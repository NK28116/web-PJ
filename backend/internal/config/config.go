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

	// Stripe
	StripeSecretKey     string
	StripeWebhookSecret string
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
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "https://backend-611370943102.us-east1.run.app/api/auth/google/callback"),

		InstagramClientID:     getEnv("INSTAGRAM_CLIENT_ID", ""),
		InstagramClientSecret: getEnv("INSTAGRAM_CLIENT_SECRET", ""),
		InstagramRedirectURL:  getEnv("INSTAGRAM_REDIRECT_URL", "https://backend-611370943102.us-east1.run.app/api/auth/instagram/callback"),

		FrontendURL: getEnv("FRONTEND_URL", "https://frontend-611370943102.us-east1.run.app"),

		StripeSecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
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
