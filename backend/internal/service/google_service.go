package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"time"

	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/repository"
)

// HTTPClient はテスト時にモック可能なHTTPクライアントインターフェース
type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
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
		return "", fmt.Errorf("google account not linked")
	}
	return RefreshTokenIfNeeded(ctx, s.cfg, s.extAcctRepo, userID, "google")
}

// doRequest はAuthorizationヘッダ付きでHTTPリクエストを実行する
func (s *GoogleService) doRequest(ctx context.Context, method, url, accessToken string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("google api error (status %d): %s", resp.StatusCode, string(body))
	}
	return body, nil
}

// getProviderUserID は external_accounts から provider_user_id (GBP account ID) を取得する
func (s *GoogleService) getProviderUserID(userID string) (string, error) {
	if s.extAcctRepo == nil {
		return "", fmt.Errorf("google account not linked")
	}
	ea, err := s.extAcctRepo.FindByUserAndProvider(userID, "google")
	if err != nil || ea == nil {
		return "", fmt.Errorf("google account not linked")
	}
	return ea.ProviderUserID, nil
}

// FetchLocations はGBPアカウントの店舗一覧を取得する
func (s *GoogleService) FetchLocations(ctx context.Context, userID string) ([]models.GoogleLocation, error) {
	token, err := s.getAccessToken(ctx, userID)
	if err != nil {
		return nil, err
	}

	// まずアカウント一覧を取得
	acctBody, err := s.doRequest(ctx, "GET",
		"https://mybusinessaccountmanagement.googleapis.com/v1/accounts", token)
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

	// 最初のアカウントの店舗一覧
	accountName := acctResp.Accounts[0].Name
	locBody, err := s.doRequest(ctx, "GET",
		fmt.Sprintf("https://mybusinessbusinessinformation.googleapis.com/v1/%s/locations?readMask=name,title,storefrontAddress,phoneNumbers,categories", accountName), token)
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
		address := ""
		if len(loc.StorefrontAddress.AddressLines) > 0 {
			address = loc.StorefrontAddress.AddressLines[0]
		}
		if loc.StorefrontAddress.Locality != "" {
			address = loc.StorefrontAddress.Locality + " " + address
		}
		locations = append(locations, models.GoogleLocation{
			Name:        loc.Name,
			LocationID:  loc.Name,
			Title:       loc.Title,
			Address:     address,
			PhoneNumber: loc.PhoneNumbers.PrimaryPhone,
			Category:    loc.Categories.PrimaryCategory.DisplayName,
		})
	}
	return locations, nil
}

