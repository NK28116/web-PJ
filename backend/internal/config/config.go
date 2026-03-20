package config

import "os"

type Config struct {
	DatabaseURL   string
	JWTSecret     string
	Port          string
	GinMode       string
	EncryptionKey string
	MockMode      bool

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

	// Stripe Plan Price IDs (legacy / backward compat)
	StripePriceIDLight string
	StripePriceIDBasic string
	StripePriceIDPro   string

	// Stripe Plan Price IDs (per plan × per phase)
	StripePriceIDLightBeta   string
	StripePriceIDLightLaunch string
	StripePriceIDLightGrowth string
	StripePriceIDBasicBeta   string
	StripePriceIDBasicLaunch string
	StripePriceIDBasicGrowth string
	StripePriceIDProBeta     string
	StripePriceIDProLaunch   string
	StripePriceIDProGrowth   string
	StripePriceIDStagingTest string
}

func Load() *Config {
	return &Config{
		DatabaseURL:   mustEnv("DATABASE_URL"),
		JWTSecret:     mustEnv("JWT_SECRET"),
		Port:          getEnv("PORT", "8080"),
		GinMode:       getEnv("GIN_MODE", "debug"),
		EncryptionKey: getEnv("ENCRYPTION_KEY", ""),
		MockMode:      os.Getenv("MOCK_MODE") == "true",

		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "https://backend-611370943102.us-east1.run.app/api/auth/google/callback"),

		InstagramClientID:     getEnv("INSTAGRAM_CLIENT_ID", ""),
		InstagramClientSecret: getEnv("INSTAGRAM_CLIENT_SECRET", ""),
		InstagramRedirectURL:  getEnv("INSTAGRAM_REDIRECT_URL", "https://backend-611370943102.us-east1.run.app/api/auth/instagram/callback"),

		FrontendURL: getEnv("FRONTEND_URL", "https://frontend-611370943102.us-east1.run.app"),

		StripeSecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),

		StripePriceIDLight: getEnv("STRIPE_PRICE_ID_LIGHT", ""),
		StripePriceIDBasic: getEnv("STRIPE_PRICE_ID_BASIC", ""),
		StripePriceIDPro:   getEnv("STRIPE_PRICE_ID_PRO", ""),

		StripePriceIDLightBeta:   getEnv("STRIPE_PRICE_ID_LIGHT_BETA", ""),
		StripePriceIDLightLaunch: getEnv("STRIPE_PRICE_ID_LIGHT_LAUNCH", ""),
		StripePriceIDLightGrowth: getEnv("STRIPE_PRICE_ID_LIGHT_GROWTH", ""),
		StripePriceIDBasicBeta:   getEnv("STRIPE_PRICE_ID_BASIC_BETA", ""),
		StripePriceIDBasicLaunch: getEnv("STRIPE_PRICE_ID_BASIC_LAUNCH", ""),
		StripePriceIDBasicGrowth: getEnv("STRIPE_PRICE_ID_BASIC_GROWTH", ""),
		StripePriceIDProBeta:     getEnv("STRIPE_PRICE_ID_PRO_BETA", ""),
		StripePriceIDProLaunch:   getEnv("STRIPE_PRICE_ID_PRO_LAUNCH", ""),
		StripePriceIDProGrowth:   getEnv("STRIPE_PRICE_ID_PRO_GROWTH", ""),
		StripePriceIDStagingTest: getEnv("STRIPE_PRICE_ID_STAGING_TEST", ""),
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
