package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/repository"
)

const fbGraphBaseURL = "https://graph.facebook.com/v21.0"

// InstagramService はInstagram Graph API操作を提供する
type InstagramService struct {
	cfg         *config.Config
	extAcctRepo *repository.ExternalAccountRepository
	httpClient  HTTPClient
}

// NewInstagramService はInstagramServiceを生成する
func NewInstagramService(cfg *config.Config, repo *repository.ExternalAccountRepository, client HTTPClient) *InstagramService {
	if client == nil {
		client = http.DefaultClient
	}
	return &InstagramService{cfg: cfg, extAcctRepo: repo, httpClient: client}
}

// getAccessToken はトークンリフレッシュ付きでアクセストークンを取得する
func (s *InstagramService) getAccessToken(ctx context.Context, userID string) (string, error) {
	if s.extAcctRepo == nil {
		return "", fmt.Errorf("instagram account not linked")
	}
	return RefreshTokenIfNeeded(ctx, s.cfg, s.extAcctRepo, userID, "instagram")
}

// getIGUserID は external_accounts から provider_user_id (IG Business Account ID) を取得する
func (s *InstagramService) getIGUserID(userID string) (string, error) {
	if s.extAcctRepo == nil {
		return "", fmt.Errorf("instagram account not linked")
	}
	ea, err := s.extAcctRepo.FindByUserAndProvider(userID, "instagram")
	if err != nil || ea == nil {
		return "", fmt.Errorf("instagram account not linked")
	}
	return ea.ProviderUserID, nil
}

// doGet はアクセストークン付きでGET リクエストを実行する
func (s *InstagramService) doGet(ctx context.Context, apiURL, accessToken string) ([]byte, error) {
	sep := "?"
	if len(apiURL) > 0 && (apiURL[len(apiURL)-1] == '?' || contains(apiURL, "?")) {
		sep = "&"
	}
	fullURL := apiURL + sep + "access_token=" + url.QueryEscape(accessToken)

	req, err := http.NewRequestWithContext(ctx, "GET", fullURL, nil)
	if err != nil {
		return nil, err
	}

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
		return nil, fmt.Errorf("instagram api error (status %d): %s", resp.StatusCode, string(body))
	}
	return body, nil
}