// FetchReviews は口コミ一覧を取得する
func (s *GoogleService) FetchReviews(ctx context.Context, userID string) ([]models.GoogleReview, error) {
	token, err := s.getAccessToken(ctx, userID)
	if err != nil {
		return nil, err
	}

	providerUserID, err := s.getProviderUserID(userID)
	if err != nil {
		return nil, err
	}

	// GBP v4 API で口コミ取得
	body, err := s.doRequest(ctx, "GET",
		fmt.Sprintf("https://mybusiness.googleapis.com/v4/accounts/%s/locations/-/reviews", providerUserID), token)
	if err != nil {
		return nil, fmt.Errorf("fetch reviews: %w", err)
	}

	var reviewResp struct {
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
		} `json:"reviews"`
	}
	if err := json.Unmarshal(body, &reviewResp); err != nil {
		return nil, fmt.Errorf("decode reviews: %w", err)
	}

	reviews := make([]models.GoogleReview, 0, len(reviewResp.Reviews))
	for _, r := range reviewResp.Reviews {
		review := models.GoogleReview{
			ReviewID:   r.ReviewID,
			Reviewer:   r.Reviewer.DisplayName,
			Rating:     starRatingToInt(r.StarRating),
			Comment:    r.Comment,
			CreateTime: parseTime(r.CreateTime),
		}
		if r.ReviewReply != nil {
			review.ReplyText = r.ReviewReply.Comment
			t := parseTime(r.ReviewReply.UpdateTime)
			review.ReplyTime = &t
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

	providerUserID, err := s.getProviderUserID(userID)
	if err != nil {
		return err
	}

	replyURL := fmt.Sprintf("https://mybusiness.googleapis.com/v4/accounts/%s/locations/-/reviews/%s/reply",
		providerUserID, reviewID)

	reqBody := fmt.Sprintf(`{"comment":"%s"}`, comment)

	req, err := http.NewRequestWithContext(ctx, "PUT", replyURL, jsonReader(reqBody))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("reply to review: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("reply failed (status %d): %s", resp.StatusCode, string(body))
	}
	return nil
}

// FetchInsights はGBPインサイトデータを取得する
func (s *GoogleService) FetchInsights(ctx context.Context, userID string, start, end time.Time) (*models.GoogleReport, error) {
	token, err := s.getAccessToken(ctx, userID)
	if err != nil {
		return nil, err
	}

	providerUserID, err := s.getProviderUserID(userID)
	if err != nil {
		return nil, err
	}

	// Performance API でメトリクスを取得
	metricsURL := fmt.Sprintf(
		"https://businessprofileperformance.googleapis.com/v1/locations/%s:fetchMultiDailyMetricsTimeSeries?dailyMetrics=CALL_CLICKS&dailyMetrics=DIRECTION_REQUESTS&dailyMetrics=WEBSITE_CLICKS&dailyMetrics=BUSINESS_IMPRESSIONS_DESKTOP_SEARCH&dailyRange.startDate.year=%s&dailyRange.startDate.month=%s&dailyRange.startDate.day=%s&dailyRange.endDate.year=%s&dailyRange.endDate.month=%s&dailyRange.endDate.day=%s",
		providerUserID,
		start.Format("2006"), start.Format("1"), start.Format("2"),
		end.Format("2006"), end.Format("1"), end.Format("2"),
	)

	body, err := s.doRequest(ctx, "GET", metricsURL, token)
	if err != nil {
		return nil, fmt.Errorf("fetch insights: %w", err)
	}

	var metricsResp struct {
		MultiDailyMetricTimeSeries []struct {
			DailyMetric    string `json:"dailyMetric"`
			TimeSeries     struct {
				DatedValues []struct {
					Date  struct{ Year, Month, Day int } `json:"date"`
					Value *int64                         `json:"value"`
				} `json:"datedValues"`
			} `json:"timeSeries"`
		} `json:"multiDailyMetricTimeSeries"`
	}
	if err := json.Unmarshal(body, &metricsResp); err != nil {
		return nil, fmt.Errorf("decode insights: %w", err)
	}

	report := &models.GoogleReport{
		Period: models.ReportPeriod{Start: start, End: end},
	}

	for _, series := range metricsResp.MultiDailyMetricTimeSeries {
		total := sumDatedValues(series.TimeSeries.DatedValues)
		switch series.DailyMetric {
		case "CALL_CLICKS":
			report.ActionDetail.PhoneCalls = total
		case "DIRECTION_REQUESTS":
			report.ActionDetail.DirectionReqs = total
		case "WEBSITE_CLICKS":
			report.ActionDetail.WebsiteVisits = total
		}
	}

	// 口コミ統計
	reviews, err := s.FetchReviews(ctx, userID)
	if err == nil && len(reviews) > 0 {
		report.ReviewStats = buildReviewStats(reviews)
		report.ReplyPerformance = buildReplyPerformance(reviews)
	}

	// 検索ワード取得
	searchURL := fmt.Sprintf(
		"https://businessprofileperformance.googleapis.com/v1/locations/%s/searchkeywords/impressions/monthly?monthlyRange.startMonth.year=%s&monthlyRange.startMonth.month=%s&monthlyRange.endMonth.year=%s&monthlyRange.endMonth.month=%s",
		providerUserID,
		start.Format("2006"), start.Format("1"),
		end.Format("2006"), end.Format("1"),
	)

	searchBody, err := s.doRequest(ctx, "GET", searchURL, token)
	if err == nil {
		var searchResp struct {
			SearchKeywordsCounts []struct {
				Keyword              string `json:"keyword"`
				InsightsValue struct {
					Value int `json:"value"`
				} `json:"insightsValue"`
			} `json:"searchKeywordsCounts"`
		}
		if json.Unmarshal(searchBody, &searchResp) == nil {
			keywords := make([]models.SearchKeyword, 0, len(searchResp.SearchKeywordsCounts))
			for _, kw := range searchResp.SearchKeywordsCounts {
				keywords = append(keywords, models.SearchKeyword{
					Keyword: kw.Keyword,
					Count:   kw.InsightsValue.Value,
				})
			}
			sort.Slice(keywords, func(i, j int) bool { return keywords[i].Count > keywords[j].Count })
			for i := range keywords {
				keywords[i].Rank = i + 1
			}
			report.SearchKeywords = keywords
		}
	}

	return report, nil
}

// --- ヘルパー ---

func starRatingToInt(rating string) int {
	switch rating {
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

func parseTime(s string) time.Time {
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return time.Time{}
	}
	return t
}

func sumDatedValues(values []struct {
	Date  struct{ Year, Month, Day int } `json:"date"`
	Value *int64                         `json:"value"`
}) int {
	total := 0
	for _, v := range values {
		if v.Value != nil {
			total += int(*v.Value)
		}
	}
	return total
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
	perf := models.ReplyPerformance{}
	repliedCount := 0
	totalReplyHours := 0.0
	for _, r := range reviews {
		if r.ReplyText != "" {
			repliedCount++
			if r.ReplyTime != nil {
				totalReplyHours += r.ReplyTime.Sub(r.CreateTime).Hours()
			}
		}
	}
	if len(reviews) > 0 {
		perf.ReplyRate = float64(repliedCount) / float64(len(reviews)) * 100
	}
	if repliedCount > 0 {
		perf.AvgReplyHours = totalReplyHours / float64(repliedCount)
	}
	return perf
}

// jsonReader は文字列からio.Readerを作成するヘルパー
func jsonReader(s string) io.Reader {
	return io.NopCloser(
		&stringReader{s: s, i: 0},
	)
}

type stringReader struct {
	s string
	i int
}

func (r *stringReader) Read(p []byte) (n int, err error) {
	if r.i >= len(r.s) {
		return 0, io.EOF
	}
	n = copy(p, r.s[r.i:])
	r.i += n
	return
}

func (r *stringReader) Close() error { return nil }
