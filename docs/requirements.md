# プロジェクト要件定義書 (Wyze System)

## 1. モノレポ構成 (Directory Structure)
フロントエンドとバックエンドを一元管理し、開発効率と型定義の共有（将来的な検討）を最適化する。

```text
/ (root)
├── frontend/             # Next.js (TypeScript)
│   ├── components/       # UI Components
│   ├── pages/            # Pages Router (API Routes含む)
│   └── package.json
├── backend/              # Go (Gin)
│   ├── cmd/
│   │   ├── server/       # APIサーバーエントリーポイント
│   │   └── migrate/      # golang-migrateによるDB移行ツール
│   ├── internal/         # ビジネスロジック, Repository, Models
│   ├── migrations/       # SQLマイグレーションファイル (*.sql)
│   └── go.mod
├── docs/                 # 要件・設計ドキュメント
├── docker-compose.yml    # ローカル開発環境 (DB, Backend, Frontend)
└── .github/workflows/    # CI/CD (Path-based trigger対応)
```

---

## 2. 環境変数・シークレット管理 (Strict Secret Management)
機密情報の漏洩を防止するため、以下の分類と管理手法を徹底する。

### 2.1 分類基準
| 分類 | 内容 | 管理手法 |
| :--- | :--- | :--- |
| **Public Config** | 環境名、ベースURL等 | `.env` (Local) / Cloud Run Env |
| **Secret Info** | DBパスワード、APIキー、OAuth Secret等 | **Secret Manager (GCP)** / `.env` (Local) |
| **Public API Keys** | Frontend用公開APIキー | `NEXT_PUBLIC_` プレフィックスを付与 |

### 2.2 変数管理ルール
1.  **Local/Docker**: `.env` を各ディレクトリ配下に作成（**Git管理禁止**）。`.env.example` を提供する。
2.  **GCP**: **Secret Manager** で一元管理。Cloud Run デプロイ時に環境変数としてマウントする。
3.  **主要変数リスト**:
    - `DATABASE_URL` (Secret): DB接続文字列
    - `JWT_SECRET` (Secret): 認証署名用
    - `GOOGLE_CLIENT_ID/SECRET` (Secret有): GBP連携用
    - `INSTAGRAM_CLIENT_ID/SECRET` (Secret有): Instagram連携用
    - `STRIPE_SECRET_KEY/WEBHOOK_SECRET` (Secret): 決済基盤用

---

## 3. 事業・機能要件

### 3.1 外部プラットフォーム連携 (基本事業)
SNS・店舗情報の取得と投稿を核とする価値提供。
- **Instagram連携 (Graph API)**: 投稿・写真・動画の取得、フィード投稿の予約・実行、インサイト分析。
- **Google Business Profile (GBP) 連携**: 口コミ取得・返信、店舗写真（内観・外観）の管理・投稿、MEO順位追跡。
- **共通基盤**: OAuthアクセストークンの暗号化保存と自動リフレッシュ。

### 3.2 課金・サブスクリプション (Stripe連携)
- **Stripe Checkout**: 自前でカード情報を保持せず、安全な決済ページへ委譲。
- **Webhook同期**: 支払成功・失敗、解約、プラン変更を即座に内部DBの権限フラグに反映。
- **カスタマーポータル**: ユーザー自身によるプラン変更、解約、領収書発行を可能にする。

---

## 4. DB構築・検証ステップ (Local → Docker → Cloud)

### STEP 1: ローカルDB (Host OS)
- **環境**: ホストOS上の PostgreSQL 16
- **確認**: `backend/migrations` のSQLが `up` 可能であり、Go APIからCRUDが動作すること。

### STEP 2: Docker環境 (Container)
- **環境**: `docker-compose.yml` で `db` と `backend` を同時起動。
- **確認**: `docker-compose up` だけでDB起動・マイグレーション・API起動が完結すること。

### STEP 3: クラウドDB (GCP Cloud SQL)
- **環境**: GCP Cloud SQL (PostgreSQL 16) / Private IP構成。
- **確認**: Cloud RunからSecret Managerの情報を使い、Cloud SQL Connector経由で接続できること。

---

## 5. インフラ・CI/CD 要件

### 5.1 モノレポ対応 CI/CD (GitHub Actions)
- **Path-based Trigger**: 変更されたディレクトリ（frontend/backend）のみビルド・テストを実行。
- **CDフロー**: Dockerビルド & Push → Cloud Run デプロイ → DBマイグレーション実行。
- **シークレット注入**: デプロイ時に `--set-secrets` フラグで Cloud Run と Secret Manager を紐付ける。

---

## 6. 非機能要件
- **セキュリティ**: 
  - DBのPublic IP無効化、VPC経由の接続。
  - OAuthトークンのDB内暗号化保存。
- **コスト抑制**: Staging環境月額 $20以下（最小インスタンス0設定、DB最小構成）。
- **パフォーマンス**: APIレスポンス 500ms以内（外部API通信時間を除く）。
