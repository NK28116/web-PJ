package handlers_test

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"webSystemPJ/backend/internal/handlers"
	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/service"
)

// mockPostRepo はベンチマーク用のモックPostRepository
type mockPostRepo struct{}

func (m *mockPostRepo) GetAll(userID string) ([]models.Post, error) {
	return []models.Post{
		{ID: "1", UserID: userID, Title: "Test Post 1", Body: "Body 1"},
		{ID: "2", UserID: userID, Title: "Test Post 2", Body: "Body 2"},
	}, nil
}

func (m *mockPostRepo) GetByID(userID, postID string) (*models.Post, error) {
	return &models.Post{ID: postID, UserID: userID, Title: "Test", Body: "Body"}, nil
}

func (m *mockPostRepo) Create(userID, title, body string) (*models.Post, error) {
	return &models.Post{ID: "new", UserID: userID, Title: title, Body: body}, nil
}

func benchRouter(handler gin.HandlerFunc) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("user_id", "bench-user-id")
		c.Next()
	})
	return r
}

// BenchmarkGetReportSummary はGET /api/reports/summaryのレスポンス時間を計測する
// 外部API連携を含むため、モックHTTPクライアントで模倣
func BenchmarkGetReportSummary(b *testing.B) {
	cfg := testServiceConfig()
	mock := &mockHTTPClient{
		responses: map[string]*http.Response{
			"accounts": newMockResponse(200, `{"accounts":[{"name":"accounts/123"}]}`),
			"locations": newMockResponse(200, `{"locations":[{"name":"locations/loc1","title":"Test Store"}]}`),
			"dailyMetrics": newMockResponse(200, `{"dailyMetricResults":[]}`),
			"reviews":      newMockResponse(200, `{"reviews":[]}`),
			"searchkeywords": newMockResponse(200, `{"searchKeywordsCounts":[]}`),
			"instagram":    newMockResponse(200, `{"data":[]}`),
			"insights":     newMockResponse(200, `{"data":[]}`),
		},
	}
	googleSvc := service.NewGoogleService(cfg, nil, mock)
	instagramSvc := service.NewInstagramService(cfg, nil, mock)

	r := benchRouter(nil)
	r.GET("/api/reports/summary", handlers.GetReportSummary(googleSvc, instagramSvc))

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/reports/summary?start=2026-01-01&end=2026-01-31", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
	}
}

// BenchmarkGetPosts はGET /api/postsのレスポンス時間を計測する
func BenchmarkGetPosts(b *testing.B) {
	repo := &mockPostRepo{}

	r := benchRouter(nil)
	r.GET("/api/posts", handlers.GetPosts(repo))

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/posts", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
	}
}

// BenchmarkGetLinkStatus はGET /api/link-statusのレスポンス時間を計測する
// 注意: ExternalAccountRepositoryはinterface化されていないためnilを使用し、
// レスポンスタイムはハンドラー+ルーティングのオーバーヘッドを計測
func BenchmarkGetLinkStatus(b *testing.B) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	// user_idなしでリクエスト → 401が返る (repo不要)
	r.GET("/api/link-status", handlers.GetLinkStatus(nil))

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/link-status", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
	}
}

// BenchmarkGetReportSummary_Parallel は並列リクエストでのレスポンス時間を計測する
func BenchmarkGetReportSummary_Parallel(b *testing.B) {
	cfg := testServiceConfig()
	mock := &mockHTTPClient{
		responses: map[string]*http.Response{
			"accounts": {
				StatusCode: 200,
				Body:       io.NopCloser(strings.NewReader(`{"accounts":[{"name":"accounts/123"}]}`)),
			},
		},
	}
	googleSvc := service.NewGoogleService(cfg, nil, mock)
	instagramSvc := service.NewInstagramService(cfg, nil, mock)

	r := benchRouter(nil)
	r.GET("/api/reports/summary", handlers.GetReportSummary(googleSvc, instagramSvc))

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			req := httptest.NewRequest(http.MethodGet, "/api/reports/summary?start=2026-01-01&end=2026-01-31", nil)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)
		}
	})
}
