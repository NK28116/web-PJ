# 実装指示書 (Phase 9: デプロイ・CIエラーの解消)

## 概要
現在、CI/CD パイプラインにおいて、バックエンドの Lint エラー、統合テストのコンパイルエラー、フロントエンドのテスト失敗、および GCP へのデプロイエラーが発生しています。これらのエラーを一つずつ解消し、パイプラインを正常化させてください。

---

## 1. バックエンドの Lint エラー (`undefined`) の解消

### 症状
`golangci-lint` において、`jwt`, `migrate`, `stripe` パッケージが `undefined` となる型チェックエラーが発生しています。

### 修正内容
1.  **依存関係の整理**:
    - `backend` ディレクトリで `go mod tidy` を実行し、`go.sum` を最新の状態に更新してください。
2.  **インポートパスとエイリアスの確認**:
    - `internal/handlers/auth.go`, `internal/models/claims.go`, `internal/service/stripe_service.go`, `cmd/migrate/main.go` 等で、インポートしているパッケージ名が正しく解決されているか確認してください。
    - 必要であれば、明示的にエイリアスを付与してください (例: `jwt "github.com/golang-jwt/jwt/v5"`)。
3.  **Stripe パッケージの修正**:
    - `stripe-go/v76` では構造体の配置が変更されている可能性があります。`stripe.CheckoutSessionParams` が正しく参照できているか、必要なら `github.com/stripe/stripe-go/v76/checkout` 等をインポートしてください。

---

## 2. CI/CD 環境の整合性向上

### 修正内容
1.  **Go バージョンの統一**:
    - `.github/workflows/ci.yml` および `cd-staging.yml` で指定されている `go-version` を `'1.22'` から `go.mod` に合わせた `'1.23'` に変更してください。
2.  **golangci-lint バージョンの更新**:
    - Go 1.23 に対応するため、`golangci-lint` のバージョンを最新（v1.61.0 以上を推奨）に更新してください。

---

## 3. バックエンド統合テストの修正

### 症状
`not enough arguments in call to handlers.GoogleCallback` というエラーにより、テストのビルドに失敗しています。

### 修正内容
1.  **引数の整合性確認**:
    - `backend/internal/handlers/oauth.go` の `GoogleCallback` の定義と、`backend/test/data_isolation_test.go` (および `cmd/server/main.go`) での呼び出しを完全に一致させてください。
    - 現在は `(cfg, extAcctRepo, userRepo)` の 3 つの引数ですが、定義が変更されていないか、あるいは別のハンドラーが参照されていないか確認してください。
2.  **テストデータのクリーンアップ**:
    - 統合テスト実行時に DB 接続エラーが起きないよう、環境変数 `DATABASE_URL` の設定とマイグレーションの実行順序を再確認してください。

---

## 4. GCP 認証 (CD Staging) の修正

### 症状
`google-github-actions/auth@v2` が `GCP_SA_KEY` の欠落によりエラーになっています。

### 修正内容
1.  **認証設定の堅牢化**:
    - `secrets.GCP_SA_KEY` が設定されていない場合に早期終了するようにするか、あるいは Workload Identity Federation への移行を検討してください。
    - 現時点では、`credentials_json` が正しく渡されるよう、GitHub Secrets の設定を確認するよう指示してください。

---

## 5. フロントエンドのテスト・Lint 修正

### 症状
`npm test` が失敗し、一部で Lint エラーが発生しています。

### 修正内容
1.  **エラーの特定**:
    - `frontend` ディレクトリで `npm test` を実行し、失敗しているテストケースを特定・修正してください。
2.  **Lint 修正**:
    - `npm run lint` を実行し、未定義の変数や型エラーを修正してください。

---

## 完了定義 (Definition of Done)
1. GitHub Actions の `CI` ワークフロー（Backend Lint, Unit Test, Integration Test, Frontend Lint/Test）がすべてパスすること。
2. `CD Staging` ワークフローにおいて、ビルドおよびデプロイ工程が正常に開始されること（Secrets 起因のデプロイ失敗は除く）。
3. ローカル環境において `go mod tidy` が実行され、差分がないこと。
