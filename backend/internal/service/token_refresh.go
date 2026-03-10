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

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/repository"
	"webSystemPJ/backend/internal/utils"
)

// RefreshTokenIfNeeded はトークンの有効期限を確認し、必要なら更新する
func RefreshTokenIfNeeded(
	ctx context.Context,
	cfg *config.Config,
	repo *repository.ExternalAccountRepository,
	userID, provider string,
) (string, error) {
	ea, err := repo.FindByUserAndProvider(userID, provider)
	if err != nil || ea == nil {
		return "", fmt.Errorf("external account not found")
	}

	// 有効期限が5分以上先ならそのまま返す
	if ea.TokenExpiresAt != nil && time.Until(*ea.TokenExpiresAt) > 5*time.Minute {
		accessToken, err := utils.Decrypt(ea.EncryptedAccessToken, cfg.EncryptionKey)
		if err != nil {
			return "", fmt.Errorf("decrypt access token: %w", err)
		}
		return accessToken, nil
	}

	log.Printf("refreshing %s token for user %s", provider, userID)

	switch provider {
	case "google":
		return refreshGoogleToken(ctx, cfg, repo, ea)
	case "instagram":
		return refreshInstagramToken(cfg, repo, ea)
	default:
		return "", fmt.Errorf("unsupported provider: %s", provider)
	}
}

func refreshGoogleToken(
	ctx context.Context,
	cfg *config.Config,
	repo *repository.ExternalAccountRepository,
	ea *models.ExternalAccount,
) (string, error) {
	refreshToken, err := utils.Decrypt(ea.EncryptedRefreshToken, cfg.EncryptionKey)
	if err != nil {
		return "", fmt.Errorf("decrypt refresh token: %w", err)
	}

	oauthCfg := &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		Endpoint:     google.Endpoint,
	}

	tokenSource := oauthCfg.TokenSource(ctx, &oauth2.Token{
		RefreshToken: refreshToken,
	})

	newToken, err := tokenSource.Token()
	if err != nil {
		return "", fmt.Errorf("refresh google token: %w", err)
	}

	encAccess, err := utils.Encrypt(newToken.AccessToken, cfg.EncryptionKey)
	if err != nil {
		return "", err
	}
	expiresAt := newToken.Expiry
	if err := repo.UpdateTokens(ea.UserID, "google", encAccess, &expiresAt); err != nil {
		return "", err
	}

	log.Printf("google token refreshed for user %s", ea.UserID)
	return newToken.AccessToken, nil
}

func refreshInstagramToken(
	cfg *config.Config,
	repo *repository.ExternalAccountRepository,
	ea *models.ExternalAccount,
) (string, error) {
	currentToken, err := utils.Decrypt(ea.EncryptedAccessToken, cfg.EncryptionKey)
	if err != nil {
		return "", fmt.Errorf("decrypt access token: %w", err)
	}

	resp, err := http.Get(fmt.Sprintf(
		"https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=%s",
		url.QueryEscape(currentToken),
	))
	if err != nil {
		return "", fmt.Errorf("refresh instagram token: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var result struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int64  `json:"expires_in"`
	}
	if err := json.Unmarshal(body, &result); err != nil || result.AccessToken == "" {
		return "", fmt.Errorf("decode refresh response: %s", string(body))
	}

	encAccess, err := utils.Encrypt(result.AccessToken, cfg.EncryptionKey)
	if err != nil {
		return "", err
	}
	expiresAt := time.Now().Add(time.Duration(result.ExpiresIn) * time.Second)
	if err := repo.UpdateTokens(ea.UserID, "instagram", encAccess, &expiresAt); err != nil {
		return "", err
	}

	log.Printf("instagram token refreshed for user %s, expires_in=%ds", ea.UserID, result.ExpiresIn)
	return result.AccessToken, nil
}
