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
 
 ---
 
 ##[debug]Evaluating condition for step: 'Build and push backend image'
 ##[debug]Evaluating: success()
 ##[debug]Evaluating success:
 ##[debug]=> true
 ##[debug]Result: true
 ##[debug]Starting: Build and push backend image
 ##[debug]Loading inputs
 ##[debug]Evaluating: format('docker build -t ***0***:***1*** -t ***2***:latest ./backend
 ##[debug]docker push ***3***:***4***
 ##[debug]docker push ***5***:latest
 ##[debug]', env.BACKEND_IMAGE, github.sha, env.BACKEND_IMAGE, env.BACKEND_IMAGE, github.sha, env.BACKEND_IMAGE)
 ##[debug]Evaluating format:
 ##[debug]..Evaluating String:
 ##[debug]..=> 'docker build -t ***0***:***1*** -t ***2***:latest ./backend
 ##[debug]docker push ***3***:***4***
 ##[debug]docker push ***5***:latest
 ##[debug]'
 ##[debug]..Evaluating Index:
 ##[debug]....Evaluating env:
 ##[debug]....=> Object
 ##[debug]....Evaluating String:
 ##[debug]....=> 'BACKEND_IMAGE'
 ##[debug]..=> 'us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend'
 ##[debug]..Evaluating Index:
 ##[debug]....Evaluating github:
 ##[debug]....=> Object
 ##[debug]....Evaluating String:
 ##[debug]....=> 'sha'
 ##[debug]..=> 'ff21eb436dbacf96a2bd508b847968157f6f5381'
 ##[debug]..Evaluating Index:
 ##[debug]....Evaluating env:
 ##[debug]....=> Object
 ##[debug]....Evaluating String:
 ##[debug]....=> 'BACKEND_IMAGE'
 ##[debug]..=> 'us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend'
 ##[debug]..Evaluating Index:
 ##[debug]....Evaluating env:
 ##[debug]....=> Object
 ##[debug]....Evaluating String:
 ##[debug]....=> 'BACKEND_IMAGE'
 ##[debug]..=> 'us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend'
 ##[debug]..Evaluating Index:
 ##[debug]....Evaluating github:
 ##[debug]....=> Object
 ##[debug]....Evaluating String:
 ##[debug]....=> 'sha'
 ##[debug]..=> 'ff21eb436dbacf96a2bd508b847968157f6f5381'
 ##[debug]..Evaluating Index:
 ##[debug]....Evaluating env:
 ##[debug]....=> Object
 ##[debug]....Evaluating String:
 ##[debug]....=> 'BACKEND_IMAGE'
 ##[debug]..=> 'us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend'
 ##[debug]=> 'docker build -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:ff21eb436dbacf96a2bd508b847968157f6f5381 -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:latest ./backend
 ##[debug]docker push us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:ff21eb436dbacf96a2bd508b847968157f6f5381
 ##[debug]docker push us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:latest
 ##[debug]'
 ##[debug]Result: 'docker build -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:ff21eb436dbacf96a2bd508b847968157f6f5381 -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:latest ./backend
 ##[debug]docker push us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:ff21eb436dbacf96a2bd508b847968157f6f5381
 ##[debug]docker push us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:latest
 ##[debug]'
 ##[debug]Loading env
 Run docker build -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:ff21eb436dbacf96a2bd508b847968157f6f5381 -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:latest ./backend
 ##[debug]/usr/bin/bash -e /home/runner/work/_temp/3bd53763-cc86-45bc-99a4-5f9b9dcce62d.sh
 #0 building with "default" instance using docker driver
 
 #1 [internal] load build definition from Dockerfile
 #1 transferring dockerfile: 381B done
 #1 DONE 0.0s
 
 #2 [internal] load metadata for docker.io/library/golang:1.25-alpine
 #2 ...
 
 #3 [auth] library/alpine:pull token for registry-1.docker.io
 #3 DONE 0.0s
 
 #4 [auth] library/golang:pull token for registry-1.docker.io
 #4 DONE 0.0s
 
 #5 [internal] load metadata for docker.io/library/alpine:3.20
 #5 DONE 0.9s
 
 #2 [internal] load metadata for docker.io/library/golang:1.25-alpine
 #2 DONE 0.9s
 
 #6 [internal] load .dockerignore
 #6 transferring context: 2B done
 #6 DONE 0.0s
 
 #7 [builder 1/6] FROM docker.io/library/golang:1.25-alpine@sha256:8e02eb337d9e0ea459e041f1ee5eece41cbb61f1d83e7d883a3e2fb4862063fa
 #7 resolve docker.io/library/golang:1.25-alpine@sha256:8e02eb337d9e0ea459e041f1ee5eece41cbb61f1d83e7d883a3e2fb4862063fa done
 #7 sha256:d30e32cb1b0c68712feb5a817c3f8c26aa993dfb21e146d31f8d8718e17e5c77 2.19kB / 2.19kB done
 #7 sha256:8ee4c410683e5abb54228063b76ee674abc2b06a0962128acb66cb696faf14a7 0B / 296.07kB 0.1s
 #7 sha256:b45a826c456c6e86847b4522633144d32e8278c39b206001c48f7ff990039794 0B / 60.17MB 0.1s
 #7 sha256:8e02eb337d9e0ea459e041f1ee5eece41cbb61f1d83e7d883a3e2fb4862063fa 10.29kB / 10.29kB done
 #7 sha256:450ce2460f20b2f581cf1ac4f36606f88817e63f907f489d9a3b1c14ba821979 1.92kB / 1.92kB done
 #7 ...
 
 #8 [internal] load build context
 #8 transferring context: 29.88MB 0.1s done
 #8 DONE 0.1s
 
 #7 [builder 1/6] FROM docker.io/library/golang:1.25-alpine@sha256:8e02eb337d9e0ea459e041f1ee5eece41cbb61f1d83e7d883a3e2fb4862063fa
 #7 sha256:8ee4c410683e5abb54228063b76ee674abc2b06a0962128acb66cb696faf14a7 296.07kB / 296.07kB 0.1s done
 #7 extracting sha256:8ee4c410683e5abb54228063b76ee674abc2b06a0962128acb66cb696faf14a7 0.1s done
 #7 sha256:c81448b65a2967f0391fb7794f00d0c4699914c2cfcb38dff5a45dd68259a523 0B / 126B 0.2s
 #7 sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1 0B / 32B 0.2s
 #7 ...
 
 #9 [stage-1 1/5] FROM docker.io/library/alpine:3.20@sha256:a4f4213abb84c497377b8544c81b3564f313746700372ec4fe84653e4fb03805
 #9 resolve docker.io/library/alpine:3.20@sha256:a4f4213abb84c497377b8544c81b3564f313746700372ec4fe84653e4fb03805 done
 #9 sha256:cc9071bd161080c1a543f3023b7d0db905b497e6ae757fe078227803bc7e4dc8 611B / 611B done
 #9 sha256:76eb174b37c3e263a212412822299b58d4098a7f96715f18c7eb6932c98b7efd 3.63MB / 3.63MB 0.1s done
 #9 sha256:a4f4213abb84c497377b8544c81b3564f313746700372ec4fe84653e4fb03805 9.22kB / 9.22kB done
 #9 sha256:b0cb30c51c47cdfde647364301758b14c335dea2fddc9490d4f007d67ecb2538 1.02kB / 1.02kB done
 #9 extracting sha256:76eb174b37c3e263a212412822299b58d4098a7f96715f18c7eb6932c98b7efd 0.1s done
 #9 DONE 0.3s
 
 #7 [builder 1/6] FROM docker.io/library/golang:1.25-alpine@sha256:8e02eb337d9e0ea459e041f1ee5eece41cbb61f1d83e7d883a3e2fb4862063fa
 #7 sha256:b45a826c456c6e86847b4522633144d32e8278c39b206001c48f7ff990039794 40.89MB / 60.17MB 0.3s
 #7 sha256:c81448b65a2967f0391fb7794f00d0c4699914c2cfcb38dff5a45dd68259a523 126B / 126B 0.3s done
 #7 sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1 32B / 32B 0.3s done
 #7 sha256:b45a826c456c6e86847b4522633144d32e8278c39b206001c48f7ff990039794 60.17MB / 60.17MB 0.5s
 #7 sha256:b45a826c456c6e86847b4522633144d32e8278c39b206001c48f7ff990039794 60.17MB / 60.17MB 0.6s done
 #7 ...
 
 #10 [stage-1 2/5] RUN apk --no-cache add ca-certificates
 #10 0.848 fetch https://dl-cdn.alpinelinux.org/alpine/v3.20/main/x86_64/APKINDEX.tar.gz
 #10 1.061 fetch https://dl-cdn.alpinelinux.org/alpine/v3.20/community/x86_64/APKINDEX.tar.gz
 #10 1.474 (1/1) Installing ca-certificates (20250911-r0)
 #10 1.510 Executing busybox-1.36.1-r31.trigger
 #10 1.542 Executing ca-certificates-20250911-r0.trigger
 #10 1.585 OK: 8 MiB in 15 packages
 #10 DONE 2.9s
 
 #11 [stage-1 3/5] WORKDIR /app
 #11 DONE 0.0s
 
 #7 [builder 1/6] FROM docker.io/library/golang:1.25-alpine@sha256:8e02eb337d9e0ea459e041f1ee5eece41cbb61f1d83e7d883a3e2fb4862063fa
 #7 extracting sha256:b45a826c456c6e86847b4522633144d32e8278c39b206001c48f7ff990039794 0.1s
 #7 extracting sha256:b45a826c456c6e86847b4522633144d32e8278c39b206001c48f7ff990039794 4.3s done
 #7 extracting sha256:c81448b65a2967f0391fb7794f00d0c4699914c2cfcb38dff5a45dd68259a523
 #7 extracting sha256:c81448b65a2967f0391fb7794f00d0c4699914c2cfcb38dff5a45dd68259a523 done
 #7 extracting sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1 done
 #7 DONE 8.3s
 
 #12 [builder 2/6] WORKDIR /app
 #12 DONE 0.0s
 
 #13 [builder 3/6] COPY go.mod go.sum ./
 #13 DONE 0.0s
 
 #14 [builder 4/6] RUN go mod download
 #14 DONE 2.3s
 
 #15 [builder 5/6] COPY . .
 #15 DONE 0.1s
 
 #16 [builder 6/6] RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server
 #16 DONE 17.8s
 
 #17 [stage-1 4/5] COPY --from=builder /app/server .
 #17 DONE 0.0s
 
 #18 [stage-1 5/5] COPY --from=builder /app/migrations ./migrations
 #18 DONE 0.0s
 
 #19 exporting to image
 #19 exporting layers
 #19 exporting layers 0.7s done
 #19 writing image sha256:fd90f02159a570c6446123a3480ca4f5c6053cfd425429037f00f9a91edf7baf done
 #19 naming to us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:ff21eb436dbacf96a2bd508b847968157f6f5381 done
 #19 naming to us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend:latest done
 #19 DONE 0.7s
 The push refers to repository [us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend]
 743d76510e22: Preparing
 bddc4416c043: Preparing
 63d6ceada926: Preparing
 8838ab3517d3: Preparing
 f5b2c0456bf1: Preparing
 denied: Permission 'artifactregistry.repositories.uploadArtifacts' denied on resource (or it may not exist).
 Error: Process completed with exit code 1.
 
 ---
 
 100 31.8M  100 31.8M    0     0  75.9M      0 --:--:-- --:--:-- --:--:-- 76.1M
 2026/03/15 17:00:49 Authorizing with Application Default Credentials
 2026/03/15 17:00:49 [wyze-develop-staging:us-east1:wyze-staging-db] Listening on 127.0.0.1:5432
 2026/03/15 17:00:49 The proxy has started successfully and is ready for new connections!
 go: downloading github.com/golang-migrate/migrate/v4 v4.17.0
 go: downloading github.com/lib/pq v1.10.9
 go: downloading github.com/hashicorp/go-multierror v1.1.1
 go: downloading go.uber.org/atomic v1.7.0
 go: downloading github.com/hashicorp/errwrap v1.1.0
 2026/03/15 17:01:05 DATABASE_URL is required
 exit status 1
 Error: Process completed with exit code 1.
 ##[debug]Finishing: Run migrations
 
