# CLAUDE.md - webSystem-PJ 作業ログ

このファイルは Claude（実装AI）が実装した内容を次回以降のセッションで理解できるように記録するものです。

---

## 最新の実装 (2026-03-20) — Phase 13 & 14: Price ID 10個対応 & 決済履歴API実装

### フェーズ / タスク
**Phase 13: Staging環境リリース最終統合 — Price ID 10個対応・Cloud Run 再デプロイ**
**Phase 14: 決済履歴 API & 次回請求情報の統合**

### 実装した変更

#### Phase 13: Price ID 3個→10個拡張

##### `backend/internal/config/config.go`
- 既存3フィールド（`StripePriceIDLight/Basic/Pro`）を後方互換のため維持
- 10個の新フィールド追加: `LightBeta/Launch/Growth`, `BasicBeta/Launch/Growth`, `ProBeta/Launch/Growth`, `StagingTest`
- 対応する `getEnv()` を `Load()` に追加

##### `backend/internal/handlers/webhook.go`
- `price_id → plan_tier` マッピングを拡張: レガシー3個 + フェーズ別9個の全てで正しくプラン判定
- Basic: `cfg.StripePriceIDBasic`, `BasicBeta`, `BasicLaunch`, `BasicGrowth` → `"basic"`
- Pro: `cfg.StripePriceIDPro`, `ProBeta`, `ProLaunch`, `ProGrowth` → `"pro"`
- それ以外（Light系含む）→ `"light"`（デフォルト）

##### `.github/workflows/cd-staging.yml`
- `--set-env-vars` 追加: `FRONTEND_URL`, `GIN_MODE`, `GOOGLE_REDIRECT_URL`, `INSTAGRAM_REDIRECT_URL`
- `--set-secrets` に10個の Price ID シークレット + `STRIPE_WEBHOOK_SECRET` を追加
- `FRONTEND_URL` を `--set-secrets` から `--set-env-vars` に移動（Secret Manager ではなくプレーン環境変数のため）

##### GCP Secret Manager
- 10個の Price ID シークレットを新規作成（`STRIPE_PRICE_ID_LIGHT_BETA` ～ `STRIPE_PRICE_ID_STAGING_TEST`）

#### Phase 14: 決済履歴API

##### `backend/internal/service/stripe_service.go`
- `InvoiceItem` / `UpcomingInvoice` 構造体追加
- `ListInvoices(customerID)`: Stripe `invoices.List` で最新10件取得（ID, 金額, PDF URL 等）
- `GetUpcomingInvoice(customerID)`: Stripe `invoices.Upcoming` で次回請求情報取得

##### `backend/internal/handlers/billing.go`
- `GetInvoices`: `GET /api/billing/invoices` — ユーザーの支払い履歴を返却
- `GetUpcoming`: `GET /api/billing/upcoming` — 次回請求情報を返却（サブスクなしは null）

##### `backend/cmd/server/main.go`
- `GET /api/billing/invoices` と `GET /api/billing/upcoming` をルート登録

##### `frontend/types/api.ts`
- `InvoiceItem`, `UpcomingInvoice` 型追加

##### `frontend/hooks/useBilling.ts`
- `fetchInvoices`: `/api/billing/invoices` + `/api/billing/upcoming` を並列取得
- `invoices`, `invoicesLoading`, `upcoming`, `refetchInvoices` を返却に追加
- `IS_MOCK` チェック: モック時は空配列/null を返却

##### `frontend/components/templates/BillingTemplate/BillingTemplate.tsx`
- 支払い履歴: `MOCK_PAYMENT_HISTORY` → 実データ優先（`invoices` が存在すれば使用）
- PDF ボタン: `invoicePdfUrl` があれば Stripe PDF を別タブで開く、なければ `generateReceiptPDF` フォールバック
- 次回お支払い: `upcoming` データがあれば実データ表示、なければ「予定はありません」

##### テスト修正
- `BillingTemplate.test.tsx`: `invoices`, `invoicesLoading`, `upcoming`, `refetchInvoices` モック追加
- 次回お支払いテストを「予定はありません」表示に変更（テスト環境では upcoming=null）

### 検証結果
- フロントエンドテスト 90/90 パス
- Go ビルド成功
- Cloud Run デプロイ成功（revision `backend-00021-75z`）
- Vercel デプロイ成功

### 注意事項（マスター作業）
- Stripe Dashboard で Webhook エンドポイント登録が必要: `https://backend-611370943102.us-east1.run.app/api/webhooks/stripe`
- `STRIPE_WEBHOOK_SECRET` を Secret Manager に登録後、Cloud Run 再デプロイが必要
- Vercel 環境変数 `NEXT_PUBLIC_MOCK_MODE=false` の設定が必要
- Google/Instagram OAuth リダイレクト URI の確認が必要

