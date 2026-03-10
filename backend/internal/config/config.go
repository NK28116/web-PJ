package config

import "os"

type Config struct {
	DatabaseURL   string
	JWTSecret     string
	Port          string
	GinMode       string
	EncryptionKey string

	// OAuth: Google
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string

	// OAuth: Instagram (Facebook)
	InstagramClientID     string
	InstagramClientSecret string
	InstagramRedirectURL  string

	// Frontend URL (for OAuth callback redirect)
	FrontendURL string
}

func Load() *Config {
	return &Config{
		DatabaseURL:   mustEnv("DATABASE_URL"),
		JWTSecret:     mustEnv("JWT_SECRET"),
		Port:          getEnv("PORT", "8080"),
		GinMode:       getEnv("GIN_MODE", "debug"),
		EncryptionKey: getEnv("ENCRYPTION_KEY", ""),

		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/auth/google/callback"),

		InstagramClientID:     getEnv("INSTAGRAM_CLIENT_ID", ""),
		InstagramClientSecret: getEnv("INSTAGRAM_CLIENT_SECRET", ""),
		InstagramRedirectURL:  getEnv("INSTAGRAM_REDIRECT_URL", "http://localhost:8080/api/auth/instagram/callback"),

		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
	}
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		panic("required environment variable not set: " + key)
	}
	return v
}

func getEnv(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}
