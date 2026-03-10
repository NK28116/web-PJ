# プロジェクトタスクリスト (Wyze System)

各タスクを行う前に`backend-GCP`からブランチを切って(例: `feature/task`)完了したらbackend-GCPにマージを繰返す

## Phase 1: モノレポ基盤 & ローカルDB構築 (STEP 1)
- [x] モノレポ構造の確定
  - [x] `frontend/` (Next.js) の疎通確認
  - [x] `backend/` (Go) のパッケージ構造整理
- [x] ローカルDB (Host OS) 構築
  - [x] PostgreSQL 16 インストール & 起動
  - [x] `backend/migrations` のSQL作成 (User, Auth)
  - [x] `golang-migrate` によるスキーマ反映確認
- [x] バックエンド基盤実装
  - [x] JWT認証ロジック実装
  - [x] ローカルDBへのCRUD API実装
  - [x] `.env.example` の作成 (Backend/Frontend)

## Phase 2: Docker環境構築 (STEP 2)
- [x] Docker化
  - [x] Backend: マルチステージビルド対応 Dockerfile 作成
  - [x] Frontend: Dockerfile 作成 (Optional)
- [x] `docker-compose.yml` 構築
  - [x] `db` (Postgres) / `backend` / `frontend` の連携設定
  - [x] コンテナ間ネットワークによる接続確認
  - [x] コンテナ起動時の自動マイグレーション設定

## Phase 3: GCPインフラ & クラウドDB構築 (STEP 3)

2026/03/10
```shell
gcloud auth login
Your browser has been opened to visit:

    https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=32555940559.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A8085%2F&scope=openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fappengine.admin+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fsqlservice.login+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcompute+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Faccounts.reauth&state=22XzlWo6ui4Jaarn3GgVP9jHc1eSVu&access_type=offline&code_challenge=z6ZlGeTOTYb8UVg6_uVD-0NvCiLWq_FzYtX3UZd8q0s&code_challenge_method=S256


You are now logged in as [shoutarou.phillip.w@gmail.com].
Your current project is [wyze-develop-staging].  You can change this setting by running:
  $ gcloud config set project PROJECT_ID
```

- [x] GCPプロジェクト準備
  - [x] プロジェクト設定確認 (`wyze-develop-staging`, リージョン: `us-east1`)
  - [x] API有効化 (Cloud Run, Cloud SQL Admin, Secret Manager, Compute Engine, Serverless VPC Access, Service Networking)
  - [x] Artifact Registry リポジトリ作成 (`web-system-pj`, `us-east1`)
- [x] Cloud SQL (PostgreSQL 16) 構築
  - [x] VPCプライベートサービスアクセス構成 (IP範囲予約 + ピアリング)
  - [x] サーバーレスVPCコネクタ作成 (`vpc-con-us-east1`, `10.8.0.0/28`)
  - [x] インスタンス作成 (`wyze-staging-db`, `db-f1-micro`, Private IP: `10.26.0.3`)
  - [x] DB作成 (`wyze_db`) & アプリユーザー作成 (`wyze_app`)
- [x] Secret Manager 設定
  - [x] `DATABASE_URL` 登録 (Cloud SQL Unix Socket形式)
  - [x] `JWT_SECRET` 登録 (48文字ランダム)
  - [x] Cloud Run SA へのアクセス権限付与
- [x] Cloud Run サービス作成
  - [x] backend/Dockerfile を Go用マルチステージビルドに修正
  - [x] Cloud Build でビルド & Artifact Registry へプッシュ
  - [x] Backend APIのデプロイ (`backend-611370943102.us-east1.run.app`)
  - [x] Secret Manager からの環境変数マウント確認
  - [x] `/health` 疎通確認 — `200 OK {"status":"ok"}`

## Phase 4: CI/CD パイプライン (GitHub Actions)
- [ ] CI設定 (Path-based)
  - [x] Backend: Lint / Test / Build
  - [x] Frontend: Lint / Build
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
