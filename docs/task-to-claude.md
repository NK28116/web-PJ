# Claudeへの実装指示書: Phase 3 GCPインフラ & クラウドDB構築

本フェーズでは、ローカル開発環境（Docker）から、GCP上のマネージド環境への移行準備および初回のデプロイ検証を行います。
セキュリティとスケーラビリティを考慮し、Cloud SQL、Secret Manager、Cloud Run を組み合わせた構成を構築してください。

## 1. GCPプロジェクト準備と Artifact Registry (Priority: High)
- **プロジェクト設定**: `gcloud` コマンドを用いて、プロジェクトの作成（または既存の指定プロジェクトの確認）、請求設定の有効化、必要なAPI（Cloud Run, Cloud SQL Admin, Secret Manager）の有効化手順を整理してください。
  - 本番環境 :https://console.cloud.google.com/welcome/new?authuser=6&hl=ja&project=wyze-system-2025&organizationId=0
  - ステージング環境 :  https://console.cloud.google.com/welcome/new?authuser=6&hl=ja&project=wyze-system-2025-staging
- **Artifact Registry**: バックエンド（Go）のDockerイメージを格納するためのリポジトリを作成してください。
  - リポジトリ名: `web-system-pj` (またはプロジェクト名に準ずる)
  - リージョン: `us-central1` (always freeを使用するため)

## 2. Cloud SQL (PostgreSQL 16) の構築 (Priority: Highest)
- **インスタンス作成**: 最小構成（db-f1-micro等）で Cloud SQL インスタンスを作成してください。
  - バージョン: PostgreSQL 16
  - ネットワーク: **Private IP** を優先し、外部からの直接アクセスを遮断してください。
  - 接続方法: **Cloud SQL Auth Proxy / Connector** を介した接続を前提とし、認証情報の管理を徹底してください。
- **データベース作成**: `wyze_db` (または適切な名前) のデータベースおよびアプリケーション用ユーザーを作成してください。

## 3. Secret Manager による機密情報管理 (Priority: High)
- **環境変数の登録**: 以下の機密情報を Secret Manager に登録し、Cloud Run から安全に参照できる構成にしてください。
  - `DATABASE_URL`: `postgres://user:password@/dbname?host=/cloudsql/project:region:instance` 形式
  - `JWT_SECRET`: 32文字以上のランダム文字列
- **サービスアカウントの権限**: Cloud Run の実行用サービスアカウントに対して、Secret Manager の「シークレット参照者」ロールを付与してください。

## 4. Cloud Run へのバックエンドデプロイ (Priority: Medium)
- **Dockerfile の最適化**: `backend/Dockerfile` がマルチステージビルドに対応していることを確認し、Cloud Run 用の軽量なイメージをビルドしてください。
- **デプロイコマンド**: `gcloud run deploy` コマンドを作成し、以下の設定を反映させてください。
  - リージョン: `asia-northeast1`
  - 環境変数のソース: Secret Manager をマウントまたは環境変数として注入
  - VPCコネクタ: Cloud SQL (Private IP) への通信が必要な場合、サーバーレスVPCアクセスを構成してください。
- **疎通確認**: デプロイされたエンドポイントの `/health` にアクセスし、200 OK が返ることを確認してください。

---
**セキュリティおよび運用の注意事項**:
- Cloud SQL のパスワードや JWT_SECRET をソースコードや CI のログに出力しないでください。
- 踏み台サーバー（Bastion）や Cloud SQL Auth Proxy を用いて、ローカルから Cloud SQL への接続（マイグレーション実行用）を確保する方法を提示してください。
- コスト削減のため、開発環境では Cloud SQL の自動停止設定や、Cloud Run の最小インスタンス数 0 を検討してください。

---

## 5. 実装・構築完了後の作業 (Priority: Required)

- インフラ構築手順や、デプロイに使用したコマンド、環境変数のリストを `docs/architecture.md` または `docs/ci-cd.md` に追記・更新してください。
- `docs/change-log.md` を更新し、今回のインフラ構築内容を記録してください。
