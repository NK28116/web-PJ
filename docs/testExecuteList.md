# テスト実行手順書 (Phase 11: Stripe 課金・サブスクリプション基盤)

## 概要
本ドキュメントは、Stripe Elements を用いたカード登録（SetupIntent）、保存済みカードの管理（CRUD）、Webhook によるサブスクリプション状態の同期、および **領収書 PDF の動的生成** を検証するための手順を定義します。

---

## 1. 事前準備

### 1.1 環境変数の設定
`.env` または `.env.local` に以下のキーが正しく設定されていることを確認してください。
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe 公開可能キー
- `STRIPE_SECRET_KEY`: Stripe シークレットキー
- `STRIPE_WEBHOOK_SECRET`: Webhook 署名検証用シークレット（`stripe listen` 実行時に表示される `whsec_...`）
- `MOCK_MODE`: `false`

### 1.2 バックエンド・フロントエンドの起動
```bash
docker compose up -d
# フロントエンドは 3001 ポートを推奨
cd frontend && export NEXT_PUBLIC_API_URL=http://localhost:8080 && npm run dev -- -p 3001
```

---

## 2. カード情報 & 決済の検証

### 2.1 カード情報の新規登録
1. `http://localhost:3001/billing` を開き、「カードを登録する」をクリック。
2. テストカード（`4242...`）を入力し、**「確定」ボタン** で送信。
**期待結果**: 「登録できました」と表示され、カード一覧に反映されること。

### 2.2 Webhook 疎通（ロールバック検証）
1. `stripe listen --forward-to localhost:8080/api/webhooks/stripe` を実行。
2. `stripe trigger customer.subscription.deleted` を実行。
**期待結果**: DB の `role` が `free` に戻ること。

---

## 3. 領収書 PDF 生成の検証 (New)

### 3.1 PDF ダウンロードテスト
1. 「お支払い履歴」セクションにある任意の履歴の **「PDF」ボタン** をクリック。
2. ブラウザで PDF がダウンロード（または表示）されることを確認。

### 3.2 変数反映の確認
ダウンロードした PDF を開き、以下の項目が正しく反映されているか確認してください。
- **宛名**: ログイン中のメールアドレス（`localStorage` の `user_email`）になっているか。
- **金額**: 履歴に表示されている金額（例: ¥33,000）と一致しているか。
- **但し書き**: プラン名（例: Standard Plan）が記載されているか。
- **領収書番号**: `INV-` で始まる番号が表示されているか。

---

## 4. トラブルシューティング（問題が起きた時の対処法）

### 4.1 日本語が文字化け（□になる）場合
- **原因**: jsPDF に日本語フォント（TTF）が読み込まれていない。
- **対処**: `frontend/utils/generateReceipt.ts` 内で `doc.addFont()` を行っている箇所を確認。フォントファイルが `public/fonts` に存在するか、または Base64 文字列として正しく定義されているか確認してください。

### 4.2 文字の位置がズレている場合
- **原因**: `doc.text(text, x, y)` の座標指定が不適切。
- **対処**: `frontend/utils/generateReceipt.ts` の `generateReceiptPDF` 関数内の数値を微調整してください。
  - 例: `doc.text(data.companyName, 20, 50)` の `50`（Y座標）を増減させる。

### 4.3 宛名（名前）が表示されない場合
- **原因**: `localStorage` に `user_email` が保存されていない。
- **対処**: 一度ログアウトし、新規登録（またはログイン）し直して、`localStorage` に値が入ることを確認してください。

---

**最終更新日**: 2026-03-18
**作成者**: 河崎 紗夜 (Gemini CLI)
