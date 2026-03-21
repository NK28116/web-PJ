# 手動テスト結果レポート

## [Gemini] UI・レイアウト修正
1. **初期状態（未登録時）の視覚的表現**
  -> **【対応完了】** `BillingTemplate.tsx` にて、カード未登録時は `blur-[3px]` および透過オーバーレイで「クレジットカードを登録してください」と表示するUIに変更しました。
2. **ボタンの集約と名称変更**
  -> **【対応完了】** 下部の大きな条件付きボタンを削除。状況に応じて「カードを登録する」または「カード情報を変更する」と表示されるボタンへ集約しました。
3. **鉛筆マークの廃止とボタンの常設**
  -> **【対応完了】** 右上の鉛筆アイコンを削除。下部に「カードを登録する（または変更）」ボタンと「キャンセル」ボタンを常に横並びで表示するように再配置しました。キャンセルボタンは、フォーム表示時は「閉じる」、非表示時は「前の画面へ戻る」動作を実装しました。

## [Gemini] カード登録フローの開通検証
4. **「現在開発中です」アラートの解消**
  -> **【対応完了】** `Button` アトムのデフォルト動作（アラート）を回避し、Stripe の登録処理が正常にキックされるよう修正しました。
5. **「確定」ボタンの導入とバリデーション連動**
  -> **【対応完了】** `CardElement` の横に「確定」ボタンを配置。カード情報の入力が完了（Stripeバリデーション通過）した時のみ有効化されるよう制御しました。
6. **フィードバックメッセージの統一**
  -> **【対応完了】** 成功時は「登録できました」、失敗時は「登録できませんでした」、不正カード時は「このカードは有効ではありません」と表示されるよう文言を要件通りに統一しました。
7. **検証ステータスの可視化**
  -> **【対応完了】** フォーム下部に「検証状況」エリアを追加。SetupIntent フローが本番同様のシーケンスで動いていることをリアルタイムに表示するようにしました。

## [Gemini] 接続・認証トラブルの解決（DoD 達成）
8. **「サーバーに接続できませんでした（404/CORS）」問題の解決**
  -> **【解決済み】** バックエンドコンテナの再ビルドにより、最新の CORS 許可リスト（`localhost:3001`）を反映させ、通信を確立しました。
9. **「カードが登録されていません（400）」問題の解決**
  -> **【解決済み】** バックエンドにて「Stripe カスタマーが存在しない場合はその場で自動生成する」ロジックを実装し、未契約ユーザーの初回登録を可能にしました。
10. **「401 Unauthorized (Malformed Token)」問題の完全解決**
  -> **【解決済み】** 
    - **原因**: フロントエンドの `useAuth.ts` が実際の API を叩かず `"mock_token"` という固定文字列を `localStorage` に保存していたため。
    - **対策**: `useAuth.ts` を非同期化し、バックエンドの `/register` および `/login` API から返却された **本物の JWT トークン** を保存・使用するように改修しました。
    - **結果**: バックエンドの認証を正常にパスし、カード情報の登録（SetupIntent）が正常に完了することを確認いたしました。

---
**最終検証完了日**: 2026-03-17
**検証者**: 河崎 紗夜 (Gemini CLI)

---

## [claude] Phase 11: Stripe カード管理・SetupIntent・Webhook 実装

### 実装内容

11. **バックエンド — Stripe サービス拡張**
  -> **【実装完了】** `stripe_service.go` に `CreateSetupIntent` / `ListPaymentMethods` / `DetachPaymentMethod` / `PaymentMethodItem` を追加。

12. **バックエンド — Billing API エンドポイント追加**
  -> **【実装完了】** 以下3エンドポイントを実装・登録。
    - `POST /api/billing/setup-intent` — カード保存用 ClientSecret を返す
    - `GET /api/billing/payment-methods` — 保存済みカード一覧を返す
    - `DELETE /api/billing/payment-methods/:id` — カードを削除（Stripe から Detach）

