package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/middleware"
	"webSystemPJ/backend/internal/models"
)

func testConfig() *config.Config {
	return &config.Config{
		JWTSecret: "test-secret-key-minimum-32-characters-x",
	}
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

func TestAuth_ValidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cfg := testConfig()

	r := gin.New()
	r.Use(middleware.Auth(cfg))
	r.GET("/protected", func(c *gin.Context) {
		userID := c.GetString("user_id")
		c.JSON(http.StatusOK, gin.H{"user_id": userID})
	})

	tokenStr := makeToken(cfg, "user-123", "user")
	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+tokenStr)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
}

func TestAuth_MissingToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cfg := testConfig()

	r := gin.New()
	r.Use(middleware.Auth(cfg))
	r.GET("/protected", func(c *gin.Context) { c.Status(http.StatusOK) })

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}

func TestAuth_InvalidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cfg := testConfig()

	r := gin.New()
	r.Use(middleware.Auth(cfg))
	r.GET("/protected", func(c *gin.Context) { c.Status(http.StatusOK) })

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer invalid.token.here")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}

func TestAuth_AlgNoneRejected(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cfg := testConfig()

	r := gin.New()
	r.Use(middleware.Auth(cfg))
	r.GET("/protected", func(c *gin.Context) { c.Status(http.StatusOK) })

	// alg=none トークンを生成
	claims := &models.Claims{
		UserID: "attacker",
		Role:   "admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodNone, claims)
	tokenString, _ := token.SignedString(jwt.UnsafeAllowNoneSignatureType)

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for alg=none, got %d", w.Code)
	}
}
