package repository

import (
	"database/sql"

	"webSystemPJ/backend/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.QueryRow(
		"SELECT id, email, password, role, created_at, updated_at FROM users WHERE email = $1",
		email,
	).Scan(&user.ID, &user.Email, &user.Password, &user.Role, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(id string) (*models.User, error) {
	var user models.User
	err := r.db.QueryRow(
		"SELECT id, email, role, nickname, plan_tier, stripe_customer_id, stripe_subscription_id, subscription_status, created_at, updated_at FROM users WHERE id = $1",
		id,
	).Scan(&user.ID, &user.Email, &user.Role, &user.Nickname, &user.PlanTier, &user.StripeCustomerID, &user.StripeSubscriptionID, &user.SubscriptionStatus, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Create(email, hashedPassword, role string) (*models.User, error) {
	var user models.User
	err := r.db.QueryRow(
		"INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at, updated_at",
		email, hashedPassword, role,
	).Scan(&user.ID, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) UpdateProfile(id, nickname, email string) error {
	if email != "" {
		_, err := r.db.Exec(
			"UPDATE users SET nickname = $1, email = $2, updated_at = NOW() WHERE id = $3",
			nickname, email, id,
		)
		return err
	}
	_, err := r.db.Exec(
		"UPDATE users SET nickname = $1, updated_at = NOW() WHERE id = $2",
		nickname, id,
	)
	return err
}

func (r *UserRepository) UpdateStripeInfo(userID, customerID, subscriptionID string) error {
	_, err := r.db.Exec(
		"UPDATE users SET stripe_customer_id = $1, stripe_subscription_id = $2, subscription_status = 'active', updated_at = NOW() WHERE id = $3",
		customerID, subscriptionID, userID,
	)
	return err
}

func (r *UserRepository) UpdateCustomerID(userID, customerID string) error {
	_, err := r.db.Exec(
		"UPDATE users SET stripe_customer_id = $1, updated_at = NOW() WHERE id = $2",
		customerID, userID,
	)
	return err
}

func (r *UserRepository) UpdateSubscriptionStatus(subscriptionID, status string) error {
	_, err := r.db.Exec(
		"UPDATE users SET subscription_status = $1, updated_at = NOW() WHERE stripe_subscription_id = $2",
		status, subscriptionID,
	)
	return err
}

// UpdatePlanTierBySubscription はサブスクリプションIDを元にプラン区分を更新する
func (r *UserRepository) UpdatePlanTierBySubscription(subscriptionID, planTier string) error {
	_, err := r.db.Exec(
		"UPDATE users SET plan_tier = $1, updated_at = NOW() WHERE stripe_subscription_id = $2",
		planTier, subscriptionID,
	)
	return err
}

// CancelSubscription はサブスクリプション終了時にステータスを canceled、role を free に戻す
func (r *UserRepository) CancelSubscription(subscriptionID string) error {
	_, err := r.db.Exec(
		"UPDATE users SET subscription_status = 'canceled', role = 'free', plan_tier = 'free', updated_at = NOW() WHERE stripe_subscription_id = $1",
		subscriptionID,
	)
	return err
}
