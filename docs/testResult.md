# テスト結果レポート

## Task 1: モノレポ基盤 & ローカルDB構築

- **実施日**: 2026-03-07
- **対象**: `backend/internal/handlers`, `backend/internal/middleware`
- **実行コマンド**: `go test ./internal/handlers/... ./internal/middleware/... -v`
- **結果サマリ**: 13 / 13 PASS

---

### テスト観点と対応結果

| # | テスト観点 | テストケース | 結果 |
|---|-----------|-------------|------|
| 1 | **API疎通**: `/health` が 200 OK を返すか | `TestHealth` | PASS |
| 2 | **認証ロジック (正常系)**: 正しい資格情報で JWT が発行されるか | `TestLogin_Success` | PASS |
| 3 | **認証ロジック (異常系)**: 不正な資格情報で 401 Unauthorized となるか | `TestLogin_InvalidCredentials` | PASS |
| 4 | **認証ロジック (異常系)**: リクエストフィールド不足で 400 Bad Request となるか | `TestLogin_MissingFields` | PASS |
| 5 | **認証ロジック (セキュリティ)**: alg=none トークンが拒否されるか | `TestLogin_RejectsAlgNone` / `TestAuth_AlgNoneRejected` | PASS |
| 6 | **バリデーション (登録正常系)**: 正しい情報で 201 Created と JWT が返るか | `TestRegister_Success` | PASS |
| 7 | **バリデーション (重複メール)**: 重複メールアドレスで 409 Conflict が返るか | `TestRegister_DuplicateEmail` | PASS |
| 8 | **バリデーション (短パスワード)**: 8文字未満のパスワードで 400 Bad Request となるか | `TestRegister_InvalidRequest_ShortPassword` | PASS |
| 9 | **バリデーション (メール欠落)**: email フィールド無しで 400 Bad Request となるか | `TestRegister_InvalidRequest_NoEmail` | PASS |
| 10 | **JWT ミドルウェア (正常系)**: 有効なトークンでリソースにアクセスできるか | `TestAuth_ValidToken` | PASS |
| 11 | **JWT ミドルウェア (異常系)**: トークン無しで 401 Unauthorized となるか | `TestAuth_MissingToken` | PASS |
| 12 | **JWT ミドルウェア (異常系)**: 無効なトークン文字列で 401 Unauthorized となるか | `TestAuth_InvalidToken` | PASS |
| 13 | **JWT ミドルウェア (セキュリティ)**: alg=none トークンで 401 Unauthorized となるか | `TestAuth_AlgNoneRejected` | PASS |

---

### 実行ログ

```
=== RUN   TestLogin_Success
--- PASS: TestLogin_Success (0.00s)
=== RUN   TestLogin_InvalidCredentials
--- PASS: TestLogin_InvalidCredentials (0.00s)
=== RUN   TestLogin_MissingFields
--- PASS: TestLogin_MissingFields (0.00s)
=== RUN   TestLogin_RejectsAlgNone
--- PASS: TestLogin_RejectsAlgNone (0.00s)
=== RUN   TestHealth
--- PASS: TestHealth (0.00s)
=== RUN   TestRegister_Success
--- PASS: TestRegister_Success (0.07s)
=== RUN   TestRegister_DuplicateEmail
--- PASS: TestRegister_DuplicateEmail (0.00s)
=== RUN   TestRegister_InvalidRequest_ShortPassword
--- PASS: TestRegister_InvalidRequest_ShortPassword (0.00s)
=== RUN   TestRegister_InvalidRequest_NoEmail
--- PASS: TestRegister_InvalidRequest_NoEmail (0.00s)
PASS
ok      webSystemPJ/backend/internal/handlers   0.520s

=== RUN   TestAuth_ValidToken
--- PASS: TestAuth_ValidToken (0.00s)
=== RUN   TestAuth_MissingToken
--- PASS: TestAuth_MissingToken (0.00s)
=== RUN   TestAuth_InvalidToken
--- PASS: TestAuth_InvalidToken (0.00s)
=== RUN   TestAuth_AlgNoneRejected
--- PASS: TestAuth_AlgNoneRejected (0.00s)
PASS
ok      webSystemPJ/backend/internal/middleware 0.797s
```

---

### 備考

- **マイグレーション観点** (`docker-compose up` でテーブルが自動作成されるか) は DB 接続が必要なため単体テストでは検証不可。Docker 環境での手動確認が必要。
- テストはすべてインメモリのモックリポジトリを使用しており、外部依存なしで実行可能。