---

Run curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.3/cloud-sql-proxy.linux.amd64
##[debug]/usr/bin/bash -e /home/runner/work/_temp/5cfbd64f-56a6-404a-89a1-ba3da9887807.sh
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
100 31.8M  100 31.8M    0     0  63.7M      0 --:--:-- --:--:-- --:--:-- 63.8M
2026/03/15 17:23:00 Authorizing with Application Default Credentials
2026/03/15 17:23:00 [wyze-develop-staging:us-east1:wyze-staging-db] Listening on 127.0.0.1:5432
2026/03/15 17:23:00 The proxy has started successfully and is ready for new connections!
go: downloading github.com/golang-migrate/migrate/v4 v4.17.0
go: downloading github.com/lib/pq v1.10.9
go: downloading github.com/hashicorp/go-multierror v1.1.1
go: downloading go.uber.org/atomic v1.7.0
go: downloading github.com/hashicorp/errwrap v1.1.0
2026/03/15 17:23:17 [wyze-develop-staging:us-east1:wyze-staging-db] Accepted connection from 127.0.0.1:39240
2026/03/15 17:23:18 [wyze-develop-staging:us-east1:wyze-staging-db] failed to connect to instance: failed to get instance: Refresh error: failed to get instance metadata (connection name = "wyze-develop-staging:us-east1:wyze-staging-db"): googleapi: Error 403: boss::NOT_AUTHORIZED: Not authorized to access resource. Possibly missing permission cloudsql.instances.get on resource instances/wyze-staging-db., forbidden
2026/03/15 17:23:18 ping: read tcp 127.0.0.1:39240->127.0.0.1:5432: read: connection reset by peer
exit status 1
Error: Process completed with exit code 1.

