package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"

	"webSystemPJ/backend/internal/config"
	"webSystemPJ/backend/internal/handlers"
	"webSystemPJ/backend/internal/middleware"
	"webSystemPJ/backend/internal/repository"
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

	gin.SetMode(cfg.GinMode)
	r := gin.Default()
	r.Use(corsMiddleware())

	r.GET("/health", handlers.Health)
	r.POST("/login", handlers.Login(cfg, userRepo))

	protected := r.Group("/")
	protected.Use(middleware.Auth(cfg))
	{
		protected.GET("/posts", handlers.GetPosts(postRepo))
		protected.GET("/posts/:id", handlers.GetPost(postRepo))
		protected.POST("/posts", handlers.CreatePost(postRepo))
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

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
