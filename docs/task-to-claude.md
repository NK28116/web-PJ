# 実装指示書 (Phase 9: デプロイ・CIエラーの解消)

## 概要
現在、CI/CD パイプラインにおいて、バックエンドの Go バージョン不整合、Lint エラー、統合テストのコンパイルエラー、および GCP へのデプロイ認証エラーが発生しています。これらを一つずつ解消し、パイプラインを正常化させてください。

---

## 1. Go バージョンの不整合解消 (最優先)

### 症状
`Error: can't load config: the Go language version (go1.23) used to build golangci-lint is lower than the targeted Go version (1.25.0)`
CI 環境 (GitHub Actions) の Go バージョンが `1.23` であるのに対し、`go.mod` が `1.25.0` を要求しています。

### 修正内容
1.  **`backend/go.mod` の修正**:
    - 特段の理由がない限り、現在の安定版である `go 1.23` または `go 1.22` にダウングレードすることを検討してください。
    - 指示がない限り、`go 1.23` に変更し、`go mod tidy` を実行してください。
2.  **ワークフローファイルの同期**:
    - `.github/workflows/ci.yml` および `cd-staging.yml` の `go-version` を、`go.mod` と完全に一致させてください。

---

## 2. バックエンドの Lint エラー (`undefined`) の解消

### 症状
`jwt`, `migrate`, `stripe` パッケージが `undefined` となる型チェックエラーが発生しています。

### 修正内容
1.  **インポートパスとエイリアスの修正**:
    - `internal/handlers/auth.go`, `internal/models/claims.go`, `internal/service/stripe_service.go`, `cmd/migrate/main.go` 等で、インポートしているパッケージ名が正しく解決されているか確認してください。
    - 例: `jwt "github.com/golang-jwt/jwt/v5"` のように明示的にエイリアスを付与してください。
2.  **Stripe (v76) 構造体の参照修正**:
    - `stripe.CheckoutSessionParams` 等の構造体がどのサブパッケージに含まれるか（`checkout/session` 等）を再確認し、インポートを修正してください。

---

## 3. バックエンド統合テストの修正

### 症状
`not enough arguments in call to handlers.GoogleCallback` というエラーにより、テストのビルドに失敗しています。

### 修正内容
1.  **引数の整合性確認**:
    - `backend/internal/handlers/oauth.go` の `GoogleCallback` の定義と、`backend/test/data_isolation_test.go` (および `cmd/server/main.go`) での呼び出しを完全に一致させてください。
    - 定義が `(cfg, extAcctRepo, userRepo)` の 3 つである場合、呼び出し側も 3 つであることを確認してください。

---

## 4. GCP 認証 (CD Staging) の修正

### 症状
`google-github-actions/auth@v2` が `GCP_SA_KEY` の欠落によりエラーになっています。

### 修正内容
1.  **認証方法の確立**:
    - GitHub Secrets に `GCP_SA_KEY` が設定されているか確認してください。
    - 設定されていない場合、ローカルまたは特定の環境でのみ実行されるようにガードをかけるか、Secrets の追加をユーザーに依頼してください。
    - ワークフローファイル (`cd-staging.yml`) 内で、`credentials_json: ${{ secrets.GCP_SA_KEY }}` が正しく指定されているか再点検してください。

---

## 5. フロントエンドのテスト・Lint 修正

### 症状
`npm test` が失敗し、一部で Lint エラーが発生しています。

### 修正内容
1.  **エラーの特定と修正**:
    - `frontend` ディレクトリで `npm test` を実行し、失敗しているテストケースを修正してください。
    - `npm run lint` を実行し、指摘事項を解消してください。

---

## 完了定義 (Definition of Done)
1. GitHub Actions の `CI` ワークフローがすべてパスすること。
2. `CD Staging` ワークフローにおいて、GCP 認証を通過し、ビルド工程が正常に開始されること。
3. `go mod tidy` が実行され、`go.mod` と `go.sum` に不整合がないこと。
