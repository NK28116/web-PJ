# プロジェクトタスクリスト (Wyze System)

各タスクを行う前に`backend-GCP`からブランチを切って完了したらマージを繰返し

## Phase 1: モノレポ基盤 & ローカルDB構築 (STEP 1)
- [ ] モノレポ構造の確定
  - [ ] `frontend/` (Next.js) の疎通確認
  - [ ] `backend/` (Go) のパッケージ構造整理
- [ ] ローカルDB (Host OS) 構築
  - [ ] PostgreSQL 16 インストール & 起動
  - [ ] `backend/migrations` のSQL作成 (User, Auth)
  - [ ] `golang-migrate` によるスキーマ反映確認
- [ ] バックエンド基盤実装
  - [ ] JWT認証ロジック実装
  - [ ] ローカルDBへのCRUD API実装
  - [ ] `.env.example` の作成 (Backend/Frontend)

## Phase 2: Docker環境構築 (STEP 2)
- [ ] Docker化
  - [ ] Backend: マルチステージビルド対応 Dockerfile 作成
  - [ ] Frontend: Dockerfile 作成 (Optional)
- [ ] `docker-compose.yml` 構築
  - [ ] `db` (Postgres) / `backend` / `frontend` の連携設定
  - [ ] コンテナ間ネットワークによる接続確認
  - [ ] コンテナ起動時の自動マイグレーション設定

## Phase 3: GCPインフラ & クラウドDB構築 (STEP 3)
- [ ] GCPプロジェクト準備
  - [ ] プロジェクト作成 & 請求設定
  - [ ] Artifact Registry リポジトリ作成
- [ ] Cloud SQL (PostgreSQL 16) 構築
  - [ ] インスタンス作成 (最小構成)
  - [ ] Private IP 設定 & Cloud SQL Connector 有効化
- [ ] Secret Manager 設定
  - [ ] `DATABASE_URL`, `JWT_SECRET` 等の登録
- [ ] Cloud Run サービス作成
  - [ ] Backend APIのデプロイ (手動)
  - [ ] Secret Manager からの環境変数マウント確認

## Phase 4: CI/CD パイプライン (GitHub Actions)
- [ ] CI設定 (Path-based)
  - [ ] Backend: Lint / Test / Build
  - [ ] Frontend: Lint / Build
- [ ] CD設定 (Staging)
  - [ ] Artifact Registry への Push 自動化
  - [ ] Cloud Run への自動デプロイ
  - [ ] デプロイフロー内でのマイグレーション自動実行

## Phase 5: 外部API連携 (Instagram / Google)
- [ ] OAuth基盤実装
  - [ ] Google Cloud Console / Meta for Developers アプリ登録
  - [ ] 認証フロー (Callback処理) 実装
  - [ ] アクセストークンの暗号化保存ロジック
- [ ] Instagram連携実装
  - [ ] 投稿・メディア取得API
  - [ ] 予約投稿・実行ロジック
- [ ] Google Business Profile連携実装
  - [ ] 口コミ取得・返信API
  - [ ] 店舗写真管理API

## Phase 6: 課金基盤 (Stripe)
- [ ] Stripe基盤実装
  - [ ] Stripe Checkout 連携 (プラン選択画面)
  - [ ] Webhook エンドポイント実装 (署名検証付)
  - [ ] サブスクリプション状態とDBの同期ロジック
- [ ] カスタマーポータル有効化
  - [ ] ポータル遷移用リンクの実装

## Phase 7: Stagingリリース & 最終検証
- [ ] マルチテナント検証 (複数アカウントでの分離確認)
- [ ] コストモニタリング (月額 $20以下の確認)
- [ ] パフォーマンス計測 (APIレスポンス速度)
- [ ] Staging環境公開 & 開発者テスト
