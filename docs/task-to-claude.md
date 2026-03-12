# 実装指示書 (Phase 5-2: 実績運用レポート & 外部API連携拡充)

## 概要
Google Business Profile (GBP) および Instagram Graph API と連携し、実績運用レポート（インサイト）の取得と、口コミ・投稿のリソース管理機能を実装してください。

## 1. 共通要件
- 外部 API へのアクセス時は、`backend/internal/service/token_refresh.go` の `RefreshTokenIfNeeded` を呼び出し、最新のアクセストークンを確保すること。
- アクセストークンの暗号化/復号には `backend/internal/utils/crypto.go` を使用すること（既存実装を継承）。
- 各 API のエラー（トークン失効、クォータ制限など）を適切にハンドリングし、フロントエンドに分かりやすいエラーメッセージを返すこと。

## 2. 実績運用レポート API (Analytics)
以下のエンドポイントを実装し、`docs/figma/report.png` の要件を満たすデータを取得・加工してください。

### エンドポイント
- `GET /api/reports/summary`: Google と Instagram の統合サマリー（アクション総数、閲覧数など）。
- `GET /api/reports/google`: Google Business Profile の詳細データ（電話・ルート・サイト閲覧、検索ワード、口コミ評価）。
- `GET /api/reports/instagram`: Instagram の詳細データ（プロフィール閲覧、フォロワー推移、投稿エンゲージメント）。

### 使用する主な API エンドポイント
- **Google Business Profile (GBP):**
  - `locations.getInsights` または `locations:fetchMultiDailyMetricsTimeSeries` (Performance API)。
  - `locations.reviews.list` (口コミ評価、件数)。
- **Instagram Graph API:**
  - `/{ig-user-id}/insights` (impressions, reach, profile_views, website_clicks)。
  - `/{ig-user-id}/media` (投稿ごとのエンゲージメント)。

## 3. リソース管理 API (Resource Management)
以下の機能を実装してください。

### Instagram 連携
- `GET /api/instagram/media`: 投稿・メディア一覧の取得。
- `POST /api/instagram/media`: 投稿作成（まずは画像/動画投稿の枠組み）。

### Google Business Profile 連携
- `GET /api/google/reviews`: 口コミ一覧の取得。
- `POST /api/google/reviews/:id/reply`: 口コミへの返信。
- `GET /api/google/locations`: 管理対象店舗（Location）の取得。

## 4. 実装構造
- **Models:** `backend/internal/models/report.go` を新規作成し、レスポンス形式を定義。
- **Services:** `backend/internal/service/google_service.go` および `backend/internal/service/instagram_service.go` を作成。外部 API 呼び出しの具象化。
- **Handlers:** `backend/internal/handlers/report.go`, `backend/internal/handlers/google.go`, `backend/internal/handlers/instagram.go` を作成。
- **Routes:** `backend/cmd/server/main.go` の `protected` グループにエンドポイントを登録。

## 5. テスト
- 各サービスの外部 API 呼び出し部分を Mock 化し、単体テストを記述してください。
- 既存の `backend/test/` 以下の構成を参考にすること。

## 参考資料
- `docs/Task.md` (Phase 5-2)
- `docs/figma/report.png`
- Google Business Profile API Documentation
- Instagram Graph API Documentation
