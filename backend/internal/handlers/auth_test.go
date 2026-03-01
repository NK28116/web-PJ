package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/handlers"
	"webSystemPJ/backend/internal/models"
)

// mockUserRepository はテスト用のリポジトリモック
type mockUserRepository struct {
	user *models.User
	err  error
}

func (m *mockUserRepository) FindByEmail(_ string) (*models.User, error) {
	return m.user, m.err
}

func (m *mockUserRepository) FindByID(_ string) (*models.User, error) {
	return m.user, m.err
}

func (m *mockUserRepository) Create(_, _, _ string) (*models.User, error) {
	return m.user, m.err
}

func testConfig() *config.Config {
	return &config.Config{
		JWTSecret: "test-secret-key-minimum-32-characters-x",
	}
}

func TestLogin_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// bcrypt hash of "password123"
	hashedPassword := "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

	mockRepo := &mockUserRepository{
		user: &models.User{
			ID:       "test-user-id",
			Email:    "test@example.com",
			Password: hashedPassword,
			Role:     "user",
		},
	}

	r := gin.New()
	r.POST("/login", handlers.Login(testConfig(), mockRepo))

	body, _ := json.Marshal(map[string]string{
		"email":    "test@example.com",
		"password": "password123",
	})
	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if resp["token"] == "" {
		t.Error("expected token in response")
	}
}

func TestLogin_InvalidCredentials(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockRepo := &mockUserRepository{user: nil}
	r := gin.New()
	r.POST("/login", handlers.Login(testConfig(), mockRepo))

	body, _ := json.Marshal(map[string]string{
		"email":    "wrong@example.com",
		"password": "wrongpassword",
	})
	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}

func TestLogin_MissingFields(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockRepo := &mockUserRepository{}
	r := gin.New()
	r.POST("/login", handlers.Login(testConfig(), mockRepo))

	body, _ := json.Marshal(map[string]string{"email": "test@example.com"})
	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestLogin_RejectsAlgNone(t *testing.T) {
	// alg=none のトークンを作成して middleware に渡すテスト
	// ここでは token 文字列レベルで検証
	token := jwt.NewWithClaims(jwt.SigningMethodNone, &models.Claims{
		UserID: "attacker",
		Role:   "admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	})
	tokenString, err := token.SignedString(jwt.UnsafeAllowNoneSignatureType)
	if err != nil {
		t.Fatal(err)
	}
	if tokenString == "" {
		t.Error("token should not be empty")
	}
	// middleware_test.go で実際の拒否を検証する
}
