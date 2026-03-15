package service

import (
	"github.com/stripe/stripe-go/v76"
	portalsession "github.com/stripe/stripe-go/v76/billingportal/session"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"webSystemPJ/backend/internal/config"
)

type StripeService struct {
	cfg *config.Config
}

func NewStripeService(cfg *config.Config) *StripeService {
	stripe.Key = cfg.StripeSecretKey
	return &StripeService{cfg: cfg}
}

func (s *StripeService) CreateCheckoutSession(userID, priceID string) (string, error) {
	params := &stripe.CheckoutSessionParams{
		Mode: stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL:        stripe.String(s.cfg.FrontendURL + "/billing?success=true"),
		CancelURL:         stripe.String(s.cfg.FrontendURL + "/billing?canceled=true"),
		ClientReferenceID: stripe.String(userID),
	}

	sess, err := session.New(params)
	if err != nil {
		return "", err
	}

	return sess.URL, nil
}

func (s *StripeService) CreatePortalSession(customerID string) (string, error) {
	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(customerID),
		ReturnURL: stripe.String(s.cfg.FrontendURL + "/billing"),
	}

	sess, err := portalsession.New(params)
	if err != nil {
		return "", err
	}

	return sess.URL, nil
}
