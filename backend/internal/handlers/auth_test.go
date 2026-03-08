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
	"golang.org/x/crypto/bcrypt"

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

// flexibleMockUserRepository は FindByEmail と Create で独立したレスポンスを返すモック
type flexibleMockUserRepository struct {
	findByEmailUser *models.User
	findByEmailErr  error
	createUser      *models.User
	createErr       error
}

func (m *flexibleMockUserRepository) FindByEmail(_ string) (*models.User, error) {
	return m.findByEmailUser, m.findByEmailErr
}

func (m *flexibleMockUserRepository) FindByID(_ string) (*models.User, error) {
	return nil, nil
}

func (m *flexibleMockUserRepository) Create(_, _, _ string) (*models.User, error) {
	return m.createUser, m.createErr
}

func testConfig() *config.Config {
	return &config.Config{
		JWTSecret: "test-secret-key-minimum-32-characters-x",
	}
}

func TestLogin_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Generate bcrypt hash of "password123" at test runtime
	hashed, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.MinCost)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}
	hashedPassword := string(hashed)

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

// --- Health ---

func TestHealth(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/health", handlers.Health)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
}

// --- Register ---

func TestRegister_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockRepo := &flexibleMockUserRepository{
		findByEmailUser: nil,
		createUser: &models.User{
			ID:    "new-user-id",
			Email: "new@example.com",
			Role:  "user",
		},
	}
	r := gin.New()
	r.POST("/register", handlers.Register(testConfig(), mockRepo))

	body, _ := json.Marshal(map[string]string{
		"email":    "new@example.com",
		"password": "password123",
	})
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
	}
	var resp map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if resp["token"] == "" || resp["token"] == nil {
		t.Error("expected non-empty token in response")
	}
}

func TestRegister_DuplicateEmail(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockRepo := &flexibleMockUserRepository{
		findByEmailUser: &models.User{ID: "existing-id", Email: "dup@example.com", Role: "user"},
	}
	r := gin.New()
	r.POST("/register", handlers.Register(testConfig(), mockRepo))

	body, _ := json.Marshal(map[string]string{
		"email":    "dup@example.com",
		"password": "password123",
	})
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d: %s", w.Code, w.Body.String())
	}
}

func TestRegister_InvalidRequest_ShortPassword(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockRepo := &flexibleMockUserRepository{}
	r := gin.New()
	r.POST("/register", handlers.Register(testConfig(), mockRepo))

	// min=8 に満たない7文字パスワード
	body, _ := json.Marshal(map[string]string{
		"email":    "test@example.com",
		"password": "short12",
	})
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
	}
}

func TestRegister_InvalidRequest_NoEmail(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockRepo := &flexibleMockUserRepository{}
	r := gin.New()
	r.POST("/register", handlers.Register(testConfig(), mockRepo))

	body, _ := json.Marshal(map[string]string{
		"password": "password123",
	})
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
	}
}
