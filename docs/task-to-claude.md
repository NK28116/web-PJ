# 実装指示書 (Phase 8: ステージング検証 & 実機連携)

## 概要
本フェーズでは、バックエンドに実装済みの外部 API (Google/Instagram/Stripe) をフロントエンドと統合し、実際のデータを用いた検証および決済・領収書発行フローを完遂させてください。

## 1. 口コミ管理機能 (Google Reviews) の実機連携

### 実装方法の概要
- **フックの活用:** `frontend/hooks/useReviews.ts` を使用して、バックエンド API (`/api/google/reviews`) からデータを取得します。
- **データマッピング:** バックエンドの `GoogleReview` 型をフロントエンドの `Review` 型に変換する `toReview` 関数を適切に実装・維持してください。
- **返信ロジック:** `submitReply` 関数内で `POST /api/google/reviews/:id/reply` を呼び出し、成功時にフロントエンドの `reviews` 状態を `replied` に更新します。

### 詳細要件
- **表示項目:** 口コミ投稿者名、星評価 (1-5)、コメント本文、画像 (media_urls)、投稿日を正しく表示。
- **フィルタリング・ソート:** `ReviewTemplate.tsx` 内の `sortReviews` ロジックを、実際の `createdAt` (ISO文字列) に対応するように調整してください。
- **返信ステータス:** 返信済みの口コミについては、返信内容 (`replyText`) と返信日を表示し、二重送信を防止してください。

## 2. レポート・ダッシュボードの統合

### 実装方法の概要
- **統計データ:** `GET /api/reports/summary` を呼び出し、ダッシュボードの各セクション（統合アクション総数、来店誘導率など）に値を流し込みます。
- **グラフの実装:** `recharts` を利用し、`GoogleReport` から取得できる曜日・時間帯傾向を棒グラフや折れ線グラフで可視化してください。
- **Instagram 連携:** `GET /api/instagram/media` から取得したメディアリストを、レポート内の「投稿一覧」セクションにマップしてください。

## 3. 決済フローの有効化 (`frontend/components/templates/BillingTemplate`)

### Stripe Checkout 連携
- `BillingTemplate.tsx` の決済ボタン押下時に `apiPost('/api/billing/checkout', { price_id: '...' })` を実行。
- 返却された `url` へ `window.location.href` で遷移させてください。

## 4. バックログ (今回のスコープ外)

### 領収書 PDF 生成機能
- **現状:** `docs/Receipt/receiptTemplate.csv` が未完成のため、本フェーズでの実装は見送ります。
- **今後の予定:** テンプレートが確定次第、`jspdf` 等を用いて、Stripe の支払い履歴から領収書を生成する機能を実装予定です。

## 5. 環境設定と疎通確認
- **OAuth 設定:** Vercel ドメイン `https://web-pj-three.vercel.app` を GCP/Meta コンソールのリダイレクト許可リストに追加したことを確認。
- **Webhook 設定:** `STRIPE_WEBHOOK_SECRET` がステージング環境の Secret Manager に正しく設定されていることを確認。

## 参考資料
- `frontend/hooks/useReviews.ts` (口コミ取得・返信ロジック)
- `backend/internal/models/report.go` (API レスポンス定義)
- `docs/Receipt/receiptTemplate.csv` (領収書テンプレート)
