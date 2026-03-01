package config

import "os"

type Config struct {
	DatabaseURL string
	JWTSecret   string
	Port        string
	GinMode     string
}

func Load() *Config {
	return &Config{
		DatabaseURL: mustEnv("DATABASE_URL"),
		JWTSecret:   mustEnv("JWT_SECRET"),
		Port:        getEnv("PORT", "8080"),
		GinMode:     getEnv("GIN_MODE", "debug"),
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
