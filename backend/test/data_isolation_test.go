//go:build integration

// データ分離統合テスト
// 実行: DATABASE_URL=... JWT_SECRET=... go test -tags=integration ./test/...
package test

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"

	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/handlers"
	"webSystemPJ/backend/internal/middleware"
	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/repository"
	"webSystemPJ/backend/internal/service"
)

func setupDB(t *testing.T) *sql.DB {
	t.Helper()
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		t.Skip("DATABASE_URL not set, skipping integration test")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	if err := db.Ping(); err != nil {
		t.Fatalf("ping db: %v", err)
	}

	// マイグレーション実行
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		t.Fatalf("migration driver: %v", err)
	}
	m, err := migrate.NewWithDatabaseInstance("file://../migrations", "postgres", driver)
	if err != nil {
		t.Fatalf("migrator: %v", err)
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		t.Fatalf("migrate up: %v", err)
	}

	return db
}

func insertUser(t *testing.T, db *sql.DB, email, password, role string) string {
	t.Helper()
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}
	var id string
	err = db.QueryRow(
		"INSERT INTO users (email, password, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password=EXCLUDED.password RETURNING id",
		email, string(hashed), role,
	).Scan(&id)
	if err != nil {
		t.Fatalf("insert user %s: %v", email, err)
	}
	return id
}

func makeToken(cfg *config.Config, userID, role string) string {
	claims := &models.Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, _ := token.SignedString([]byte(cfg.JWTSecret))
	return s
}

func setupRouter(db *sql.DB, cfg *config.Config) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	userRepo := repository.NewUserRepository(db)
	postRepo := repository.NewPostRepository(db)

	r.POST("/login", handlers.Login(cfg, userRepo))
	r.GET("/health", handlers.Health)

	protected := r.Group("/")
	protected.Use(middleware.Auth(cfg))
	{
		protected.GET("/posts", handlers.GetPosts(postRepo))
		protected.GET("/posts/:id", handlers.GetPost(postRepo))
		protected.POST("/posts", handlers.CreatePost(postRepo))
	}
	return r
}

// setupExtendedRouter は拡張テスト用のルーターを構築する
func setupExtendedRouter(cfg *config.Config, userRepo *repository.UserRepository, extAcctRepo *repository.ExternalAccountRepository, stripeSvc *service.StripeService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	protected := r.Group("/")
	protected.Use(middleware.Auth(cfg))
	{
		protected.DELETE("/api/unlink/:provider", handlers.UnlinkAccount(extAcctRepo))
		protected.GET("/api/link-status", handlers.GetLinkStatus(extAcctRepo))
		protected.POST("/api/billing/portal", handlers.CreatePortalSession(stripeSvc, userRepo))
	}
	return r
}

// insertExternalAccount はテスト用の外部アカウントを挿入する
func insertExternalAccount(t *testing.T, repo *repository.ExternalAccountRepository, userID, provider, providerUserID string) {
	t.Helper()
	expiresAt := time.Now().Add(24 * time.Hour)
	_, err := repo.Upsert(userID, provider, providerUserID, []byte("enc_access"), []byte("enc_refresh"), &expiresAt, "test_scope")
	if err != nil {
		t.Fatalf("insert external account: %v", err)
	}
}

func testCfg() *config.Config {
	return &config.Config{
		JWTSecret:   "test-secret-key-minimum-32-characters-x",
		FrontendURL: "http://localhost:3000",
	}
}

// TestDataIsolation_UserACannotAccessUserBData は
// User A のトークンで User B の投稿 ID を指定した場合に 404 が返ることを検証する
func TestDataIsolation_UserACannotAccessUserBData(t *testing.T) {
	db := setupDB(t)
	defer db.Close()

	cfg := &config.Config{
		JWTSecret: os.Getenv("JWT_SECRET"),
	}
	if cfg.JWTSecret == "" {
		cfg.JWTSecret = "test-secret-key-minimum-32-characters-x"
	}

	suffix := fmt.Sprintf("%d", time.Now().UnixNano())
	userAID := insertUser(t, db, "usera_isolation_"+suffix+"@example.com", "passwordA", "user")
	userBID := insertUser(t, db, "userb_isolation_"+suffix+"@example.com", "passwordB", "user")

	r := setupRouter(db, cfg)

	// User B の投稿を作成
	tokenB := makeToken(cfg, userBID, "user")
	postBody, _ := json.Marshal(map[string]string{"title": "User B の投稿", "body": "User B のコンテンツ"})
	req := httptest.NewRequest(http.MethodPost, "/posts", bytes.NewBuffer(postBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+tokenB)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("User B post creation: expected 201, got %d: %s", w.Code, w.Body.String())
	}

	var createdPost map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &createdPost)
	postID := createdPost["id"].(string)

	// User A のトークンで User B の投稿 ID を取得しようとする
	tokenA := makeToken(cfg, userAID, "user")
	req2 := httptest.NewRequest(http.MethodGet, "/posts/"+postID, nil)
	req2.Header.Set("Authorization", "Bearer "+tokenA)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)

	// 他ユーザーのデータは 404 で拒否される
	if w2.Code != http.StatusNotFound {
		t.Fatalf("expected 404 when User A accesses User B's post, got %d: %s", w2.Code, w2.Body.String())
	}
}