---

## 過去の実装 (2026-03-20) — Phase 12 Task 4: 外部コンテンツ MOCK_MODE 切替 & Task.md 作成

### フェーズ / タスク
**Phase 12 Task 4: 外部コンテンツの表示統合 — `NEXT_PUBLIC_MOCK_MODE` によるモック/実データ切替**

### 実装した変更

#### `frontend/hooks/useReviews.ts`
- `NEXT_PUBLIC_MOCK_MODE` 環境変数チェックを追加
- `IS_MOCK === true` の場合、`reviewMockData` を返却して API 呼び出しをスキップ
- ステージング環境では `NEXT_PUBLIC_MOCK_MODE=false` で実 API を使用

#### `frontend/hooks/useInstagramMedia.ts`
- `NEXT_PUBLIC_MOCK_MODE` 環境変数チェックを追加
- `IS_MOCK === true` の場合、空配列を返却して API 呼び出しをスキップ

#### `docs/Task.md`
- Phase 12 の全タスク完了状況を追記
- Phase 13（マスター手動作業）を新規追加：Cloud Run 環境変数、Stripe Webhook 設定、Vercel 環境変数、OAuth リダイレクト URI
- 疎通確認チェックリストを追加
- 未実装・要設計判断セクション（Stripe Invoice API）を追加

### 確認済み（変更不要と判断したもの）

| ファイル | 確認内容 | 状態 |
|---|---|---|
| `PostTemplate` | ハイブリッド方式（`useInstagramMedia` → 空の場合 `generateMockPosts` フォールバック）| ✅ 既存ロジックで対応済み |
| `generateReceipt.ts` | 領収書 PDF 生成（jsPDF）| ✅ Phase 11 で実装済み |

### 検証結果
- フロントエンドテスト 90/90 パス

### 注意事項
- `NEXT_PUBLIC_MOCK_MODE` は Vercel 環境変数として `false` を設定する必要あり（マスター作業）
- 決済履歴 API（Stripe Invoice 取得）は設計判断が必要なため未実装

---

## 過去の実装 (2026-03-20) — Phase 12 Task 3: BillingTemplate 現在プラン表示 & CurrentFeaturesTemplate 実API連携

### フェーズ / タスク
**Phase 12 Task 3: 3段階プラン & サブスクリプション制御 — UI を実API連携に変更**

### 実装した変更

#### `frontend/components/templates/BillingTemplate/BillingTemplate.tsx`
- `useProfile()` フックを統合し、現在のプランを取得
- プラン選択セクション上部に「現在のプラン」表示を追加（`plan_tier !== 'free'` 時のみ）
- 契約中プランのラジオボタンを無効化し「現在のプラン」ラベルを表示
- セクション見出しを動的変更（「プランを選択」/「プランを変更」）

#### `frontend/components/templates/CurrentFeaturesTemplate/CurrentFeaturesTemplate.tsx`
- `useProfile()` フックを統合し、`plan_tier` からプラン状態を動的取得
- ハードコードされた `PLAN_DATA` を `PLAN_DISPLAY` マップに変更（Light/Basic/Pro 対応）
- `planStatus` を `useState` から `useProfile` 由来の算出値に変更（`free` → `inactive`, それ以外 → `active`）
- `PRICE_IDS` を環境変数（`NEXT_PUBLIC_STRIPE_PRICE_ID_*`）から取得するよう変更
- プラン変更ブロックを動的化：現在プランより上位のみ表示

#### テスト修正
- `CurrentFeaturesTemplate.test.tsx`: `useBilling` / `useProfile` モック追加、「未契約」複数箇所対応
- `BillingTemplate.test.tsx`: `useProfile` モック追加

### 検証結果
- フロントエンドテスト 90/90 パス
- Go ビルド成功

---

## 過去の実装 (2026-03-19) — Phase 12 Task 2: /register エンドポイントにメール認証済みチェック追加

### フェーズ / タスク
**Phase 12 Task 2: 本番用メール認証シーケンス — `/register` にメール認証済みチェックを追加**

### 実装した変更

#### `backend/internal/repository/verification.go`
- `IsVerified(email string) (bool, error)` メソッド追加
  - `email_verifications` テーブルから `used = true` のレコードを検索
  - メール認証コード検証済み（`/api/auth/verify-code` 成功済み）かどうかを判定

#### `backend/internal/repository/interfaces.go`
- `VerificationRepositoryInterface` インターフェース追加（`IsVerified` メソッド定義）
  - テスト時のモック差し替えを可能にする

