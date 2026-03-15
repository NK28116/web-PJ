# 実装指示書 (Phase 9: デプロイ・CIエラーの解消)

## 概要
現在、CI/CD パイプラインにおいて、Go バージョンの不整合、特定の Lint エラー、統合テストのコンパイルエラー、および GCP へのデプロイ認証・ビルド・マイグレーションエラーが発生しています。これらを一つずつ解消し、パイプラインを正常化させてください。

---

## 1. Go バージョンの不整合解消 (最優先)

### 症状
- `Error: can't load config: the Go language version (go1.23) used to build golangci-lint is lower than the targeted Go version (1.25.0)`
- `backend/Dockerfile` が `golang:1.25-alpine` を参照しており、CI 環境と不整合。

### 修正内容
1.  **`backend/go.mod` のダウングレード**:
    - `go 1.25.0` を **`go 1.23`** に変更してください。
    - 変更後、`go mod tidy` を実行して依存関係を再整理してください。
2.  **`backend/Dockerfile` の修正**:
    - `FROM golang:1.25-alpine` を **`FROM golang:1.23-alpine`** に変更してください。
3.  **ワークフローファイルの同期**:
    - `.github/workflows/ci.yml` および `cd-staging.yml` の `go-version` が `'1.23'` であることを再確認し、統一してください。

---

## 2. バックエンドの Lint エラー解消

### 修正内容
1.  **インポートパスのエイリアス付与とパッケージ参照**:
    - **jwt**: `internal/handlers/auth.go` および `internal/models/claims.go` で、`jwt "github.com/golang-jwt/jwt/v5"` のように明示的にエイリアスを付与し、`jwt.RegisteredClaims` 等の参照を有効にしてください。
    - **migrate**: `cmd/migrate/main.go` で、パッケージ名 `migrate` として正しく参照できているか確認し、必要に応じてエイリアスを付与してください。
    - **stripe**: `internal/service/stripe_service.go` で、`stripe-go/v76` の仕様に合わせ、適切なパッケージ（`"github.com/stripe/stripe-go/v76"` 等）をインポートし、構造体参照を修正してください。
2.  **未使用関数の削除**:
    - `google_service.go` 内の `parseDate` 関数が使用されていないため、削除してください。

---

## 3. バックエンド統合テストの修正

### 症状
`not enough arguments in call to handlers.GoogleCallback`
`test/data_isolation_test.go` における `handlers.GoogleCallback` の呼び出し引数が、定義と一致していません。

### 修正内容
1.  **引数の完全一致**:
    - `backend/internal/handlers/oauth.go` の `GoogleCallback` の最新の定義（シグネチャ）を確認し、`test/data_isolation_test.go` での呼び出し側引数が不足している場合は、モックや適切なリポジトリを渡すよう修正してください。

---

## 4. GCP 認証と権限の修正 (CD Staging)

### 症状
- `Evaluating: secrets.GCP_SA_KEY => null`
- `denied: Permission 'artifactregistry.repositories.uploadArtifacts' denied on resource`

### 修正内容
1.  **GitHub Secrets の再設定**:
    - `GCP_SA_KEY` が GitHub Actions の Secrets に正しく登録されているか確認してください。
2.  **IAM 権限の確認**:
    - サービスアカウントに `Artifact Registry 書き込み` (roles/artifactregistry.writer) 権限が付与されているか、コンソールで確認してください。

---

## 5. バックエンド・マイグレーションのエラー修正

### 症状
- `2026/03/15 17:01:05 DATABASE_URL is required`

### 修正内容
1.  **環境変数の確認**:
    - `cd-staging.yml` において `DATABASE_URL="${{ secrets.DATABASE_URL_TCP }}"` が正しく渡されているか確認してください。
2.  **GitHub Secrets の確認**:
    - `DATABASE_URL_TCP` が GitHub Actions の Secrets に登録されているか、および正しい PostgreSQL 接続文字列（Cloud SQL Proxy 経由の場合は `postgres://user:pass@127.0.0.1:5432/db?sslmode=disable` 等）になっているか確認してください。

---

## 6. フロントエンドのビルドエラー修正 (CD Staging)

### 症状
- `open Dockerfile: no such file or directory` (ビルドコンテキストの誤り)
- `"/app/public": not found` (Dockerfile 内の COPY エラー)
- `LegacyKeyValueFormat` Warning (ENV 形式)

### 修正内容
1.  **ビルドコンテキストの修正**:
    - `.github/workflows/cd-staging.yml` において、`docker build ... ./` → **`docker build ... ./frontend`** に変更してください。
2.  **Dockerfile の修正 (`frontend/Dockerfile`)**:
    - `ENV NODE_ENV production` → **`ENV NODE_ENV=production`** に変更してください。
    - **`public` ディレクトリの欠落**: `frontend/public` が存在しないためビルドが失敗しています。`frontend/public` ディレクトリを（空の状態でも良いので）作成するか、不要であれば Dockerfile の `COPY` 行を削除してください。通常は `public/.gitkeep` を作成してディレクトリを保持することを推奨します。

---

## 7. フロントエンドのテスト修正

### 症状
`npm test` が exit code 1 で失敗しています。

### 修正内容
1.  **テストケースの修正**:
    - `frontend` ディレクトリで `npm test` を実行し、アサーションエラーや型エラーが発生しているテストファイルを特定して修正してください。

---

## 完了定義 (Definition of Done)
1. GitHub Actions の `CI` ワークフローがすべてパスすること。
2. `CD Staging` ワークフローにおいて、ビルド、プッシュ、マイグレーション、デプロイが成功すること。
3. Go の全ファイルが `1.23` で正常にコンパイル・Lint できること。
