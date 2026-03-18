# 設計書 (Design Document)

## 1. モノレポ基盤 & ローカルDB構築 (Phase 1 & 2)
- **要求**: 開発効率の最大化と、本番環境に近いローカル開発環境の提供（`docs/requirements.md` 1, 4項）

### 基本設計
- **実装方針・概要**: Next.js (frontend) と Go (backend) を一つのリポジトリで管理し、Docker を用いて PostgreSQL 16 を含む一貫した環境を構築する。
- **技術・アーキテクチャ**:
  - Frontend: Next.js (TypeScript), Tailwind CSS
  - Backend: Go (Gin), golang-migrate
  - Infra: Docker Compose (db, backend, frontend)
- **異常系・リスク**: Dockerコンテナ間通信の失敗、マイグレーションの不整合。

### 詳細設計
- **実装の概要**: モノレポ構造の雛形作成、Docker設定ファイルの記述、JWT認証の初期実装。
- **コミットメッセージ**: `feat: setup monorepo foundation with docker and postgres`
- **行数目安**: 150~200行程度 (Size: L)

---

## 2. GCP & Vercel インフラ & CI/CD パイプライン (Phase 3 & 4)
- **要求**: 安全なデプロイフローと、機密情報の適切な管理（`docs/requirements.md` 2, 5項）

### 基本設計
- **実装方針・概要**: 
  - **Backend**: GitHub Actions を利用し、Cloud Run への自動デプロイを行う。機密情報は Secret Manager で管理。
  - **Frontend**: Vercel を利用し、ブランチベースの自動デプロイを行う。
    - `develop` ブランチ: ステージング環境
    - `main` ブランチ: 本番環境
- **技術・アーキテクチャ**:
  - CI/CD: GitHub Actions (Backend), Vercel Git Integration (Frontend)
  - Cloud: Cloud Run, Artifact Registry, Cloud SQL
  - Hosting: Vercel (Next.js)
  - Security: GCP Secret Manager, Vercel Environment Variables
- **異常系・リスク**: デプロイ時のシークレット注入失敗、Vercel/Backend 間 CORS エラー。

### 詳細設計
- **実装の概要**: CI/CD ワークフローの YAML 作成、GCP サービスアカウント設定、Secret Manager 連携コードの実装。
- **コミットメッセージ**: `ci: add github actions for cloud run and secret manager integration`
- **行数目安**: 100~150行程度 (Size: M)

---

## 3. 外部プラットフォーム連携 (Phase 5)
- **要求**: Instagram および Google Business Profile とのデータ連携（`docs/requirements.md` 3.1項）

### 基本設計
- **実装方針・概要**: OAuth 認可フローを構築し、各プラットフォームの API (Graph API, Google My Business API) を叩く共通基盤を実装する。
- **技術・アーキテクチャ**:
  - Auth: OAuth 2.0 (Authorization Code Flow)
  - Encryption: AES-256 によるトークン暗号化保存
- **異常系・リスク**: アクセストークンの期限切れ、レートリミット到達、API仕様変更。

### 詳細設計
- **実装の概要**: 各プラットフォーム用の OAuth ハンドラー作成、暗号化/復号化ユーティリティの実装、モックAPIによる疎通確認。
- **コミットメッセージ**: `feat: implement oauth base and platform integration for instagram/google`
- **行数目安**: 150~200行程度 (Size: L)

---

## 4. 課金・サブスクリプション基盤 (Phase 6)
- **要求**: Stripe を用いた決済フローと契約管理の自動化（`docs/requirements.md` 3.2項）

### 基本設計
- **実装方針・概要**: Stripe Checkout をフロントエンドから呼び出し、サーバー側で Webhook を受信してユーザーの権限状態を更新する。
- **技術・アーキテクチャ**:
  - Payment: Stripe Checkout, Stripe Webhook
  - State: DBによるプラン・フラグ管理
- **異常系・リスク**: Webhook 受信失敗による契約状態の不整合、二重決済。

### 詳細設計
- **実装の概要**: Stripe 連携用の API エンドポイント作成、Webhook シグネチャ検証の実装、契約状態更新ロジックの実装。
- **コミットメッセージ**: `feat: integrate stripe checkout and webhook for subscription management`
- **行数目安**: 150~200行程度 (Size: L)

---

## 5. アカウント管理 & プロフィール編集 (Phase 7)
- **要求**: ユーザー自身によるアカウント名（ニックネーム）およびメールアドレスの変更機能（Issue #30 A項）

### 基本設計
- **実装方針・概要**: 認証済みユーザーに対し、自身のプロフィールの取得と更新を行う API を提供。フロントエンドには編集モード（フォーム）を実装し、即時反映を可能にする。
- **技術・アーキテクチャ**:
  - API: `GET /api/user/profile`, `PATCH /api/user/profile`
  - Frontend: `AccountTemplate` での `useState` 管理と保存ボタン。
- **異常系・リスク**: メールアドレス重複、不正な形式の入力。

---

## 6. レポート統計・分析ロジック (Phase 8)
- **要求**: Google/Instagram データの統合表示、指標計算、およびモック動作（`docs/requirements.md` 2項, APIモック定義）

### 基本設計
- **実装方針・概要**: 
  - バックエンドで両プラットフォームのデータを取得・正規化し、フロントエンドに提供する。
  - 来店誘導率計算: `統合アクション総数 / 統合プロフィール閲覧総数` を算出。
- **技術・アーキテクチャ**:
  - Logic: 統合・計算ロジック（分母0考慮）。
  - UI: `useReport` フックによるデータ取得。

---

## 7. 本番用メール認証シーケンス (Phase 9)
- **要求**: 新規登録時のランダム認証コード送信と検証（Issue #30 A項）

### 基本設計
- **実装方針・概要**: 6桁のランダム数字を生成し、DB または Redis に一時保存。メール送信 API（SendGrid 等）を介してユーザーに通知。
- **技術・アーキテクチャ**:
  - Flow: `POST /api/auth/send-verification` -> `POST /api/auth/verify-code`
- **異常系・リスク**: コードの期限切れ、メール不達。

---

## 8. ステージング検証 & 実機連携 (Phase 10)
- **要求**: 本番環境（GCP/Vercel）での外部 API 連携の完遂と、全プラン（Light/Basic/Pro）の動作検証（Issue #30 B項）

### 基本設計
- **実装方針・概要**: 
  - バックエンドに実装済みの Google/Instagram API をフロントエンド画面へ統合。
  - Stripe Checkout を詳細プラン（Light/Basic/Pro）に対応させ、領収書発行までのフローを検証。
- **技術・アーキテクチャ**:
  - Integration: SWR または React Query
  - Payment: Stripe Price ID によるプラン制御
- **異常系・リスク**: 本番環境固有の認可エラー、リダイレクト URL 不一致。