#### `backend/internal/handlers/auth.go`
- `Register` ハンドラの引数に `verifyRepo repository.VerificationRepositoryInterface` を追加
- ユーザー作成前に `verifyRepo.IsVerified(req.Email)` を呼び出し
- 未認証の場合 `403 Forbidden` (`"email not verified"`) を返却

#### `backend/cmd/server/main.go`
- `Register(cfg, userRepo)` → `Register(cfg, userRepo, verifyRepo)` に変更

#### `backend/internal/handlers/auth_test.go`
- `mockVerificationRepository` 構造体追加（`isVerified bool` で制御）
- 全4テスト（Success, DuplicateEmail, ShortPassword, NoEmail）に `mockVerifyRepo` を追加

### 検証結果
- `go build ./...` → 成功
- `TestRegister_Success` / `TestRegister_DuplicateEmail` / `TestRegister_InvalidRequest_ShortPassword` / `TestRegister_InvalidRequest_NoEmail` → 全パス

### 注意事項
- メール認証なしで `/register` を直接呼ぶと `403` が返る（セキュリティ強化）
- フロントエンドの `SignUpTemplate` は既に `/api/auth/send-code` → `/api/auth/verify-code` → `/register` の順で呼び出しているため変更不要

---

## 過去の実装 (2026-03-18) — Phase 11 追加: Webhook 署名検証修正・STRIPE_WEBHOOK_SECRET 設定

### フェーズ / タスク
**Phase 11 追加: Webhook API バージョン不一致解消・STRIPE_WEBHOOK_SECRET ローカル設定**

### 実装した変更

#### バックエンド
- `handlers/webhook.go`: `webhook.ConstructEvent` → `webhook.ConstructEventWithOptions` に変更し `IgnoreAPIVersionMismatch: true` を設定
  - **理由**: Stripe CLI が送信するイベントの API Version (`2025-07-30.basil`) と `stripe-go v76` が期待するバージョン (`2023-10-16`) の不一致により全イベントが 400 になっていた
- `backend/internal/middleware/cors.go`: `allowedOrigins` に `http://localhost:3001` を追加

#### 環境設定
- `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...` を追加（Stripe CLI `stripe listen` で取得）

### 検証結果
- `customer.subscription.created` → DB 更新 ✅
- `customer.subscription.deleted` → `role='free'` ロールバック ✅

### 注意事項
- `STRIPE_WEBHOOK_SECRET` はローカル開発用（`stripe listen` 実行中のみ有効）
- 本番用は Stripe Dashboard で別途 Webhook Endpoint を作成してシークレットを取得する

---

## 過去の実装 (2026-03-18) — Phase 11: Stripe カード管理 & Webhook サブスクリプション制御

### フェーズ / タスク
**Phase 11: Stripe Elements カード管理・SetupIntent フロー・Webhook ライフサイクル管理 (task-to-claude.md 準拠)**

### 実装した変更

#### バックエンド
- `stripe_service.go`: `CreateSetupIntent`, `ListPaymentMethods`, `DetachPaymentMethod`, `PaymentMethodItem` 追加
- `handlers/billing.go`: `POST /api/billing/setup-intent`, `GET /api/billing/payment-methods`, `DELETE /api/billing/payment-methods/:id` ハンドラ追加
- `handlers/webhook.go`: `customer.subscription.created` ケース追加; `deleted` で `CancelSubscription` 呼び出し
- `repository/user.go`: `CancelSubscription(subscriptionID string) error` 追加 — `subscription_status='canceled'`, `role='free'` をセット
- `cmd/server/main.go`: 3 エンドポイント登録

#### フロントエンド
- `types/api.ts`: `SetupIntentResponse`, `PaymentMethod` 型追加
- `utils/api.ts`: `apiDelete<T>` 追加（204 No Content 対応）
- `hooks/useBilling.ts`: `fetchPaymentMethods`, `getSetupIntentSecret`, `deletePaymentMethod`, `paymentMethods`, `pmLoading`, `refetchPaymentMethods` 追加
- `BillingTemplate.tsx`: Stripe Elements 統合 — `CardSetupForm` (SetupIntent フロー), 保存済みカード一覧 + 削除ボタン
- `package.json`: `@stripe/react-stripe-js ^5.6.1`, `@stripe/stripe-js ^8.10.0` 追加

#### テスト修正
- `BillingTemplate.test.tsx`: Stripe / useBilling モック更新
- `ReportTemplate.test.tsx`: TypeScript エラー解消 (`!!data`)

