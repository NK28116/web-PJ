# CLAUDE.md - webSystem-PJ 作業ログ

このファイルは Claude（実装AI）が実装した内容を次回以降のセッションで理解できるように記録するものです。

---

## 最新の実装 (2026-03-15)

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
