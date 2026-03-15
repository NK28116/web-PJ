package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
)

func StripeWebhook(cfg *config.Config, userRepo *repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		const MaxBodyBytes = int64(65536)
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)
		payload, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Error reading request body"})
			return
		}

		sigHeader := c.GetHeader("Stripe-Signature")
		event, err := webhook.ConstructEvent(payload, sigHeader, cfg.StripeWebhookSecret)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid signature"})
			return
		}

		switch event.Type {
		case "checkout.session.completed":
			var session stripe.CheckoutSession
			err := json.Unmarshal(event.Data.Raw, &session)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Error parsing session"})
				return
			}

			userID := session.ClientReferenceID
			if userID == "" {
				// Metadata フォールバック (旧セッション互換)
				userID = session.Metadata["user_id"]
			}
			if userID == "" {
				log.Printf("stripe webhook: checkout.session.completed missing user_id, session=%s", session.ID)
				c.JSON(http.StatusBadRequest, gin.H{"error": "missing user identification"})
				return
			}

			customerID := ""
			if session.Customer != nil {
				customerID = session.Customer.ID
			}

			subscriptionID := ""
			if session.Subscription != nil {
				subscriptionID = session.Subscription.ID
			}

			log.Printf("stripe webhook: checkout completed user=%s customer=%s subscription=%s", userID, customerID, subscriptionID)
			if err := userRepo.UpdateStripeInfo(userID, customerID, subscriptionID); err != nil {
				log.Printf("stripe webhook: UpdateStripeInfo error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user stripe info"})
				return
			}

		case "customer.subscription.updated", "customer.subscription.deleted":
			var subscription stripe.Subscription
			err := json.Unmarshal(event.Data.Raw, &subscription)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Error parsing subscription"})
				return
			}

			status := string(subscription.Status)
			log.Printf("stripe webhook: %s subscription=%s status=%s", event.Type, subscription.ID, status)
			if err := userRepo.UpdateSubscriptionStatus(subscription.ID, status); err != nil {
				log.Printf("stripe webhook: UpdateSubscriptionStatus error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update subscription status"})
				return
			}
		}

		c.Status(http.StatusOK)
	}
}
