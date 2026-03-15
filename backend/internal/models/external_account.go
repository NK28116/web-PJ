package models

import "time"

type ExternalAccount struct {
	ID                    string     `db:"id" json:"id"`
	UserID                string     `db:"user_id" json:"user_id"`
	Provider              string     `db:"provider" json:"provider"`
	ProviderUserID        string     `db:"provider_user_id" json:"provider_user_id,omitempty"`
	EncryptedAccessToken  []byte     `db:"encrypted_access_token" json:"-"`
	EncryptedRefreshToken []byte     `db:"encrypted_refresh_token" json:"-"`
	TokenExpiresAt        *time.Time `db:"token_expires_at" json:"token_expires_at,omitempty"`
	Scopes                string     `db:"scopes" json:"scopes,omitempty"`
	CreatedAt             time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt             time.Time  `db:"updated_at" json:"updated_at"`
}

// LinkStatus はフロントエンドに返す連携状態
type LinkStatus struct {
	Google    bool `json:"google"`
	Instagram bool `json:"instagram"`
}