---

Run curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.3/cloud-sql-proxy.linux.amd64
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed

  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
  1 31.8M    1  356k    0     0  2428k      0  0:00:13 --:--:--  0:00:13 2422k
100 31.8M  100 31.8M    0     0  37.6M      0 --:--:-- --:--:-- --:--:-- 37.5M
2026/03/15 17:28:25 Authorizing with Application Default Credentials
2026/03/15 17:28:25 [wyze-develop-staging:us-east1:wyze-staging-db] Listening on 127.0.0.1:5432
2026/03/15 17:28:25 The proxy has started successfully and is ready for new connections!
go: downloading github.com/golang-migrate/migrate/v4 v4.17.0
go: downloading github.com/lib/pq v1.10.9
go: downloading github.com/hashicorp/go-multierror v1.1.1
go: downloading go.uber.org/atomic v1.7.0
go: downloading github.com/hashicorp/errwrap v1.1.0
2026/03/15 17:28:42 [wyze-develop-staging:us-east1:wyze-staging-db] Accepted connection from 127.0.0.1:51548
2026/03/15 17:28:42 [wyze-develop-staging:us-east1:wyze-staging-db] failed to connect to instance: Config error: instance does not have IP of type "PUBLIC" (connection name = "wyze-develop-staging:us-east1:wyze-staging-db")
2026/03/15 17:28:42 ping: read tcp 127.0.0.1:51548->127.0.0.1:5432: read: connection reset by peer
exit status 1
Error: Process completed with exit code 1.