13. **バックエンド — Webhook ライフサイクル管理**
  -> **【実装完了】** `webhook.go` にて `customer.subscription.created` / `updated` / `deleted` を処理。`deleted` イベント時に `CancelSubscription` を呼び出し、DB の `subscription_status='canceled'` / `role='free'` へロールバック。

14. **フロントエンド — BillingTemplate Stripe Elements 統合**
  -> **【実装完了】** `BillingTemplate.tsx` に `CardSetupForm` コンポーネントを実装。`getSetupIntentSecret()` → `stripe.confirmCardSetup()` のフローでカード登録を実現。保存済みカード一覧と削除ボタンも実装。

15. **フロントエンド — useBilling フック拡張**
  -> **【実装完了】** `paymentMethods` / `pmLoading` / `getSetupIntentSecret` / `deletePaymentMethod` / `refetchPaymentMethods` を追加。`apiDelete` ユーティリティ（204 No Content 対応）も新規追加。

16. **フロントエンド — パッケージ追加**
  -> **【実装完了】** `@stripe/react-stripe-js ^5.6.1` / `@stripe/stripe-js ^8.10.0` を `package.json` に追加・インストール。

### トラブルシューティング

17. **セキュリティ修正 — Secret Key の NEXT_PUBLIC_ 誤設定**
  -> **【修正済み】**
    - **原因**: `.env` に `NEXT_PUBLIC_STRIPE_SECRET_KEY` として Secret Key が設定されており、ブラウザに露出する状態だった。
    - **対策**: `STRIPE_SECRET_KEY`（バックエンド専用）に改名。フロントエンド用は `frontend/.env.local` に `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` のみ設定。

18. **NEXT_PUBLIC_API_URL 未読み込み問題**
  -> **【修正済み】**
    - **原因**: `NEXT_PUBLIC_API_URL` がプロジェクトルートの `.env` にのみ存在し、`frontend/` ディレクトリで起動する Next.js に読み込まれていなかった。フロントエンドが Cloud Run URL（ステージング）にリクエストを送り、新エンドポイントが存在しないため CORS エラーが発生。
    - **対策**: `frontend/.env.local` を新規作成し `NEXT_PUBLIC_API_URL=http://localhost:8080` を追加。

19. **CORS エラー（localhost:3001）**
  -> **【修正済み】**
    - **原因**: フロントエンドがポート 3001 で起動していたが、バックエンドの CORS 許可リストに `http://localhost:3001` が未記載。
    - **対策**: `backend/internal/middleware/cors.go` の `allowedOrigins` に `http://localhost:3001` を追加。バックエンドコンテナ再ビルドで反映。

### 最終確認

20. **カード登録 E2E フロー確認**
  -> **【確認済み】** ログイン → `/billing` → カード登録フォーム → Stripe SetupIntent → カード登録完了。実機にて正常動作を確認。

21. **フロントエンドテスト**
  -> **【全件パス】** 87/87 テスト通過。`BillingTemplate.test.tsx` の Stripe モック追加、`ReportTemplate.test.tsx` の TypeScript エラー解消を含む。

---
**実装・検証完了日**: 2026-03-18
**実装者**: CSS-28 (Claude Sonnet 4.6)

## 3
### 3.1
```
 stripe listen --forward-to localhost:8080/api/webhooks/stripe
zsh: correct 'stripe' to 'strip' [nyae]? n
> Ready! You are using Stripe API Version [2025-07-30.basil]. Your webhook signing secret is whsec_REDACTED (^C to quit)
```

### 3.2
```
stripe trigger customer.subscription.deleted
Setting up fixture for: customer
Running fixture for: customer
Setting up fixture for: product
Running fixture for: product
Setting up fixture for: price
Running fixture for: price
Setting up fixture for: subscription
Running fixture for: subscription
Setting up fixture for: subscription_deleted
Running fixture for: subscription_deleted
Trigger succeeded! Check dashboard for event details.
```

