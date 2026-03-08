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