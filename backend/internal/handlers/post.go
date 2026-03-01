package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"webSystemPJ/backend/internal/models"
	"webSystemPJ/backend/internal/repository"
)

type createPostRequest struct {
	Title string `json:"title" binding:"required"`
	Body  string `json:"body" binding:"required"`
}

func GetPosts(postRepo repository.PostRepositoryInterface) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		posts, err := postRepo.GetAll(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
			return
		}
		if posts == nil {
			posts = []models.Post{}
		}
		c.JSON(http.StatusOK, posts)
	}
}

func GetPost(postRepo repository.PostRepositoryInterface) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		postID := c.Param("id")

		post, err := postRepo.GetByID(userID, postID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch post"})
			return
		}
		// 他ユーザーの投稿 ID を指定された場合も 404 を返す（データ分離）
		if post == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
			return
		}
		c.JSON(http.StatusOK, post)
	}
}

func CreatePost(postRepo repository.PostRepositoryInterface) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		var req createPostRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		post, err := postRepo.Create(userID, req.Title, req.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
			return
		}
		c.JSON(http.StatusCreated, post)
	}
}
