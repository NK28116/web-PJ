# テスト実行手順書 (Phase 11: Stripe 課金・サブスクリプション基盤)

## 概要
本ドキュメントは、Stripe Elements を用いたカード登録（SetupIntent）、保存済みカードの管理（CRUD）、および Webhook によるサブスクリプション状態の同期を検証するための手順を定義します。

---

## 1. 事前準備

### 1.1 環境変数の設定
`.env` または `.env.local` に以下のキーが設定されていることを確認してください。
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe 公開可能キー
- `STRIPE_SECRET_KEY`: Stripe シークレットキー
- `STRIPE_WEBHOOK_SECRET`: Webhook 署名検証用シークレット

### 1.2 バックエンドの起動
Docker またはローカルでバックエンドが起動しており、DB と通信できる状態にしてください。
```bash
docker compose up -d
```

---

## 2. 手動検証手順 (Frontend / UI)

### 2.1 カード情報の登録 (SetupIntent フロー)
1. ブラウザで `/billing` ページを開きます。
2. 「登録クレジットカード情報」セクションの **編集（鉛筆アイコン）** をクリックします。
3. 表示されたフォームに、Stripe のテストカード番号（例: 4242 4242 4242 4242）を入力して「カードを登録する」をクリックします。
**期待結果**:
- 「カードを登録しました」という成功メッセージが表示されること。
- 登録したカード（Brand, 下4桁）が一覧に即座に反映されること。

### 2.2 保存済みカードの管理
1. 登録されたカードの右側にある **ゴミ箱アイコン** をクリックします。
2. 確認ダイアログで「OK」を選択します。
**期待結果**:
- カードが一覧から削除されること。
- Stripe Dashboard 上でも、該当する PaymentMethod が Customer から Detach されていること。

---

## 3. Webhook 検証 (Backend / Subscription)

### 3.1 Webhook の疎通確認 (Stripe CLI を使用)
実際の決済イベントをシミュレートします。
```bash
# 1. Stripe CLI で Webhook をローカルに転送
stripe listen --forward-to localhost:8080/api/webhooks/stripe

# 2. 別のターミナルで、サブスクリプション削除イベントを発生させる
# ※実際にはユーザーの subscription_id が必要ですが、トリガーで疎通確認は可能です
stripe trigger customer.subscription.deleted
```
**期待結果**:
- バックエンドのログに `stripe webhook: subscription.deleted subscription=sub_...` が出力されること。
- データベースの `users` テーブルにおいて、該当ユーザーの `role` が `free` に、`subscription_status` が `canceled` に更新されていること。

---

## 4. API エンドポイントの直接検証 (開発者向け)

### 4.1 SetupIntent の取得
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" -X POST http://localhost:8080/api/billing/setup-intent
```
**期待結果**: `client_secret` が返却されること。

### 4.2 保存済みカードの一覧取得
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:8080/api/billing/payment-methods
```
**期待結果**: 登録済みのカード情報が JSON 配列で返却されること。

---

## 5. 自動テストの実行

```bash
# フロントエンドのテスト (87/87 pass を確認済み)
cd frontend && npm test
```

---

**最終更新日**: 2026-03-18
**作成者**: 河崎 紗夜 (Gemini CLI)
