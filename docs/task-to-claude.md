# Claudeへの実装指示書 (Task to Claude)

本ドキュメントは、`docs/design.md` に基づき、各タスクの具体的な実装手順を Claude へ指示するためのものです。

---

## Task 1: モノレポ基盤 & ローカルDB構築 (Phase 1 & 2)
- **ステータス**: [ ] Pending
- **設計参照**: `docs/design.md` 1項

### 実装指示
1.  **ディレクトリ構造の作成**:
    - ルートディレクトリに `frontend/` (Next.js) と `backend/` (Go) を作成。
    - `backend/` 内に `cmd/server`, `internal/`, `migrations/` の構造を構築。
2.  **Docker環境の構築**:
    - `docker-compose.yml` を作成し、`db` (PostgreSQL 16), `backend`, `frontend` のサービスを定義。
    - `backend` は `golang-migrate` による自動マイグレーションを含むマルチステージビルドを設定。
3.  **バックエンド初期実装**:
    - Gin を使用した基本的な API サーバーの構築。
    - JWT 認証のミドルウェアと、ユーザ登録/ログインの初期エンドポイントを実装。
4.  **データベース接続**:
    - Go から PostgreSQL への接続、および `migrations/` 配下の SQL 実行を確認。

### レビュー対応・追加指示
- (ここにレビュー結果や修正依頼を追記してください)

---

## Task 2: GCPインフラ & CI/CD パイプライン (Phase 3 & 4)
- **ステータス**: [ ] Pending
- **設計参照**: `docs/design.md` 2項

### 実装指示
1.  **GitHub Actions の作成**:
    - `.github/workflows/ci.yml` (Lint/Test) と `cd.yml` (Deploy) を作成。
    - `frontend/` または `backend/` への変更を検知するパスベーストリガーを設定。
2.  **GCPデプロイ設定**:
    - Docker イメージを Artifact Registry へ Push するステップを追加。
    - `gcloud` コマンドを使用して Cloud Run へデプロイするステップを追加。
3.  **Secret Manager 連携**:
    - デプロイ時に Secret Manager から環境変数をマウントする設定 (`--set-secrets`) を YAML に記述。
4.  **マイグレーション自動化**:
    - デプロイ成功後に、Cloud Run のジョブ等を利用して DB マイグレーションを実行する仕組みを構築。

### レビュー対応・追加指示
- (ここにレビュー結果や修正依頼を追記してください)

---

## Task 3: 外部プラットフォーム連携 (Phase 5)
- **ステータス**: [ ] Pending
- **設計参照**: `docs/design.md` 3項

### 実装指示
1.  **OAuth基盤の実装**:
    - Google および Meta (Instagram) の OAuth 2.0 認可コードフローを実装。
    - コールバック URL のハンドリングと、アクセストークンの取得。
2.  **トークン保存のセキュリティ**:
    - 取得したトークンを AES-256 等で暗号化し、DB の `user_tokens` テーブルへ保存するロジックを実装。
3.  **API クライアントの実装**:
    - Instagram Graph API: 投稿取得、予約投稿のスケジューラ。
    - Google Business Profile: 口コミ一覧取得、返信投稿エンドポイント。
4.  **リフレッシュトークン対応**:
    - 有効期限切れを検知し、自動でリフレッシュするバックグラウンド処理またはミドルウェアの実装。

### レビュー対応・追加指示
- (ここにレビュー結果や修正依頼を追記してください)

---

## Task 4: 課金・サブスクリプション基盤 (Phase 6)
- **ステータス**: [ ] Pending
- **設計参照**: `docs/design.md` 4項

### 実装指示
1.  **Stripe Checkout 連携**:
    - フロントエンドにプラン選択画面を作成し、Stripe の決済セッションを開始する API を backend に実装。
2.  **Webhook ハンドラーの実装**:
    - `/api/webhooks/stripe` エンドポイントを作成。
    - Stripe の署名検証を行い、`checkout.session.completed` などのイベントを適切に処理。
3.  **DBの状態同期**:
    - 決済成功時にユーザーの `subscription_status` を更新し、機能制限を解除するロジックを実装。
4.  **カスタマーポータル**:
    - ユーザーが自身のサブスクリプションを管理するためのポータル画面への遷移機能を実装。

### レビュー対応・追加指示
- (ここにレビュー結果や修正依頼を追記してください)

---

## Task 5: 認証・UI設計 (Phase 1 & 7)
- **ステータス**: [ ] Pending
- **設計参照**: `docs/design.md` 5項

### 実装指示
1.  **UIコンポーネントの実装**:
    - `docs/figma/` 配下のデザインに基づき、Tailwind CSS を使用してログイン・サインアップ画面を構築。
    - `StepIndicator` を含む、複数ステップの登録フローの実装。
2.  **フロントエンド認証ロジック**:
    - `localStorage` での JWT トークン管理と、`AuthGuard` によるページ遷移制限。
3.  **バリデーション**:
    - `React Hook Form` と `Zod` を使用した、クライアントサイド・サーバーサイド両面での入力検証。
4.  **最終検証（Staging）**:
    - 複数アカウントでの同時ログイン、データの分離（マルチテナント）が正しく動作することを確認。

### レビュー対応・追加指示
- (ここにレビュー結果や修正依頼を追記してください)
