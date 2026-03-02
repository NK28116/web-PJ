package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type seedUser struct {
	email    string
	password string
	role     string
}

// シードユーザー一覧
// test@example.com / password123 は開発用ログインボタン (MOCK_USER) と一致させる
var users = []seedUser{
	{email: "admin@example.com", password: "Admin1234!", role: "admin"},
	{email: "usera@example.com", password: "UserA1234!", role: "user"},
	{email: "userb@example.com", password: "UserB1234!", role: "user"},
	{email: "test@example.com", password: "password123", role: "user"},
}

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("failed to connect: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping db: %v", err)
	}

	for _, u := range users {
		hashed, err := bcrypt.GenerateFromPassword([]byte(u.password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("failed to hash password for %s: %v", u.email, err)
		}

		_, err = db.Exec(
			"INSERT INTO users (email, password, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
			u.email, string(hashed), u.role,
		)
		if err != nil {
			log.Fatalf("failed to insert user %s: %v", u.email, err)
		}
		fmt.Printf("seeded: %s (role=%s)\n", u.email, u.role)
	}

	// 各ユーザーにサンプル投稿を追加
	for _, u := range users {
		var userID string
		if err := db.QueryRow("SELECT id FROM users WHERE email = $1", u.email).Scan(&userID); err != nil {
			log.Fatalf("failed to get user id for %s: %v", u.email, err)
		}

		_, err := db.Exec(
			"INSERT INTO posts (user_id, title, body) VALUES ($1, $2, $3)",
			userID,
			fmt.Sprintf("サンプル投稿 by %s", u.email),
			"これはシードデータです。",
		)
		if err != nil {
			log.Printf("warning: failed to insert post for %s: %v", u.email, err)
		}
	}

	fmt.Println("seed completed")
}