----

 

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

---

##[debug]Evaluating condition for step: 'Build and push frontend image'
##[debug]Evaluating: success()
##[debug]Evaluating success:
##[debug]=> true
##[debug]Result: true
##[debug]Starting: Build and push frontend image
##[debug]Loading inputs
##[debug]Evaluating: format('docker build -t ***0***:***1*** -t ***2***:latest ./
##[debug]docker push ***3***:***4***
##[debug]docker push ***5***:latest
##[debug]', env.FRONTEND_IMAGE, github.sha, env.FRONTEND_IMAGE, env.FRONTEND_IMAGE, github.sha, env.FRONTEND_IMAGE)
##[debug]Evaluating format:
##[debug]..Evaluating String:
##[debug]..=> 'docker build -t ***0***:***1*** -t ***2***:latest ./
##[debug]docker push ***3***:***4***
##[debug]docker push ***5***:latest
##[debug]'
##[debug]..Evaluating Index:
##[debug]....Evaluating env:
##[debug]....=> Object
##[debug]....Evaluating String:
##[debug]....=> 'FRONTEND_IMAGE'
##[debug]..=> 'us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend'
##[debug]..Evaluating Index:
##[debug]....Evaluating github:
##[debug]....=> Object
##[debug]....Evaluating String:
##[debug]....=> 'sha'
##[debug]..=> 'ff21eb436dbacf96a2bd508b847968157f6f5381'
##[debug]..Evaluating Index:
##[debug]....Evaluating env:
##[debug]....=> Object
##[debug]....Evaluating String:
##[debug]....=> 'FRONTEND_IMAGE'
##[debug]..=> 'us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend'
##[debug]..Evaluating Index:
##[debug]....Evaluating env:
##[debug]....=> Object
##[debug]....Evaluating String:
##[debug]....=> 'FRONTEND_IMAGE'
##[debug]..=> 'us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend'
##[debug]..Evaluating Index:
##[debug]....Evaluating github:
##[debug]....=> Object
##[debug]....Evaluating String:
##[debug]....=> 'sha'
##[debug]..=> 'ff21eb436dbacf96a2bd508b847968157f6f5381'
##[debug]..Evaluating Index:
##[debug]....Evaluating env:
##[debug]....=> Object
##[debug]....Evaluating String:
##[debug]....=> 'FRONTEND_IMAGE'
##[debug]..=> 'us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend'
##[debug]=> 'docker build -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend:ff21eb436dbacf96a2bd508b847968157f6f5381 -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend:latest ./
##[debug]docker push us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend:ff21eb436dbacf96a2bd508b847968157f6f5381
##[debug]docker push us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend:latest
##[debug]'
##[debug]Result: 'docker build -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend:ff21eb436dbacf96a2bd508b847968157f6f5381 -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend:latest ./
##[debug]docker push us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend:ff21eb436dbacf96a2bd508b847968157f6f5381
##[debug]docker push us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend:latest
##[debug]'
##[debug]Loading env
Run docker build -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend:ff21eb436dbacf96a2bd508b847968157f6f5381 -t us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/frontend:latest ./
##[debug]/usr/bin/bash -e /home/runner/work/_temp/9c785ac9-c69b-4bf2-8374-01dfe23b1c1b.sh
#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 2B done
#1 DONE 0.0s
ERROR: failed to build: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
Error: Process completed with exit code 1.
##[debug]Finishing: Build and push frontend image

