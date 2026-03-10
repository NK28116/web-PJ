package repository

import (
	"database/sql"
	"time"

	"webSystemPJ/backend/internal/models"
)

type ExternalAccountRepository struct {
	db *sql.DB
}

func NewExternalAccountRepository(db *sql.DB) *ExternalAccountRepository {
	return &ExternalAccountRepository{db: db}
}

// Upsert は外部アカウント情報を挿入または更新する
func (r *ExternalAccountRepository) Upsert(
	userID, provider, providerUserID string,
	encAccessToken, encRefreshToken []byte,
	expiresAt *time.Time,
	scopes string,
) (*models.ExternalAccount, error) {
	var ea models.ExternalAccount
	err := r.db.QueryRow(`
		INSERT INTO external_accounts (user_id, provider, provider_user_id, encrypted_access_token, encrypted_refresh_token, token_expires_at, scopes)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (user_id, provider) DO UPDATE SET
			provider_user_id = EXCLUDED.provider_user_id,
			encrypted_access_token = EXCLUDED.encrypted_access_token,
			encrypted_refresh_token = EXCLUDED.encrypted_refresh_token,
			token_expires_at = EXCLUDED.token_expires_at,
			scopes = EXCLUDED.scopes,
			updated_at = NOW()
		RETURNING id, user_id, provider, provider_user_id, token_expires_at, scopes, created_at, updated_at`,
		userID, provider, providerUserID, encAccessToken, encRefreshToken, expiresAt, scopes,
	).Scan(&ea.ID, &ea.UserID, &ea.Provider, &ea.ProviderUserID, &ea.TokenExpiresAt, &ea.Scopes, &ea.CreatedAt, &ea.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &ea, nil
}

// FindByUserAndProvider はユーザーIDとプロバイダーで外部アカウントを取得する
func (r *ExternalAccountRepository) FindByUserAndProvider(userID, provider string) (*models.ExternalAccount, error) {
	var ea models.ExternalAccount
	err := r.db.QueryRow(`
		SELECT id, user_id, provider, provider_user_id, encrypted_access_token, encrypted_refresh_token, token_expires_at, scopes, created_at, updated_at
		FROM external_accounts WHERE user_id = $1 AND provider = $2`,
		userID, provider,
	).Scan(&ea.ID, &ea.UserID, &ea.Provider, &ea.ProviderUserID,
		&ea.EncryptedAccessToken, &ea.EncryptedRefreshToken,
		&ea.TokenExpiresAt, &ea.Scopes, &ea.CreatedAt, &ea.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &ea, nil
}

// GetLinkStatus はユーザーの全プロバイダー連携状態を返す
func (r *ExternalAccountRepository) GetLinkStatus(userID string) (*models.LinkStatus, error) {
	rows, err := r.db.Query(`SELECT provider FROM external_accounts WHERE user_id = $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	status := &models.LinkStatus{}
	for rows.Next() {
		var provider string
		if err := rows.Scan(&provider); err != nil {
			return nil, err
		}
		switch provider {
		case "google":
			status.Google = true
		case "instagram":
			status.Instagram = true
		}
	}
	return status, nil
}

// Delete は外部アカウント連携を解除する
func (r *ExternalAccountRepository) Delete(userID, provider string) error {
	_, err := r.db.Exec(`DELETE FROM external_accounts WHERE user_id = $1 AND provider = $2`, userID, provider)
	return err
}

// UpdateTokens はトークンを更新する（リフレッシュ時に使用）
func (r *ExternalAccountRepository) UpdateTokens(
	userID, provider string,
	encAccessToken []byte,
	expiresAt *time.Time,
) error {
	_, err := r.db.Exec(`
		UPDATE external_accounts
		SET encrypted_access_token = $1, token_expires_at = $2, updated_at = NOW()
		WHERE user_id = $3 AND provider = $4`,
		encAccessToken, expiresAt, userID, provider,
	)
	return err
}
