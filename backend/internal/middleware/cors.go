package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

func isOriginAllowed(origin string) bool {
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:3001",
		"https://frontend-611370943102.us-east1.run.app",
		"https://wyze-system.com",
		"https://stg.wyze-system.com",
	}

	for _, o := range allowedOrigins {
		if o == origin {
			return true
		}
	}
	// Vercel プレビュー環境のサフィックス
	const vercelSuffix = ".vercel.app"
	return strings.HasSuffix(origin, vercelSuffix)
}

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if isOriginAllowed(origin) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
