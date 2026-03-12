package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/service"
)

// GetInstagramMedia はInstagram投稿一覧を返す
func GetInstagramMedia(instagramSvc *service.InstagramService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")

		media, err := instagramSvc.FetchMedia(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if media == nil {
			media = []models.InstagramMediaItem{}
		}
		c.JSON(http.StatusOK, media)
	}
}

// CreateInstagramMedia はInstagram投稿を作成する
func CreateInstagramMedia(instagramSvc *service.InstagramService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")

		var req models.InstagramMediaCreateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		mediaID, err := instagramSvc.CreateMedia(c.Request.Context(), userID, req.ImageURL, req.Caption)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"id": mediaID})
	}
}
