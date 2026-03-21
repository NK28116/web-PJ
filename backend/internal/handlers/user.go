package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"webSystemPJ/backend/internal/repository"
)

// GetProfile はログインユーザーのプロフィール情報を返す
func GetProfile(userRepo *repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		user, err := userRepo.FindByID(userID)
		if err != nil || user == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"id":        user.ID,
			"email":     user.Email,
			"nickname":  user.Nickname,
			"shop_name": user.ShopName,
			"role":      user.Role,
			"plan_tier": user.PlanTier,
		})
	}
}

type updateProfileRequest struct {
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	ShopName string `json:"shop_name"`
}

// UpdateProfile はニックネームとメールアドレスを更新する
func UpdateProfile(userRepo *repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		var req updateProfileRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}
		// メールアドレスの重複チェック
		if req.Email != "" {
			existing, err := userRepo.FindByEmail(req.Email)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
				return
			}
			if existing != nil && existing.ID != userID {
				c.JSON(http.StatusConflict, gin.H{"error": "email already in use"})
				return
			}
		}
		if err := userRepo.UpdateProfile(userID, req.Nickname, req.Email, req.ShopName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
			return
		}
		user, _ := userRepo.FindByID(userID)
		c.JSON(http.StatusOK, gin.H{
			"id":        user.ID,
			"email":     user.Email,
			"nickname":  user.Nickname,
			"shop_name": user.ShopName,
			"role":      user.Role,
			"plan_tier": user.PlanTier,
		})
	}
}