func contains(s, substr string) bool {
	for i := 0; i+len(substr) <= len(s); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

// FetchInsights はInstagramインサイトデータを取得する
func (s *InstagramService) FetchInsights(ctx context.Context, userID string, start, end time.Time) (*models.InstagramReport, error) {
	token, err := s.getAccessToken(ctx, userID)
	if err != nil {
		return nil, err
	}

	igUserID, err := s.getIGUserID(userID)
	if err != nil {
		return nil, err
	}

	report := &models.InstagramReport{
		Period: models.ReportPeriod{Start: start, End: end},
	}

	// ユーザーインサイト取得 (impressions, reach, profile_views, website_clicks)
	since := start.Unix()
	until := end.Unix()
	insightsURL := fmt.Sprintf(
		"%s/%s/insights?metric=impressions,reach,profile_views,website_clicks&period=day&since=%d&until=%d",
		fbGraphBaseURL, igUserID, since, until,
	)

	body, err := s.doGet(ctx, insightsURL, token)
	if err != nil {
		return nil, fmt.Errorf("fetch insights: %w", err)
	}

	var insightsResp struct {
		Data []struct {
			Name   string `json:"name"`
			Values []struct {
				Value int `json:"value"`
			} `json:"values"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &insightsResp); err != nil {
		return nil, fmt.Errorf("decode insights: %w", err)
	}

	for _, metric := range insightsResp.Data {
		total := 0
		for _, v := range metric.Values {
			total += v.Value
		}
		switch metric.Name {
		case "impressions":
			report.Impressions.Value = total
		case "reach":
			report.Reach.Value = total
		case "profile_views":
			report.ProfileViews.Value = total
		case "website_clicks":
			report.WebsiteClicks.Value = total
		}
	}

	// フォロワー数
	profileURL := fmt.Sprintf("%s/%s?fields=followers_count", fbGraphBaseURL, igUserID)
	profileBody, err := s.doGet(ctx, profileURL, token)
	if err == nil {
		var profileResp struct {
			FollowersCount int `json:"followers_count"`
		}
		if json.Unmarshal(profileBody, &profileResp) == nil {
			report.FollowerCount = profileResp.FollowersCount
		}
	}

	return report, nil
}

// FetchMedia はInstagram投稿一覧を取得する
func (s *InstagramService) FetchMedia(ctx context.Context, userID string) ([]models.InstagramMediaItem, error) {
	token, err := s.getAccessToken(ctx, userID)
	if err != nil {
		return nil, err
	}

	igUserID, err := s.getIGUserID(userID)
	if err != nil {
		return nil, err
	}

	mediaURL := fmt.Sprintf(
		"%s/%s/media?fields=id,media_type,media_url,caption,timestamp,like_count,comments_count&limit=25",
		fbGraphBaseURL, igUserID,
	)

	body, err := s.doGet(ctx, mediaURL, token)
	if err != nil {
		return nil, fmt.Errorf("fetch media: %w", err)
	}

	var mediaResp struct {
		Data []struct {
			ID            string `json:"id"`
			MediaType     string `json:"media_type"`
			MediaURL      string `json:"media_url"`
			Caption       string `json:"caption"`
			Timestamp     string `json:"timestamp"`
			LikeCount     int    `json:"like_count"`
			CommentsCount int    `json:"comments_count"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &mediaResp); err != nil {
		return nil, fmt.Errorf("decode media: %w", err)
	}

	items := make([]models.InstagramMediaItem, 0, len(mediaResp.Data))
	for _, m := range mediaResp.Data {
		items = append(items, models.InstagramMediaItem{
			ID:           m.ID,
			MediaType:    m.MediaType,
			MediaURL:     m.MediaURL,
			Caption:      m.Caption,
			Timestamp:    parseTime(m.Timestamp),
			LikeCount:    m.LikeCount,
			CommentCount: m.CommentsCount,
		})
	}
	return items, nil
}

// CreateMedia はInstagramに投稿を作成する (コンテナ作成 → 公開の2ステップ)
func (s *InstagramService) CreateMedia(ctx context.Context, userID, imageURL, caption string) (string, error) {
	token, err := s.getAccessToken(ctx, userID)
	if err != nil {
		return "", err
	}

	igUserID, err := s.getIGUserID(userID)
	if err != nil {
		return "", err
	}

	// Step 1: メディアコンテナ作成
	containerURL := fmt.Sprintf("%s/%s/media", fbGraphBaseURL, igUserID)
	containerData := url.Values{
		"image_url":    {imageURL},
		"caption":      {caption},
		"access_token": {token},
	}

	req, err := http.NewRequestWithContext(ctx, "POST", containerURL, bytes.NewBufferString(containerData.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("create media container: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return "", fmt.Errorf("create container failed (status %d): %s", resp.StatusCode, string(body))
	}

	var containerResp struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(body, &containerResp); err != nil {
		return "", fmt.Errorf("decode container response: %w", err)
	}

	// Step 2: メディア公開
	publishURL := fmt.Sprintf("%s/%s/media_publish", fbGraphBaseURL, igUserID)
	publishData := url.Values{
		"creation_id":  {containerResp.ID},
		"access_token": {token},
	}

	pubReq, err := http.NewRequestWithContext(ctx, "POST", publishURL, bytes.NewBufferString(publishData.Encode()))
	if err != nil {
		return "", err
	}
	pubReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	pubResp, err := s.httpClient.Do(pubReq)
	if err != nil {
		return "", fmt.Errorf("publish media: %w", err)
	}
	defer pubResp.Body.Close()

	pubBody, _ := io.ReadAll(pubResp.Body)
	if pubResp.StatusCode >= 400 {
		return "", fmt.Errorf("publish failed (status %d): %s", pubResp.StatusCode, string(pubBody))
	}

	var publishResp struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(pubBody, &publishResp); err != nil {
		return "", fmt.Errorf("decode publish response: %w", err)
	}

	return publishResp.ID, nil
}
