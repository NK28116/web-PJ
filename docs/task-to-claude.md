# 実装指示書 (Phase 9: デプロイ・CIエラーの解消)

## 概要
現在、CI/CD パイプラインにおいて、バックエンドの Go バージョン不整合、特定の Lint エラー、統合テストのコンパイルエラー、および GCP へのデプロイ認証・ビルドエラーが発生しています。これらを一つずつ解消し、パイプラインを正常化させてください。

---

## 1. Go バージョンの不整合解消 (最優先)

### 症状
`Error: can't load config: the Go language version (go1.23) used to build golangci-lint is lower than the targeted Go version (1.25.0)`
`go.mod` が `1.25.0` を要求していますが、CI 環境および golangci-lint のビルド環境が `1.23` であるため動作が停止しています。

### 修正内容
1.  **`backend/go.mod` のダウングレード**:
    - `go 1.25.0` を **`go 1.23`** に変更してください。
    - 変更後、`go mod tidy` を実行して依存関係を再整理してください。
2.  **ワークフローファイルの同期**:
    - `.github/workflows/ci.yml` および `cd-staging.yml` の `go-version` が `'1.23'` であることを再確認し、統一してください。

---

## 2. バックエンドの Lint エラー解消

### 症状
- `jwt`, `migrate`, `stripe` パッケージの `undefined` エラー。
- `internal/service/google_service.go:510:6: func parseDate is unused (unused)`

### 修正内容
1.  **インポートパスのエイリアス付与とパッケージ参照**:
    - **jwt**: `internal/handlers/auth.go` および `internal/models/claims.go` で、`jwt "github.com/golang-jwt/jwt/v5"` のように明示的にエイリアスを付与し、`jwt.RegisteredClaims` 等の参照を有効にしてください。
    - **migrate**: `cmd/migrate/main.go` で、`"github.com/golang-migrate/migrate/v4"` がインポートされているか、またパッケージ名 `migrate` として正しく参照できているか確認してください。必要に応じてエイリアスを付与してください。
    - **stripe**: `internal/service/stripe_service.go` で、`stripe-go/v76` の仕様に合わせ、適切なパッケージ（`"github.com/stripe/stripe-go/v76"` 等）をインポートし、構造体参照（`checkout/session` 等）を修正してください。
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
    - `GCP_SA_KEY` が GitHub Actions の Secrets に登録されているか、タイポがないか、正しい環境（Environment）に設定されているか確認してください。
2.  **IAM 権限の確認**:
    - 認証エラーが解消された後も `artifactregistry.repositories.uploadArtifacts` エラーが出る場合、サービスアカウントに `Artifact Registry 書き込み` 権限が付与されているか確認してください。

---

## 5. フロントエンドのビルドエラー修正 (CD Staging)

### 症状
`ERROR: failed to build: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory`
CD ワークフローにおいて、フロントエンドの Docker ビルドがルートディレクトリで実行されているため、`frontend/Dockerfile` が見つかっていません。

### 修正内容
1.  **ビルドコンテキストの修正**:
    - `.github/workflows/cd-staging.yml` の `deploy-frontend` ジョブ内の `Build and push frontend image` ステップにおいて、`docker build` コマンドの末尾のパスを `./` から **`./frontend`** に変更してください。

---

## 6. フロントエンドのテスト修正

### 症状
`npm test` が exit code 1 で失敗しています。

### 修正内容
1.  **テストケースの修正**:
    - `frontend` ディレクトリで `npm test` を実行し、アサーションエラーや型エラーが発生しているテストファイルを特定して修正してください。特に、モックが不足している箇所や、コンポーネントのプロパティ変更に伴うエラーを重点的に確認してください。

---

## 完了定義 (Definition of Done)
1. GitHub Actions の `CI` ワークフローがすべてパスすること。
2. `CD Staging` ワークフローにおいて、フロントエンド・バックエンド共にビルド・プッシュが成功すること。
3. `go.mod` が `1.23` となり、バックエンドのビルド・Lint が正常終了すること。
