## Backend Lint
```
3s
Run cd backend && golangci-lint run ./...
Error: cmd/migrate/main.go:40:12: undefined: migrate (typecheck)
	m, err := migrate.NewWithDatabaseInstance("file://migrations", "postgres", driver)
	          ^
Error: cmd/migrate/main.go:47:44: undefined: migrate (typecheck)
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
		                                         ^
Error: cmd/migrate/main.go:52:42: undefined: migrate (typecheck)
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		                                       ^
Error: internal/models/claims.go:9:2: undefined: jwt (typecheck)
	jwt.RegisteredClaims
	^
Error: internal/service/stripe_service.go:15:2: undefined: stripe (typecheck)
	stripe.Key = cfg.StripeSecretKey
	^
Error: internal/service/stripe_service.go:20:13: undefined: stripe (typecheck)
	params := &stripe.CheckoutSessionParams{
	           ^
Error: internal/service/stripe_service.go:21:9: undefined: stripe (typecheck)
		Mode: stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		      ^
Error: internal/handlers/auth.go:70:22: undefined: jwt (typecheck)
			RegisteredClaims: jwt.RegisteredClaims{
			                  ^
Error: internal/handlers/auth.go:71:16: undefined: jwt (typecheck)
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
				           ^
Error: Process completed with exit code 1.
```

### Frontend Test

```
Run npm test -- --ci --passWithNoTests
Process completed with exit code 1.

```

### Backend Integration Test

```
Run integration tests
Process completed with exit code 1.
Run integration tests
not enough arguments in call to handlers.GoogleCallback
```