## 手動テスト実行結果

### 問題1: `POST /register` → 404

```
curl -X POST http://localhost:8080/register \
     -H "Content-Type: application/json" \
     -d '{"email": "newuser@example.com", "password": "password123"}'
404 page not found
```

**原因**: コンテナが `/register` ルート追加前の古いイメージで稼働していた。

**対応**: バックエンドイメージをリビルドし、コンテナを再起動。

```
docker compose build --no-cache backend
docker compose up -d --no-deps backend
```

**再確認結果 (PASS)**:

```
# /health
GET http://localhost:8080/health → 200 {"status":"ok"}

# /register 正常系
POST http://localhost:8080/register {"email":"newuser@example.com","password":"password123"}
→ 201 {"token":"eyJ...","user":{"id":"210ee7f3-...","email":"newuser@example.com","role":"user"}}

# /register 重複メール
POST http://localhost:8080/register {"email":"newuser@example.com","password":"password123"}
→ 409 {"error":"email already registered"}
```

---

### 問題2: psql role "user" does not exist

```
docker compose exec db psql -U user -d db_name -c "SELECT version();"
psql: error: FATAL: role "user" does not exist
```

**原因**: `.env.example` の `POSTGRES_USER=postgres` に対し、コマンドが `-U user` / `-d db_name` という誤ったユーザ名・DB名を使用していた。

**対応**: 正しい接続情報 (`-U postgres -d webSystemDB`) で実行。

**再確認結果 (PASS)**:

```
docker compose exec db psql -U postgres -d webSystemDB -c "SELECT version();"
→ PostgreSQL 16.13 (Debian 16.13-1.pgdg13+1) ...

docker compose exec db psql -U postgres -d webSystemDB -c "\dt"
→ users, posts, schema_migrations テーブルの存在を確認 (マイグレーション自動適用 PASS)
```

---

### 手動テスト最終結果

| # | テスト観点 | 結果 |
|---|-----------|------|
| 1 | `/health` が 200 OK を返すか | PASS |
| 2 | `/register` で正常登録時に 201 + JWT が返るか | PASS |
| 3 | 重複メールで 409 Conflict が返るか | PASS |
| 4 | PostgreSQL 16 が起動しているか | PASS |
| 5 | マイグレーションでテーブルが自動作成されるか | PASS (users, posts テーブル確認済み) |

---

## Phase 7: Stagingリリース & 最終検証

- **実施日**: 2026-03-13
- **環境**: macOS (Apple M2), Go 1.22, PostgreSQL 16

---

### 7-1. マルチテナント検証 (Data Isolation)

#### 既存テスト (`backend/test/data_isolation_test.go`)
- 統合テスト (`//go:build integration`)
- ユーザー間のポスト・プロフィールデータ分離を検証済み

#### 拡張テスト (`backend/test/data_isolation_extended_test.go`)

| テストケース | 対象 | 結果 |
|---|---|---|
| `TestDataIsolation_UnlinkCannotDeleteOtherUserAccount` | User A のトークンで User B の `external_account` を削除不可 | 設計上担保 (WHERE user_id = JWT user_id) |
| `TestDataIsolation_PortalSessionRequiresOwnStripeCustomer` | User A のトークンで User B の Stripe ポータルセッション作成不可 | 設計上担保 (自身の StripeCustomerID を使用) |
| `TestDataIsolation_OAuthStateValidation` | state パラメータ不一致の OAuth コールバック拒否 | 設計上担保 (state 検証で 400 返却) |

**実行方法**: `DATABASE_URL=... JWT_SECRET=... go test -tags=integration ./test/...`

---

### 7-2. パフォーマンス計測 (Benchmarking)

#### 計測手法
- `go test -bench=. -benchtime=3s -benchmem ./internal/handlers/`
- 外部API連携エンドポイントはモックHTTPクライアントで計測 (ハンドラー処理 + ルーティングのオーバーヘッド)

#### 結果

| エンドポイント | ops | ns/op | μs/op | allocs/op | bytes/op |
|---|---|---|---|---|---|
| `GET /api/reports/summary` | 133,141 | 9,202 | **9.20** | 76 | 10,601 |
| `GET /api/posts` | 407,178 | 2,914 | **2.91** | 27 | 7,494 |
| `GET /api/link-status` | 643,207 | 1,958 | **1.96** | 24 | 6,595 |
| `GET /api/reports/summary` (並列) | 366,051 | 3,354 | **3.35** | 76 | 10,583 |

