# Claudeへの実装指示書: Phase 5 外部API連携 (OAuth 基盤 & 初回同期)

本フェーズでは、Instagram Graph API および Google Business Profile API との連携を実現するための **OAuth 2.0 認可フロー** を実装します。セキュリティを最優先とし、機密情報の適切な管理と暗号化保存を徹底してください。

## 1. OAuth 認可フローのエンドポイント実装 (Priority: Highest)
- **エンドポイント作成**: 以下のルートをバックエンド（Go/Gin）に実装してください。
  - `GET /api/auth/google/login`: Google 認可画面へのリダイレクト。
  - `GET /api/auth/google/callback`: 認可コードの受け取り、トークン交換、DB保存。
  - `GET /api/auth/instagram/login`: Facebook 認可画面へのリダイレクト。
  - `GET /api/auth/instagram/callback`: トークン交換（短期→長期トークンへの交換を含む）、DB保存。
- **認可スコープの設定**: `docs/architecture.md` に記載された必要最小限のスコープ（`instagram_basic`, `business.manage` 等）を正確に指定してください。
- **State パラメータの検証**: CSRF 対策として、`state` パラメータの発行とコールバック時の検証を必須としてください。

## 2. アクセストークンの暗号化保存 (Priority: Highest)
- **暗号化ロジック**: `backend/internal/utils/crypto.go` を作成し、AES-256-GCM 等を用いてトークンを暗号化/復号する機能を実装してください。
- **シークレット管理**: 暗号化に使用するキー（`ENCRYPTION_KEY`）は Secret Manager に登録し、環境変数経由で注入してください。
- **DB モデルの拡張**: `users` テーブルまたは関連テーブル（`external_accounts` 等）に、暗号化されたトークン、リフレッシュトークン、有効期限を保存するカラムを追加するマイグレーションを作成してください。

## 3. トークンの自動更新（リフレッシュ）機能 (Priority: High)
- **リフレッシュロジック**: `access_token` の期限が切れる前、または API 呼び出し時に 401 エラーを検知した際に、`refresh_token` を用いて自動的にトークンを更新する機能を実装してください。
- **Instagram の長期トークン**: Instagram の場合は 60 日間の長期トークンを取得し、期限が切れる前に自動更新する定期タスク（またはアクセス時チェック）を考慮してください。

## 4. フロントエンドの「連携する」ボタンの実装 (Priority: Medium)
- **UI 連携**: `HomeTemplate` 内の「連携する」トグルボタンをクリックした際、バックエンドのログインエンドポイントへ遷移する処理を実装してください。
- **連携状態の表示**: ログイン後にバックエンドから連携状態（`google_linked: true` 等）を取得し、UI に反映させてください。

## 5. 疎通確認と初回データ取得 (Priority: Medium)
- **初回同期**: 連携成功直後に、Instagram のプロフィール情報や Google の店舗情報を試験的に取得し、ログに出力または DB に一時保存して疎通を確認してください。

---
**セキュリティおよび運用の注意事項**:
- **絶対に `access_token` をフロントエンドに返さないでください。** トークンはサーバーサイドで秘匿し、フロントエンドとは JWT セッションのみでやり取りしてください。
- Google/Meta の `CLIENT_ID`, `CLIENT_SECRET` は必ず Secret Manager で管理してください。
- 開発時はローカルの `localhost:3000` をリダイレクト URI として登録し、ステージング環境デプロイ時は GCP のドメインに切り替える構成を考慮してください。

---

## 6. 実装・構築完了後の作業 (Priority: Required)
- トークン管理のデータ構造（ER図）を `docs/03_data_design.md` に追記してください。
- `docs/change-log.md` を更新し、OAuth 基盤の実装内容を記録してください。
