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

## 2. GCPインフラ & CI/CD パイプライン (Phase 3 & 4)
- **要求**: 安全なデプロイフローと、機密情報の適切な管理（`docs/requirements.md` 2, 5項）

### 基本設計
- **実装方針・概要**: GitHub Actions を利用し、特定のパスへの変更時に Cloud Run への自動デプロイを行う。機密情報は Secret Manager で一元管理する。
- **技術・アーキテクチャ**:
  - CI/CD: GitHub Actions (Path-based trigger)
  - Cloud: Cloud Run, Artifact Registry, Cloud SQL (Private IP)
  - Security: GCP Secret Manager
- **異常系・リスク**: デプロイ時のシークレット注入失敗、VPCネットワーク接続エラー。

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

## 6. ステージング検証 & 実機連携 (Phase 8)
- **要求**: 本番環境（GCP/Vercel）での外部 API 連携の完遂と、決済から領収書発行までの実運用フローの検証（`docs/requirements.md` 3, 5項）

### 基本設計
- **実装方針・概要**: 
  - バックエンドに実装済みの Google/Instagram API をフロントエンド（Review/Report 画面）へ統合する。
  - Stripe Checkout をフロントエンドの `BillingTemplate` と疎通させ、実際のテスト決済フローを構築する。
  - Stripe の支払い完了イベント（Webhook）をトリガーに、指定のテンプレートに基づいた領収書 PDF 生成機能を実装する。
  - 使用する領収書はdocs/Receiptに格納
    - 未完成
    - docs/Receipt/receiptTemplate.xlsx を参考に変数にできる部分は抽出しておく
- **技術・アーキテクチャ**:
  - Integration: SWR または React Query による API フェッチ
  - Payment: Stripe SDK (Frontend), Stripe Webhook (Backend)
  - Document: `jspdf` または `react-pdf` によるクライアントサイド PDF 生成
- **異常系・リスク**: 
  - 外部 API（Meta/Google）の認可エラー、リダイレクト URL の不一致。
  - Stripe Webhook の遅延や受信失敗による契約状態の不整合。

### 詳細設計
- **実装の概要**: 
  - `ReviewTemplate` / `ReportTemplate` での API 呼び出し実装。
  - `BillingTemplate` への Stripe Checkout 遷移ロジック追加。
  - MoneyForward テンプレート風の領収書生成ロジックの実装。
  - GCP/Meta/Stripe 管理画面での本番（ステージング）用 URL の設定確認。
- **コミットメッセージ**: `feat: integrate real API data and implement stripe payment with receipt generation`
- **行数目安**: 200~300行程度 (Size: L)