// TestDataIsolation_PostListContainsOnlyOwnPosts は
// GET /posts が自分の投稿のみを返すことを検証する
func TestDataIsolation_PostListContainsOnlyOwnPosts(t *testing.T) {
	db := setupDB(t)
	defer db.Close()

	cfg := &config.Config{
		JWTSecret: os.Getenv("JWT_SECRET"),
	}
	if cfg.JWTSecret == "" {
		cfg.JWTSecret = "test-secret-key-minimum-32-characters-x"
	}

	suffix := fmt.Sprintf("%d", time.Now().UnixNano())
	userAID := insertUser(t, db, "usera_list_"+suffix+"@example.com", "passwordA", "user")
	userBID := insertUser(t, db, "userb_list_"+suffix+"@example.com", "passwordB", "user")

	r := setupRouter(db, cfg)

	// User B の投稿を作成
	tokenB := makeToken(cfg, userBID, "user")
	for i := 0; i < 3; i++ {
		body, _ := json.Marshal(map[string]string{
			"title": fmt.Sprintf("User B post %d", i),
			"body":  "content",
		})
		req := httptest.NewRequest(http.MethodPost, "/posts", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tokenB)
		r.ServeHTTP(httptest.NewRecorder(), req)
	}

	// User A のトークンで投稿一覧を取得
	tokenA := makeToken(cfg, userAID, "user")
	req := httptest.NewRequest(http.MethodGet, "/posts", nil)
	req.Header.Set("Authorization", "Bearer "+tokenA)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var posts []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &posts)

	// User A の投稿は 0 件（User B の投稿が混在しないこと）
	for _, p := range posts {
		if p["user_id"].(string) != userAID {
			t.Errorf("found post belonging to another user in list: %v", p)
		}
	}
}

// TestDataIsolation_UnlinkCannotDeleteOtherUserAccount は
// User A のトークンで User B の external_account を削除できないことを検証する
func TestDataIsolation_UnlinkCannotDeleteOtherUserAccount(t *testing.T) {
	db := setupDB(t)
	defer db.Close()

	cfg := testCfg()
	extAcctRepo := repository.NewExternalAccountRepository(db)

	suffix := fmt.Sprintf("%d", time.Now().UnixNano())
	userAID := insertUser(t, db, "unlink_a_"+suffix+"@example.com", "passwordA", "user")
	userBID := insertUser(t, db, "unlink_b_"+suffix+"@example.com", "passwordB", "user")

	// User B に Google アカウントを連携
	insertExternalAccount(t, extAcctRepo, userBID, "google", "google-provider-b")

	// User B のリンク状態を確認 (連携済み)
	statusBefore, err := extAcctRepo.GetLinkStatus(userBID)
	if err != nil {
		t.Fatalf("get link status: %v", err)
	}
	if !statusBefore.Google {
		t.Fatal("expected User B's Google to be linked")
	}

	// User A のトークンで User B の Google を unlink しようとする
	r := setupExtendedRouter(cfg, nil, extAcctRepo, nil)
	tokenA := makeToken(cfg, userAID, "user")

	req := httptest.NewRequest(http.MethodDelete, "/api/unlink/google", nil)
	req.Header.Set("Authorization", "Bearer "+tokenA)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// API は 200 を返すが (User A 自身には google がないので空振り DELETE)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	// User B のリンク状態は変わっていないことを確認
	statusAfter, err := extAcctRepo.GetLinkStatus(userBID)
	if err != nil {
		t.Fatalf("get link status after: %v", err)
	}
	if !statusAfter.Google {
		t.Fatal("User B's Google account should still be linked after User A's unlink attempt")
	}
}

// TestDataIsolation_PortalSessionRequiresOwnStripeCustomer は
// User A のトークンでは User B の Stripe ポータルセッションを作成できないことを検証する
func TestDataIsolation_PortalSessionRequiresOwnStripeCustomer(t *testing.T) {
	db := setupDB(t)
	defer db.Close()

	cfg := testCfg()
	userRepo := repository.NewUserRepository(db)
	stripeSvc := service.NewStripeService(cfg)

	suffix := fmt.Sprintf("%d", time.Now().UnixNano())
	userAID := insertUser(t, db, "portal_a_"+suffix+"@example.com", "passwordA", "user")
	userBID := insertUser(t, db, "portal_b_"+suffix+"@example.com", "passwordB", "user")

	// User B に Stripe 情報を設定
	err := userRepo.UpdateStripeInfo(userBID, "cus_test_b", "sub_test_b")
	if err != nil {
		t.Fatalf("update stripe info: %v", err)
	}

	// User A のトークンでポータルセッションを作成しようとする
	// → User A には StripeCustomerID がないので 400 が返る
	r := setupExtendedRouter(cfg, userRepo, nil, stripeSvc)
	tokenA := makeToken(cfg, userAID, "user")

	req := httptest.NewRequest(http.MethodPost, "/api/billing/portal", nil)
	req.Header.Set("Authorization", "Bearer "+tokenA)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 (no stripe customer), got %d: %s", w.Code, w.Body.String())
	}
}

// TestDataIsolation_OAuthStateValidation は
// state パラメータ不一致時に OAuth コールバックが拒否されることを検証する
func TestDataIsolation_OAuthStateValidation(t *testing.T) {
	gin.SetMode(gin.TestMode)

	cfg := testCfg()
	cfg.GoogleClientID = "test-client-id"
	cfg.GoogleClientSecret = "test-client-secret"
	cfg.GoogleRedirectURL = "http://localhost:8080/api/auth/google/callback"
	cfg.FrontendURL = "http://localhost:3000"

	db := setupDB(t)
	defer db.Close()
	extAcctRepo := repository.NewExternalAccountRepository(db)

	r := gin.New()
	r.GET("/api/auth/google/callback", handlers.GoogleCallback(cfg, extAcctRepo))

	// state パラメータなしでコールバック → 400
	req := httptest.NewRequest(http.MethodGet, "/api/auth/google/callback?code=test_code&state=forged_state", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for mismatched state, got %d: %s", w.Code, w.Body.String())
	}
}
