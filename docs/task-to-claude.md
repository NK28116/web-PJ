# Claude への実装指示書：インフラ再構築と Always Free 最適化

## 目的
`docs/release-strategy.md` に基づき、Google Cloud の無料枠（Always Free）を最大限に活用したインフラ構成への移行と、Vercel プロジェクトの再構築を CLI を中心に実行してください。

---

## Task 1: Google Cloud インフラの最適化設定

### 1-1. Cloud Run (API) のデプロイ設定変更
以下のフラグを付与して、リクエストがない時のコストを $0 に抑えます。
```bash
# ステージング環境 (個人 GCP プロジェクト)
gcloud run deploy backend-stg \
  --image=[IMAGE_URL] \
  --min-instances=0 \
  --max-instances=1 \
  --cpu-throttling \
  --memory=256Mi \
  --region=us-east1 \
  --allow-unauthenticated
```
※本番環境も同様のパラメータを適用してください。

### 1-2. Artifact Registry のクリーンアップポリシー適用
500MB の制限を超えないよう、最新の 2 つ以外のイメージを削除するポリシーを設定します。
```bash
# cleanup-policy.json の作成
cat <<EOF > cleanup-policy.json
[
  {
    "name": "keep-latest-two",
    "action": { "type": "Delete" },
    "condition": {
      "tagState": "any",
      "olderThan": "1s"
    },
    "mostRecentVersions": { "keepCount": 2 }
  }
]
EOF

# ポリシーの適用
gcloud artifacts repositories set-cleanup-policies [REPO_NAME] \
  --project=[PROJECT_ID] \
  --location=[LOCATION] \
  --policy=cleanup-policy.json
```

### 1-3. Compute Engine (e2-micro) への DB 移行準備
Cloud SQL を廃止し、無料枠の e2-micro インスタンスで PostgreSQL を稼働させます。
- **GCE インスタンス作成**: `e2-micro`, `us-east1` (Always Free 対象リージョン)
- **Docker 構成**: `backend/docker-compose.yml` を GCE 上で実行可能な形式に調整。
- **バックアップ**: `pg_dump` を実行し、無料枠内の Cloud Storage (Standard 5GB) へアップロードするスクリプト `scripts/backup-db.sh` を作成。

#### 【追加】DBeaver 接続のためのセキュリティ設定
1. **GCP ファイアウォール設定**:
   - `tcp:22` (SSH) を許可。
   - ※セキュリティ強化のため、Identity-Aware Proxy (IAP) の IP 範囲 `35.235.240.0/20` からのみを許可する設定を推奨。
2. **PostgreSQL 設定 (pg_hba.conf)**:
   - Docker ホスト（SSHトンネル）からの接続を許可するため、`host all all 0.0.0.0/0 md5` 等を適切に設定。
3. **DBeaver 側の設定 (ユーザーマニュアルへの追記用)**:
   - **Main タブ**:
     - Host: `localhost` (トンネル経由のため)
     - Port: `5432`
     - Database/Username/Password: 各種環境変数の値を指定。
   - **SSH タブ**:
     - `Use SSH Tunnel` を有効化。
     - Host: GCE の外部 IP。
     - User: GCE のログインユーザー名。
     - Authentication: `Private Key` を選択し、GCP の SSH 鍵を指定。

---

## Task 2: Vercel プロジェクトの再構築 (CLI)

既存の設定をリセットし、`main` と `develop` ブランチを分離して紐付けます。

### 2-1. プロジェクトの再リンク
```bash
cd frontend
rm -rf .vercel
vercel link # 新しいプロジェクト名 "wyze-system" として作成
```

### 2-2. カスタムドメインの紐付け
```bash
# 本番ドメイン (main)
vercel domains add wyze-system.com

# ステージングドメイン (develop)
vercel domains add stg.wyze-system.com
# ※Vercel Dashboard で stg.wyze-system.com の Git Branch を develop に設定する必要があります
```

### 2-3. 環境変数の分離設定
```bash
# Production (main)
vercel env add NEXT_PUBLIC_API_URL production # 本番用URLを入力

# Preview (develop)
# vercel env add はデフォルトで全 Preview に適用されるため、
# 特定のブランチ (develop) 用は Dashboard からの設定を推奨
```

---

## Task 3: バックエンド CORS 設定の更新

`backend/internal/middleware/cors.go`（または相当するファイル）を修正し、新しいドメインを許可します。

```go
allowedOrigins := []string{
    "https://wyze-system.com",
    "https://stg.wyze-system.com",
    "http://localhost:3000",
}
```

---

## Task 4: 動作検証フローの実行

指示書に従い、以下の順でデプロイを確認してください。
1. **develop ブランチ**: `git push origin develop` → `https://stg.wyze-system.com` で動作確認。
2. **main ブランチ**: `git push origin main` → `https://wyze-system.com` で動作確認。
3. **Always Free 確認**: Google Cloud Console の「お支払い」画面で、課金が発生していないか（無料枠内で収まっているか）をチェック。

---
**注意**: 作業中は `gcloud config set project [PROJECT_ID]` を使用して、個人用と WorkSpace 用のプロジェクトを間違えないよう厳密に切り替えてください。
