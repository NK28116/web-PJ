# 実装指示書 (Phase 8: ステージング検証 & 実機連携)

## 概要
本フェーズでは、バックエンドに実装済みの外部 API (Google/Instagram/Stripe) をフロントエンドと統合し、実際のデータを用いた検証および決済フローを完遂させてください。**ユーザーレビューにより判明した OAuth 設定不備および決済導線の未実装が最優先事項です。**

## 1. OAuth 連携設定の修正 (最優先)

### Instagram (Meta) 連携の修正
- **現状:** `このURLのドメインはアプリのドメインに含まれていません` というエラーが発生。
- **対応:** 
  - Meta for Developers のアプリ設定にて、「アプリドメイン」に `web-pj-three.vercel.app` を追加してください。
  - 「有効なOAuthリダイレクトURI」にバックエンドのコールバック URL (`https://backend-611370943102.us-east1.run.app/api/auth/instagram/callback`) が含まれていることを確認してください。

### Google 連携の修正
- **現状:** `Google hasn’t verified this app` という警告が発生。
- **対応:**
  - Google Cloud Console の「OAuth 同意画面」にて、公開ステータスを「アプリを公開」にするか、検証用ユーザーとしてテスターのメールアドレスを追加してください。

## 2. 決済フローの有効化 (`frontend/components/templates/CurrentFeaturesTemplate`)

- **現状:** 「契約する」ボタンを押しても Stripe 決済画面へ遷移しません。
- **対応:**
  - `CurrentFeaturesTemplate` および `BillingTemplate` の「契約する」ボタンに、バックエンドの `POST /api/billing/checkout` を呼び出すロジックを実装してください。
  - 返却された `url` へ `window.location.href` でリダイレクトしてください。

## 3. 口コミ管理機能 (Google Reviews) の実機連携

### 実装方法
- **フックの活用:** `frontend/hooks/useReviews.ts` を使用して、バックエンド API (`/api/google/reviews`) からデータを取得します。
- **返信ロジック:** `submitReply` 関数内で `POST /api/google/reviews/${id}/reply` を呼び出す機能をフロントエンドと繋ぎ込んでください。

## 4. レポート・ダッシュボードの統合

- **統計データ:** `GET /api/reports/summary` を呼び出し、ダッシュボードの各セクション（統合アクション総数、来店誘導率など）に値を反映してください。
- **Instagram メディア:** `GET /api/instagram/media` から取得した実際の画像とキャプションを表示してください。

## 5. バックログ (今回のスコープ外)

### 領収書 PDF 生成機能
- **現状:** `docs/Receipt/receiptTemplate.csv` が未完成のため、本フェーズでの実装は見送ります。

## 参考資料
- `docs/review.md` (詳細なエラー内容と技術ガイド)
- `frontend/hooks/useReviews.ts` (既存の API 連携フック)

