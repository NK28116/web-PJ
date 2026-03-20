# 実装指示書 (Phase 12: Staging検証に向けた最終統合)

## 概要
GitHub Issue #30「Staging検証」の要件に基づき、未実装のアカウント管理、動的なメール認証、および詳細なプラン管理を完遂してください。これが Staging 環境での全機能統合の最終フェーズとなります。

---

## 1. アカウント・プロフィール編集機能 (Account)

### 要求事項
- **Profile API**: ログインユーザーのニックネームおよびメールアドレスを取得・更新する。
- **ユニーク制約**: メールアドレス変更時、既に他ユーザーが使用している場合はエラー（409 Conflict）を返す。
- **フロントエンド統合**: `AccountTemplate.tsx` に編集モードを実装し、保存時に API を叩く。

### 修正/新規ファイル
- `backend/internal/handlers/user.go` (新規/修正)
- `frontend/hooks/useProfile.ts` (新規)
- `frontend/components/templates/AccountTemplate/AccountTemplate.tsx`

---

## 2. 本番用メール認証シーケンス (Sign Up)

### 要求事項
- **動的コード生成**: 6桁のランダム数字を生成し、DB 等に一時保存（有効期限10分）。
- **メール送信モック**: Staging環境では実際にメールを送る代わりに、バックエンドのログに「【Verification Code】: 123456」のように出力し、検証可能にする。
- **API連携**: `SignUpTemplate` の認証コード入力ステップにて、実際の API を使用して検証を行う。

### 修正/新規ファイル
- `backend/internal/service/auth_service.go`
- `frontend/components/templates/SignUpTemplate/index.tsx`

---

## 3. 3段階プラン & サブスクリプション制御 (Stripe)

### プラン定義
- **Light / Basic / Pro** の 3 段階をサポートする。
- 各プランの `price_id` を環境変数として管理し、Stripe Checkout 時に使用する。

### タスク
- **Webhook**: 支払い完了時に、取得した `price_id` からプラン種別を判定し、DB の `users.plan_tier` (新規追加) を更新。
- **UI表示**: `BillingTemplate` に現在のプラン（Light 等）を明示し、上位プランへのアップグレードを促す表示。

---

## 補足

設定するプランは以下の通り

```
〈Light プラン〉
→連携重視
月額費用：
・ベータ版：10,000円　※事例獲得最優先
・立ち上げ期：19,800円（契約10〜30件）※最初の事例が出た段階
・成長期：24,800円（契約30件以上）※ROI実績が3件以上証明できた段階

〈Basicプラン〉
→自動化重視
月額費用：
・ベータ版：29,800円　※事例獲得最優先
・立ち上げ期：39,800円（契約10〜30件）※最初の事例が出た段階
・成長期：49,800円（契約30件以上）※ROI実績が3件以上証明できた段階

〈Proプラン〉
→戦略重視
月額費用：
・ベータ版：59,800円　※事例獲得最優先
・立ち上げ期：79,800円（契約10〜30件）※最初の事例が出た段階
・成長期：99,800円（契約30件以上）※ROI実績が3件以上証明できた段階
```

---

## 4. 外部コンテンツの表示統合 & 領収書対応

### 要求事項
- **Review**: Google Business Profile から取得した「実際の口コミ」を `ReviewTemplate` に表示。
- **Post**: Instagram から取得した「実際の投稿」を `PostTemplate` に表示。
- **領収書対応**: 検証フェーズとして、Stripe 決済後の領収書 PDF 生成およびダウンロード機能を確認する。
- **モックとの切り替え**: `MOCK_MODE=false` 時は、必ず実 API からのデータを使用すること。

---

## 完了定義 (Definition of Done)
1. **アカウント編集**: プロフィール画面で名前とメールを変更し、リロード後も反映されていること。
2. **メール認証**: 新規登録時、ログに出力された動的なコードを入力して登録が完了すること。
3. **プラン反映**: Stripe テスト決済後、ユーザーのプラン種別が DB 上で正しく（例: Basic）更新されること。
4. **表示統合**: レビュー画面および投稿画面に、モックではない実データが表示されること。

---

# 実装指示書 (Phase 13: Staging環境リリース最終統合)

## 概要
Staging環境（Vercel + Cloud Run）を完全に動作させるための、環境変数および外部連携の最終設定を完遂してください。

## 1. バックエンド (Cloud Run) 環境変数の更新

