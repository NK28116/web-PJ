package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/service"
)

// GetReportSummary はGoogle+Instagramの統合サマリーを返す
func GetReportSummary(googleSvc *service.GoogleService, instagramSvc *service.InstagramService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		start, end := parsePeriod(c)

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

		summary := gin.H{
			"period": gin.H{"start": start, "end": end},
		}

		googleActions := 0
		instagramActions := 0
		profileViews := 0

		if gRes.err == nil && gRes.report != nil {
			googleActions = gRes.report.ActionDetail.PhoneCalls +
				gRes.report.ActionDetail.DirectionReqs +
				gRes.report.ActionDetail.WebsiteVisits
			summary["google_detail"] = gRes.report
			summary["review_avg_rating"] = gRes.report.ReviewStats.AvgRating
		}

		if iRes.err == nil && iRes.report != nil {
			instagramActions = iRes.report.WebsiteClicks.Value
			profileViews = iRes.report.ProfileViews.Value
			summary["instagram_detail"] = iRes.report
		}

		summary["profile_views"] = gin.H{
			"value":          profileViews,
			"change_percent": 0,
		}
		summary["total_actions"] = gin.H{
			"value":          googleActions + instagramActions,
			"change_percent": 0,
		}
		summary["action_breakdown"] = gin.H{
			"google":    googleActions,
			"instagram": instagramActions,
		}

		c.JSON(http.StatusOK, summary)
	}
}

// GetGoogleReport はGBP詳細レポートを返す
func GetGoogleReport(googleSvc *service.GoogleService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		start, end := parsePeriod(c)

		report, err := googleSvc.FetchInsights(c.Request.Context(), userID, start, end)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