### 注意事項
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` を `.env.local` に設定が必要
- フロントエンドテスト: 87/87 パス

---

## 過去の実装 (2026-03-16) — Phase 9 v8: Cloud Run 実行用 SA への Secret Manager アクセス権付与

### フェーズ / タスク
**Phase 9 v8: `Permission denied on secret` エラー解消 (task-to-claude.md Task 4 新規追加項目)**

### 実装した変更（GCP IAM）

対象 SA: `611370943102-compute@developer.gserviceaccount.com`（Cloud Run 実行用デフォルト SA）

```bash
gcloud projects add-iam-policy-binding wyze-develop-staging \
  --member="serviceAccount:611370943102-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None
```

| ロール | 付与目的 | 状態 |
|---|---|---|
| `roles/secretmanager.secretAccessor` | Cloud Run コンテナ起動時の Secret Manager 参照 | ✅ 今回付与 |

**理由:** `roles/editor` は `secretmanager.secretAccessor` を包含しないため、`--set-secrets` で注入した SECRET_API 等の参照が `Permission denied` になっていた。

---

### 完了定義 (Definition of Done) 確認

1. ✅ Cloud Run 実行用 SA が Secret Manager シークレットを参照可能
2. ✅ `STRIPE_SECRET_KEY=STRIPE_API:latest` 等の `--set-secrets` が正常動作見込み

---

## 過去の実装 (2026-03-16) — Phase 9 v7: Cloud Run デプロイコマンド修正（Cloud SQL 接続・Secret Manager 連携）

### フェーズ / タスク
**Phase 9 v7: コンテナ起動エラー解消 (task-to-claude.md Task 6 準拠)**

### 実装した変更

#### `.github/workflows/cd-staging.yml` — Deploy Backend to Cloud Run
```diff
  gcloud run deploy ${{ env.BACKEND_SERVICE }} \
    --image=${{ env.BACKEND_IMAGE }}:${{ github.sha }} \
    --region=${{ env.REGION }} \
    --platform=managed \
+   --add-cloudsql-instances=${{ env.CLOUD_SQL_INSTANCE }} \
+   --set-secrets=DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,ENCRYPTION_KEY=ENCRYPTION_KEY:latest,GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,INSTAGRAM_CLIENT_ID=INSTAGRAM_CLIENT_ID:latest,INSTAGRAM_CLIENT_SECRET=INSTAGRAM_CLIENT_SECRET:latest,STRIPE_SECRET_KEY=STRIPE_API:latest \
    --quiet
```

**理由:**
- `--add-cloudsql-instances`: Cloud Run コンテナから Cloud SQL へ unix socket 経由で接続するために必要
- `--set-secrets`: Secret Manager の値を環境変数として Cloud Run コンテナに注入。`DATABASE_URL` が未設定だと `mustEnv` で panic してコンテナがクラッシュしていた

**Secret Manager → 環境変数 マッピング:**

| 環境変数 | Secret Manager キー |
|---|---|
| `DATABASE_URL` | `DATABASE_URL:latest` (unix socket 形式 ✅) |
| `JWT_SECRET` | `JWT_SECRET:latest` |
| `ENCRYPTION_KEY` | `ENCRYPTION_KEY:latest` |
| `GOOGLE_CLIENT_ID` | `GOOGLE_CLIENT_ID:latest` |
| `GOOGLE_CLIENT_SECRET` | `GOOGLE_CLIENT_SECRET:latest` |
| `INSTAGRAM_CLIENT_ID` | `INSTAGRAM_CLIENT_ID:latest` |
| `INSTAGRAM_CLIENT_SECRET` | `INSTAGRAM_CLIENT_SECRET:latest` |
| `STRIPE_SECRET_KEY` | `STRIPE_API:latest` |

---

### 確認済み（変更不要と判断したもの）

| 確認内容 | 状態 |
|---|---|
| Cloud SQL パブリック IP | ✅ `ipv4Enabled: true` で既に有効 |
| `config.go` の PORT 処理 | ✅ `getEnv("PORT", "8080")` — Cloud Run が自動設定 |
| Secret Manager の `DATABASE_URL` 形式 | ✅ unix socket 形式 (`host=/cloudsql/wyze-develop-staging:us-east1:wyze-staging-db`) |
| Cloud Run SA の Secret Manager アクセス | ✅ `roles/editor` で包含済み |
| Cloud SQL の `wyze_db` 存在確認 | ✅ `gcloud sql databases list` で確認済み |

---

### 完了定義 (Definition of Done) 確認

1. ✅ Cloud Run バックエンドが起動時に Cloud SQL 接続・必須 env 取得可能
2. ✅ `DATABASE_URL_TCP` (Proxy 用) と Secret Manager `DATABASE_URL` (Cloud Run 用) の役割分離
3. ⚠️ `STRIPE_WEBHOOK_SECRET` は Secret Manager 未登録 — 必要なら手動追加

---

## 過去の実装 (2026-03-16) — Phase 9 v6: GCP IAM ロール追加付与

### フェーズ / タスク
**Phase 9 v6: CD Staging 実行に必要な IAM ロールを SA に付与 (task-to-claude.md 準拠)**

### 実装した変更（GCP IAM）

対象 SA: `github-actions-deploy@wyze-develop-staging.iam.gserviceaccount.com`

| ロール | 付与目的 | 状態 |
|---|---|---|
| `roles/artifactregistry.writer` | Docker イメージ push | ✅ 前回付与済み |
| `roles/run.admin` | Cloud Run デプロイ | ✅ 今回付与 |
| `roles/cloudsql.viewer` | Cloud SQL インスタンス参照 | ✅ 今回付与 |
| `roles/cloudsql.client` | Cloud SQL Proxy 接続 | ✅ 今回付与 |
| `roles/iam.serviceAccountUser` | SA 権限でのサービス実行 | ✅ 今回付与 |

**付与コマンド:**
```bash
gcloud projects add-iam-policy-binding wyze-develop-staging \
  --member="serviceAccount:github-actions-deploy@wyze-develop-staging.iam.gserviceaccount.com" \
  --role="<role>" --condition=None
