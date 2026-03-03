package repository

import "webSystemPJ/backend/internal/models"

type UserRepositoryInterface interface {
	FindByEmail(email string) (*models.User, error)
	FindByID(id string) (*models.User, error)
	Create(email, hashedPassword, role string) (*models.User, error)
}

type PostRepositoryInterface interface {
	GetAll(userID string) ([]models.Post, error)
	GetByID(userID, postID string) (*models.Post, error)
	Create(userID, title, body string) (*models.Post, error)
}
