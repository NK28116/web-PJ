package handlers_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"webSystemPJ/backend/internal/handlers"
	"webSystemPJ/backend/internal/service"
)

func TestCreateCheckoutSession_BadRequest_MissingPriceID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	cfg := testServiceConfig()
	cfg.FrontendURL = "http://localhost:3000"
	stripeSvc := service.NewStripeService(cfg)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("user_id", "test-user-id")
		c.Next()
	})
	r.POST("/api/billing/checkout", handlers.CreateCheckoutSession(stripeSvc))

	// price_id が空のリクエスト → 400
	body := `{}`
	req := httptest.NewRequest(http.MethodPost, "/api/billing/checkout", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
	}
}

func TestCreateCheckoutSession_Unauthorized_NoUserID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	cfg := testServiceConfig()
	stripeSvc := service.NewStripeService(cfg)

	r := gin.New()
	// user_id をコンテキストにセットしない
	r.POST("/api/billing/checkout", handlers.CreateCheckoutSession(stripeSvc))

	body := `{"price_id":"price_123"}`
	req := httptest.NewRequest(http.MethodPost, "/api/billing/checkout", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", w.Code, w.Body.String())
	}
}

func TestCreatePortalSession_Unauthorized_NoUserID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	cfg := testServiceConfig()
	stripeSvc := service.NewStripeService(cfg)

	r := gin.New()
	// user_id をコンテキストにセットしない
	r.POST("/api/billing/portal", handlers.CreatePortalSession(stripeSvc, nil))

	req := httptest.NewRequest(http.MethodPost, "/api/billing/portal", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", w.Code, w.Body.String())
	}
}

func TestStripeWebhook_InvalidSignature(t *testing.T) {
	gin.SetMode(gin.TestMode)

	cfg := testServiceConfig()
	cfg.StripeWebhookSecret = "whsec_test_secret"

	r := gin.New()
	r.POST("/api/webhooks/stripe", handlers.StripeWebhook(cfg, nil))

	// 不正な署名 → 400
	body := `{"type":"checkout.session.completed"}`
	req := httptest.NewRequest(http.MethodPost, "/api/webhooks/stripe", strings.NewReader(body))
	req.Header.Set("Stripe-Signature", "t=1234567890,v1=invalid_signature")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
	}
}

func TestStripeWebhook_EmptyBody(t *testing.T) {
	gin.SetMode(gin.TestMode)

	cfg := testServiceConfig()
	cfg.StripeWebhookSecret = "whsec_test_secret"

	r := gin.New()
	r.POST("/api/webhooks/stripe", handlers.StripeWebhook(cfg, nil))

	req := httptest.NewRequest(http.MethodPost, "/api/webhooks/stripe", strings.NewReader(""))
	req.Header.Set("Stripe-Signature", "")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
	}
}
