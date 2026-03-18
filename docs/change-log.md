# 変更ログ

## 2026-03-19 (Phase 12: Staging最終統合 — アカウント編集・メール認証・プランtier・外部コンテンツ)

### 概要
GitHub Issue #30「Staging検証」に向けた最終統合フェーズ。アカウントプロフィール編集API、動的メール認証、3段階プランtierのDB管理、Instagram実データ表示を実装。

### 実施内容

#### 1. DBマイグレーション
- `000005_add_nickname_to_users`: `users.nickname VARCHAR(255)` 追加
- `000006_create_email_verifications`: 認証コード管理テーブル（email / code / expires_at / used）
- `000007_add_plan_tier_to_users`: `users.plan_tier VARCHAR(50) DEFAULT 'free'` 追加

#### 2. バックエンド — プロフィールAPI (`backend/internal/handlers/user.go` 新規)
- `GET /api/user/profile`: ニックネーム・メール・role・plan_tier を返す
- `PUT /api/user/profile`: ニックネーム・メール更新（メール重複時 409 Conflict）

#### 3. バックエンド — メール認証API (`backend/internal/handlers/verify.go` 新規)
- `POST /api/auth/send-code`: 6桁コード生成・DBに10分有効で保存・ログに出力（Staging用擬似送信）
- `POST /api/auth/verify-code`: コード検証・使用済みフラグ設定

#### 4. バックエンド — プランtier制御 (`handlers/webhook.go`)
- `customer.subscription.created/updated` で price_id → plan_tier（light/basic/pro）に変換してDB更新
- `config.go` に `MockMode`, `StripePriceIDLight/Basic/Pro` 追加

#### 5. バックエンド — リポジトリ拡張
- `repository/user.go`: `UpdateProfile`, `UpdatePlanTierBySubscription`, `CancelSubscription`（plan_tier='free'も追加）
- `repository/verification.go` 新規: コード保存・検証ロジック

#### 6. フロントエンド — プロフィール連携
- `hooks/useProfile.ts` 新規: `fetchProfile` / `updateProfile`
- `utils/api.ts`: `apiPut` 追加
- `types/api.ts`: `ProfileResponse` 型追加
- `AccountTemplate.tsx`: useProfile 経由でニックネーム・メールを保存

#### 7. フロントエンド — メール認証連携
- `SignUpTemplate/index.tsx`: モックコード廃止 → `send-code` / `verify-code` API呼び出しに変更

#### 8. フロントエンド — Instagram実データ表示
- `PostTemplate.tsx`: `useInstagramMedia` 統合 — 実データが存在する場合はInstagram投稿を表示

---

## 2026-03-19 (Phase 11 補足: 課金プラン選択UI実装)

### 概要
Light / Basic / Pro の3プラン選択UIを BillingTemplate に実装。ベータ価格でのラジオボタン選択 → Stripe Checkout 遷移フローを整備。

### 実施内容

#### 1. フロントエンド — BillingTemplate プラン選択UI追加 (`frontend/components/templates/BillingTemplate/BillingTemplate.tsx`)
- `PLANS` 定数追加: Light（¥10,000）/ Basic（¥29,800）/ Pro（¥59,800）ベータ価格と各 Price ID env var を定義
- プラン選択ラジオボタンセクションを追加（カードセクションとお支払い履歴の間）
- `handleCheckout` を選択プランの `priceId` を使用するよう変更
- Price ID が未設定の場合は「プランに申し込む」ボタンを disabled に制御

#### 2. 環境変数追加 (`frontend/.env.local`)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_LIGHT`, `NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC`, `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO` のプレースホルダー追加
- Stripe Dashboard で Price 作成後に設定

#### 3. テスト追加 (`frontend/test/BillingTemplate.test.tsx`)
- プラン選択 3 件追加（3プラン表示 / 月額表示 / デフォルト選択）
- 90/90 パス

---

## 2026-03-18 (Phase 11: Stripe カード管理 & Webhook サブスクリプション制御)

### 概要
Stripe Elements を使ったインアプリカード登録（SetupIntent フロー）、PaymentMethod CRUD、Webhook によるサブスクリプションライフサイクル管理（role ロールバック）を実装。
