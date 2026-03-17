package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sort"
	"strings"
	"time"

	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/repository"
)

// HTTPClient はテスト時にモック可能なHTTPクライアントインターフェース
type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}

// RateLimitError はAPIのレート制限（429）を表すエラー型
type RateLimitError struct {
	Provider string
}

func (e *RateLimitError) Error() string {
	return fmt.Sprintf("%s api rate limit exceeded", e.Provider)
}

// GoogleService はGBP API操作を提供する
type GoogleService struct {
	cfg         *config.Config
	extAcctRepo *repository.ExternalAccountRepository
	httpClient  HTTPClient
}

// NewGoogleService はGoogleServiceを生成する
func NewGoogleService(cfg *config.Config, repo *repository.ExternalAccountRepository, client HTTPClient) *GoogleService {
	if client == nil {
		client = http.DefaultClient
	}
	return &GoogleService{cfg: cfg, extAcctRepo: repo, httpClient: client}
}

// getAccessToken はトークンリフレッシュ付きでアクセストークンを取得する
func (s *GoogleService) getAccessToken(ctx context.Context, userID string) (string, error) {
	if s.extAcctRepo == nil {
		return "", fmt.Errorf("google account repo not initialized")
	}
	return RefreshTokenIfNeeded(ctx, s.cfg, s.extAcctRepo, userID, "google")
}

// doRequest はAuthorizationヘッダ付きでHTTPリクエストを実行する
func (s *GoogleService) doRequest(ctx context.Context, method, apiURL, accessToken string, body io.Reader) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, method, apiURL, body)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	if method == "POST" || method == "PUT" || method == "PATCH" {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http execute: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode == http.StatusTooManyRequests {
		return nil, &RateLimitError{Provider: "google"}
	}
	if resp.StatusCode >= 400 {
		log.Printf("Google API Error: status=%d, body=%s", resp.StatusCode, string(respBody))
		return nil, fmt.Errorf("google api error (status %d): %s", resp.StatusCode, string(respBody))
	}
	return respBody, nil
}

// FetchLocations はGBPアカウントの店舗一覧を取得する
func (s *GoogleService) FetchLocations(ctx context.Context, userID string) ([]models.GoogleLocation, error) {
	token, err := s.getAccessToken(ctx, userID)
	if err != nil {
		return nil, err
	}

	// 1. アカウント一覧を取得
	acctBody, err := s.doRequest(ctx, "GET", "https://mybusinessaccountmanagement.googleapis.com/v1/accounts", token, nil)
	if err != nil {
		return nil, fmt.Errorf("fetch accounts: %w", err)
	}

	var acctResp struct {
		Accounts []struct {
			Name string `json:"name"`
		} `json:"accounts"`
	}
	if err := json.Unmarshal(acctBody, &acctResp); err != nil {
		return nil, fmt.Errorf("decode accounts: %w", err)
	}

	if len(acctResp.Accounts) == 0 {
		return []models.GoogleLocation{}, nil
	}

	// 2. 最初のアカウントの店舗一覧を取得
	// Note: 実際には全アカウント回るべきだが、Phase 5-2では最初の一つ
	accountName := acctResp.Accounts[0].Name
	locURL := fmt.Sprintf("https://mybusinessbusinessinformation.googleapis.com/v1/%s/locations?readMask=name,title,storefrontAddress,phoneNumbers,categories,serviceArea", accountName)
	locBody, err := s.doRequest(ctx, "GET", locURL, token, nil)
	if err != nil {
		return nil, fmt.Errorf("fetch locations: %w", err)
	}

	var locResp struct {
		Locations []struct {
			Name              string `json:"name"`
			Title             string `json:"title"`
			StorefrontAddress struct {
				AddressLines []string `json:"addressLines"`
				Locality     string   `json:"locality"`
			} `json:"storefrontAddress"`
			PhoneNumbers struct {
				PrimaryPhone string `json:"primaryPhone"`
			} `json:"phoneNumbers"`
			Categories struct {
				PrimaryCategory struct {
					DisplayName string `json:"displayName"`
				} `json:"primaryCategory"`
			} `json:"categories"`
		} `json:"locations"`
	}
	if err := json.Unmarshal(locBody, &locResp); err != nil {
		return nil, fmt.Errorf("decode locations: %w", err)
	}

	locations := make([]models.GoogleLocation, 0, len(locResp.Locations))
	for _, loc := range locResp.Locations {
		addr := ""
		if len(loc.StorefrontAddress.AddressLines) > 0 {
			addr = loc.StorefrontAddress.AddressLines[0]
		}
		if loc.StorefrontAddress.Locality != "" {
			addr = loc.StorefrontAddress.Locality + " " + addr
		}

		gl := models.GoogleLocation{
			Name:        loc.Name,
			LocationID:  extractID(loc.Name),
			Title:       loc.Title,
			Address:     addr,
			PhoneNumber: loc.PhoneNumbers.PrimaryPhone,
			Category:    loc.Categories.PrimaryCategory.DisplayName,
		}

		// カバー写真取得
		coverURL := s.fetchCoverPhotoURL(ctx, loc.Name, token)
		gl.CoverPhotoURL = coverURL

		locations = append(locations, gl)
	}

	return locations, nil
}

