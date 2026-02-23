# 設計書 (Design Document)

## 1. 基本設計 (Basic Design)

### 1.1 概要と目的
`docs/requirements.md` に基づき、アプリケーションの認証基盤（ログイン・サインアップ・ログアウト・セッション管理）を実装する。
既存の React Native 資産 (`stash/Login`) を Next.js/Tailwind CSS 環境に最適化して移植し、フロントエンド完結型の認証フローを実現する。

### 1.2 アーキテクチャ方針
- **Client-Side Auth**: 認証状態は `localStorage` の `auth_token` で管理する。
- **Routing Security**: `AuthGuard` により、未認証ユーザーの保護リソースへのアクセスを制限する。
- **UI Modernization**: モバイルアプリ特有のピッカーやステップ表示を、Web 標準かつレスポンシブな UI へ変換する。

### 1.3 コンポーネント構成

| コンポーネント名 | 種類 | 配置場所 | 責務 |
| :--- | :--- | :--- | :--- |
| `AuthGuard` | Wrapper | `components/auth/AuthGuard` | アプリケーション全体の認証状態を監視し、ルーティング制限を行う。 |
| `LoginTemplate` | Template | `components/templates/LoginTemplate` | ログインフォームの管理とモック認証。 |
| `SignUpTemplate` | Template | `components/templates/SignUpTemplate` | ステップ形式の新規登録フローの管理。 |
| `StepIndicator` | Atom/Molecule | `components/atoms/StepIndicator` | サインアップの進捗状況を視覚的に表示するバー。 |
| `LogoutModal` | Organism | `components/organisms/Modal` | ログアウト確認とセッション破棄。 |

## 2. 詳細設計 (Detailed Design)

### 2.1 認証・セッション管理
- **ログイン成功条件**: メールアドレスとパスワードが非空であること。
- **永続化**: `localStorage.setItem('auth_token', ...)`
- **ログアウト**: `localStorage.removeItem('auth_token')`

### 2.2 サインアップ・ステップ管理
- **Step 1**: 登録方法の選択（LINE, Google 等 - UIのみ）
- **Step 2**: メールアドレス入力・認証（モック）
- **Step 3**: 登録完了表示
- **UI置換**:
    - `CustomWheelPicker` は標準の `<select>` または入力フィールドに置き換える。
    - ステップバーは `flex` レイアウトを用いたインジケーターとして実装する。

### 2.3 ルーティングガードロジック
- `pages/_app.tsx` で `AuthGuard` を使用。
- ログイン/サインアップページ以外の全ページでトークンの存在を必須とする。

### 2.4 デザイン仕様
- **カラーパレット**: 背景 `#1A1A1A`、プライマリ `#00A48D`。
- **ログイン画面**: `docs/figma/login.svg` に準拠。
- **ログアウトモーダル**: `docs/figma/logoutModal.svg` に準拠。
