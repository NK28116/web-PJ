package service

import (
	"github.com/stripe/stripe-go/v76"
	portalsession "github.com/stripe/stripe-go/v76/billingportal/session"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/customer"
	"github.com/stripe/stripe-go/v76/paymentmethod"
	"github.com/stripe/stripe-go/v76/invoice"
	"github.com/stripe/stripe-go/v76/setupintent"
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

// CreateCustomer は Stripe 上に顧客を作成する
func (s *StripeService) CreateCustomer(email, userID string) (string, error) {
	params := &stripe.CustomerParams{
		Email: stripe.String(email),
		Metadata: map[string]string{
			"user_id": userID,
		},
	}
	cus, err := customer.New(params)
	if err != nil {
		return "", err
	}
	return cus.ID, nil
}

// CreateSetupIntent はカード保存用の SetupIntent を作成する
func (s *StripeService) CreateSetupIntent(customerID string) (string, error) {
	params := &stripe.SetupIntentParams{
		Customer: stripe.String(customerID),
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
	}
	si, err := setupintent.New(params)
	if err != nil {
		return "", err
	}
	return si.ClientSecret, nil
}

// PaymentMethodItem はカード情報の返却用構造体
type PaymentMethodItem struct {
	ID       string `json:"id"`
	Brand    string `json:"brand"`
	Last4    string `json:"last4"`
	ExpMonth int64  `json:"exp_month"`
	ExpYear  int64  `json:"exp_year"`
}

// ListPaymentMethods はCustomerに紐付いたカード一覧を返す
func (s *StripeService) ListPaymentMethods(customerID string) ([]PaymentMethodItem, error) {
	params := &stripe.PaymentMethodListParams{
		Customer: stripe.String(customerID),
		Type:     stripe.String("card"),
	}
	iter := paymentmethod.List(params)
	var items []PaymentMethodItem
	for iter.Next() {
		pm := iter.PaymentMethod()
		items = append(items, PaymentMethodItem{
			ID:       pm.ID,
			Brand:    string(pm.Card.Brand),
			Last4:    pm.Card.Last4,
			ExpMonth: pm.Card.ExpMonth,
			ExpYear:  pm.Card.ExpYear,
		})
	}
	if err := iter.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

// DetachPaymentMethod はカードをCustomerから切り離す（削除）
func (s *StripeService) DetachPaymentMethod(pmID string) error {
	_, err := paymentmethod.Detach(pmID, nil)
	return err
}

// InvoiceItem は支払い履歴の返却用構造体
type InvoiceItem struct {
	ID            string `json:"id"`
	AmountPaid    int64  `json:"amount_paid"`
	Currency      string `json:"currency"`
	Status        string `json:"status"`
	Created       int64  `json:"created"`
	InvoicePDFURL string `json:"invoice_pdf_url"`
	HostedURL     string `json:"hosted_url"`
	PlanName      string `json:"plan_name"`
}

// UpcomingInvoice は次回請求の返却用構造体
type UpcomingInvoice struct {
	AmountDue       int64  `json:"amount_due"`
	Currency        string `json:"currency"`
	NextPaymentDate int64  `json:"next_payment_date"`
}

// ListInvoices はCustomerの決済履歴を取得する
func (s *StripeService) ListInvoices(customerID string) ([]InvoiceItem, error) {
	params := &stripe.InvoiceListParams{
		Customer: stripe.String(customerID),
	}
	params.Filters.AddFilter("limit", "", "10")
	iter := invoice.List(params)
	var items []InvoiceItem
	for iter.Next() {
		inv := iter.Invoice()
		planName := ""
		if len(inv.Lines.Data) > 0 && inv.Lines.Data[0].Description != "" {
			planName = inv.Lines.Data[0].Description
		}
		item := InvoiceItem{
			ID:         inv.ID,
			AmountPaid: inv.AmountPaid,
			Currency:   string(inv.Currency),
			Status:     string(inv.Status),
			Created:    inv.Created,
			PlanName:   planName,
		}
		if inv.InvoicePDF != "" {
			item.InvoicePDFURL = inv.InvoicePDF
		}
		if inv.HostedInvoiceURL != "" {
			item.HostedURL = inv.HostedInvoiceURL
		}
		items = append(items, item)
	}
	if err := iter.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

// GetUpcomingInvoice は次回請求情報を取得する
func (s *StripeService) GetUpcomingInvoice(customerID string) (*UpcomingInvoice, error) {
	params := &stripe.InvoiceUpcomingParams{
		Customer: stripe.String(customerID),
	}
	inv, err := invoice.Upcoming(params)
	if err != nil {
		return nil, err
	}
	return &UpcomingInvoice{
		AmountDue:       inv.AmountDue,
		Currency:        string(inv.Currency),
		NextPaymentDate: inv.PeriodEnd,
	}, nil
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