```

---

### 完了定義 (Definition of Done) 確認

1. ✅ `roles/run.admin` → Cloud Run デプロイ権限エラー解消見込み
2. ✅ `roles/cloudsql.client` + `roles/cloudsql.viewer` → Cloud SQL 403 エラー解消見込み
3. ✅ `roles/iam.serviceAccountUser` → SA 実行権限エラー解消見込み
4. ✅ `GCP_SA_KEY` / `DATABASE_URL_TCP` GitHub Secrets 登録済み

---

## 過去の実装 (2026-03-16) — Phase 9 v5: Dockerfile バージョン統一 & frontend/public 作成 & ENV 形式修正

### フェーズ / タスク
**Phase 9 v5: backend/Dockerfile Go バージョン統一、frontend/Dockerfile 修正、public ディレクトリ作成 (task-to-claude.md 準拠)**

### 実装した変更

#### `backend/Dockerfile`
```diff
- FROM golang:1.25-alpine AS builder
+ FROM golang:1.23-alpine AS builder
```
**理由:** `go.mod` は `go 1.23` であるにもかかわらず、Dockerfile が `golang:1.25-alpine` を参照しており CI 環境と不整合だった。

---

#### `frontend/Dockerfile`
```diff
- ENV NODE_ENV production
+ ENV NODE_ENV=production
```
**理由:** `LegacyKeyValueFormat` Warning が発生していたため、現行仕様の `KEY=VALUE` 形式に修正。

---

#### `frontend/public/.gitkeep` (新規作成)
- `frontend/public` ディレクトリが存在しないため、Dockerfile の `COPY --from=builder /app/public ./public` が `/app/public: not found` で失敗していた。
- 空ディレクトリとして `public/.gitkeep` を作成して解消。

---

### 確認済み（変更不要と判断したもの）

| 確認内容 | 状態 |
|---|---|
| `cd-staging.yml` の `DATABASE_URL_TCP` 渡し | ✅ `DATABASE_URL="${{ secrets.DATABASE_URL_TCP }}" go run ./cmd/migrate/main.go up` で正しい |
| フロントエンドテスト 87/87 | ✅ パス確認済み |

---

### 完了定義 (Definition of Done) 確認

1. ✅ `backend/Dockerfile` → `golang:1.23-alpine`（go.mod・CI と統一）
2. ✅ `frontend/Dockerfile` → `ENV NODE_ENV=production`（LegacyKeyValueFormat 解消）
3. ✅ `frontend/public/.gitkeep` → Dockerfile COPY エラー解消
4. ⚠️ `GCP_SA_KEY` は GitHub Secrets に手動登録が必要
5. ⚠️ `DATABASE_URL_TCP` は GitHub Secrets に手動登録が必要（コード側は正しい）

---

## 過去の実装 (2026-03-16) — Phase 9 v4: インポートエイリアス付与 & CDフロントエンドビルドパス修正

### フェーズ / タスク
**Phase 9 v4: Lint エラー解消（明示的エイリアス）& CD Staging フロントエンドビルドパス修正 (task-to-claude.md 準拠)**

### 実装した変更

#### `backend/internal/models/claims.go`
```diff
- import "github.com/golang-jwt/jwt/v5"
+ import jwt "github.com/golang-jwt/jwt/v5"
```

#### `backend/internal/handlers/auth.go`
```diff
- "github.com/golang-jwt/jwt/v5"
+ jwt "github.com/golang-jwt/jwt/v5"
```

#### `backend/cmd/migrate/main.go`
```diff
- "github.com/golang-migrate/migrate/v4"
+ migrate "github.com/golang-migrate/migrate/v4"
```

**理由:** golangci-lint の typecheck において `jwt`/`migrate` が undefined として検出されていた。明示的エイリアスを付与することで typecheck が確実にパッケージ名を解決できるようにした。

---

#### `.github/workflows/cd-staging.yml`
```diff
- docker build -t ${{ env.FRONTEND_IMAGE }}:${{ github.sha }} -t ${{ env.FRONTEND_IMAGE }}:latest ./
+ docker build -t ${{ env.FRONTEND_IMAGE }}:${{ github.sha }} -t ${{ env.FRONTEND_IMAGE }}:latest ./frontend
```

**理由:** `frontend/Dockerfile` が存在するにもかかわらず、docker build のコンテキストがルート `./` を指していたため `open Dockerfile: no such file or directory` エラーが発生していた。`./frontend` に修正することで正しい Dockerfile を参照できるようにした。

---

### 確認済み（変更不要と判断したもの）

| 確認内容 | 状態 |
|---|---|
| `backend/internal/service/stripe_service.go` の stripe インポート | ✅ 正しい（`"github.com/stripe/stripe-go/v76"` + サブパッケージ） |
| `backend/test/data_isolation_test.go` の `GoogleCallback` 引数 | ✅ 3引数 `(cfg, extAcctRepo, userRepo)` で定義と一致 |
| フロントエンドテスト 87/87 | ✅ ローカル確認済み |

---

### 完了定義 (Definition of Done) 確認

1. ✅ import エイリアス付与（`jwt`, `migrate`）→ typecheck エラー解消見込み
2. ✅ `cd-staging.yml` フロントエンドビルドパス修正 (`./` → `./frontend`)
3. ✅ フロントエンドテスト 87/87 パス
4. ⚠️ `GCP_SA_KEY` は GitHub Secrets に手動登録が必要（コード側は正しい）
5. ⚠️ Artifact Registry の IAM 権限 (`artifactregistry.repositories.uploadArtifacts`) は GCP コンソールで確認が必要

---

## 過去の実装 (2026-03-15)

### フェーズ / タスク
**Phase 8: ステージング検証 & 実機連携 (task-to-claude.md 準拠)**

### 実装した変更

#### `CurrentFeaturesTemplate.tsx` (line 32)
```diff
- const [planStatus, setPlanStatus] = useState<PlanStatus>('active');
+ const [planStatus, setPlanStatus] = useState<PlanStatus>('inactive');
```

**理由:** デフォルトが `'active'` だったため、未契約ユーザーに「契約する」ボタンが表示されなかった。
`'inactive'` に変更することで、未契約ユーザーがページを開いた際にボタンが正しく表示される。

---

### 実装済み確認（変更不要と判断したもの）

| ファイル | 確認内容 | 状態 |
|---|---|---|
| `backend/internal/handlers/oauth.go` | `GoogleCallback` でJWT未存在時にメールでユーザー検索 → 新規作成 → JWT発行 (line 127-165) | ✅ 実装済み |
| `frontend/components/templates/LoginTemplate/index.tsx` | `handleGoogleLogin` と Google ログインボタン (line 26-28, 134-145) | ✅ 実装済み |
| `frontend/components/templates/LoginTemplate/index.tsx` | コールバック後 `token` をURLから取得して localStorage に保存 (line 17-24) | ✅ 実装済み |
| `frontend/hooks/useBilling.ts` | `startCheckout` で `window.location.assign(res.url)` (line 16) | ✅ 実装済み |
| `frontend/hooks/useReviews.ts` | `create_time.split('T')[0]` による ISO 文字列パース (line 13) | ✅ 実装済み |
| `frontend/hooks/useReviews.ts` | `submitReply` 後に `setReviews` で即座に返信済み状態に更新 (line 52-57) | ✅ 実装済み |
| `frontend/hooks/useReport.ts` | `GET /api/reports/summary` 呼び出しと `profile_views`/`total_actions` バインド | ✅ 実装済み |
| `frontend/components/templates/ReportTemplate/ReportTab.tsx` | `{item.media_url && <img ...>}` ガード処理 (line 283-289) | ✅ 実装済み |

---

### インフラ対応（コード変更なし・手動作業が必要）

以下は Meta/Google コンソールでの設定変更が必要。Claude からは実施不可。

- **Instagram (Meta for Developers):**
  - 「アプリドメイン」に `web-pj-three.vercel.app` を追加
  - 「有効なOAuthリダイレクトURI」に `https://backend-611370943102.us-east1.run.app/api/auth/instagram/callback` を登録

