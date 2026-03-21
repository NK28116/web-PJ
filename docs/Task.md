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
- [x] `frontend/.vercel` 削除 → `vercel link`（新プロジェクト名 `wyze-system`）完了
- **ステータス**: 完了

### 2-2. カスタムドメインの紐付け
- [x] `wyze-system.com` および `stg.wyze-system.com` の稼働を確認済み
- **ステータス**: 完了

### 2-3. 環境変数の分離設定
- [x] Production/Preview 各環境の `NEXT_PUBLIC_API_URL` 設定完了
- **ステータス**: 完了

---

## Task 3: バックエンド CORS 設定の更新
- [x] `stg.wyze-system.com` および `wyze-system.com` を `allowedOrigins` に追加・反映済み
- **ステータス**: 完了

---

## Task 4: 動作検証フロー
- [x] `develop` → `stg.wyze-system.com` 動作確認
- [x] `main` → `wyze-system.com` 動作確認
- [x] Google Cloud Console で課金状況確認（Always Free 枠内）
- **懸念**: Task 1-3（DB 移行）と Task 2（Vercel 再構築）が完了しないと検証不可
- **Gemini の回答**: 依存関係を整理し、検証フローの最終ステップとして課金状況の目視確認を追加します。

---

## Task 5: ステージング環境の不具合修正 (UI/UX・ロジック)

### 5-1. 新規登録・ログイン周りの改善
- [ ] **入力フォームの視覚的フィードバック**: フォーカス時に背景色を `text-white` に変更し、カーソル点滅を明示
- [ ] **認証番号のコピペ許可**: `InputOTP` 等のコンポーネントでペーストイベントを有効化
- [ ] **デバッグ用認証コード表示**: ステージング環境限定で、ログから抽出した認証コードを画面下部に表示するコンポーネントを実装
- [ ] **全体背景の修正**: 画面外の白い余白をコンテンツの背景色に統一

### 5-2. モックデータの排除と初期状態の実装
- [ ] **ホーム**: 連携前の「店舗一覧」ブロックの表示制御
- [ ] **投稿**: 未連携時に「Google Businessアカウントと連携してください」という Empty State を表示（モック排除）
- [ ] **お支払い**: 
    - [ ] 「カードを登録する」ボタン押下後に blur が解除されないバグを修正
    - [ ] 存在しないお支払い履歴（モック）を非表示化
- [ ] **店舗設定**: Google連携前はプロフィールの代わりに連携を促す表示に切り替え
- [ ] **通知**: 初期状態（通知ゼロ）でアイコンやリストが表示されないよう修正

### 5-3. 不足機能の実装
- [ ] **サポートヘルプページ**: 
    - [ ] お問い合わせフォーム（テキストエリア、送信ボタン）の実装
    - [ ] アカウント削除依頼用の定型文コピー機能または専用ボタンの設置
- [ ] **退会動線の追加**: ホームの店舗一覧下部にサポートへのリンクを追加

---

## Task 6: 外部サービス連携の修正と本番公開準備

### 6-1. OAuth リダイレクト URI の修正
- [ ] **Google OAuth**: GCP コンソールで `stg.wyze-system.com` / `wyze-system.com` のリダイレクト URI を追加登録（`redirect_uri_mismatch` 対策）
- [ ] **Instagram OAuth**: Meta for Developers でアプリドメインと有効な OAuth リダイレクト URI を更新

### 6-2. サイトの限定公開設定
- [ ] **アクセス制限の実装**: `wyze-system.com` へのアクセスを許可されたメールアドレス（開発者・起票者）のみに制限
    - 案: Cloud Run の前に Identity-Aware Proxy (IAP) を配置、または Vercel の Deployment Protection を有効化

### 6-3. ユーザープロフィールの紐付け
- [ ] 新規登録時のユーザーネームを店舗プロフィールのデフォルト値として使用するよう修正
- [ ] 通知設定の初期値を一括「OFF」に変更

---

## 横断的な懸念事項 (更新)

### ステージングテスト結果からの追加懸念
- **認証コードの確認**: `gcloud logs` を直接見る権限を作業者以外に持たせるのは難しいため、Task 5-1 の「画面上へのコード表示」の優先度を上げる
- **Stripe Elements の挙動**: Billing 画面の blur 解除バグは、Stripe のロード状態監視（`useBilling`）と UI 側の状態管理の不整合が疑われる

### タスク間の依存関係 (追加)
```
Task 2 (Vercel再構築) → Task 6-1 (OAuth更新) → Task 5 (UI修正) → Task 4 (最終検証)
```
- OAuth 設定はドメイン確定（Task 2）後にしか修正できないため、この順序を守る
