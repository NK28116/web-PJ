# プロジェクトタスクリスト (Wyze System)

## 現在のフェーズ: インフラ再構築 & Always Free 最適化

### 環境方針

| 環境 | GCP プロジェクト | フロントエンド URL | ブランチ |
|---|---|---|---|
| ステージング | 個人（`wyze-develop-staging`） | `stg.wyze-system.com` | `develop` |
| 本番 | Workspace | `wyze-system.com` | `main` |

---

## Task 1: Google Cloud インフラの最適化設定

### 1-1. Cloud Run 設定変更
- [ ] `min-instances=0`, `max-instances=1`, `cpu-throttling`, `memory=256Mi` を適用
- **懸念**: 現在 backend は Cloud SQL（`wyze-staging-db`）と VPC コネクタ（`vpc-con-us-east1`）に接続中。Task 1-3 の e2-micro 移行完了後に Cloud SQL 接続設定と VPC コネクタを外す必要がある。移行順序を誤ると DB 接続が切れてサービス停止する
- **Gemini の回答**: 移行順序を「1. GCE DB構築 → 2. データ同期 → 3. Cloud Run の DATABASE_URL 更新（新DBへ） → 4. 動作確認 → 5. 旧環境（VPCコネクタ/Cloud SQL）削除」の 5 ステップで固定し、指示書に明記します。

### 1-2. Artifact Registry クリーンアップ
- [x] `cleanup-policy.json` 作成済み（`scripts/cleanup-policy.json`）
- [x] `web-system-pj` リポジトリに適用済み（現在 2.2GB → 500MB 無料枠超過中、ポリシー適用で今後自動削除）
- [x] `cloud-run-source-deploy` リポジトリにも適用済み
- **懸念**: ポリシー適用は完了したが、既存の古いイメージの実際の削除は GCP 側のバックグラウンド処理。即座に 500MB 以下にはならない可能性あり。手動で `gcloud artifacts docker images delete` を実行して即時削減することも検討
- **Gemini の回答**: 課金回避のため、指示書に手動削除コマンドを追加し、即時 500MB 未満に削減する手順を実行します。

### 1-3. Compute Engine (e2-micro) への DB 移行
- [ ] GCE インスタンス作成（`e2-micro`, `us-east1`）
- [ ] Docker Compose で PostgreSQL を起動
- [ ] 既存 Cloud SQL からのデータ移行（`pg_dump` → `pg_restore`）
- [ ] `backup-db.sh` スクリプト作成（Cloud Storage 5GB 無料枠へバックアップ）
- [ ] Cloud Run の `DATABASE_URL` を新しい GCE の接続先に変更
- [ ] Cloud SQL インスタンスの廃止
- **Gemini の回答**: 
  1. **e2-micro 制限**: ステージング（個人）と本番（Workspace）でプロジェクトが分かれているため、それぞれで 1 台ずつ Always Free 枠が使えます（競合しません）。
  2. **可用性**: ステージングはリスクを許容。本番は `$0` 運用を優先し e2-micro を採用しますが、`docker --restart always` 設定と死活監視を強化します。
  3. **バックアップ**: `pg_dump` + Cloud Storage (Standard 5GB) への日次自動転送スクリプトを構築し、信頼性を担保します。
  4. **セキュリティ**: VPC コネクタを廃止し、GCP ファイアウォールで「Cloud Run の外向き IP 範囲」のみを許可する設定を行います。
  5. **設計判断**: ステージングは **e2-micro ($0)** で確定。本番は一旦 **e2-micro ($0)** で構築し、可用性に不安があれば将来的に **Cloud SQL ($9)** または **Supabase Free Tier (Managed)** への移行を検討する「$0 スタート」方針を推奨します。

---

## Task 2: Vercel プロジェクトの再構築

### 2-1. プロジェクトの再リンク
- [ ] `frontend/.vercel` 削除 → `vercel link`（新プロジェクト名 `wyze-system`）
- **懸念**: 現在の Vercel プロジェクト（`web-pj-three.vercel.app`）に紐づく環境変数・デプロイ履歴はすべて失われる。必要な環境変数を事前にメモしておくこと
- **Gemini の回答**: 作業開始前に `vercel env pull .env.bak` コマンドで現行設定をローカルに完全バックアップする手順を指示書に含めます。

