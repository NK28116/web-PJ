# 実装指示書 (Phase 7: Stagingリリース & 最終検証)

## 概要
システム全体の最終的な品質・セキュリティ・パフォーマンスを検証し、Staging 環境への完全なデプロイを完了させてください。

## 1. マルチテナント検証の拡充 (Data Isolation)
既存の `backend/test/data_isolation_test.go` を拡張し、以下のリソースについてもユーザー間のデータ分離が厳格に行われていることをテストしてください。

- **External Accounts:**
  - User A のトークンを用いて、User B の `external_account` を削除 (`DELETE /api/unlink/:provider`) できないこと。
- **Billing:**
  - User A のトークンを用いて、User B の Stripe 情報に紐づくポータルセッションを作成できないこと。
- **OAuth Callback:**
  - state パラメータの不一致や、他人の JWT トークンを用いた連携の乗っ取りが不可能であることの再確認。

## 2. パフォーマンス計測 (Benchmarking)
主要な API エンドポイントのレスポンス時間を計測し、レポートを作成してください。

- **対象:** `GET /api/reports/summary`, `GET /api/posts`, `GET /api/link-status`
- **目標:** 95パーセンタイル (P95) でレスポンス時間が 500ms 以下（外部 API 連携を含む場合は 1.5s 以下）であることを確認。
- **手法:** `go test -bench` または `k6` 等の簡易的なツールを使用して計測値を `docs/testResult.md` に追記してください。

## 3. コストモニタリングの確認
GCP 環境におけるコストが月額 $20 以下に収まる設定であることを確認してください。

- Cloud SQL インスタンスが `db-f1-micro` であることの確認。
- Cloud Run の最小インスタンス数が 0 に設定されていることの確認（コールドスタートは許容）。
- GCP Console にて Budget Alert ($20) を設定したことを報告してください（設定済みであればチェック）。

## 4. Staging デプロイ & 疎通確認
CI/CD パイプライン (`.github/workflows/cd-staging.yml`) をトリガーし、最新コードをデプロイしてください。

- **デプロイ後チェック:**
  - Staging ドメイン（`backend-*.run.app`）に対して `/health` が `200 OK` を返すこと。
  - フロントエンドからログイン、OAuth 連携、レポート表示が正常に行えること。
- **ログ確認:** Google Cloud Logging にて致命的なエラー (Error/Critical) が出力されていないことを確認。

## 5. ドキュメントの最終化
- `docs/change-log.md` に今回のリリース内容を追記。
- `docs/testResult.md` に本フェーズでの検証結果をすべて記載。

## 参考資料
- `docs/Task.md` (Phase 7)
- `backend/test/data_isolation_test.go`