```
2026-03-19 01:32:35   --> payment_method.attached [evt_1TCN1L2LUnmFOZdS4mNGlBbz]
2026-03-19 01:32:35  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1L2LUnmFOZdS4mNGlBbz]
2026-03-19 01:32:35   --> customer.created [evt_1TCN1L2LUnmFOZdS7BiZ3gIA]
2026-03-19 01:32:35  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1L2LUnmFOZdS7BiZ3gIA]
2026-03-19 01:32:36   --> product.created [evt_1TCN1M2LUnmFOZdSyaYnFPqb]
2026-03-19 01:32:36  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1M2LUnmFOZdSyaYnFPqb]
2026-03-19 01:32:37   --> plan.created [evt_1TCN1M2LUnmFOZdSa19LhbW4]
2026-03-19 01:32:37   --> price.created [evt_1TCN1M2LUnmFOZdSFTbjHNWc]
2026-03-19 01:32:37  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1M2LUnmFOZdSFTbjHNWc]
2026-03-19 01:32:37  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1M2LUnmFOZdSa19LhbW4]
2026-03-19 01:32:41   --> charge.succeeded [evt_3TCN1P2LUnmFOZdS0xo7WoR3]
2026-03-19 01:32:41  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_3TCN1P2LUnmFOZdS0xo7WoR3]
2026-03-19 01:32:42   --> customer.updated [evt_1TCN1R2LUnmFOZdS82MgTAyO]
2026-03-19 01:32:42  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1R2LUnmFOZdS82MgTAyO]
2026-03-19 01:32:42   --> customer.subscription.created [evt_1TCN1R2LUnmFOZdSmw6kVWL7]
2026-03-19 01:32:42  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1R2LUnmFOZdSmw6kVWL7]
2026-03-19 01:32:42   --> payment_intent.succeeded [evt_3TCN1P2LUnmFOZdS0YGvuXys]
2026-03-19 01:32:42  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_3TCN1P2LUnmFOZdS0YGvuXys]
2026-03-19 01:32:42   --> payment_intent.created [evt_3TCN1P2LUnmFOZdS0s91qBgw]
2026-03-19 01:32:42  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_3TCN1P2LUnmFOZdS0s91qBgw]
2026-03-19 01:32:42   --> invoice.created [evt_1TCN1S2LUnmFOZdSeZj7jfHw]
2026-03-19 01:32:42  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1S2LUnmFOZdSeZj7jfHw]
2026-03-19 01:32:42   --> invoice.finalized [evt_1TCN1S2LUnmFOZdSM9wP6g4f]
2026-03-19 01:32:42  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1S2LUnmFOZdSM9wP6g4f]
2026-03-19 01:32:42   --> invoice.paid [evt_1TCN1S2LUnmFOZdSWkEQh6BP]
2026-03-19 01:32:42  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1S2LUnmFOZdSWkEQh6BP]
2026-03-19 01:32:43   --> invoice.payment_succeeded [evt_1TCN1S2LUnmFOZdSCPqmtql2]
2026-03-19 01:32:43  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1S2LUnmFOZdSCPqmtql2]
2026-03-19 01:32:43   --> customer.subscription.deleted [evt_1TCN1T2LUnmFOZdSHNLhDjOL]
2026-03-19 01:32:43  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1T2LUnmFOZdSHNLhDjOL]
2026-03-19 01:33:04   --> invoice_payment.paid [evt_1TCN1o2LUnmFOZdSipsXHdbw]
2026-03-19 01:33:04  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN1o2LUnmFOZdSipsXHdbw]
2026-03-19 01:34:05   --> billing_portal.configuration.created [evt_1TCN2n2LUnmFOZdSfSyYz9Et]
2026-03-19 01:34:05  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN2n2LUnmFOZdSfSyYz9Et]
2026-03-19 01:34:05   --> billing_portal.session.created [evt_1TCN2n2LUnmFOZdSJHxMIv1w]
2026-03-19 01:34:05  <--  [200] POST http://localhost:8080/api/webhooks/stripe [evt_1TCN2n2LUnmFOZdSJHxMIv1w]

```

## stg.wyze-system.com環境下でのテスト結果

### 一覧
