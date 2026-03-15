package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/repository"
	"webSystemPJ/backend/internal/utils"
)

// generateState はCSRF対策用のstateパラメータを生成する
func generateState() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// --- Google OAuth ---

func googleOAuthConfig(cfg *config.Config) *oauth2.Config {
	return &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		RedirectURL:  cfg.GoogleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/business.manage",
			"https://www.googleapis.com/auth/userinfo.email",
		},
		Endpoint: google.Endpoint,
	}
}

// GoogleLogin はGoogle認可画面へリダイレクトする
func GoogleLogin(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		state, err := generateState()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate state"})
			return
		}

		// stateをcookieに保存 (CSRF検証用)
		c.SetCookie("oauth_state", state, 600, "/", "", false, true)

		// JWTトークンをstateに含めてコールバックでユーザー識別
		token := c.Query("token")
		if token != "" {
			c.SetCookie("oauth_token", token, 600, "/", "", false, true)
		}

		oauthCfg := googleOAuthConfig(cfg)
		authURL := oauthCfg.AuthCodeURL(state, oauth2.AccessTypeOffline, oauth2.ApprovalForce)
		c.Redirect(http.StatusTemporaryRedirect, authURL)
	}
}

// GoogleCallback はGoogle認可コードを受け取り、トークンを交換・保存する
func GoogleCallback(cfg *config.Config, extAcctRepo *repository.ExternalAccountRepository, userRepo repository.UserRepositoryInterface) gin.HandlerFunc {
	return func(c *gin.Context) {
		// state検証
		savedState, err := c.Cookie("oauth_state")
		if err != nil || savedState != c.Query("state") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid state parameter"})
			return
		}

		// エラーチェック
		if errMsg := c.Query("error"); errMsg != "" {
			redirectWithError(c, cfg.FrontendURL, errMsg)
			return
		}

		code := c.Query("code")
		if code == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing authorization code"})
			return
		}

		// トークン交換
		oauthCfg := googleOAuthConfig(cfg)
		token, err := oauthCfg.Exchange(c.Request.Context(), code)
		if err != nil {
			log.Printf("google token exchange error: %v", err)
			redirectWithError(c, cfg.FrontendURL, "token_exchange_failed")
			return
		}

		// ユーザー情報取得
		client := oauthCfg.Client(c.Request.Context(), token)
		resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
		if err != nil {
			log.Printf("google userinfo error: %v", err)
			redirectWithError(c, cfg.FrontendURL, "userinfo_failed")
			return
		}
		defer resp.Body.Close()

		var userInfo struct {
			ID    string `json:"id"`
			Email string `json:"email"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
			log.Printf("google userinfo decode error: %v", err)
			redirectWithError(c, cfg.FrontendURL, "userinfo_decode_failed")
			return
		}

		// JWTからuser_idを取得（既存ユーザーの連携時）
		userID := getUserIDFromOAuthCookie(c, cfg)

		// JWTが存在しない場合 → ソーシャルログイン/新規登録フロー
		if userID == "" {
			if userInfo.Email == "" {
				redirectWithError(c, cfg.FrontendURL, "email_not_provided")
				return
			}

			existingUser, err := userRepo.FindByEmail(userInfo.Email)
			if err != nil {
				log.Printf("google login find user error: %v", err)
				redirectWithError(c, cfg.FrontendURL, "login_failed")
				return
			}

			var targetUser *models.User
			if existingUser != nil {
				targetUser = existingUser
			} else {
				// 新規ユーザー作成（パスワードは空ハッシュ: ソーシャルログイン専用）
				newUser, err := userRepo.Create(userInfo.Email, "", "user")
				if err != nil {
					log.Printf("google login create user error: %v", err)
					redirectWithError(c, cfg.FrontendURL, "registration_failed")
					return
				}
				targetUser = newUser
			}

			userID = targetUser.ID

			// JWT発行してCookieにセット
			jwtToken, err := issueJWT(targetUser, cfg.JWTSecret)
			if err != nil {
				log.Printf("google login jwt error: %v", err)
				redirectWithError(c, cfg.FrontendURL, "token_generation_failed")
				return
			}
			c.SetCookie("auth_token", jwtToken, 86400, "/", "", false, true)
		}

		// トークン暗号化・保存
		if err := saveTokens(cfg, extAcctRepo, userID, "google", userInfo.ID, token); err != nil {
			log.Printf("save google tokens error: %v", err)
			redirectWithError(c, cfg.FrontendURL, "save_failed")
			return
		}

		log.Printf("google oauth linked: user=%s provider_user=%s", userID, userInfo.ID)

		// フロントエンドにリダイレクト
		redirectURL := cfg.FrontendURL + "/home?linked=google"
		// ソーシャルログインの場合、JWTをクエリパラメータでも渡す（フロントでlocalStorageに保存用）
		if jwtCookie, err := c.Cookie("auth_token"); err == nil && jwtCookie != "" {
			redirectURL += "&token=" + url.QueryEscape(jwtCookie)
		}
		c.Redirect(http.StatusTemporaryRedirect, redirectURL)
	}
}

// --- Instagram OAuth ---

var instagramOAuthEndpoint = oauth2.Endpoint{
	AuthURL:  "https://www.facebook.com/v21.0/dialog/oauth",
	TokenURL: "https://graph.facebook.com/v21.0/oauth/access_token",
}

func instagramOAuthConfig(cfg *config.Config) *oauth2.Config {
	return &oauth2.Config{
		ClientID:     cfg.InstagramClientID,
		ClientSecret: cfg.InstagramClientSecret,
		RedirectURL:  cfg.InstagramRedirectURL,
		Scopes: []string{
			"instagram_basic",
			"instagram_content_publish",
			"instagram_manage_comments",
			"instagram_manage_insights",
			"pages_show_list",
			"pages_read_engagement",
		},
		Endpoint: instagramOAuthEndpoint,
	}
}

// InstagramLogin はFacebook認可画面へリダイレクトする
func InstagramLogin(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		state, err := generateState()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate state"})
			return
		}

		c.SetCookie("oauth_state", state, 600, "/", "", false, true)

		token := c.Query("token")
		if token != "" {
			c.SetCookie("oauth_token", token, 600, "/", "", false, true)
		}

		oauthCfg := instagramOAuthConfig(cfg)
		authURL := oauthCfg.AuthCodeURL(state)
		c.Redirect(http.StatusTemporaryRedirect, authURL)
	}
}

// InstagramCallback はInstagram認可コードを受け取り、短期→長期トークン交換・保存する
func InstagramCallback(cfg *config.Config, extAcctRepo *repository.ExternalAccountRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// state検証
		savedState, err := c.Cookie("oauth_state")
		if err != nil || savedState != c.Query("state") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid state parameter"})
			return
		}

		if errMsg := c.Query("error"); errMsg != "" {
			redirectWithError(c, cfg.FrontendURL, errMsg)
			return
		}

		code := c.Query("code")
		if code == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing authorization code"})
			return
		}

		// 短期トークン取得
		oauthCfg := instagramOAuthConfig(cfg)
		shortToken, err := oauthCfg.Exchange(c.Request.Context(), code)
		if err != nil {
			log.Printf("instagram token exchange error: %v", err)
			redirectWithError(c, cfg.FrontendURL, "token_exchange_failed")
			return
		}

		// 短期→長期トークンに交換 (60日間有効)
		longToken, expiresIn, err := exchangeForLongLivedToken(cfg, shortToken.AccessToken)
		if err != nil {
			log.Printf("instagram long-lived token exchange error: %v", err)
			redirectWithError(c, cfg.FrontendURL, "long_token_exchange_failed")
			return
		}

		// Instagram User ID 取得
		igUserID, err := getInstagramUserID(longToken)
		if err != nil {
			log.Printf("instagram user id error: %v", err)
			redirectWithError(c, cfg.FrontendURL, "ig_user_failed")
			return
		}

		userID := getUserIDFromOAuthCookie(c, cfg)
		if userID == "" {
			redirectWithError(c, cfg.FrontendURL, "authentication_required")
			return
		}

		// 長期トークンをoauth2.Token形式に変換して保存
		expiresAt := time.Now().Add(time.Duration(expiresIn) * time.Second)
		token := &oauth2.Token{
			AccessToken: longToken,
			Expiry:      expiresAt,
		}

		if err := saveTokens(cfg, extAcctRepo, userID, "instagram", igUserID, token); err != nil {
			log.Printf("save instagram tokens error: %v", err)
			redirectWithError(c, cfg.FrontendURL, "save_failed")
			return
		}

		log.Printf("instagram oauth linked: user=%s ig_user=%s expires_in=%ds", userID, igUserID, expiresIn)

		c.Redirect(http.StatusTemporaryRedirect, cfg.FrontendURL+"/home?linked=instagram")
	}
}

// exchangeForLongLivedToken は短期トークンを60日有効な長期トークンに交換する
func exchangeForLongLivedToken(cfg *config.Config, shortToken string) (string, int64, error) {
	resp, err := http.Get(fmt.Sprintf(
		"https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=%s&client_secret=%s&fb_exchange_token=%s",
		url.QueryEscape(cfg.InstagramClientID),
		url.QueryEscape(cfg.InstagramClientSecret),
		url.QueryEscape(shortToken),
	))
	if err != nil {
		return "", 0, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var result struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		ExpiresIn   int64  `json:"expires_in"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", 0, fmt.Errorf("decode response: %w", err)
	}
	if result.AccessToken == "" {
		return "", 0, fmt.Errorf("empty access token in response: %s", string(body))
	}
	return result.AccessToken, result.ExpiresIn, nil
}

