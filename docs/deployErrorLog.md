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

### CD staging
Authenticate to Google Cloud (Service Account)
google-github-actions/auth failed with: the GitHub Action workflow must specify exactly one of "workload_identity_provider" or "credentials_json"! If you are specifying input values via GitHub secrets, ensure the secret is being injected into the environment. By default, secrets are not passed to workflows triggered from forks, including Dependabot.
Complete job
Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/checkout@v4, google-github-actions/auth@v2. Actions will be forced to run with Node.js 24 by default starting June 2nd, 2026. Please check if updated versions of these actions are available that support Node.js 24. To opt into Node.js 24 now, set the FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true environment variable on the runner or in your workflow file. Once Node.js 24 becomes the default, you can temporarily opt out by setting ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true. For more information see: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/

### CI
#### backend Lint
Annotations
10 errors and 1 warning
Run lint
Process completed with exit code 1.
Run lint
undefined: jwt (typecheck)
Run lint
undefined: jwt (typecheck)
Run lint
undefined: stripe (typecheck)
Run lint
undefined: stripe (typecheck)
Run lint
undefined: stripe (typecheck)
Run lint
undefined: jwt (typecheck)
Run lint
undefined: migrate (typecheck)
Run lint
undefined: migrate (typecheck)
Run lint
undefined: migrate (typecheck)
Complete job
Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/checkout@v4, actions/setup-go@v5. Actions will be forced to run with Node.js 24 by default starting June 2nd, 2026. Please check if updated versions of these actions are available that support Node.js 24. To opt into Node.js 24 now, set the FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true environment variable on the runner or in your workflow file. Once Node.js 24 becomes the default, you can temporarily opt out by setting ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true. For more information see: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/


### frontend Lint
Annotations
1 error and 1 warning
Run npm test -- --ci --passWithNoTests
Process completed with exit code 

 ## CI 
 ### Backend Lint 
 
 0s
 Run cd backend && golangci-lint run ./...
 Error: can't load config: the Go language version (go1.23) used to build golangci-lint is lower than the targeted Go version (1.25.0)
 Failed executing command with error: can't load config: the Go language version (go1.23) used to build golangci-lint is lower than the targeted Go version (1.25.0)
 Error: Process completed with exit code 3.
 
 ---
 
 #[debug]Evaluating condition for step: 'Run lint'
 ##[debug]Evaluating: success()
 ##[debug]Evaluating success:
 ##[debug]=> true
 ##[debug]Result: true
 ##[debug]Starting: Run lint
 ##[debug]Loading inputs
 ##[debug]Loading env
 Run cd backend && golangci-lint run ./...
 ##[debug]/usr/bin/bash -e /home/runner/work/_temp/5cd1430c-21b5-43d5-8ebf-7ea61ce2b084.sh
 ##[debug]Dropping file value '/home/runner/work/web-PJ/web-PJ/internal/service/google_service.go'. Path does not exist
 Error: internal/service/google_service.go:510:6: func `parseDate` is unused (unused)
 func parseDate(y, m, d int) time.Time {
      ^
 Error: Process completed with exit code 1.
 ##[debug]Finishing: Run lint
 
 ---
 
 ## CD stgaing
 ### Builds Migarate &Deploy BackEnd
 Authenticate to Google Cloud (Service Account)
 google-github-actions/auth failed with: the GitHub Action workflow must specify exactly one of "workload_identity_provider" or "credentials_json"! If you are specifying input values via GitHub secrets, ensure the secret is being injected into the environment. By default, secrets are not passed to workflows triggered from forks, including Dependabot.
 
 
 ---
 
 ##[debug]Evaluating condition for step: 'Authenticate to Google Cloud (Service Account)'
 ##[debug]Evaluating: success()
 ##[debug]Evaluating success:
 ##[debug]=> true
 ##[debug]Result: true
 ##[debug]Starting: Authenticate to Google Cloud (Service Account)
 ##[debug]Register post job cleanup for action: google-github-actions/auth@v2
 ##[debug]Loading inputs
 ##[debug]Evaluating: secrets.GCP_SA_KEY
 ##[debug]Evaluating Index:
 ##[debug]..Evaluating secrets:
 ##[debug]..=> Object
 ##[debug]..Evaluating String:
 ##[debug]..=> 'GCP_SA_KEY'
 ##[debug]=> null
 ##[debug]Result: null
 ##[debug]Loading env
 Run google-github-actions/auth@v2
 Error: google-github-actions/auth failed with: the GitHub Action workflow must specify exactly one of "workload_identity_provider" or "credentials_json"! If you are specifying input values via GitHub secrets, ensure the secret is being injected into the environment. By default, secrets are not passed to workflows triggered from forks, including Dependabot.
 ##[debug]Node Action run completed with exit code 1
 ##[debug]Finishing: Authenticate to Google Cloud (Service Account)

### Build &Deploy FrontEnd
Authenticate to Google Cloud (Service Account)
google-github-actions/auth failed with: the GitHub Action workflow must specify exactly one of "workload_identity_provider" or "credentials_json"! If you are specifying input values via GitHub secrets, ensure the secret is being injected into the environment. By default, secrets are not passed to workflows triggered from forks, including Dependabot.
Complete job
Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/checkout@v4, google-github-actions/auth@v2. Actions will be forced to run with Node.js 24 by default starting June 2nd, 2026. Please check if updated versions of these actions are available that support Node.js 24. To opt into Node.js 24 now, set the FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true environment variable on the runner or in your workflow file. Once Node.js 24 becomes the default, you can temporarily opt out by setting ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true. For more information see: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/

----

##[debug]Evaluating condition for step: 'Authenticate to Google Cloud (Service Account)'
##[debug]Evaluating: success()
##[debug]Evaluating success:
##[debug]=> true
##[debug]Result: true
##[debug]Starting: Authenticate to Google Cloud (Service Account)
##[debug]Register post job cleanup for action: google-github-actions/auth@v2
##[debug]Loading inputs
##[debug]Evaluating: secrets.GCP_SA_KEY
##[debug]Evaluating Index:
##[debug]..Evaluating secrets:
##[debug]..=> Object
##[debug]..Evaluating String:
##[debug]..=> 'GCP_SA_KEY'
##[debug]=> null
##[debug]Result: null
##[debug]Loading env
Run google-github-actions/auth@v2
Error: google-github-actions/auth failed with: the GitHub Action workflow must specify exactly one of "workload_identity_provider" or "credentials_json"! If you are specifying input values via GitHub secrets, ensure the secret is being injected into the environment. By default, secrets are not passed to workflows triggered from forks, including Dependabot.
##[debug]Node Action run completed with exit code 1
##[debug]Finishing: Authenticate to Google Cloud (Service Account)