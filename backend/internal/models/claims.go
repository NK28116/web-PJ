package models

import "github.com/golang-jwt/jwt/v5"

// Claims は JWT のペイロード定義
type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}
