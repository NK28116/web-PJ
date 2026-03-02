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
		"SELECT id, email, role, created_at, updated_at FROM users WHERE id = $1",
		id,
	).Scan(&user.ID, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt)

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