- **Google Cloud Console:**
  - 「OAuth 同意画面」で公開ステータスを「アプリを公開」に変更、またはテストユーザーに `wyze.system.inc@gmail.com` を追加

- **Stripe:**
  - `STRIPE_SECRET_KEY` および `STRIPE_PUBLIC_KEY` が Secret Manager に登録されているか確認

---

### 完了定義 (Definition of Done) 確認

1. ✅ 未ログイン状態で `login.tsx` から Google 連携 → ダッシュボード遷移できる（バックエンド・フロントエンド両方実装済み）
2. ⚠️ Instagram 連携のドメインエラー → Meta コンソール設定が必要（コード側は問題なし）
3. ✅ `current-features` から「契約する」押下 → Stripe 決済画面へ遷移（本 PR で修正）

---

---

## 実装 (2026-03-16)

### フェーズ / タスク
**Phase 9: デプロイ・CIエラーの解消 (task-to-claude.md 準拠)**

### 実装した変更

#### `.github/workflows/ci.yml`
```diff
- go-version: '1.22'  # backend-lint / backend-unit-test / backend-integration-test の3箇所
+ go-version: '1.23'

- sh -s -- -b $(go env GOPATH)/bin v1.57.2  # golangci-lint
+ sh -s -- -b $(go env GOPATH)/bin v1.61.0
```

