# 手動テスト結果レポート
`docs/testExecuteList.md` の実施結果

## 1. モックモードでの検証 (Docker 経由) - 【成功】

### 1.1 背景と修正内容
初期検証では、Docker コンテナ内の環境変数設定不足により `404 Not Found` および `NOT_CONNECTED` エラーが発生。
以下の修正を行い、本番同等のコンテナ環境で検証を再実施した。

- **修正 1**: `docker-compose.yml` の `backend` サービスに `MOCK_MODE` および OAuth 関連の環境変数を追加。
- **修正 2**: `docker compose build backend` を実行し、最新のソースコード（Phase 10）をバイナリに反映。

### 1.2 実行コマンドと検証プロセス

#### ユーザー登録とトークン取得
```bash
# 新規ユーザー登録
curl -s -X POST http://localhost:8080/register \
     -H "Content-Type: application/json" \
     -d '{"email": "mock_tester@example.com", "password": "password12345"}' | jq .
```
**レスポンス**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "email": "mock_tester@example.com", ... }
}
```

#### レポートサマリー API の呼び出し
```bash
# 取得したトークンを使用してサマリーを取得
curl -s -H "Authorization: Bearer <TOKEN>" \
     "http://localhost:8080/api/reports/summary?start=2026-02-17&end=2026-03-17" | jq .
```

### 1.3 最終検証結果（レスポンス JSON）
```json
{
  "action_breakdown": {
    "google": 450,
    "instagram": 270
  },
  "conversion_rate": 36,
  "google_detail": {
    "map_views": 1200,
    "action_detail": {
      "phone_calls": 150,
      "direction_requests": 200,
      "website_visits": 100
    },
    "queries_direct": 300,
    "queries_indirect": 500
  },
  "instagram_detail": {
    "profile_views": { "value": 800 },
    "action_clicks": { "value": 120 },
    "profile_link_clicks": { "value": 90 },
    "story_link_clicks": { "value": 60 }
  },
  "period": {
    "end": "2026-03-17T00:00:00Z",
    "start": "2026-02-17T00:00:00Z"
  },
  "profile_views": {
    "value": 2000
  },
  "total_actions": {
    "value": 720
  }
}
```

### 1.4 評価・考察
- **計算精度**: Google(1200) + Instagram(800) = **2000 (profile_views)**、統合アクション数 **720**、来店誘導率 **36%** と、設計通りの計算が行われていることを確認。
- **堅牢性**: DB接続や環境変数のバリデーションを維持しつつ、モックモードでの安全な検証が可能であることを実証。
- **DoD 達成**: 「レポート計算」「モックモード」「フロントエンドへの提供データ構造」の全ての要件を満たしている。

---
**検証完了日**: 2026-03-17
**検証者**: 河崎 紗夜 (Gemini CLI)
