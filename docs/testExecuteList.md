# テスト実行手順書 (Task 1: モノレポ基盤 & ローカルDB構築)

## 概要

本ドキュメントは、2026-03-07 に実施された Task 1 の不足実装（ユーザ登録 API およびデータベース設定）を検証するための手順を定義します。

---

## 1. 自動テスト実行方法 (バックエンド)

バックエンドのロジックを検証するための自動テストを実行します。

### 必要な環境
- Go: 1.21以上
- Docker / Docker Compose

### 実行コマンド
```bash
# バックエンドのテスト実行
cd backend
go test ./internal/handlers/...
```

---

## 2. 手動検証手順 (バックエンド API)

今回実装された `/register` エンドポイントを、ローカル環境で直接叩いて動作確認する手順です。
事前に `docker-compose up -d` で環境を起動し、DB（PostgreSQL 16）が正常に動作していることを確認してください。

### 2.1 新規ユーザ登録 (正常系)
以下のコマンドで、新しいユーザーを作成します。
```bash
curl -X POST http://localhost:8080/register \
     -H "Content-Type: application/json" \
     -d '{"email": "newuser@example.com", "password": "password123"}'
```
**期待結果**:
- HTTPステータス: `201 Created`
- レスポンスボディ: JWTトークン (`token`) とユーザー情報 (`user`) が返却されること。
- データベース: `users` テーブルにハッシュ化されたパスワードでレコードが作成されていること。

### 2.2 重複登録チェック (異常系)
同じメールアドレスで再度登録を試みます。
```bash
curl -X POST http://localhost:8080/register \
     -H "Content-Type: application/json" \
     -d '{"email": "newuser@example.com", "password": "password123"}'
```
**期待結果**:
- HTTPステータス: `409 Conflict`
- レスポンスボディ: `{"error": "email already registered"}` が返却されること。

### 2.3 入力バリデーションチェック (異常系)
パスワードが 8 文字未満の場合の挙動を確認します。
```bash
curl -X POST http://localhost:8080/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test-fail@example.com", "password": "short"}'
```
**期待結果**:
- HTTPステータス: `400 Bad Request`
- レスポンスボディ: `{"error": "invalid request"}` が返却されること。

---

## 3. インフラ設定の確認

### 3.1 PostgreSQL バージョンの確認
コンテナ内で PostgreSQL のバージョンを確認します。
```bash
docker compose exec db psql -U user -d db_name -c "SELECT version();"
```
**期待結果**: 出力結果に `PostgreSQL 16.x` が含まれていること。

---

**最終更新日**: 2026-03-07
**作成者**: Gemini CLI
