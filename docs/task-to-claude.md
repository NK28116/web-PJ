# 実装指示書 (Google ソーシャルログイン機能)

## 概要
Google アカウントを使用して、アプリケーションへのログインおよび新規登録を完遂できる機能を実装してください。現在の「既存アカウントへの紐付け」フローを拡張し、非ログイン状態からのアクセスに対応させます。

## 1. バックエンドの拡張 (`backend/internal/handlers/oauth.go`)

`GoogleCallback` ハンドラーを以下のロジックに修正・拡張してください。

### ロジックフロー:
1.  **既存の紐付けチェック:** 
    -   Cookie に `oauth_token` (JWT) が存在する場合、現在の「アカウント紐付け」処理を継続。
2.  **ログイン/新規登録フロー (JWT がない場合):**
    -   Google から取得した `email` を使用して `UserRepository.FindByEmail` でユーザーを検索。
    -   **ユーザーが存在する場合:** そのユーザーとしてログイン。
    -   **ユーザーが存在しない場合:** 
        -   新規ユーザーを作成 (`UserRepository.Create`)。パスワードはランダムな文字列または null を許容（パスワード認証を将来的に行う場合は再設定が必要な旨を案内）。
        -   作成したユーザーとしてログイン。
3.  **JWT の発行:**
    -   ログイン/新規登録に成功したユーザーに対し、新しい JWT トークンを発行。
4.  **フロントエンドへのリダイレクト:**
    -   フロントエンドのリダイレクト先を `${FrontendURL}/login/callback?token=${JWT}` の形式にするか、あるいは Cookie にトークンをセットしてリダイレクトしてください。

## 2. フロントエンドの更新

### ログイン画面 (`frontend/pages/login.tsx`)
- 「Google でログイン」ボタンを追加してください。
- ボタン押下時に `backend/api/auth/google/login` へリダイレクト（非ログイン状態で遷移）するようにしてください。

### コールバック受け取り (`frontend/pages/login/callback.tsx` を新規作成)
- クエリパラメータから `token` を受け取るページを作成。
- 受け取ったトークンを `localStorage` (または既存の認証管理 `useAuth`) に保存。
- 保存完了後、ダッシュボード (`/home`) へ自動リダイレクト。

## 3. セキュリティ
- `state` パラメータによる CSRF 対策は既存の実装を維持・徹底すること。
- Google から提供される `email_verified` フラグが true であることを確認するロジックを追加（任意だが推奨）。

## 参考資料
- `backend/internal/handlers/oauth.go` (既存の Google 連携ロジック)
- `backend/internal/repository/user.go` (ユーザー検索・作成)
