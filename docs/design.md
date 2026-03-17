# 設計書 (Design Document)

## 1. 外部プラットフォーム連携 (API連携 & セキュリティ)
- **要求**: Instagram および Google Business Profile とのセキュアな連携とレート制限への耐性（`docs/requirements.md` 1, 6項）

### 基本設計
- **実装方針・概要**: OAuth 2.0 認可フローを基盤とし、サーバー側でトークンを秘匿管理。外部 API のエラーやレート制限を適切に検知・処理する。
- **技術・アーキテクチャ**:
  - Auth: OAuth 2.0 (Authorization Code Flow)
  - Encryption: AES-256 によるトークン暗号化保存（DB保存時）
  - Reliability: 429 (Rate Limit) エラー検知時はリトライを抑制し、フロントエンドにステータスを伝播。
- **異常系・リスク**: トークン失効、API仕様変更による取得失敗。

### 詳細設計
- **実装の概要**: 
  - `internal/repository` での暗号化保存。
  - `internal/service` における 429 エラーハンドリングの実装。
- **コミットメッセージ**: `feat: implement secure oauth and rate-limit aware api client`
- **行数目安**: 150~200行 (Size: L)

---

## 2. 課金・サブスクリプション基盤 (Stripe)
- **要求**: Stripe を用いたカード情報の管理(CRUD)とサブスクリプションフロー（`docs/requirements.md` 1.3項）

### 基本設計
- **実装方針・概要**: 
  - `BillingTemplate` において、Stripe Elements を使用したカード登録・更新・削除機能を実装。
  - 決済は Stripe Checkout を利用し、状態変更を Webhook で非同期に DB 反映。
  - **検証用領収書**: 検証段階では Stripe がデフォルトで発行する領収書を利用する。
- **技術・アーキテクチャ**:
  - UI: Stripe Elements / Stripe SDK (Frontend)
  - Backend: Stripe API (Go SDK) / Webhook Signature Verification
- **異常系・リスク**: カード登録失敗、Webhook 受信失敗によるプラン不整合。

### 詳細設計
- **実装の概要**: 
  - `SetupIntent` によるカード登録フロー。
  - 顧客(Customer)に紐づく決済手段の一覧取得・削除 API。
- **コミットメッセージ**: `feat: implement stripe card management and subscription webhook`
- **行数目安**: 200~250行 (Size: L)

---

## 3. レポート統計・分析ロジック
- **要求**: 両プラットフォームの指標統合と計算処理、およびモック動作（`docs/requirements.md` 2項, APIモック定義）

### 基本設計
- **実装方針・概要**: 
  - フロントエンドまたは BFF 層で各 API レスポンスを統合。
  - 共通の指標（閲覧数、アクション数）を合算し、来店誘導率を算出。
  - 環境変数または未連携状態に応じて、定義済みのモックデータを返却。
- **技術・アーキテクチャ**:
  - Logic: 統合・計算ロジック（分母0考慮）
  - Data: SWR フック経由での状態管理
- **異常系・リスク**: 片方の API のみ失敗した際の「部分成功」表示。

### 詳細設計
- **算出仕様**: 
  - 来店誘導率 = `(Googleアクション数 + Instagramアクション数) / (Google閲覧数 + Instagram閲覧数)`
  - 小数点第一位までの表示（例: 31.2%）。
  - 分母 0 の場合は 0 として扱う。
- **UIステータス**: `NOT_CONNECTED`（未連携）時のモック表示。
- **コミットメッセージ**: `feat: implement integrated report analytics and mock data support`
- **行数目安**: 200~300行 (Size: L)

---

## 4. ステージング検証 & 実機連携
- **要求**: 本番環境での外部 API 連携完遂と、テスト仕様に基づく全件検証（`docs/requirements.md` 3, 5, 6項）

### 基本設計
- **実装方針・概要**: 
  - 実ドメイン（GCP/Vercel）でのリダイレクト設定、Webhook 疎通確認。
  - 「テスト仕様書」の各ケース（正常・異常・境界値・レート制限）を網羅した最終検証。
- **技術・アーキテクチャ**:
  - Environment: Staging / Production config
  - Validation: 外部 API 連携の疎通パス確認
- **異常系・リスク**: 審査待ちによる API 制限、シークレットの設定ミス。

### 詳細設計
- **実装の概要**: `ReviewTemplate` / `ReportTemplate` へのリアルデータ流し込み。決済完了後の領収書メール確認。
- **コミットメッセージ**: `fix: final integration and production verification for report and billing`
- **行数目安**: 100~150行 (Size: M)