// FetchReviews は口コミ一覧を取得する
func (s *GoogleService) FetchReviews(ctx context.Context, userID string) ([]models.GoogleReview, error) {
	token, err := s.getAccessToken(ctx, userID)
	if err != nil {
		return nil, err
	}

	// アカウントID取得
	acctID, err := s.getFirstAccountID(ctx, token)
	if err != nil {
		return nil, err
	}

	// GBP v4 API でアカウント配下の全店舗の口コミを取得 (wildcard '-' used for location)
	reviewURL := fmt.Sprintf("https://mybusiness.googleapis.com/v4/accounts/%s/locations/-/reviews", acctID)
	body, err := s.doRequest(ctx, "GET", reviewURL, token, nil)
	if err != nil {
		return nil, fmt.Errorf("fetch reviews: %w", err)
	}

	var resp struct {
		Reviews []struct {
			ReviewID string `json:"reviewId"`
			Reviewer struct {
				DisplayName string `json:"displayName"`
			} `json:"reviewer"`
			StarRating  string `json:"starRating"`
			Comment     string `json:"comment"`
			CreateTime  string `json:"createTime"`
			ReviewReply *struct {
				Comment    string `json:"comment"`
				UpdateTime string `json:"updateTime"`
			} `json:"reviewReply"`
			ReviewMedia []struct {
				GoogleURL string `json:"googleUrl"`
			} `json:"reviewMedia"`
		} `json:"reviews"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("decode reviews: %w", err)
	}

	reviews := make([]models.GoogleReview, 0, len(resp.Reviews))
	for _, r := range resp.Reviews {
		review := models.GoogleReview{
			ReviewID:   r.ReviewID,
			Reviewer:   r.Reviewer.DisplayName,
			Rating:     parseRating(r.StarRating),
			Comment:    r.Comment,
			CreateTime: parseRFC3339(r.CreateTime),
		}
		if r.ReviewReply != nil {
			review.ReplyText = r.ReviewReply.Comment
			t := parseRFC3339(r.ReviewReply.UpdateTime)
			review.ReplyTime = &t
		}
		if len(r.ReviewMedia) > 0 {
			urls := make([]string, 0, len(r.ReviewMedia))
			for _, m := range r.ReviewMedia {
				if m.GoogleURL != "" {
					urls = append(urls, m.GoogleURL)
				}
			}
			review.MediaURLs = urls
		}
		reviews = append(reviews, review)
	}

	return reviews, nil
}

// ReplyToReview は口コミに返信する
func (s *GoogleService) ReplyToReview(ctx context.Context, userID, reviewID, comment string) error {
	token, err := s.getAccessToken(ctx, userID)
	if err != nil {
		return err
	}

	acctID, err := s.getFirstAccountID(ctx, token)
	if err != nil {
		return err
	}

	// 実際には reviewID から locationID を特定する必要があるが、GBP v4 では accounts/{acct}/locations/{loc}/reviews/{rev}
	// ここでは reviewID がフルパスであることを期待するか、もしくは locations/-/reviews で受け取った ID を使用
	replyURL := fmt.Sprintf("https://mybusiness.googleapis.com/v4/accounts/%s/locations/-/reviews/%s/reply", acctID, reviewID)
	reqBody := map[string]string{"comment": comment}
	jsonBody, _ := json.Marshal(reqBody)

	_, err = s.doRequest(ctx, "PUT", replyURL, token, strings.NewReader(string(jsonBody)))
	if err != nil {
		return fmt.Errorf("reply to review: %w", err)
	}

	return nil
}

// FetchInsights はGBPインサイトデータを取得する
func (s *GoogleService) FetchInsights(ctx context.Context, userID string, start, end time.Time) (*models.GoogleReport, error) {
	token, err := s.getAccessToken(ctx, userID)
	if err != nil {
		return nil, err
	}

	// 1. 最初に見つかった店舗をターゲットにする
	locations, err := s.FetchLocations(ctx, userID)
	if err != nil || len(locations) == 0 {
		return nil, fmt.Errorf("no locations found for insights: %v", err)
	}
	targetLocation := locations[0].Name // "locations/{locationId}"

	// 2. Performance API (v1) でメトリクス取得
	metrics := []string{
		"CALL_CLICKS",
		"DIRECTION_REQUESTS",
		"WEBSITE_CLICKS",
		"BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
		"BUSINESS_IMPRESSIONS_MOBILE_MAPS",
		"QUERIES_DIRECT",
		"QUERIES_INDIRECT",
	}
	metricsQuery := ""
	for _, m := range metrics {
		metricsQuery += "&dailyMetrics=" + m
	}

	apiURL := fmt.Sprintf(
		"https://businessprofileperformance.googleapis.com/v1/%s:fetchMultiDailyMetricsTimeSeries?%s&dailyRange.startDate.year=%d&dailyRange.startDate.month=%d&dailyRange.startDate.day=%d&dailyRange.endDate.year=%d&dailyRange.endDate.month=%d&dailyRange.endDate.day=%d",
		targetLocation,
		metricsQuery[1:],
		start.Year(), start.Month(), start.Day(),
		end.Year(), end.Month(), end.Day(),
	)

	body, err := s.doRequest(ctx, "GET", apiURL, token, nil)
	if err != nil {
		return nil, fmt.Errorf("fetch performance metrics: %w", err)
	}

	var perfResp struct {
		MultiDailyMetricTimeSeries []struct {
			DailyMetric string `json:"dailyMetric"`
			TimeSeries  struct {
				DatedValues []struct {
					Date struct {
						Year  int `json:"year"`
						Month int `json:"month"`
						Day   int `json:"day"`
					} `json:"date"`
					Value int64 `json:"value,string"`
				} `json:"datedValues"`
			} `json:"timeSeries"`
		} `json:"multiDailyMetricTimeSeries"`
	}
	if err := json.Unmarshal(body, &perfResp); err != nil {
		return nil, fmt.Errorf("decode performance metrics: %w", err)
	}

	report := &models.GoogleReport{
		Period: models.ReportPeriod{Start: start, End: end},
	}

	for _, ts := range perfResp.MultiDailyMetricTimeSeries {
		total := int64(0)
		for _, dv := range ts.TimeSeries.DatedValues {
			total += dv.Value
		}
		switch ts.DailyMetric {
		case "CALL_CLICKS":
			report.ActionDetail.PhoneCalls = int(total)
		case "DIRECTION_REQUESTS":
			report.ActionDetail.DirectionReqs = int(total)
		case "WEBSITE_CLICKS":
			report.ActionDetail.WebsiteVisits = int(total)
		case "BUSINESS_IMPRESSIONS_DESKTOP_MAPS", "BUSINESS_IMPRESSIONS_MOBILE_MAPS":
			report.MapViews += int(total)
		case "QUERIES_DIRECT":
			report.QueriesDirect = int(total)
		case "QUERIES_INDIRECT":
			report.QueriesIndirect = int(total)
		}
	}

	// 口コミ統計も付与
	allReviews, _ := s.FetchReviews(ctx, userID)
	if len(allReviews) > 0 {
		report.ReviewStats = buildReviewStats(allReviews)
		report.ReplyPerformance = buildReplyPerformance(allReviews)
	}

	// 検索キーワード (Performance API)
	s.fetchSearchKeywords(ctx, targetLocation, token, start, end, report)

	return report, nil
}

// --- ヘルパーメソッド ---

func (s *GoogleService) getFirstAccountID(ctx context.Context, token string) (string, error) {
	body, err := s.doRequest(ctx, "GET", "https://mybusinessaccountmanagement.googleapis.com/v1/accounts", token, nil)
	if err != nil {
		return "", err
	}
	var acctResp struct {
		Accounts []struct {
			Name string `json:"name"`
		} `json:"accounts"`
	}
	if err := json.Unmarshal(body, &acctResp); err != nil || len(acctResp.Accounts) == 0 {
		return "", fmt.Errorf("no accounts found")
	}
	return extractID(acctResp.Accounts[0].Name), nil
}

func (s *GoogleService) fetchCoverPhotoURL(ctx context.Context, locationName, token string) string {
	// My Business Media API (v4) を使用
	mediaURL := fmt.Sprintf("https://mybusiness.googleapis.com/v4/%s/media", locationName)
	body, err := s.doRequest(ctx, "GET", mediaURL, token, nil)
	if err != nil {
		return ""
	}

	var mediaResp struct {
		MediaItems []struct {
			MediaFormat string `json:"mediaFormat"`
			LocationAssociatedMedia struct {
				Category string `json:"category"`
			} `json:"locationAssociatedMedia"`
			GoogleURL string `json:"googleUrl"`
		} `json:"mediaItems"`
	}
	if err := json.Unmarshal(body, &mediaResp); err != nil {
		return ""
	}

	// COVER カテゴリを優先、なければ最初のPHOTO
	for _, item := range mediaResp.MediaItems {
		if item.LocationAssociatedMedia.Category == "COVER" && item.GoogleURL != "" {
			return item.GoogleURL
		}
	}
	for _, item := range mediaResp.MediaItems {
		if item.MediaFormat == "PHOTO" && item.GoogleURL != "" {
			return item.GoogleURL
		}
	}
	return ""
}

func (s *GoogleService) fetchSearchKeywords(ctx context.Context, locationName string, token string, start, end time.Time, report *models.GoogleReport) {
	// Performance API Search Keywords
	apiURL := fmt.Sprintf(
		"https://businessprofileperformance.googleapis.com/v1/%s/searchkeywords/impressions/monthly?monthlyRange.startMonth.year=%d&monthlyRange.startMonth.month=%d&monthlyRange.endMonth.year=%d&monthlyRange.endMonth.month=%d",
		locationName,
		start.Year(), start.Month(),
		end.Year(), end.Month(),
	)

	body, err := s.doRequest(ctx, "GET", apiURL, token, nil)
	if err != nil {
		return
	}

	var resp struct {
		SearchKeywordsCounts []struct {
			SearchKeyword string `json:"searchKeyword"`
			InsightsValue struct {
				Value int64 `json:"value,string"`
			} `json:"insightsValue"`
		} `json:"searchKeywordsCounts"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return
	}

	keywords := make([]models.SearchKeyword, 0, len(resp.SearchKeywordsCounts))
	for _, kw := range resp.SearchKeywordsCounts {
		keywords = append(keywords, models.SearchKeyword{
			Keyword: kw.SearchKeyword,
			Count:   int(kw.InsightsValue.Value),
		})
	}

	sort.Slice(keywords, func(i, j int) bool {
		return keywords[i].Count > keywords[j].Count
	})

	for i := range keywords {
		keywords[i].Rank = i + 1
	}

	if len(keywords) > 10 {
		report.SearchKeywords = keywords[:10]
	} else {
		report.SearchKeywords = keywords
	}
}

