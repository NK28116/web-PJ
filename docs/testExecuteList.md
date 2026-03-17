# テスト実行手順書 (Phase 10: 外部API連携 & レポート集計基盤)

## 概要
本ドキュメントは、Google Business Profile および Instagram Graph API の連携基盤、ならびにレポート画面の集計ロジックを検証するための手順を定義します。
※現在は Docker コンテナによる本番同等の環境で動作中です。

---

## 1. モックモードでの検証 (Docker 経由)
実際のAPI連携が完了していない状態でも、計算ロジックやUIを検証できる「モックモード」での確認手順です。

### 1.1 バックエンドの起動状態確認
`.env` に `MOCK_MODE=true` が設定され、コンテナが `Running` であることを確認してください。
```bash
docker compose ps backend
```
curl -X POST http://localhost:8080/login \
        -H "Content-Type: application/json" \
        -d '{
          "email": "admin@example.com",
          "password": "Admin1234!"
        }'
### 1.2 API レスポンスの確認
ホストマシン（あなたのPC）から、Docker コンテナに対して `curl` でリクエストを送信します。
※有効な JWT トークンがない場合、`/register` または `/login` で取得したトークンを使用してください。
```
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGJlMjJhYmUtMjFhYS00NDdkLTlkZTQtYWM1MjEyYTllMDhmIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzczODM2MTMxLCJpYXQiOjE3NzM3NDk3MzF9.y4diGLP1I0ab3TCAgtT5mQHnoF_-i2gQMK4tUX5SKzg","user":{"id":"4be22abe-21aa-447d-9de4-ac5212a9e08f","email":"admin@example.com","role":"admin"}}%   
```


```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZGZhYjcwYmUtMWYzZi00Y2QyLTg2YmEtMjMwZjg1M2I1YWYxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NzM4MzY1NDEsImlhdCI6MTc3Mzc1MDE0MX0.P2HfE9nytOWThBWc_1ifqGhj-kj-KkVKyG3PWenhcGU" \
     "http://localhost:8080/api/reports/summary?start=2026-02-17&end=2026-03-17"
```
**期待結果**:
- `conversion_rate` が `31` (31.0%) 前後で返却されること。
- `google_detail.map_views` が `1200`、`instagram_detail.profile_views.value` が `800` であること。

---

## 2. 異常系・部分成功の検証
片方のAPIが失敗した際の「部分成功バナー」の表示確認です。

### 2.1 未連携状態の再現
`.env` の `MOCK_MODE=false` に戻して再起動し、OAuth連携を行っていないアカウントでログインし、レポート画面（`/report`）を表示します。
**期待結果**:
- 画面上部に「⚠ Google: Google未連携」「⚠ Instagram: Instagram未連携」という黄色いバナーが表示されること。
- 指標は 0 または空のグラフが表示され、アプリがクラッシュしないこと。

---

## 3. 自動テストの実行 (コンテナ外 / ホストマシン)

### 3.1 フロントエンドのテスト
```bash
cd frontend
npm test
```
**期待結果**: `87/87` 全てのテストケースがパスすること。

### 3.2 バックエンドのテスト
```bash
cd backend
go test ./internal/handlers/...
```

---

## 4. フロントエンド UI チェック項目
ブラウザで `http://localhost:3000/report` にアクセスし、以下を確認してください。

- [ ] **来店誘導率**: 小数点第一位まで表示されているか（例: 31.2%）。
- [ ] **統合プロフィール閲覧数**: Google(MapViews) と Instagram(ProfileViews) が合算されているか。
- [ ] **遷移元分析**: 「プロフィールリンク」「ストーリーリンク」の項目が表示されているか。
- [ ] **エラー表示**: API故障時に赤いエラー画面にならず、黄色い「部分エラーバナー」が表示されるか。

---

**最終更新日**: 2026-03-17
**作成者**: 河崎 紗夜 (Gemini CLI)
**進捗状況**: 環境構築の失敗を解消し、検証フェーズへ移行済み。
