# 実装指示書 (外部プラットフォーム連携 & レポート集計基盤)

## 概要
Google Business Profile API および Instagram Graph API との OAuth 連携を完遂し、取得したデータを統合してレポート画面に表示する基盤を構築してください。セキュリティ（暗号化）と信頼性（レート制限・エラーハンドリング）を最優先事項とします。

---

## 0. 準備
- feature/externalAPICoordinationからブランチを切って実行

## 1. OAuth 連携 & トークン管理 (Backend)

### 要求事項
- **OAuth 2.0 実装**: Google および Meta (Instagram) の認可コードフローを完成させる。
- **トークンの暗号化**: `internal/repository` において、取得した `access_token` および `refresh_token` を **AES-256** で暗号化して PostgreSQL に保存すること。
- **セキュアなハンドリング**: クライアントID/シークレットは環境変数（Secret Manager）から取得し、フロントエンドには一切露出させない。

### 修正/新規ファイル
- `backend/internal/service/auth_service.go` (または相当)
- `backend/internal/repository/token_repository.go`

---

## 2. API クライアント & レート制限対応 (Backend)

### 取得対象データ (過去1ヶ月分)
1. **Google**: 店舗表示回数、電話タップ、経路案内、Webサイトクリック、ブランド検索(直接/間接)。
2. **Instagram**: プロフィール閲覧、アクションボタン、リンククリック(プロフィール/ストーリー)。

### 信頼性の担保
- **429 (Rate Limit) 検知**: 各 API が 429 エラーを返した場合、リトライを行わず即座に `RateLimitError` を返し、アプリのハングを防止すること。
- **エラー伝播**: 片方の API が失敗しても、もう片方のデータは返却できる「部分成功」を許容するレスポンス形式にする。

---

## 3. レポート統計・分析ロジック (Backend/BFF)

### 指標計算仕様
- **統合プロフィール閲覧総数**: Google(MAP_VIEWS) + Instagram(ProfileViews)
- **統合アクション総数**: Google(合計) + Instagram(合計)
- **来店誘導率**: `統合アクション総数 ÷ 統合プロフィール閲覧総数`
  - 分母 0 の場合は 0。
  - 表示は小数点第一位までとする。
- **ブランド検索**: Google の Direct/Indirect を提供。

---

## 4. モックモードの実装

### 要求事項
- `MOCK_MODE=true` 環境、または OAuth 未連携時に `docs/requirements.md` で定義された JSON 形式のモックデータを返却する機能を実装すること。
- エラー時も `429` や `NOT_CONNECTED` のエラーコードを統一された形式で返却する。

---

## 5. フロントエンド統合 (Frontend)

### 修正対象
- `frontend/hooks/useReport.ts`: 新しいバックエンドエンドポイントからデータを取得するよう更新。
- `frontend/pages/report.tsx`: 取得した統計データを表示し、未連携・エラー時の UI バナー等を実装。

---

## 完了定義 (Definition of Done)
1. **暗号化**: DB 内のトークンが暗号化されていること。
2. **レポート計算**: レポート画面で統合指標が正しく計算・表示されること。
3. **エラーハンドリング**: API 故障やレート制限時に適切なエラー表示（またはモック表示）が行われること。
4. **テスト**: `docs/requirements.md` のテスト仕様に基づき、正常系・異常系・境界値が検証されていること。
