package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

var allowedOrigins = []string{
	"http://localhost:3000",
	"https://wyze-system.com",
}

// Vercel プレビュー環境のサフィックス
const vercelSuffix = ".vercel.app"

func isOriginAllowed(origin string) bool {
	for _, o := range allowedOrigins {
		if o == origin {
			return true
		}
	}
	// https://*.vercel.app のパターンマッチ
	if strings.HasPrefix(origin, "https://") && strings.HasSuffix(origin, vercelSuffix) {
		return true
	}
	return false
}

// CORS はクロスオリジンリクエストを許可するミドルウェア
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		if origin != "" && isOriginAllowed(origin) {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
			c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Vary", "Origin")
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
