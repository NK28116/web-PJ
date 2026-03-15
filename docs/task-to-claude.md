# 実装指示書 (Phase 8: ステージング検証 & 実機連携)

## 概要
本フェーズでは、バックエンドに実装済みの外部 API (Google/Instagram/Stripe) をフロントエンドと統合し、実際のデータを用いた検証および決済・領収書発行フローを完遂させてください。

## 1. 外部 API のフロントエンド統合

### 口コミ管理 (`frontend/components/templates/ReviewTemplate`)
- **API 連携:** `GET /api/google/reviews` から取得したデータを表示してください。
- **返信機能:** 口コミカード内の「返信」ボタンから `POST /api/google/reviews/:id/reply` を呼び出す機能を実装してください。
- **状態管理:** 返信成功時にリストを再取得（またはローカル状態を更新）してください。

### レポート・ダッシュボード (`frontend/components/templates/ReportTemplate`)
- **サマリー連携:** `GET /api/reports/summary` を使用して、ダッシュボードの統計数値（閲覧数、アクション数、来店誘導率）を反映してください。
- **グラフ描画:** `recharts` 等を使用し、`DayOfWeekTrend` や `HourlyTrend` のデータを可視化してください。
- **Instagram メディア:** `GET /api/instagram/media` から取得した実際の画像とキャプションをレポート内に表示してください。

## 2. 課金フローの有効化 (`frontend/components/templates/BillingTemplate`)

### Stripe Checkout 連携
- 「プランに申し込む」または「カード情報を変更する」ボタン押下時に、バックエンドの `POST /api/billing/checkout` を呼び出してください。
- レスポンスに含まれる `url` へリダイレクトして Stripe Checkout 画面を表示させてください。
- 決済完了後の戻り先 URL (success_url) で、ユーザーのサブスクリプション状態が更新されていることを確認するメッセージを表示してください。

## 3. 領収書 PDF 生成機能の実装

### 要件
- `BillingTemplate` の「領収書 / PDF」ボタンから、過去の支払い履歴に基づいた領収書を生成してください。
- **テンプレート:** `docs/Receipt/receiptTemplate.csv` (または `.xlsx`) のレイアウトを再現してください。
- **使用ライブラリ:** `jspdf` または `react-pdf` を推奨します。

### 埋め込み変数 (Mapping):
- `{$yyyy}`, `{$mm}`, `{$dd}`: 支払い完了日
- `{$CompanyName}`: ログインユーザーの所属（または DB の `users.email` から類推）
- `{$SumPrice}`: 支払い合計金額
- `{$PlanName}`: 契約プラン名 (例: "Standard Plan")
- `{$ReceiptNumber}`: Stripe の `Invoice ID` またはユニークな ID

## 4. 環境設定の最終確認
- **CORS 設定:** `backend/internal/middleware/cors.go` 等で Vercel ドメイン (`https://web-pj-three.vercel.app`) が許可されているか確認。
- **OAuth リダイレクト:** GCP および Meta のデベロッパーコンソールで、本番環境のコールバック URL が登録済みであることを確認。
- **Webhook:** Stripe 管理画面に Cloud Run の Webhook URL (`/api/webhooks/stripe`) を登録し、シークレットを Secret Manager に設定。

## 参考資料
- `backend/internal/handlers/google.go` (口コミ API)
- `backend/internal/handlers/report.go` (レポート API)
- `backend/internal/handlers/billing.go` (決済 API)
- `docs/Receipt/receiptTemplate.csv` (領収書レイアウト)
