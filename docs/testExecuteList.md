# テスト実行手順書 (Phase 11: Stripe 課金・サブスクリプション基盤)

## 概要
本ドキュメントは、Stripe Elements を用いたカード登録（SetupIntent）、保存済みカードの管理（CRUD）、および Webhook によるサブスクリプション状態の同期を検証するための手順を定義します。

---

## 1. 事前準備

### 1.1 環境変数の設定
`.env` または `.env.local` に以下のキーが正しく設定されていることを確認してください。
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe 公開可能キー
- `STRIPE_SECRET_KEY`: Stripe シークレットキー
- `STRIPE_WEBHOOK_SECRET`: Webhook 署名検証用シークレット（`stripe listen` 実行時に表示される `whsec_...`）
- `MOCK_MODE`: `false`（Stripeの実動作を確認する場合）

### 1.2 バックエンド・フロントエンドの起動
```bash
# バックエンド (Docker)
docker compose up -d

# フロントエンド (ポート3001で起動する場合)
cd frontend
export NEXT_PUBLIC_API_URL=http://localhost:8080
npm run dev -- -p 3001
```

---

## 2. 手動検証手順 (Frontend / UI)

### 2.1 カード情報の新規登録 (SetupIntent フロー)
1. ブラウザで `http://localhost:3001/billing` を開きます。
2. 「カードを登録する」ボタンをクリックし、登録フォームを表示します。
3. カード番号入力欄にテストカード（例: `4242 4242 4242 4242`）を入力します。
4. 入力完了後、右側の **「確定」ボタン** が有効になることを確認し、クリックします。
**期待結果**:
- 「登録できました」という成功メッセージが表示されること。
- 登録したカード（Brand, 下4桁）が一覧に即座に表示されること。
- 「検証状況」エリアに Stripe SDK の接続ステータスが表示されていること。

### 2.2 保存済みカードの削除
1. 表示されたカードの右側にある **ゴミ箱アイコン** をクリックします。
2. 確認ダイアログで「OK」を選択します。
**期待結果**:
- カードが一覧から削除され、未登録状態（ぼかし表示）に戻ること。

---

## 3. Webhook 検証 (Backend / Subscription)

### 3.1 Webhook の疎通確認 (Stripe CLI を使用)
API バージョンの不一致が解消されているか確認します。
```bash
# 1. Stripe CLI で Webhook をローカルに転送
stripe listen --forward-to localhost:8080/api/webhooks/stripe

# 2. 別のターミナルで、サブスクリプション削除イベントを発生させる
stripe trigger customer.subscription.deleted
```
**期待結果**:
- ターミナルの `stripe listen` ログに `200 OK` が表示されること。
- バックエンドのログに `stripe webhook: subscription.deleted ...` が出力されること。
- DB 内のユーザーの `role` が `free` にロールバックされること。

---

## 4. 異常系・セキュリティ検証

### 4.1 無効なカードの入力
1. 意図的にエラーになるカード番号（例: `4000 0000 0000 0002`）を入力し、「確定」をクリックします。
**期待結果**:
- 「このカードは有効ではありません」または具体的なエラー理由が表示されること。

### 4.2 未認証アクセス
1. ログアウトした状態で `http://localhost:8080/api/billing/payment-methods` にアクセスを試みます。
**期待結果**:
- `401 Unauthorized` が返却されること。

---

**最終更新日**: 2026-03-18
**作成者**: 河崎 紗夜 (Gemini CLI)