### 2-2. カスタムドメインの紐付け
- [ ] `vercel domains add wyze-system.com`
- [ ] `vercel domains add stg.wyze-system.com` → Dashboard で Git Branch を `develop` に設定
- **懸念**:
  1. **ドメイン `wyze-system.com` は取得済みか？** 未取得の場合、レジストラでの購入が先
  2. **DNS 設定**: Vercel が要求する CNAME / A レコードをレジストラ側で設定する必要がある
  3. `release-strategy.md` に「Cloud DNS は無料枠がない（$0.40/月）」と記載あり。Cloudflare (Free) を DNS に使う場合、Vercel のドメイン検証手順が異なる可能性
- **Gemini の回答**: $0 運用のために Cloud DNS を避け、**Cloudflare Free プラン** または **レジストラ無料 DNS** を活用する設定に変更します。Cloudflare の場合は Vercel への CNAME 登録だけで $0 運用可能です。ドメイン未取得の場合は、レジストラでの購入を最優先とします。

### 2-3. 環境変数の分離設定
- [ ] Production: `NEXT_PUBLIC_API_URL` に本番 Backend URL を設定
- [ ] Preview (develop): `NEXT_PUBLIC_API_URL` にステージング Backend URL を設定
- **懸念**:
  1. 現在の `NEXT_PUBLIC_API_URL` は `https://backend-611370943102.us-east1.run.app` を指している。Workspace の本番 Backend URL はまだ存在しない
  2. Stripe Price ID も環境ごとに分離が必要（テストキー vs 本番キー）
  3. `NEXT_PUBLIC_MOCK_MODE` の環境別設定も必要
- **Gemini の回答**: ステージング/本番で値を分けます。Stripe / OAuth 等の環境依存キーは、Vercel の Environment (Production / Preview) 機能を用いて、ブランチごとに自動で切り替わるよう管理します。

---

## Task 3: バックエンド CORS 設定の更新
- [x] `stg.wyze-system.com` を `allowedOrigins` に追加済み
- **懸念**: `https://frontend-611370943102.us-east1.run.app` と `https://web-pj-three.vercel.app`（旧 Vercel URL）は残すか削除するか要判断。Vercel 再構築後はサフィックスマッチ（`.vercel.app`）でカバーされるが、Cloud Run の frontend URL は手動削除が必要
- **Gemini の回答**: `stg.wyze-system.com` への移行完了後、旧 URL（`web-pj-three.vercel.app` 等）はセキュリティとコードの健全性の観点から `allowedOrigins` から削除し、クリーンな状態にします。

---

## Task 4: 動作検証フロー
- [ ] `develop` → `stg.wyze-system.com` 動作確認
- [ ] `main` → `wyze-system.com` 動作確認
- [ ] Google Cloud Console で課金状況確認（Always Free 枠内）
- **懸念**: Task 1-3（DB 移行）と Task 2（Vercel 再構築）が完了しないと検証不可
- **Gemini の回答**: 依存関係を整理し、検証フローの最終ステップとして課金状況の目視確認を追加します。

---

## 横断的な懸念事項

### タスク間の依存関係
```
Task 1-3 (DB移行) → Task 1-1 (Cloud Run再設定) → Task 4 (検証)
Task 2 (Vercel再構築) → Task 3 (CORS最終調整) → Task 4 (検証)
```
- Task 1-3 と Task 2 は並行して進められるが、Task 4 は両方の完了が前提

### Workspace 側の本番環境
- `task-to-claude.md` は個人プロジェクト（ステージング）の作業のみ記載
- 本番環境（Workspace）の GCP プロジェクト作成・Cloud Run 構築・Secret Manager 設定は **別タスクとして定義が必要**
- **作業者の回答**:まずはステージングの構築が第一.ステージング検証で期待していた応答があれば，その後もしくは並行して本番のGCP構築を行う

### 既存 Phase 13 のマスター手動作業（未完了）
以下は Vercel 再構築前に完了させるか、再構築後にやり直すか判断が必要：
- Stripe Webhook 登録（Stripe Dashboard）
- Vercel 環境変数設定（再構築で消えるため、再構築後に再設定）
- Google / Instagram OAuth リダイレクト URI（URL が変わるため再設定必要）
- **作業者の回答**:デプロイ環境再構築後に一気に行うのでタイミングになれば通知せよ

### ステージング URL 変更の影響
`web-pj-three.vercel.app` → `stg.wyze-system.com` に変更されるため：
- Backend の `FRONTEND_URL` 環境変数を更新する必要がある
- Google OAuth リダイレクト URI の登録を更新
- Meta for Developers のアプリドメインを更新
- Stripe Webhook の URL は Backend 側なので変更不要
- **Gemini の回答**: OAuth リダイレクト URI や Stripe Webhook URL の一斉更新を「Task 5: 外部サービス連携更新」として指示書に新設し、移行後の設定漏れを防ぎます。
