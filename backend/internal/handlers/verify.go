package handlers

import (
	"crypto/rand"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"webSystemPJ/backend/internal/repository"
)

// SendVerificationCode は認証コードを生成してログ出力する（Staging: メール送信の代替）
func SendVerificationCode(verifyRepo *repository.VerificationRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Email string `json:"email" binding:"required,email"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email"})
			return
		}

		code, err := generateVerificationCode()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate code"})
			return
		}

		expiresAt := time.Now().Add(10 * time.Minute)
		if err := verifyRepo.Create(req.Email, code, expiresAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save code"})
			return
		}

		// Staging環境: 実メール送信の代わりにログへ出力
		log.Printf("【Verification Code】 email=%s code=%s expires=%s", req.Email, code, expiresAt.Format(time.RFC3339))

		c.JSON(http.StatusOK, gin.H{"message": "code sent"})
	}
}

// VerifyCode は認証コードを検証する
func VerifyCode(verifyRepo *repository.VerificationRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Email string `json:"email" binding:"required,email"`
			Code  string `json:"code" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		valid, err := verifyRepo.Verify(req.Email, req.Code)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
			return
		}
		if !valid {
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "invalid or expired code"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"verified": true})
	}
}

func generateVerificationCode() (string, error) {
	b := make([]byte, 3)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	n := (int(b[0])<<16 | int(b[1])<<8 | int(b[2])) % 1000000
	return fmt.Sprintf("%06d", n), nil
}
