package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
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
		return "", fmt.Errorf("instagram account repo not initialized")
	}
	return RefreshTokenIfNeeded(ctx, s.cfg, s.extAcctRepo, userID, "instagram")
}

// getIGUserID は external_accounts から provider_user_id (IG Business Account ID) を取得する
func (s *InstagramService) getIGUserID(userID string) (string, error) {
	ea, err := s.extAcctRepo.FindByUserAndProvider(userID, "instagram")
	if err != nil || ea == nil {
		return "", fmt.Errorf("instagram account not linked")
	}
	return ea.ProviderUserID, nil
}

// doRequest はアクセストークン付きで HTTP リクエストを実行する
func (s *InstagramService) doRequest(ctx context.Context, method, apiURL, accessToken string, body io.Reader) ([]byte, error) {
	// URLにアクセストークンを付与
	u, err := url.Parse(apiURL)
	if err != nil {
		return nil, err
	}
	q := u.Query()
	q.Set("access_token", accessToken)
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, method, u.String(), body)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
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

	if resp.StatusCode >= 400 {
		log.Printf("Instagram API Error: status=%d, body=%s", resp.StatusCode, string(respBody))
		return nil, fmt.Errorf("instagram api error (status %d): %s", resp.StatusCode, string(respBody))
	}
	return respBody, nil
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

	// 1. ユーザーインサイト取得 (impressions, reach, profile_views, website_clicks)
	// Note: since/until は Unix タイムスタンプ
	since := start.Unix()
	until := end.Unix()
	// period=day の場合、過去30日間まで取得可能
	insightsURL := fmt.Sprintf("%s/%s/insights?metric=impressions,reach,profile_views,website_clicks&period=day&since=%d&until=%d",
		fbGraphBaseURL, igUserID, since, until)

	body, err := s.doRequest(ctx, "GET", insightsURL, token, nil)
	if err != nil {
		return nil, fmt.Errorf("fetch user insights: %w", err)
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
		return nil, fmt.Errorf("decode user insights: %w", err)
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

	// 2. フォロワー数推移 (follower_count)
	// 現在のフォロワー数を取得
	profileURL := fmt.Sprintf("%s/%s?fields=followers_count", fbGraphBaseURL, igUserID)
	profileBody, err := s.doRequest(ctx, "GET", profileURL, token, nil)
	if err == nil {
		var profileResp struct {
			FollowersCount int `json:"followers_count"`
		}
		if json.Unmarshal(profileBody, &profileResp) == nil {
			report.FollowerCount = profileResp.FollowersCount
		}
	}

	// 3. トップメディア (エンゲージメント順)
	media, err := s.FetchMedia(ctx, userID)
	if err == nil && len(media) > 0 {
		// エンゲージメント (Like + Comment) でソート
		sortMediaByEngagement(media)
		if len(media) > 5 {
			report.TopMedia = media[:5]
		} else {
			report.TopMedia = media
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

	mediaURL := fmt.Sprintf("%s/%s/media?fields=id,media_type,media_url,caption,timestamp,like_count,comments_count&limit=50",
		fbGraphBaseURL, igUserID)

	body, err := s.doRequest(ctx, "GET", mediaURL, token, nil)
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
			Timestamp:    parseIGRFC3339(m.Timestamp),
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

	// Step 1: メディアコンテナ作成 (POST)
	containerURL := fmt.Sprintf("%s/%s/media", fbGraphBaseURL, igUserID)
	params := url.Values{}
	params.Set("image_url", imageURL)
	params.Set("caption", caption)
	params.Set("access_token", token)

	resp, err := http.PostForm(containerURL, params)
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

	// Step 2: メディア公開 (POST)
	publishURL := fmt.Sprintf("%s/%s/media_publish", fbGraphBaseURL, igUserID)
	pubParams := url.Values{}
	pubParams.Set("creation_id", containerResp.ID)
	pubParams.Set("access_token", token)

	pubResp, err := http.PostForm(publishURL, pubParams)
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

// sortMediaByEngagement はメディアをエンゲージメント順に並び替える
func sortMediaByEngagement(media []models.InstagramMediaItem) {
	for i := 0; i < len(media); i++ {
		for j := i + 1; j < len(media); j++ {
			engI := media[i].LikeCount + media[i].CommentCount
			engJ := media[j].LikeCount + media[j].CommentCount
			if engJ > engI {
				media[i], media[j] = media[j], media[i]
			}
		}
	}
}

func parseIGRFC3339(s string) time.Time {
	t, _ := time.Parse(time.RFC3339, s)
	return t
}
