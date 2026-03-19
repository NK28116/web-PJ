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

// CreateSetupIntent はカード保存用 SetupIntent の ClientSecret を返す
func CreateSetupIntent(stripeSvc *service.StripeService, userRepo *repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		user, err := userRepo.FindByID(userID)
		if err != nil || user == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
			return
		}

		customerID := ""
		if user.StripeCustomerID != nil && *user.StripeCustomerID != "" {
			customerID = *user.StripeCustomerID
		} else {
			// カスタマーが存在しない場合は自動生成
			newID, err := stripeSvc.CreateCustomer(user.Email, user.ID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create stripe customer"})
				return
			}
			if err := userRepo.UpdateCustomerID(user.ID, newID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user customer id"})
				return
			}
			customerID = newID
		}

		secret, err := stripeSvc.CreateSetupIntent(customerID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create setup intent"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"client_secret": secret})
	}
}

// GetPaymentMethods はユーザーの保存済みカード一覧を返す
func GetPaymentMethods(stripeSvc *service.StripeService, userRepo *repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		user, err := userRepo.FindByID(userID)
		if err != nil || user == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
			return
		}
		if user.StripeCustomerID == nil || *user.StripeCustomerID == "" {
			c.JSON(http.StatusOK, gin.H{"payment_methods": []struct{}{}})
			return
		}
		pms, err := stripeSvc.ListPaymentMethods(*user.StripeCustomerID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list payment methods"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"payment_methods": pms})
	}
}

// DeletePaymentMethod はカードを削除（Stripeから切り離し）する
func DeletePaymentMethod(stripeSvc *service.StripeService) gin.HandlerFunc {
	return func(c *gin.Context) {
		pmID := c.Param("id")
		if pmID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "payment method id required"})
			return
		}
		if err := stripeSvc.DetachPaymentMethod(pmID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete payment method"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "deleted"})
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
