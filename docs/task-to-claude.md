# 実装指示書 (Phase 9: デプロイ・CIエラーの解消)

## 概要
現在、CI/CD パイプラインにおいて、バックエンドの Go バージョン不整合、特定の Lint エラー、統合テストのコンパイルエラー、および GCP へのデプロイ認証エラーが発生しています。これらを一つずつ解消し、パイプラインを正常化させてください。

---

## 1. Go バージョンの不整合解消 (最優先)

### 症状
`Error: can't load config: the Go language version (go1.23) used to build golangci-lint is lower than the targeted Go version (1.25.0)`
`go.mod` が `1.25.0` を要求していますが、CI 環境および golangci-lint のビルド環境が `1.23` であるため動作が停止しています。

### 修正内容
1.  **`backend/go.mod` のダウングレード**:
    - `go 1.25.0` は現時点で一般的ではない（将来バージョンの可能性が高い）ため、**`go 1.23`** に変更してください。
    - 変更後、`go mod tidy` を実行して依存関係を再整理してください。
2.  **ワークフローファイルの同期**:
    - `.github/workflows/ci.yml` および `cd-staging.yml` の `go-version` を `'1.23'` に統一してください。

---

## 2. バックエンドの Lint エラー解消

### 症状
- `jwt`, `migrate`, `stripe` パッケージの `undefined` エラー。
- **新規検出**: `internal/service/google_service.go:510:6: func parseDate is unused (unused)`

### 修正内容
1.  **未使用関数の削除または利用**:
    - `google_service.go` 内の `parseDate` 関数が使用されていないため、削除するか、適切な箇所で使用されるように修正してください。
2.  **インポートパスのエイリアス付与**:
    - `internal/handlers/auth.go` 等で、`jwt "github.com/golang-jwt/jwt/v5"` のように明示的にエイリアスを付与し、`undefined` を解消してください。
3.  **Stripe 構造体の参照修正**:
    - `stripe-go/v76` の仕様に合わせ、インポートおよび構造体参照（`checkout/session` 等）を修正してください。

---

## 3. バックエンド統合テストの修正

### 症状
`not enough arguments in call to handlers.GoogleCallback`

### 修正内容
1.  **引数の完全一致**:
    - `backend/internal/handlers/oauth.go` の `GoogleCallback` の定義に対し、`test/data_isolation_test.go` での呼び出し側引数が不足しています。
    - 定義が `(cfg, extAcctRepo, userRepo)` の場合、テスト側でもこれら 3 つを正しく渡すよう修正してください。

---

## 4. GCP 認証 (CD Staging) の修正

### 症状
`Evaluating: secrets.GCP_SA_KEY => null`
デバッグログにより、**GitHub Secrets から `GCP_SA_KEY` が取得できていない（null になっている）**ことが確認されました。

### 修正内容
1.  **シークレット名の検証**:
    - GitHub リポジトリの Settings > Secrets and variables > Actions に登録されている名前が `GCP_SA_KEY` と完全に一致しているか確認してください。
2.  **アクセス権・スコープの確認**:
    - ワークフローが「Environments」を使用している場合、シークレットがその Environment に紐づいているか、あるいはリポジトリ全体（Repository secrets）に設定されているか確認してください。
    - 現在の `.github/workflows/cd-staging.yml` で `credentials_json: ${{ secrets.GCP_SA_KEY }}` が正しく記述されているか、タイポがないか再点検してください。

---

## 5. フロントエンドのテスト・Lint 修正

### 症状
`npm test` が exit code 1 で失敗しています。

### 修正内容
1.  **テストケースの修正**:
    - `frontend` ディレクトリで `npm test` を実行し、アサーションエラーや型エラーが発生しているテストファイルを特定して修正してください。

---

## 完了定義 (Definition of Done)
1. GitHub Actions の `CI` ワークフローがすべてパスすること。
2. `CD Staging` ワークフローにおいて、`GCP_SA_KEY` が正しく読み込まれ、GCP 認証を通過すること。
3. `go.mod` が `1.23` となり、バックエンドのビルド・Lint が正常終了すること。