### 要求事項
- **FRONTEND_URL**: `http://localhost:3000` から `https://web-pj-three.vercel.app` (またはカスタムドメイン) に変更。
- **Stripe Price IDs**: 以下の 10 個の ID を環境変数として追加（GCP Secret Manager または Cloud Run 直接設定）。
  - `STRIPE_PRICE_ID_LIGHT_BETA`: `price_1TCfJ92LUnmFOZdSIip48gnK`
  - `STRIPE_PRICE_ID_LIGHT_LAUNCH`: `price_1TCfJA2LUnmFOZdSFZ1h59mR`
  - `STRIPE_PRICE_ID_LIGHT_GROWTH`: `price_1TCfJA2LUnmFOZdSIKl2XwL1`
  - `STRIPE_PRICE_ID_BASIC_BETA`: `price_1TCfJB2LUnmFOZdSrGUixjM9`
  - `STRIPE_PRICE_ID_BASIC_LAUNCH`: `price_1TCfJB2LUnmFOZdSFWnFWint`
  - `STRIPE_PRICE_ID_BASIC_GROWTH`: `price_1TCfJC2LUnmFOZdSDAul8EQ6`
  - `STRIPE_PRICE_ID_PRO_BETA`: `price_1TCfJC2LUnmFOZdSfCqz6uai`
  - `STRIPE_PRICE_ID_PRO_LAUNCH`: `price_1TCfJC2LUnmFOZdSbe2BuuQc`
  - `STRIPE_PRICE_ID_PRO_GROWTH`: `price_1TCfJD2LUnmFOZdSAjDsq1ig`
  - `STRIPE_PRICE_ID_STAGING_TEST`: `price_1TCfJD2LUnmFOZdSLIYBgrWW`
- **STRIPE_WEBHOOK_SECRET**: Stripe ダッシュボードで作成した Webhook シークレットを設定。

## 2. Stripe Webhook の作成と疎通確認

### 要求事項
- **エンドポイント登録**: Stripe ダッシュボード (Test Mode) にて、以下の URL を登録。
  - URL: `https://backend-611370943102.us-east1.run.app/api/stripe/webhook`
  - イベント: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
- **疎通確認**: Stripe CLI (`stripe listen`) またはテスト決済を行い、バックエンドのログに Webhook 受信記録が残ることを確認。

## 3. Vercel (Frontend) の最終適用

### 要求事項
- **環境変数の反映**: 先ほど Vercel CLI で登録した Price ID 群が `vercel env ls` で正しく反映されているか確認。
- **再ビルド・デプロイ**: `vercel deploy --prod` を実行し、フロントエンド側で `process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_...` が正しく読み込まれているか、Billing 画面で確認。

## 4. Google / Instagram Auth のリダイレクト URI 修正

### 要求事項
- **Google Cloud Console**: 承認済みのリダイレクト URI に `https://backend-611370943102.us-east1.run.app/api/auth/google/callback` が含まれているか確認。
- **Facebook for Developers**: アプリの設定で、ステージングのドメイン (`web-pj-three.vercel.app`) をアプリドメインに追加し、有効な OAuth リダイレクト URI を更新。

## 完了定義 (Definition of Done)
1. **決済疎通**: Staging 環境の Billing 画面から Checkout を開始し、テストカードで決済完了後、トップページにリダイレクトされること。
2. **プラン反映**: 決済完了後, ユーザーのアカウント画面でプランが（例：Light Beta 等に）更新されていること。
3. **ソーシャルログイン**: Google ログインボタンから Staging 環境へのログインが正常に完了すること。

---

# 実装指示書 (Phase 14: 決済履歴 API & 次回請求情報の統合)

## 概要
Stripe API を直接呼び出し、ユーザーに実際の支払い履歴と次回の請求予定を提示する機能を実装してください。

## 1. バックエンド (Go) API エンドポイントの実装

### 要求事項
- **GET /api/billing/invoices**:
  - ユーザーの `stripe_customer_id` を基に Stripe `invoices.List` を実行。
  - `limit: 10` で最新の履歴を取得。
  - レスポンス: `id`, `amount`, `status`, `created_at`, `invoice_pdf_url` (Stripe リンク)。
- **GET /api/billing/upcoming**:
  - Stripe `invoices.RetrieveUpcoming` を実行。
  - レスポンス: `next_payment_date`, `amount`, `currency`。
  - サブスクリプションが存在しない場合は 404 または null を返す。

## 2. フロントエンド (Next.js) の統合

### 要求事項
- **hooks/useBilling.ts**:
  - `fetchInvoices` および `fetchUpcoming` 関数を実装。
  - `MOCK_MODE=false` の場合にこれらの API を呼び出すよう制御。
- **components/templates/BillingTemplate/BillingTemplate.tsx**:
  - **クレジットカード情報ブロックの直下**に「次回のご請求予定」セクションを新設。
  - 履歴テーブルの「領収書」ボタンを、Stripe から取得した `invoice_pdf_url` への外部リンクに変更。
  - モックデータ (`MOCK_PAYMENT_HISTORY`) を API から取得した実データに差し替え。

## 完了定義 (Definition of Done)
1. **履歴表示**: Billing 画面の「支払い履歴」に、実際の Stripe 決済履歴が最大 10 件表示されること。
2. **領収書アクセス**: 履歴の「領収書」ボタンをクリックすると、Stripe が生成した PDF が別タブで開くこと。
3. **次回請求**: クレジットカード情報の下に、次回の決済予定日と金額が正しく表示されること。