// getInstagramUserID はInstagram Graph APIからユーザーIDを取得する
func getInstagramUserID(accessToken string) (string, error) {
	resp, err := http.Get(fmt.Sprintf(
		"https://graph.facebook.com/v21.0/me/accounts?access_token=%s",
		url.QueryEscape(accessToken),
	))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		Data []struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if len(result.Data) == 0 {
		return "unknown", nil
	}

	// 最初のページIDからIG Business Account IDを取得
	pageID := result.Data[0].ID
	igResp, err := http.Get(fmt.Sprintf(
		"https://graph.facebook.com/v21.0/%s?fields=instagram_business_account&access_token=%s",
		pageID, url.QueryEscape(accessToken),
	))
	if err != nil {
		return pageID, nil
	}
	defer igResp.Body.Close()

	var igResult struct {
		IgAccount struct {
			ID string `json:"id"`
		} `json:"instagram_business_account"`
	}
	if err := json.NewDecoder(igResp.Body).Decode(&igResult); err != nil || igResult.IgAccount.ID == "" {
		return pageID, nil
	}
	return igResult.IgAccount.ID, nil
}

// issueJWT はユーザー情報からJWTトークン文字列を生成する
func issueJWT(user *models.User, secret string) (string, error) {
	claims := &models.Claims{
		UserID: user.ID,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// --- 共通ヘルパー ---

// saveTokens はトークンを暗号化してDBに保存する
func saveTokens(cfg *config.Config, repo *repository.ExternalAccountRepository, userID, provider, providerUserID string, token *oauth2.Token) error {
	encAccess, err := utils.Encrypt(token.AccessToken, cfg.EncryptionKey)
	if err != nil {
		return fmt.Errorf("encrypt access token: %w", err)
	}

	var encRefresh []byte
	if token.RefreshToken != "" {
		encRefresh, err = utils.Encrypt(token.RefreshToken, cfg.EncryptionKey)
		if err != nil {
			return fmt.Errorf("encrypt refresh token: %w", err)
		}
	}

	var expiresAt *time.Time
	if !token.Expiry.IsZero() {
		expiresAt = &token.Expiry
	}

	scopes := ""
	switch provider {
	case "google":
		scopes = "business.manage,userinfo.email"
	case "instagram":
		scopes = "instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement"
	}

	_, err = repo.Upsert(userID, provider, providerUserID, encAccess, encRefresh, expiresAt, scopes)
	return err
}

// getUserIDFromOAuthCookie はcookieに保存されたJWTからuser_idを取得する
func getUserIDFromOAuthCookie(c *gin.Context, cfg *config.Config) string {
	tokenStr, err := c.Cookie("oauth_token")
	if err != nil || tokenStr == "" {
		return ""
	}

	// JWTの解析（middleware.Authと同じロジック）
	claims, err := parseJWT(tokenStr, cfg.JWTSecret)
	if err != nil {
		return ""
	}
	return claims.UserID
}

func redirectWithError(c *gin.Context, frontendURL, errMsg string) {
	c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/home?error="+url.QueryEscape(errMsg))
}

// --- 連携状態API ---

// GetLinkStatus はユーザーの外部アカウント連携状態を返す
func GetLinkStatus(extAcctRepo *repository.ExternalAccountRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		status, err := extAcctRepo.GetLinkStatus(userID.(string))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get link status"})
			return
		}

		c.JSON(http.StatusOK, status)
	}
}

// UnlinkAccount は外部アカウント連携を解除する
func UnlinkAccount(extAcctRepo *repository.ExternalAccountRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		provider := c.Param("provider")
		if provider != "google" && provider != "instagram" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid provider"})
			return
		}

		if err := extAcctRepo.Delete(userID.(string), provider); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unlink"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "unlinked"})
	}
}
