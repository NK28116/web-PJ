package models

import "time"

type User struct {
	ID                     string    `db:"id" json:"id"`
	Email                  string    `db:"email" json:"email"`
	Password               string    `db:"password" json:"-"`
	Role                   string    `db:"role" json:"role"`
	StripeCustomerID       *string   `db:"stripe_customer_id" json:"stripe_customer_id"`
	StripeSubscriptionID   *string   `db:"stripe_subscription_id" json:"stripe_subscription_id"`
	SubscriptionStatus     *string   `db:"subscription_status" json:"subscription_status"`
	CreatedAt              time.Time `db:"created_at" json:"created_at"`
	UpdatedAt              time.Time `db:"updated_at" json:"updated_at"`
}