#### `.github/workflows/cd-staging.yml`
```diff
- go-version: '1.22'
+ go-version: '1.23'
```

**理由:** `go.mod` は `go 1.23.0` だが CI/CD が `'1.22'` を指定していたため型チェックが通らなかった。
`golangci-lint v1.57.2` は Go 1.23 非対応のため `v1.61.0` に更新。

---

#### `backend/` — `go mod tidy` 実行
`go.sum` を最新状態に更新（ローカル実行済み）。

---

#### `frontend/test/CurrentFeaturesTemplate.test.tsx`
Phase 8 で `planStatus` 初期値を `'inactive'` に変更したことによるテスト失敗を修正。

変更した6テスト:
1. `'ステータスが「契約中」であること'` → `'ステータスが「未契約」であること'`
2. `'次回更新日が表示されていること'` → `'「契約する」ボタンが初期表示されること'`
3. `'契約期間が表示されていること'` → `'契約期間が非表示であること'`
4. `'解約後、「契約する」ボタンが表示されること'` → `'未契約状態では「契約する」ボタンが常に表示されること'`
5. `'自動更新停止後、更新日が警告テキストに変化すること'` → 未契約状態では警告テキスト非表示を確認に変更
6. `'自動更新停止後、ステータスは「契約中」のままであること'` → 未契約状態維持を確認に変更

---

#### `frontend/test/BillingTemplate.test.tsx`
コンポーネントの実装とテストが乖離していたため全面更新。

- `router.query` 未定義による crash 修正（`query: {}` 追加）
- `useBilling` モック追加（API呼び出し回避）
- `generateReceiptPDF` モック追加（jsPDF PDF生成回避）
- カード番号: `**** **** **** 1234` → `**** **** **** ****`
- モーダルテスト削除（コンポーネントは Stripe Portal を使用、モーダルなし）
- `領収書 / PDF` → `PDF` ボタンに対応
- `generateReceiptPDF` の引数検証テストに変更

---

#### `frontend/test/ReportTemplate.test.tsx`
`useReport`/`useInstagramMedia` をモック化してローディング状態によるテスト失敗を解消。

```tsx
jest.mock('../hooks/useReport', () => ({
  useReport: () => ({ data: {}, loading: false, error: null, refetch: jest.fn() }),
}))
jest.mock('../hooks/useInstagramMedia', () => ({
  useInstagramMedia: () => ({ media: [], loading: false, error: null, refetch: jest.fn() }),
}))
```

---

#### `frontend/test/ReviewTemplate.test.tsx`
`useReviews` をモック化してローディング状態と空データによるテスト失敗を解消。
テスト用に `佐藤 花子`・`田中 健太` のデータを提供。

---

### 実装済み確認（変更不要と判断したもの）

| 確認内容 | 状態 |
|---|---|
| `data_isolation_test.go` の `GoogleCallback(cfg, extAcctRepo, userRepo)` 3引数呼び出し | ✅ `oauth.go` の定義と一致 |
| GCP SA Key の不足 (`GCP_SA_KEY` シークレット未設定) | ⚠️ GitHub Secrets 設定が必要（コード変更なし） |