func extractID(name string) string {
	parts := strings.Split(name, "/")
	return parts[len(parts)-1]
}

func parseRating(r string) int {
	switch r {
	case "ONE":
		return 1
	case "TWO":
		return 2
	case "THREE":
		return 3
	case "FOUR":
		return 4
	case "FIVE":
		return 5
	default:
		return 0
	}
}

func parseRFC3339(s string) time.Time {
	t, _ := time.Parse(time.RFC3339, s)
	return t
}

func buildReviewStats(reviews []models.GoogleReview) models.ReviewStats {
	stats := models.ReviewStats{
		RatingBreakdown: make(map[int]int),
		TotalCount:      len(reviews),
	}
	totalRating := 0
	for _, r := range reviews {
		totalRating += r.Rating
		stats.RatingBreakdown[r.Rating]++
	}
	if len(reviews) > 0 {
		stats.AvgRating.Value = float64(totalRating) / float64(len(reviews))
	}
	return stats
}

func buildReplyPerformance(reviews []models.GoogleReview) models.ReplyPerformance {
	repliedCount := 0
	var totalReplyHours float64
	for _, r := range reviews {
		if r.ReplyText != "" {
			repliedCount++
			if r.ReplyTime != nil {
				totalReplyHours += r.ReplyTime.Sub(r.CreateTime).Hours()
			}
		}
	}
	perf := models.ReplyPerformance{}
	if len(reviews) > 0 {
		perf.ReplyRate = float64(repliedCount) / float64(len(reviews)) * 100
	}
	if repliedCount > 0 {
		perf.AvgReplyHours = totalReplyHours / float64(repliedCount)
	}
	return perf
}
