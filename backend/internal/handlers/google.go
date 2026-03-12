package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/service"
)

// GetGoogleReviews は口コミ一覧を返す
func GetGoogleReviews(googleSvc *service.GoogleService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")

		reviews, err := googleSvc.FetchReviews(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if reviews == nil {
			reviews = []models.GoogleReview{}
		}
		c.JSON(http.StatusOK, reviews)
	}
}

// ReplyGoogleReview は口コミに返信する
func ReplyGoogleReview(googleSvc *service.GoogleService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		reviewID := c.Param("id")

		var req models.ReviewReplyRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		if err := googleSvc.ReplyToReview(c.Request.Context(), userID, reviewID, req.Comment); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "replied"})
	}
}

// GetGoogleLocations は管理対象店舗一覧を返す
func GetGoogleLocations(googleSvc *service.GoogleService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")

		locations, err := googleSvc.FetchLocations(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if locations == nil {
			locations = []models.GoogleLocation{}
		}
		c.JSON(http.StatusOK, locations)
	}
}