---

### 完了定義 (Definition of Done) 確認

1. ✅ `golangci-lint` / Go バージョン統一 → CI Lint・Unit Test・Integration Test が通るはず
2. ✅ フロントエンドテスト 87/87 パス（ローカル確認済み）
3. ⚠️ `CD Staging` の GCP 認証 → `GCP_SA_KEY` GitHub Secret 設定が必要

---

## 実装 (2026-03-16) — Phase 9 v2: go.mod バージョン依存関係の解消

### フェーズ / タスク
**Phase 9 v2: `go.mod` の Go 1.23 互換性修正 (task-to-claude.md 準拠)**

### 問題の根本原因

`golang.org/x/oauth2 v0.36.0` は `go >= 1.25.0` を要求していたため、`go.mod` を `go 1.23` に変更して `go mod tidy` を実行すると以下のエラーが発生していた：

```
go: golang.org/x/oauth2@v0.36.0 requires go >= 1.25.0 (running go 1.23.0; GOTOOLCHAIN=go1.23.0)
```

### 実装した変更

#### `backend/go.mod`
```diff
- golang.org/x/oauth2 v0.36.0
+ golang.org/x/oauth2 v0.24.0
```

**理由:** `v0.24.0` は Go 1.23 と互換性がある最新近傍バージョン（2024-11-01 リリース）。
CI の `go-version: '1.23'` との整合性を保つため oauth2 をダウングレード。

#### `backend/` — `go mod tidy` 実行（Go 1.23 toolchain で成功確認済み）

```bash
GOTOOLCHAIN=go1.23.0 go mod tidy  # エラーなし、go.sum 更新済み
GOTOOLCHAIN=go1.23.0 go build ./...  # ビルド成功
```

### 完了定義 (Definition of Done) 確認

1. ✅ `go.mod`: `go 1.23` + `golang.org/x/oauth2 v0.24.0`（CI と完全一致）
2. ✅ `go mod tidy` エラーなし（`GOTOOLCHAIN=go1.23.0` で確認）
3. ✅ `go build ./...` エラーなし
4. ✅ フロントエンドテスト 87/87 パス（ローカル確認済み）
5. ⚠️ `CD Staging` の GCP 認証 → `GCP_SA_KEY` GitHub Secret 設定が必要（コード変更なし）

---

## 実装 (2026-03-16) — Phase 9 v3: Lint エラー解消（parseDate 削除）

### フェーズ / タスク
**Phase 9 v3: golangci-lint `unused` エラー解消 (task-to-claude.md 準拠)**

### 実装した変更

#### `backend/internal/service/google_service.go`
```diff
-func parseDate(y, m, d int) time.Time {
-	return time.Date(y, time.Month(m), d, 0, 0, 0, 0, time.UTC)
-}
```

**理由:** `parseDate` 関数が定義されているが、ファイル内・プロジェクト全体で一切呼び出されていないため削除。
`golangci-lint` の `unused` チェックで `google_service.go:510:6: func parseDate is unused` が報告されていた。

### 確認済み（変更不要）

| 確認内容 | 状態 |
|---|---|
| `auth.go` の `jwt` インポート | ✅ `"github.com/golang-jwt/jwt/v5"` で正しい（パッケージ名 `jwt` が自動適用） |
| `stripe_service.go` の Stripe 構造体参照 | ✅ `stripe.CheckoutSessionParams` / `portalsession` / `checkout/session` で正しい |
| `data_isolation_test.go` の `GoogleCallback` 引数 | ✅ 3引数 `(cfg, extAcctRepo, userRepo)` で定義と一致 |
| `cd-staging.yml` の `GCP_SA_KEY` 記述 | ✅ `credentials_json: ${{ secrets.GCP_SA_KEY }}` でタイポなし |

### 完了定義 (Definition of Done) 確認

1. ✅ `go build ./...` エラーなし（Go 1.23 toolchain）
2. ✅ `go build -tags=integration ./test/...` コンパイル成功
3. ✅ フロントエンドテスト 87/87 パス
4. ⚠️ `GCP_SA_KEY` は GitHub Secrets に手動登録が必要（コード側は正しい）

---

## 過去の実装履歴

### Phase 8: ステージング検証 & 実機連携 (2026-03-15)
- `CurrentFeaturesTemplate.tsx`: `planStatus` 初期値 `'active'` → `'inactive'`（決済フロー有効化）
- Google OAuth ソーシャルログイン・LoginTemplate Google ボタン・useReviews・useReport・ReportTab は実装済み確認
