package repository

import (
	"database/sql"
	"time"
)

type VerificationRepository struct {
	db *sql.DB
}

func NewVerificationRepository(db *sql.DB) *VerificationRepository {
	return &VerificationRepository{db: db}
}

// Create は新しい認証コードを保存する。同メールの既存コードは無効化する。
func (r *VerificationRepository) Create(email, code string, expiresAt time.Time) error {
	_, _ = r.db.Exec(
		"UPDATE email_verifications SET used = true WHERE email = $1 AND used = false",
		email,
	)
	_, err := r.db.Exec(
		"INSERT INTO email_verifications (email, code, expires_at) VALUES ($1, $2, $3)",
		email, code, expiresAt,
	)
	return err
}

// Verify は認証コードを検証し、有効であれば使用済みにして true を返す。
func (r *VerificationRepository) Verify(email, code string) (bool, error) {
	var id string
	err := r.db.QueryRow(
		"SELECT id FROM email_verifications WHERE email = $1 AND code = $2 AND used = false AND expires_at > NOW()",
		email, code,
	).Scan(&id)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	_, err = r.db.Exec("UPDATE email_verifications SET used = true WHERE id = $1", id)
	return err == nil, err
}
