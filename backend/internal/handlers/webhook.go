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
		event, err := webhook.ConstructEventWithOptions(payload, sigHeader, cfg.StripeWebhookSecret, webhook.ConstructEventOptions{
			IgnoreAPIVersionMismatch: true,
		})
		if err != nil {
			log.Printf("[webhook] ConstructEvent error: %v", err)
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

		case "customer.subscription.created", "customer.subscription.updated":
			var subscription stripe.Subscription
			if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
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
			// price_id からプラン区分を判定して plan_tier を更新
			if len(subscription.Items.Data) > 0 {
				priceID := subscription.Items.Data[0].Price.ID
				planTier := "light" // default

				// Basic plan prices (all phases)
				switch priceID {
				case cfg.StripePriceIDBasic,
					cfg.StripePriceIDBasicBeta,
					cfg.StripePriceIDBasicLaunch,
					cfg.StripePriceIDBasicGrowth:
					planTier = "basic"
				case cfg.StripePriceIDPro,
					cfg.StripePriceIDProBeta,
					cfg.StripePriceIDProLaunch,
					cfg.StripePriceIDProGrowth:
					planTier = "pro"
				}

				if err := userRepo.UpdatePlanTierBySubscription(subscription.ID, planTier); err != nil {
					log.Printf("stripe webhook: UpdatePlanTierBySubscription error: %v", err)
				}
			}

		case "customer.subscription.deleted":
			var subscription stripe.Subscription
			if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Error parsing subscription"})
				return
			}
			log.Printf("stripe webhook: subscription.deleted subscription=%s", subscription.ID)
			if err := userRepo.CancelSubscription(subscription.ID); err != nil {
				log.Printf("stripe webhook: CancelSubscription error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to cancel subscription"})
				return
			}
		}

		c.Status(http.StatusOK)
	}
}
