# Claudeへの実装指示書: Phase 4 CI/CD パイプライン (CD部分) の構築 & CORS設定

本フェーズでは、GitHub の `develop` ブランチへのプッシュをトリガーに、**ステージング環境（wyze-develop-staging）** へアプリケーションを自動デプロイするパイプラインを完遂させ、フロントエンドからの接続を許可する設定を行います。

## 1. バックエンドへの CORS 設定の導入 (Priority: Highest)
- **ミドルウェアの実装**: `backend/internal/middleware/cors.go` を作成し、ブラウザからのクロスオリジンリクエストを適切に処理できるようにしてください。
- **許可するオリジン (Allow Origins)**: 
  - `http://localhost:3000` (ローカル開発)
  - `https://*.vercel.app` (Vercel プレビュー/ステージング環境)
  - `https://wyze-system.com` (将来の本番環境、必要に応じて)
- **設定内容**: 
  - メソッド: `GET, POST, PUT, DELETE, OPTIONS, PATCH`
  - ヘッダー: `Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization`
  - `AllowCredentials: true` (将来のクッキーベース認証を見据えて)
- **統合**: `backend/internal/handlers/auth.go` 等で Gin エンジンを初期化する際に、このミドルウェアをグローバルに適用してください。

## 2. GitHub Actions による自動デプロイ設定の最終調整 (Priority: High)
- **ワークフローの修正/確認**: `.github/workflows/cd-staging.yml` において、以下のステップが正しく動作することを確認してください。
  - `cloud-sql-proxy` を使用したマイグレーション実行ステップ。
  - `latest` タグと `github.sha` タグの両方を用いたイメージのプッシュ。
  - デプロイ成功後の `/health` エンドポイントへの自動疎通確認。

## 3. GitHub Secrets 登録の案内作成 (Priority: Medium)
- **ユーザーへの通知**: 以下のシークレットを GitHub リポジトリの `Settings > Secrets and variables > Actions` に登録するよう、具体的な手順（値の形式例を含む）を提示してください。
  1.  `GCP_SA_KEY`: デプロイ用サービスアカウントの JSON キー。
  2.  `DATABASE_URL_TCP`: マイグレーション用。 `postgres://user:password@localhost:5432/wyze_db?sslmode=disable` 形式。
- **重要**: `GCP_SA_KEY` に必要な権限（Cloud Run 開発者、Artifact Registry 書き込み、Cloud SQL クライアント等）の付与手順も併せて説明してください。

## 4. デプロイ後の最終疎通確認 (Priority: Required)
- 自動デプロイ成功後、Cloud Run のコンソールまたはログを確認し、CORS ミドルウェアが読み込まれていること、および外部からの `/health` アクセスがログに記録されていることを確認してください。

---
**セキュリティおよび運用の注意事項**:
- CORS の許可ドメインに `*` (ワイルドカード) を使用しないでください。必ず具体的なドメインを指定してください。
- マイグレーションで使用する `DATABASE_URL_TCP` は GitHub Runner 内のローカル接続用であるため、`sslmode=disable` で問題ありませんが、Cloud Run の本番用環境変数は常にセキュアに保ってください。

---

## 5. 実装・構築完了後の作業 (Priority: Required)
- CORS の設定方針と、GitHub Actions のデプロイフローを `docs/architecture.md` および `docs/ci-cd.md` に追記してください。
- `docs/change-log.md` を更新し、CORS 対応および CD 自動化が完了したことを記録してください。
