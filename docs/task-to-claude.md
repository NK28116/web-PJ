# Claudeへの実装指示書: Phase 4 CI/CD パイプライン (CD部分) の構築

本フェーズでは、GitHub の `develop` ブランチへのプッシュをトリガーに、**ステージング環境（wyze-develop-staging）** へアプリケーションを自動デプロイするパイプラインを構築します。

## 1. GitHub Actions による自動デプロイ設定 (Priority: Highest)
- **ワークフローの作成**: `.github/workflows/cd-staging.yml` を作成してください。
- **実行トリガー**: `develop` ブランチへの `push`（または PR のマージ）をトリガーとしてください。
- **デプロイフロー**:
  1.  **Checkout**: ソースコードの取得。
  2.  **Google Auth**: GCP への認証。サービスアカウントキー（`GCP_SA_KEY`）を GitHub Secrets に登録する手順をユーザーに提示してください。
  3.  **Build & Push**: `backend/Dockerfile` を用いて Docker イメージをビルドし、既に作成済みの Artifact Registry (`us-east1-docker.pkg.dev/wyze-develop-staging/web-system-pj/backend`) へプッシュ。
  4.  **Deploy to Cloud Run**: プッシュしたイメージを用いて `backend` サービスを更新。既存の設定（VPCコネクタ、Secret Manager のマウント）を維持したままデプロイされるようにしてください。

## 2. データベースマイグレーションの自動化 (Priority: High)
- **マイグレーションの実行**: デプロイが成功する前に、最新のスキーマを反映させる必要があります。
- **推奨方法**: Cloud Run Job を使用するか、GitHub Actions 内で `cloud-sql-proxy` を起動し、`go run ./cmd/migrate/main.go up` を実行するステップを追加してください。
- **安全性**: マイグレーションが失敗した場合は、デプロイ（Cloud Run の更新）を中断し、エラーを通知するように構成してください。

## 3. 環境変数とシークレットの整理 (Priority: Medium)
- **GitHub Secrets**: 以下の値を GitHub リポジトリの Secrets に登録する手順をドキュメント化し、ユーザーに案内してください。
  - `GCP_PROJECT_ID`: `wyze-develop-staging`
  - `GCP_SA_KEY`: デプロイ権限を持つサービスアカウントの JSON キー
- **デプロイ時の引数**: `gcloud run deploy` コマンドにおいて、Secret Manager (`DATABASE_URL`, `JWT_SECRET`) を参照する設定が正しく引き継がれることを確認してください。

## 4. フロントエンド（Next.js）の暫定デプロイ準備 (Priority: Medium)
- **API URL の更新**: フロントエンドの環境変数 `NEXT_PUBLIC_API_URL` に、今回確定した Cloud Run の URL (`https://backend-611370943102.us-east1.run.app`) を設定する準備をしてください。
- **CORS 設定の確認**: バックエンド側で、Vercel のデプロイ先ドメインを許可するロジックが含まれているか再確認してください。

---
**セキュリティおよび運用の注意事項**:
- サービスアカウントには、必要最小限の権限（`Cloud Run Developer`, `Artifact Registry Writer`, `Storage Object Viewer`, `Secret Manager Accessor` 等）を付与する手順を示してください。
- デプロイ成功後、GitHub の PR または Slack 等に通知を送る設定を検討してください。

---

## 5. 実装・構築完了後の作業 (Priority: Required)
- 作成した GitHub Actions の内容を `docs/ci-cd.md` に追記し、デプロイフローを図解してください。
- `docs/change-log.md` を更新し、CI/CD パイプラインの自動化が完了したことを記録してください。
