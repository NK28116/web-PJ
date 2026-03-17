package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/service"
)

// apiError はAPIエラーの統一レスポンス形式
type apiError struct {
	Error   bool   `json:"error"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

func makeAPIError(code, message string) apiError {
	return apiError{Error: true, Code: code, Message: message}
}

// classifyError はエラーを統一コードに変換する
func classifyError(err error, provider string) apiError {
	var rlErr *service.RateLimitError
	if errors.As(err, &rlErr) {
		return makeAPIError("429", fmt.Sprintf("%s rate limit exceeded", provider))
	}
	// トークンなし＝未連携
	if err.Error() == "external account not found" {
		return makeAPIError("NOT_CONNECTED", fmt.Sprintf("%s account not connected", provider))
	}
	return makeAPIError("API_ERROR", err.Error())
}

// mockGoogleReport はモックデータ（requirements.md定義）
func mockGoogleReport(start, end time.Time) *models.GoogleReport {
	return &models.GoogleReport{
		Period:          models.ReportPeriod{Start: start, End: end},
		MapViews:        1200,
		QueriesDirect:   300,
		QueriesIndirect: 500,
		ActionDetail: models.GoogleActionDetail{
			PhoneCalls:    150,
			DirectionReqs: 200,
			WebsiteVisits: 100,
		},
	}
}

// mockInstagramReport はモックデータ（requirements.md定義）
func mockInstagramReport(start, end time.Time) *models.InstagramReport {
	return &models.InstagramReport{
		Period:            models.ReportPeriod{Start: start, End: end},
		ProfileViews:      models.MetricWithChange{Value: 800},
		ActionClicks:      models.MetricWithChange{Value: 120},
		ProfileLinkClicks: models.MetricWithChange{Value: 90},
		StoryLinkClicks:   models.MetricWithChange{Value: 60},
	}
}

// GetReportSummary はGoogle+Instagramの統合サマリーを返す
func GetReportSummary(googleSvc *service.GoogleService, instagramSvc *service.InstagramService, cfg ...*config.Config) gin.HandlerFunc {
	var appCfg *config.Config
	if len(cfg) > 0 {
		appCfg = cfg[0]
	}
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		start, end := parsePeriod(c)

		// モックモード
		if appCfg != nil && appCfg.MockMode {
			gReport := mockGoogleReport(start, end)
			iReport := mockInstagramReport(start, end)
			c.JSON(http.StatusOK, buildSummaryResponse(start, end, gReport, iReport, nil, nil))
			return
		}

		type googleResult struct {
			report *models.GoogleReport
			err    error
		}
		type igResult struct {
			report *models.InstagramReport
			err    error
		}

		gCh := make(chan googleResult, 1)
		iCh := make(chan igResult, 1)

		// Google インサイト並列取得
		go func() {
			defer func() {
				if r := recover(); r != nil {
					gCh <- googleResult{err: fmt.Errorf("google insights panic: %v", r)}
				}
			}()
			report, err := googleSvc.FetchInsights(c.Request.Context(), userID, start, end)
			gCh <- googleResult{report: report, err: err}
		}()

		// Instagram インサイト並列取得
		go func() {
			defer func() {
				if r := recover(); r != nil {
					iCh <- igResult{err: fmt.Errorf("instagram insights panic: %v", r)}
				}
			}()
			report, err := instagramSvc.FetchInsights(c.Request.Context(), userID, start, end)
			iCh <- igResult{report: report, err: err}
		}()

		gRes := <-gCh
		iRes := <-iCh

		var gErr, iErr *apiError
		if gRes.err != nil {
			e := classifyError(gRes.err, "google")
			gErr = &e
		}
		if iRes.err != nil {
			e := classifyError(iRes.err, "instagram")
			iErr = &e
		}

		c.JSON(http.StatusOK, buildSummaryResponse(start, end, gRes.report, iRes.report, gErr, iErr))
	}
}

// buildSummaryResponse は統合サマリーレスポンスを構築する
func buildSummaryResponse(
	start, end time.Time,
	gReport *models.GoogleReport,
	iReport *models.InstagramReport,
	gErr, iErr *apiError,
) gin.H {
	summary := gin.H{
		"period": gin.H{"start": start, "end": end},
	}

	googleProfileViews := 0
	googleActions := 0
	instagramProfileViews := 0
	instagramActions := 0

	if gReport != nil {
		googleProfileViews = gReport.MapViews
		googleActions = gReport.ActionDetail.PhoneCalls +
			gReport.ActionDetail.DirectionReqs +
			gReport.ActionDetail.WebsiteVisits
		summary["google_detail"] = gReport
		summary["review_avg_rating"] = gReport.ReviewStats.AvgRating
	}
	if gErr != nil {
		summary["google_error"] = gErr
	}

	if iReport != nil {
		instagramProfileViews = iReport.ProfileViews.Value
		instagramActions = iReport.ActionClicks.Value +
			iReport.ProfileLinkClicks.Value +
			iReport.StoryLinkClicks.Value
		summary["instagram_detail"] = iReport
	}
	if iErr != nil {
		summary["instagram_error"] = iErr
	}

	totalProfileViews := googleProfileViews + instagramProfileViews
	totalActions := googleActions + instagramActions

	var conversionRate float64
	if totalProfileViews > 0 {
		// 小数点第一位まで（例: 0.31 → 31.0%）
		conversionRate = float64(int(float64(totalActions)/float64(totalProfileViews)*1000)) / 10
	}

	summary["profile_views"] = gin.H{
		"value":          totalProfileViews,
		"change_percent": 0,
	}
	summary["total_actions"] = gin.H{
		"value":          totalActions,
		"change_percent": 0,
	}
	summary["conversion_rate"] = conversionRate
	summary["action_breakdown"] = gin.H{
		"google":    googleActions,
		"instagram": instagramActions,
	}

	return summary
}

// GetGoogleReport はGBP詳細レポートを返す
func GetGoogleReport(googleSvc *service.GoogleService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		start, end := parsePeriod(c)

		report, err := googleSvc.FetchInsights(c.Request.Context(), userID, start, end)
		if err != nil {
			e := classifyError(err, "google")
			c.JSON(http.StatusInternalServerError, e)
			return
		}
		c.JSON(http.StatusOK, report)
	}
}

// GetInstagramReport はInstagram詳細レポートを返す
func GetInstagramReport(instagramSvc *service.InstagramService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		start, end := parsePeriod(c)

		report, err := instagramSvc.FetchInsights(c.Request.Context(), userID, start, end)
		if err != nil {
			e := classifyError(err, "instagram")
			c.JSON(http.StatusInternalServerError, e)
			return
		}
		c.JSON(http.StatusOK, report)
	}
}

// parsePeriod はクエリパラメータから期間を解析する (デフォルト: 過去30日)
func parsePeriod(c *gin.Context) (time.Time, time.Time) {
	now := time.Now()
	end := now
	start := now.AddDate(0, 0, -30)

	if s := c.Query("start"); s != "" {
		if t, err := time.Parse("2006-01-02", s); err == nil {
			start = t
		}
	}
	if e := c.Query("end"); e != "" {
		if t, err := time.Parse("2006-01-02", e); err == nil {
			end = t
		}
	}
	return start, end
}
