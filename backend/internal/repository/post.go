package repository

import (
	"database/sql"

	"webSystemPJ/backend/internal/models"
)

type PostRepository struct {
	db *sql.DB
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

// GetAll は JWT から取得した userID に一致する投稿のみを返す（スコープ強制）
func (r *PostRepository) GetAll(userID string) ([]models.Post, error) {
	rows, err := r.db.Query(
		"SELECT id, user_id, title, body, created_at, updated_at FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var p models.Post
		if err := rows.Scan(&p.ID, &p.UserID, &p.Title, &p.Body, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}

// GetByID は JWT から取得した userID と post の user_id が一致する場合のみ返す（スコープ強制）
// 他ユーザーの投稿 ID を指定された場合は nil を返す -> ハンドラが 404 を返す
func (r *PostRepository) GetByID(userID, postID string) (*models.Post, error) {
	var p models.Post
	err := r.db.QueryRow(
		"SELECT id, user_id, title, body, created_at, updated_at FROM posts WHERE id = $1 AND user_id = $2",
		postID, userID,
	).Scan(&p.ID, &p.UserID, &p.Title, &p.Body, &p.CreatedAt, &p.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostRepository) Create(userID, title, body string) (*models.Post, error) {
	var p models.Post
	err := r.db.QueryRow(
		"INSERT INTO posts (user_id, title, body) VALUES ($1, $2, $3) RETURNING id, user_id, title, body, created_at, updated_at",
		userID, title, body,
	).Scan(&p.ID, &p.UserID, &p.Title, &p.Body, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}
