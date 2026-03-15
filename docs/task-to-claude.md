# 実装指示書 (Phase 9: デプロイ・CIエラーの解消 - 完全版)

## 概要
現在、CI/CD パイプラインにおいて、Go バージョンの不整合、特定の Lint エラー、統合テストの不整合、および GCP へのデプロイにおける認証・権限・ネットワーク・データベース設定のエラーが発生しています。これらをすべて解消し、パイプラインを正常化させてください。

---

## 1. Go バージョンの不整合解消 (最優先)

### 症状
- `golangci-lint` が Go 1.25 を要求しているが CI 環境が 1.23。
- `backend/Dockerfile` が `golang:1.25-alpine` を参照している。

### 修正内容
1.  **`backend/go.mod`**: `go 1.25.0` を **`go 1.23`** にダウングレードし、`go mod tidy` を実行してください。
2.  **`backend/Dockerfile`**: `FROM golang:1.25-alpine` を **`FROM golang:1.23-alpine`** に変更してください。
3.  **ワークフロー同期**: `.github/workflows/ci.yml` と `cd-staging.yml` の `go-version` が `'1.23'` であることを確認してください。

---

## 2. バックエンドの Lint / コンパイルエラー解消

### 症状
- `jwt`, `migrate`, `stripe` パッケージが `undefined`。
- `internal/service/google_service.go:510:6: func parseDate is unused`。

### 修正内容
1.  **パッケージ参照修正**:
    - **jwt**: `auth.go` 等で `jwt "github.com/golang-jwt/jwt/v5"` のようにエイリアスを付与。
    - **migrate**: `cmd/migrate/main.go` でのインポートとパッケージ参照を整理。
    - **stripe**: `stripe-go/v76` の仕様に合わせ、適切なサブパッケージをインポートし参照を修正。
2.  **未使用関数削除**: `google_service.go` の `parseDate` 関数を削除。

---

## 3. バックエンド統合テストの修正

### 症状
- `not enough arguments in call to handlers.GoogleCallback`

### 修正内容
1.  `test/data_isolation_test.go` における `handlers.GoogleCallback` の呼び出し引数を、最新の定義に合わせて修正してください（モックやリポジトリの不足分を追加）。

---

## 4. GCP 認証・権限・ネットワーク設定 (CD Staging)

### 症状
- `GCP_SA_KEY => null` (認証失敗)
- `Permission 'artifactregistry.repositories.uploadArtifacts' denied` (ビルド失敗)
- `Permission 'run.services.get' denied` (デプロイ失敗)
- `Config error: instance does not have IP of type "PUBLIC"` (接続失敗)
- **新規**: `Permission denied on secret: projects/.../secrets/STRIPE_API` (シークレット参照失敗)

### 修正内容
1.  **Secrets 再設定**: GitHub Secrets に `GCP_SA_KEY` が正しく登録されているか確認。
2.  **GCP ネットワーク設定**: Cloud SQL インスタンスの設定で **「パブリック IP」** を有効にしてください。
3.  **IAM 権限付与 (GCP コンソール)**:
    - **デプロイ用サービスアカウント** に付与：
        - `Artifact Registry 書き込み`
        - `Cloud Run 管理者`
        - `Cloud SQL 閲覧者` および `Cloud SQL クライアント`
        - `サービス アカウント ユーザー`
    - **Cloud Run 実行用サービスアカウント** (デフォルト: `...-compute@developer.gserviceaccount.com`) に付与：
        - **`Secret Manager のシークレット参照者`** (roles/secretmanager.secretAccessor)

---

## 5. データベース接続・マイグレーションのエラー修正

### 症状
- `DATABASE_URL is required` (環境変数不足)
- `pq: database "wyze-staging-db" does not exist` (論理DB名の不一致)

### 修正内容
1.  **環境変数の修正**: `cd-staging.yml` でマイグレーション実行時に `DATABASE_URL` を正しく渡すよう修正。
2.  **データベース名の修正**:
    - **GitHub Secrets `DATABASE_URL_TCP`** の接続文字列末尾のデータベース名を確認。
    - 「wyze-staging-db」はインスタンス名である可能性が高いため、実際のデータベース名（例: `postgres` またはアプリ用DB名）に修正してください。

---

## 6. コンテナ起動エラーの解消 (Backend)

### 症状
- `The user-provided container failed to start and listen on the port defined provided by the PORT=8080`

### 修正内容
1.  **待機ポートの確認**: アプリケーションが `PORT` 環境変数（Cloud Run が指定する 8080）を読み込み、そのポートで Listen しているか確認してください。
2.  **接続タイムアウト**: DB接続に失敗して起動時にクラッシュしていないか、ログを確認し必要に応じてリトライ処理やタイムアウトを調整してください。

---

## 7. フロントエンドのビルド・デプロイ修正

### 症状
- `open Dockerfile: no such file or directory` (パスの誤り)
- `"/app/public": not found` (Dockerfile の COPY エラー)
- `LegacyKeyValueFormat` Warning

### 修正内容
1.  **ワークフロー修正**: `cd-staging.yml` のビルドコンテキストを `./frontend` に変更。
2.  **Dockerfile 修正**: `ENV NODE_ENV production` → `ENV NODE_ENV=production` に修正。
3.  **public ディレクトリ**: `frontend/public/.gitkeep` を作成し、ディレクトリがリポジトリに含まれるようにしてください。

---

## 8. フロントエンドのテスト修正

### 修正内容
1.  `frontend` ディレクトリで `npm test` を実行し、現状発生しているアサーションエラーや型エラーをすべて解消してください。

---

## 完了定義 (Definition of Done)
1. CI ワークフローがすべてパスすること。
2. CD ワークフローにおいて、フロントエンド・バックエンド共にデプロイが完了し、URLにアクセスできること。
3. マイグレーションが正常に実行され、DBスキーマが反映されていること。
