package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"webSystemPJ/backend/internal/repository"
	"webSystemPJ/backend/internal/service"
)

func CreateCheckoutSession(stripeSvc *service.StripeService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		var req struct {
			PriceID string `json:"price_id" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		url, err := stripeSvc.CreateCheckoutSession(userID, req.PriceID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create checkout session"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"url": url})
	}
}

func CreatePortalSession(stripeSvc *service.StripeService, userRepo *repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		user, err := userRepo.FindByID(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user"})
			return
		}
		if user == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		if user.StripeCustomerID == nil || *user.StripeCustomerID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "stripe customer id not found"})
			return
		}

		url, err := stripeSvc.CreatePortalSession(*user.StripeCustomerID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create portal session"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"url": url})
	}
}