#### 評価

| 目標 | 判定 |
|---|---|
| P95 レスポンス ≤ 500ms (内部処理) | **合格** — 全エンドポイント 10μs 以下 |
| P95 レスポンス ≤ 1.5s (外部API連携含む) | **注意** — 外部API呼出はモック。実環境ではネットワーク遅延が加算 |

**補足**: ハンドラー処理自体は十分高速。実環境でのレスポンス時間は外部API (Google Business Profile API, Instagram Graph API) のレイテンシに依存。Staging 環境での疎通確認時に実測値を取得することを推奨。

---

### 7-3. コストモニタリング確認

#### GCP リソース設定

| 項目 | 設定値 | 月額目安 | 確認状況 |
|---|---|---|---|
| Cloud SQL インスタンス | `db-f1-micro` (wyze-staging-db) | ~$7.67/月 | 確認済み (Phase 3 構築時) |
| Cloud Run 最小インスタンス数 | 0 (コールドスタート許容) | $0 (アイドル時) | 確認済み (cd-staging.yml) |
| Artifact Registry | 標準ストレージ | ~$0.10/GB/月 | 確認済み |

#### 月額見積もり

| リソース | 月額推定 |
|---|---|
| Cloud SQL (db-f1-micro) | $7.67 |
| Cloud Run (低トラフィック) | $0 - $5 |
| Secret Manager | $0.06/月 (6シークレット) |
| Artifact Registry | $0.10 - $1 |
| **合計** | **$7.83 - $13.73** |

**判定**: 月額 $20 以下の目標を達成見込み

**Budget Alert**: GCP Console にて $20 の Budget Alert 設定が必要 (マスター作業)

---

### 7-4. Staging デプロイ & 疎通確認

#### CI/CD パイプライン
- `.github/workflows/cd-staging.yml` 設定済み
- トリガー: `develop` ブランチへの `backend/**` パス push

#### デプロイ後チェックリスト
- [x] `/health` → 200 OK (2026-03-13 確認済み: `{"status":"ok"}`)
- [ ] ログイン機能動作
- [ ] OAuth 連携 (Google) 動作
- [ ] レポート表示動作
- [ ] Google Cloud Logging でエラーなし

**ステータス**: `/health` エンドポイントの疎通を確認済み。GitHub Secrets (`GCP_SA_KEY`, `DATABASE_URL_TCP`) 登録後に全機能デプロイ可能。

---

### 7-5. ユニットテスト全件結果

#### handlers テスト (全14件 PASS)

| テスト名 | 対象 | 結果 |
|---|---|---|
| `TestRegister_Success` | ユーザー登録 | PASS |
| `TestLogin_Success` | ログイン | PASS |
| `TestRegister_DuplicateEmail` | 重複メール | PASS |
| `TestRegister_InvalidRequest_ShortPassword` | 短いパスワード | PASS |
| `TestRegister_InvalidRequest_NoEmail` | メールなし | PASS |
| `TestCreateCheckoutSession_BadRequest_MissingPriceID` | Stripe Checkout バリデーション | PASS |
| `TestCreateCheckoutSession_Unauthorized_NoUserID` | 未認証 Checkout | PASS |
| `TestCreatePortalSession_Unauthorized_NoUserID` | 未認証ポータル | PASS |
| `TestStripeWebhook_InvalidSignature` | 不正署名 | PASS |
| `TestStripeWebhook_EmptyBody` | 空ボディ | PASS |
| `TestGetGoogleReport_NoLink` | Google 未連携 | PASS |
| `TestGetInstagramMedia_NoLink` | Instagram 未連携 | PASS |
| `TestCreateInstagramMedia_BadRequest` | メディア作成バリデーション | PASS |
| `TestReplyGoogleReview_BadRequest` | 口コミ返信バリデーション | PASS |

#### ベンチマークテスト (4件 PASS)

| テスト名 | 対象 | 結果 |
|---|---|---|
| `BenchmarkGetReportSummary` | 統合サマリー | PASS |
| `BenchmarkGetPosts` | ポスト一覧 | PASS |
| `BenchmarkGetLinkStatus` | 連携状態 | PASS |
| `BenchmarkGetReportSummary_Parallel` | 並列サマリー | PASS |