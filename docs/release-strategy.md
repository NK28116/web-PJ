# リリース戦略
- セマンティックバージョニングを採用 (vX.Y.Z)
- mainブランチへのマージでリリース

## インフラ構成と環境区分

Google Cloud の **Always Free** 枠を最大限に活用し、月額コストをほぼ $0 に抑える構成をとります。

### 1. 環境定義と Always Free 活用戦略

| 項目 | 活用リソース | Always Free 枠の制限と対策 |
| :--- | :--- | :--- |
| **Compute** | **Cloud Run** | **制限**: 200万リクエスト/月、36万 vCPU秒、18万 GiB秒。<br>**対策**: `min-instances: 0` に設定し、リクエストがない時間は課金対象外とする。 |
| **Storage** | **Cloud Storage** | **制限**: 5GB (Standard)。<br>**対策**: 画像等の静的資産に限定。期限切れファイルの自動削除（Lifecycle）を設定。 |
| **Database** | **Compute Engine** (e2-micro) | **制限**: 1インスタンス (米国リージョン)。<br>**対策**: Cloud SQL（有料）を避け、e2-micro 上に Docker で PostgreSQL を構築。 |
| **Registry** | **Artifact Registry** | **制限**: 500MB。<br>**対策**: **重要：ビルドのたびに古いイメージを削除し、常に最新の1〜2件のみ保持する。** |
| **DNS** | **Cloud DNS** | **注意**: **Cloud DNS は無料枠がありません** ($0.40/月)。<br>**対策**: 完全に $0 を目指す場合、レジストラ側の DNS または Cloudflare (Free) を利用。 |

---

## Google Cloud Always Free 最適化設定の手順

### 1. Cloud Run (API) のコスト最適化
リクエストがない時に CPU を割り当てない設定にします。
- **インスタンスの最小数**: 0
- **インスタンスの最大数**: 1〜2 (無料枠内でのスパイク対応)
- **CPU の割り当て**: 「リクエスト中のみ割り当てる」を選択。
- **メモリ**: 256MB または 512MB (無料枠の GiB秒を節約)。

### 2. Artifact Registry のクリーンアップ設定
無料枠の 500MB はすぐに枯渇するため、クリーンアップ ポリシーを設定します。
1. Artifact Registry コンソールでリポジトリを選択。
2. **クリーンアップ ポリシー** を編集。
3. 「最新の 2 つのバージョンを除いてすべて削除」するルールを追加。

### 3. Database (PostgreSQL) の無料運用
Cloud SQL (月額 $9〜) の代わりに、Always Free 枠の `e2-micro` インスタンスを使用します。
- **構成**: `e2-micro` + 30GB 標準永続ディスク。
- **実装**: Docker Compose で PostgreSQL を起動。
- **注意**: 自動バックアップ等は Cloud Storage へダンプを書き出すスクリプトを自作し、無料枠内で運用。

---

## Vercel プロジェクト再構築手順（Hobby アカウント）

### Step 1: プロジェクトの新規作成
1. [Vercel New Project](https://vercel.com/new) からリポジトリ選択。
2. **Root Directory**: `frontend`
3. **Production Branch**: `main`

### Step 2: カスタムドメインの設定（Google Cloud DNS 等）
1. **本番ドメイン**: `wyze-system.com` を追加。
2. **ステージングドメイン**: `stg.wyze-system.com` を追加し、**Git Branch** を `develop` に指定。

---

## リリースフロー

1. **機能開発**: 各 `feature/` ブランチで作業。
2. **検証**: `develop` へマージ。個人 GCP プロジェクトのステージング環境（Always Free）へデプロイ。
3. **本番リリース**: `main` へマージ。Workspace 側の GCP プロジェクト（Always Free）へデプロイ。

## 可用性と監視

- **ヘルスチェック**: Cloud Run の設定で、コンテナ起動成功を判定するプローブを最小限（無料枠内）で設定。
- **ログ監視**: Cloud Logging (50GB/月 無料) を利用し、重要なエラーログのみを保持。