---

 1 warning found (use docker --debug to expand):
 - LegacyKeyValueFormat: "ENV key=value" should be used instead of legacy "ENV key value" format (line 17)
Dockerfile:21
--------------------
  19 |     # Copy necessary files
  20 |     COPY --from=builder /app/.next ./.next
  21 | >>> COPY --from=builder /app/public ./public
  22 |     COPY --from=builder /app/package.json ./package.json
  23 |     COPY --from=builder /app/node_modules ./node_modules
--------------------
ERROR: failed to build: failed to solve: failed to compute cache key: failed to calculate checksum of ref d09189cb-1d3f-4984-a57a-14f8dab86177::y4gawhx1sja497r4os1ymdl34: "/app/public": not found
Error: Process completed with exit code 1.
##[debug]Finishing: Build and push frontend image

---

Run gcloud run deploy frontend \
##[debug]/usr/bin/bash -e /home/runner/work/_temp/b33e5681-abc8-40d6-9967-76dae0791eec.sh
ERROR: (gcloud.run.deploy) PERMISSION_DENIED: Permission 'run.services.get' denied on resource 'namespaces/wyze-develop-staging/services/frontend' (or resource may not exist). This command is authenticated as github-actions-deploy@wyze-develop-staging.iam.gserviceaccount.com using the credentials in /home/runner/work/web-PJ/web-PJ/gha-creds-9a6951c93f9dae95.json, specified by the [auth/credential_file_override] property.
Error: Process completed with exit code 1.
##[debug]Finishing: Deploy Frontend to Cloud Run
