# 設計書 (Design Document)

## 1. システム概要 (System Overview)

### 1.1 目的
`docs/requirements.md` に定義された要件に基づき、堅牢な認証基盤と厳格なデータ分離機能を持つWebアプリケーションシステムを構築する。
フロントエンドに Next.js、バックエンドに Go (Gin)、データベースに PostgreSQL を採用し、開発から本番運用まで一貫した環境分離と自動化されたCI/CDパイプラインを実現する。

### 1.2 環境構成

| 環境 | 対象ブランチ | インフラ構成 | データベース | 目的 |
|:---|:---|:---|:---|:---|
| **Development** | `feature/*` | Docker Compose (Local) | Docker PostgreSQL 15 | ローカル開発、機能実装 |
| **Preview** | PR | Vercel (Preview) | Managed DB (Test) | PRごとの動作確認 |
| **Staging** | `develop` | Staging Server | Managed DB (Staging) | 統合テスト、本番リハーサル |
| **Production** | `main` | Production Server | Managed DB (Production) | 本番運用 |

---

## 2. インフラ・バックエンド設計 (Infrastructure & Backend Design)

### 2.1 コンテナ構成 (Docker)
開発環境の再現性と本番デプロイの安定性を担保するため、Dockerを活用する。

- **Frontend**: Node.js ベースの Next.js アプリケーション。
- **Backend**: Go 1.2x + Gin Framework。
    - **ビルド**: Multi-stage build を採用し、軽量な実行イメージを作成。
    - **モード**: 本番環境では `GIN_MODE=release` を強制。
    - **ヘルスチェック**: `/health` エンドポイントを実装し、コンテナオーケストレーターからの死活監視に対応。
- **Database**: PostgreSQL 15。
    - **永続化**: Docker Volume を使用し、コンテナ再起動後もデータを保持。
    - **起動順序**: Backend は DB のヘルスチェック (`pg_isready`) 通過を待機してから起動する (`depends_on` 設定)。

### 2.2 データベース・データ設計
- **マイグレーション**:
    - ツール: `golang-migrate` または `Prisma` を採用。
    - 運用: CIパイプライン内で自動実行し、スキーマドリフトを防止。`AutoMigrate` の本番利用は禁止。
- **データ分離 (Multi-Tenancy)**:
    - **原則**: 全てのユーザーリソース（投稿、設定、履歴等）テーブルに `user_id` カラムを必須とする。
    - **強制フィルタ**: API層で、JWTから抽出した `user_id` を用いた `WHERE` 句をクエリに強制適用する。リクエストパラメータの `user_id` は信用しない。
- **シードデータ (Seeding)**:
    - 開発環境起動時に、以下のテストアカウントと初期データを自動投入するコマンドを用意。
        1. **Admin User**: 管理者権限の動作確認用。
        2. **General User A**: 一般ユーザー動作確認用。
        3. **General User B**: 他ユーザーデータとの分離確認用（User Aのデータが見えないことの検証）。

### 2.3 API・セキュリティ設計
- **認証 (Authentication)**:
    - **方式**: JWT (JSON Web Token)。
    - **署名**: HMAC SHA256 (HS256) 以上を使用。`alg=none` は拒否。
    - **秘密鍵**: `JWT_SECRET` は環境変数経由で注入。Git管理不可。最低32文字。
- **通信**:
    - Staging/Production 環境では全通信を HTTPS 化。
    - DB接続は本番環境において TLS 接続を必須とする。

---

## 3. フロントエンド設計 (Frontend Design)

### 3.1 概要と目的
フロントエンドの主な責務は、`docs/requirements.md` に基づき、任意のアカウント（管理者、一般ユーザーA/B等）で遅滞なくログイン・操作が可能であることを保証することにある。
バックエンドが提供するデータ分離（user_id によるフィルタ）を前提とし、フロントエンドではセッション状態のクリーンな管理と、アカウント切り替え時の表示不整合防止に注力する。

### 3.2 アーキテクチャ方針
- **Auth Strategy**:
    - **Token Storage**: `localStorage` (auth_token) で管理。
    - **Session Cleanup**: ログアウト時および別ユーザーでのログイン時に、既存のセッション情報・キャッシュを完全にクリアし、他ユーザーの情報が残存（汚染）しないことを徹底する。
    - **Routing Security**: `AuthGuard` コンポーネントにより、未認証時のガードおよびトークン失効時の即時リダイレクトを実装。

### 3.3 コンポーネント構成
| コンポーネント名 | 種類 | 配置場所 | 責務 |
| :--- | :--- | :--- | :--- |
| `AuthGuard` | Wrapper | `components/auth/AuthGuard` | 全ページでの認証状態監視。無効なトークンでのアクセスを遮断し、ログイン画面へ誘導する。 |
| `LoginTemplate` | Template | `components/templates/LoginTemplate` | ログインUI。任意のアカウント情報をバックエンドへ送信し、取得したトークンを安全に保存する。 |
| `LogoutModal` | Organism | `components/organisms/Modal` | ログアウト実行と、ローカルストレージの完全クリアを担う。 |

---

## 4. CI/CD・テスト設計 (CI/CD & Testing)

### 4.1 GitHub Actions ワークフロー
- **PR時**: フロントエンドのビルドチェックおよび、複数アカウントを想定したテストケースの実行。

### 4.2 テスト戦略
- **フロントエンド検証の焦点**:
    - **アカウント切り替え**: 「ユーザーAでログイン -> ログアウト -> ユーザーBでログイン」のフローにおいて、UIが正しく更新され、以前のユーザー情報が表示されないこと。
    - **同時セッション**: 別ブラウザやシークレットウィンドウで異なるアカウントが同時に動作し、互いに干渉しないこと。
- **データ分離の保証（バックエンド主導）**:
    - APIリクエスト時に付与されるJWTに基づき、バックエンド側で正しくデータがフィルタリングされていることを、結合テスト（Integration Test）で担保する。

---

## 5. 開発プロセス
1. **Setup**: `docker compose up` で DB, Backend, Frontend を起動。
2. **Seed**: シードコマンド実行で初期ユーザー生成。
3. **Develop**: 機能実装 -> ローカルテスト。
4. **Push**: PR作成 -> CI通過 -> レビュー -> マージ。