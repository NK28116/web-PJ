package main

import (
	"database/sql"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"

	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/handlers"
	"webSystemPJ/backend/internal/middleware"
	"webSystemPJ/backend/internal/repository"
	"webSystemPJ/backend/internal/service"
)

func main() {
	cfg := config.Load()

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping database: %v", err)
	}

	runMigrations(db)

	userRepo := repository.NewUserRepository(db)
	postRepo := repository.NewPostRepository(db)
	extAcctRepo := repository.NewExternalAccountRepository(db)
	verifyRepo := repository.NewVerificationRepository(db)

	// サービス初期化
	googleSvc := service.NewGoogleService(cfg, extAcctRepo, nil)
	instagramSvc := service.NewInstagramService(cfg, extAcctRepo, nil)
	stripeSvc := service.NewStripeService(cfg)

	gin.SetMode(cfg.GinMode)
	r := gin.Default()
	r.Use(middleware.CORS())

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Wyze System API is running",
			"version": "1.0.0",
			"health":  "/health",
		})
	})
	r.GET("/health", handlers.Health)
	r.POST("/register", handlers.Register(cfg, userRepo, verifyRepo))
	r.POST("/login", handlers.Login(cfg, userRepo))
	r.POST("/api/auth/send-code", handlers.SendVerificationCode(verifyRepo))
	r.POST("/api/auth/verify-code", handlers.VerifyCode(verifyRepo))
	r.POST("/api/webhooks/stripe", handlers.StripeWebhook(cfg, userRepo))

	// OAuth routes (認証不要 — ブラウザリダイレクト経由)
	auth := r.Group("/api/auth")
	{
		auth.GET("/google/login", handlers.GoogleLogin(cfg))
		auth.GET("/google/callback", handlers.GoogleCallback(cfg, extAcctRepo, userRepo))
		auth.GET("/instagram/login", handlers.InstagramLogin(cfg))
		auth.GET("/instagram/callback", handlers.InstagramCallback(cfg, extAcctRepo))
	}

	protected := r.Group("/")
	protected.Use(middleware.Auth(cfg))
	{
		protected.GET("/posts", handlers.GetPosts(postRepo))
		protected.GET("/posts/:id", handlers.GetPost(postRepo))
		protected.POST("/posts", handlers.CreatePost(postRepo))

		// 連携状態API
		protected.GET("/api/link-status", handlers.GetLinkStatus(extAcctRepo))
		protected.DELETE("/api/unlink/:provider", handlers.UnlinkAccount(extAcctRepo))

		// レポートAPI
		protected.GET("/api/reports/summary", handlers.GetReportSummary(googleSvc, instagramSvc))
		protected.GET("/api/reports/google", handlers.GetGoogleReport(googleSvc))
		protected.GET("/api/reports/instagram", handlers.GetInstagramReport(instagramSvc))

		// Google Business Profile API
		protected.GET("/api/google/reviews", handlers.GetGoogleReviews(googleSvc))
		protected.POST("/api/google/reviews/:id/reply", handlers.ReplyGoogleReview(googleSvc))
		protected.GET("/api/google/locations", handlers.GetGoogleLocations(googleSvc))

		// Instagram API
		protected.GET("/api/instagram/media", handlers.GetInstagramMedia(instagramSvc))
		protected.POST("/api/instagram/media", handlers.CreateInstagramMedia(instagramSvc))

		// User Profile API
		protected.GET("/api/user/profile", handlers.GetProfile(userRepo))
		protected.PUT("/api/user/profile", handlers.UpdateProfile(userRepo))

		// Billing API
		protected.POST("/api/billing/checkout", handlers.CreateCheckoutSession(stripeSvc))
		protected.POST("/api/billing/portal", handlers.CreatePortalSession(stripeSvc, userRepo))
		protected.POST("/api/billing/setup-intent", handlers.CreateSetupIntent(stripeSvc, userRepo))
		protected.GET("/api/billing/payment-methods", handlers.GetPaymentMethods(stripeSvc, userRepo))
		protected.DELETE("/api/billing/payment-methods/:id", handlers.DeletePaymentMethod(stripeSvc))
		protected.GET("/api/billing/invoices", handlers.GetInvoices(stripeSvc, userRepo))
		protected.GET("/api/billing/upcoming", handlers.GetUpcoming(stripeSvc, userRepo))
	}

	log.Printf("server starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

func runMigrations(db *sql.DB) {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		log.Fatalf("migration driver error: %v", err)
	}

	m, err := migrate.NewWithDatabaseInstance("file://migrations", "postgres", driver)
	if err != nil {
		log.Fatalf("failed to create migrator: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("failed to run migrations: %v", err)
	}
	log.Println("migrations applied")
}

