# プロジェクトタスクリスト (Wyze System)

各タスクを行う前に`backend-GCP`からブランチを切って(例: `feature/task`)完了したらbackend-GCPにマージを繰返す

## Phase 1: モノレポ基盤 & ローカルDB構築 (STEP 1)
- [x] モノレポ構造の確定
  - [x] `frontend/` (Next.js) の疎通確認
  - [x] `backend/` (Go) のパッケージ構造整理
- [x] ローカルDB (Host OS) 構築
  - [x] PostgreSQL 16 インストール & 起動
  - [x] `backend/migrations` のSQL作成 (User, Auth)
  - [x] `golang-migrate` によるスキーマ反映確認
- [x] バックエンド基盤実装
  - [x] JWT認証ロジック実装
  - [x] ローカルDBへのCRUD API実装
  - [x] `.env.example` の作成 (Backend/Frontend)

## Phase 2: Docker環境構築 (STEP 2)
- [x] Docker化
  - [x] Backend: マルチステージビルド対応 Dockerfile 作成
  - [x] Frontend: Dockerfile 作成 (Optional)
- [x] `docker-compose.yml` 構築
  - [x] `db` (Postgres) / `backend` / `frontend` の連携設定
  - [x] コンテナ間ネットワークによる接続確認
  - [x] コンテナ起動時の自動マイグレーション設定

## Phase 3: GCPインフラ & クラウドDB構築 (STEP 3)

2026/03/10
```shell
gcloud auth login
Your browser has been opened to visit:

    https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=32555940559.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A8085%2F&scope=openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fappengine.admin+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fsqlservice.login+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcompute+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Faccounts.reauth&state=22XzlWo6ui4Jaarn3GgVP9jHc1eSVu&access_type=offline&code_challenge=z6ZlGeTOTYb8UVg6_uVD-0NvCiLWq_FzYtX3UZd8q0s&code_challenge_method=S256


You are now logged in as [shoutarou.phillip.w@gmail.com].
Your current project is [wyze-develop-staging].  You can change this setting by running:
  $ gcloud config set project PROJECT_ID
```

- [x] GCPプロジェクト準備
  - [x] プロジェクト設定確認 (`wyze-develop-staging`, リージョン: `us-east1`)
  - [x] API有効化 (Cloud Run, Cloud SQL Admin, Secret Manager, Compute Engine, Serverless VPC Access, Service Networking)
  - [x] Artifact Registry リポジトリ作成 (`web-system-pj`, `us-east1`)
- [x] Cloud SQL (PostgreSQL 16) 構築
  - [x] VPCプライベートサービスアクセス構成 (IP範囲予約 + ピアリング)
  - [x] サーバーレスVPCコネクタ作成 (`vpc-con-us-east1`, `10.8.0.0/28`)
  - [x] インスタンス作成 (`wyze-staging-db`, `db-f1-micro`, Private IP: `10.26.0.3`)
  - [x] DB作成 (`wyze_db`) & アプリユーザー作成 (`wyze_app`)
- [x] Secret Manager 設定
  - [x] `DATABASE_URL` 登録 (Cloud SQL Unix Socket形式)
  - [x] `JWT_SECRET` 登録 (48文字ランダム)
  - [x] Cloud Run SA へのアクセス権限付与
- [x] Cloud Run サービス作成
  - [x] backend/Dockerfile を Go用マルチステージビルドに修正
  - [x] Cloud Build でビルド & Artifact Registry へプッシュ
  - [x] Backend APIのデプロイ (`backend-611370943102.us-east1.run.app`)
  - [x] Secret Manager からの環境変数マウント確認
  - [x] `/health` 疎通確認 — `200 OK {"status":"ok"}`

## Phase 4: CI/CD パイプライン (GitHub Actions)
- [x] CI設定 (Path-based)
  - [x] Backend: Lint / Test / Build
  - [x] Frontend: Lint / Build
- [x] CD設定 (Staging)
  - [x] `.github/workflows/cd-staging.yml` 作成 (develop push → 自動デプロイ)
  - [x] Artifact Registry への Push 自動化 (commit SHA + latest タグ)
  - [x] Cloud SQL Proxy + `cmd/migrate` によるマイグレーション自動実行
  - [x] Cloud Run への自動デプロイ (既存設定維持)
  - [x] デプロイ後ヘルスチェック
  - [x] デプロイ用SA作成 (`github-actions-deploy`) & 最小権限付与
  - [ ] GitHub Secrets 登録 (`GCP_SA_KEY`, `DATABASE_URL_TCP`) — マスター作業

## Phase 5: 外部API連携 (Instagram / Google)
instagramとGoogle Business Profileは今後の拡充を見据えた実装やドキュメントを作成する

### 5-1. OAuth基盤実装
- [x] OAuth基盤実装
  - [ ] Google Cloud Console / Meta for Developers アプリ登録 — マスター作業
  - [x] 認証フロー (Callback処理) 実装
    - [x] `GET /api/auth/google/login` & `/callback`
    - [x] `GET /api/auth/instagram/login` & `/callback`
    - [x] state パラメータによる CSRF 対策
    - [x] Instagram 短期→長期トークン交換
  - [x] アクセストークンの暗号化保存ロジック (AES-256-GCM)
  - [x] `external_accounts` テーブル マイグレーション作成
  - [x] トークン自動リフレッシュサービス (`service/token_refresh.go`)
  - [x] 連携状態API (`GET /api/link-status`, `DELETE /api/unlink/:provider`)
  - [x] フロントエンド連携ボタン (`useAccountLink` hook)
  - [x] `ENCRYPTION_KEY` Secret Manager 登録

### 5-2 実績運用レポートに用いるAPI
以下を実現するAPI

参考:docs/figma/report.png
- 統合アクション総数
  - Googleマップ経由で、電話・ルート検索・サイト閲覧のいずれかを行った、来店意欲の高いユーザーの総数。
- 統合アクション内訳
  - G※Googleは「電話・経路案内・HP移動」、Instagramは「アクションボタン・リンククリック」の合計値を算出しています。
- 来店誘導率
  - ※閲覧した人のうち、実際に予約や経路案内などのアクションを起こした人の割合です。この数値が高いほど、魅力的な店舗情報を発信できています。
- 統合アクション内訳詳細
  - ※各アクションは、Googleマップ上でボタンがタップされた回数を集計しています。
- 曜日・時間帯傾向
  - ※このデータは、過去1ヶ月間にユーザーがあなたのお店を調べたタイミングの傾向を示しています。
- 統合プロフィール閲覧総数
  - Google マップでの店舗表示回数とInstagramプロフィール閲覧の総数。
- Google検索ワード内訳
  - 直接検索
    - 店名を知っている既存客やSNSを見て検索
  - 間接検索
    - ジャンルで検索
  - ブランド検索
    - 他店や関連ブランドの検索で表示
- Instagram遷移元分析
  - フィード投稿
  - リール動画
  - ストーリーズ
  - その他（タグ等）
- MEO順位推移
- 口コミ返信パフォーマンス
  - 返信率
  - 平均返信時間
- 口コミ平均評価
  - 前月比
  - 星（評価）の内訳

#### 使用するAPI
- [x] **Instagram連携実装**
  - [x] 投稿・メディア取得API (`GET /api/instagram/media`)
  - [x] 投稿作成API (`POST /api/instagram/media`)
  - [x] インサイト取得API (`GET /api/reports/instagram`)
- [x] **Google Business Profile連携実装**
  - [x] 口コミ取得API (`GET /api/google/reviews`)
  - [x] 口コミ返信API (`POST /api/google/reviews/:id/reply`)
  - [x] 店舗一覧API (`GET /api/google/locations`)
  - [x] インサイト取得API (`GET /api/reports/google`)
  - [x] 統合サマリーAPI (`GET /api/reports/summary`)
- [ ] 店舗写真管理API (未実装)


## Phase 6: 課金基盤 (Stripe)
- [x] Stripe基盤実装
  - [x] Stripe Checkout 連携 (`POST /api/billing/checkout`)
  - [x] Webhook エンドポイント実装 (`POST /api/webhooks/stripe`, 署名検証付)
  - [x] サブスクリプション状態とDBの同期ロジック (`checkout.session.completed`, `subscription.updated/deleted`)
- [x] カスタマーポータル有効化
  - [x] ポータル遷移用リンクの実装 (`POST /api/billing/portal`)

## Phase 7: Stagingリリース & 最終検証
- [x] マルチテナント検証 (複数アカウントでの分離確認)
- [x] コストモニタリング (月額 $20以下の確認)
- [x] パフォーマンス計測 (APIレスポンス速度)
- [x] Staging環境公開 (Cloud Run 手動デプロイ成功)
  - **Frontend URL:** `https://frontend-611370943102.us-east1.run.app`
  - **Backend URL:** `https://backend-611370943102.us-east1.run.app`
- [ ] CI/CD 自動化の完全復旧 (GitHub Secrets `GCP_SA_KEY` 登録) — マスター作業->DONE
- [x] Vercel 連携とドメイン設定 : DONE (https://web-pj-three.vercel.app/)
  - [x] Vercel コンソールでリポジトリをインポート
  - [x] Root Directory を `frontend/` に設定
  - [x] 環境変数 `NEXT_PUBLIC_API_URL` に Cloud Run の Backend URL を設定
- [ ] 開発者テスト & メンバーへの URL 共有

## Phase 8: ステージング検証の準備
ステージング検証内容と必要なもの

### 検証項目と現状の妥当性
- [ ] **Google アカウント連携 & 口コミ取得**
    - **妥当性:** バックエンド (`/api/google/reviews`) は実装済み。フロントエンドの `ReviewTemplate` との結合を確認する必要がある。
- [ ] **Instagram 連携 & 投稿画像表示**
    - **妥当性:** バックエンド (`/api/instagram/media`) は実装済み。フロントエンドの `ReportTemplate` 等での表示を確認する必要がある。
- [ ] **Stripe 決済連携**
    - **妥当性:** バックエンドの Checkout/Webhook 処理は実装済み。フロントエンド (`BillingTemplate`) は現在モック表示のため、Stripe Checkout への遷移ボタンを実装・検証する必要がある。
- [ ] **領収書発行機能**
    - **妥当性:** **未実装 (要実装)**。現在の `BillingTemplate` ではモックデータを `console.log` 出力するのみ。Stripe の支払い履歴からデータを取得し、指定の MoneyForward テンプレート風のレイアウトで PDF 出力するロジックが必要。

### 検証方法（テスト手順）
1. **Google/Instagram 連携テスト**
    - テストユーザー (`test@example.com`) でログイン。
    - アカウント設定ページから各プロバイダーの連携ボタンをクリック。
    - 認可画面で提供されたアカウント情報を使用し、完了後に「連携済み」になるか確認。
    - 各機能ページ（口コミ一覧、レポート）で実際のデータが表示されるか確認。
2. **Stripe 決済テスト**
    - 料金プランページから「申し込む」をクリックし、Stripe Checkout 画面へ遷移することを確認。
    - テスト用カード番号 (`4242 4242 4242 4242`) を使用して決済完了。
    - 完了後、アプリケーションに戻り、サブスクリプション状態が「有効」に更新されることを確認。
3. **領収書発行テスト**
    - 支払い完了後、請求情報ページに履歴が表示されることを確認。
    - 「領収書発行」ボタンから、決済内容（日付、金額、店舗名）が正しく反映された PDF が生成されるか確認。

### 必要なもの

#### ユーザーが用意したもの
- Google アカウント
  - ID: wyze.system.inc@gmail.com
  - Pass: wyze2025
- Instagram
  - ID: wyze_system_official
  - Pass: wyze2025
- Stripe
  - 公開可能キー: `pk_test_51RxMhx2LUnmFOZdSeo2akMqr5MqfELVd3RN4jm3JhPNraBB0LF3hX0Wb32fsUbxvTBM8qM4Mmztknh1DBxeInW9f00OdP69dvc`
- Google Cloud
  - プロジェクトID: `wyze-develop-staging` (611370943102)
- Meta for Developer
  - アプリ名: Wyze System (ID: 1263482195912997)

#### 追加で必要なもの (開発チーム作業)
- [ ] **リダイレクトURLの設定確認:** GCP コンソールおよび Meta コンソールで、ステージング環境の URL(https://web-pj-three.vercel.app/以外は未設定)が許可リストに登録されていること。
- [ ] **Stripe Webhook 設定:** Stripe 管理画面で、Cloud Run の Webhook エンドポイント URL を登録し、`STRIPE_WEBHOOK_SECRET` を Secret Manager に設定すること。
- [ ] **PDF 生成ライブラリの選定:** 領収書 PDF 出力用（例: `jspdf`, `react-pdf` またはバックエンドでの生成）。

### 検証環境
- **Frontend URL:** `https://web-pj-three.vercel.app/`
- **Backend URL:** `https://backend-611370943102.us-east1.run.app`

---

## Phase 12: Staging検証に向けた最終統合

### Task 1: アカウント・プロフィール編集機能
- [x] Backend: `GET /PUT /api/user/profile` 実装
- [x] Frontend: `useProfile` hook 実装
- [x] Frontend: `AccountTemplate` に編集モード実装

### Task 2: 本番用メール認証シーケンス
- [x] Backend: 6桁認証コード生成・DB保存（10分有効期限）
- [x] Backend: Staging ログ出力（`【Verification Code】`）
- [x] Frontend: `SignUpTemplate` に認証コード入力ステップ実装
- [x] Backend: `/register` にメール認証済みチェック追加（未認証→403）

### Task 3: 3段階プラン & サブスクリプション制御
- [x] Backend: `plan_tier` カラム追加（migration 000007）
- [x] Backend: Webhook で price_id → plan_tier マッピング
- [x] Frontend: `BillingTemplate` に現在プラン表示を追加
- [x] Frontend: `CurrentFeaturesTemplate` を実API（`useProfile`）連携に変更
- [x] **Stripe Price ID 環境変数設定** — Secret Manager に10個登録済み

### Task 4: 外部コンテンツの表示統合 & 領収書対応
- [x] Frontend: `useReviews` に `NEXT_PUBLIC_MOCK_MODE` 切替ロジック追加
- [x] Frontend: `useInstagramMedia` に `NEXT_PUBLIC_MOCK_MODE` 切替ロジック追加
- [x] Frontend: `PostTemplate` はハイブリッド方式（実データ優先、なければモック）で対応済み
- [x] Frontend: 領収書 PDF 生成（`generateReceipt.ts` / jsPDF）実装済み
- [x] **決済履歴 API 実装（Stripe Invoice 取得）** — Phase 14 で実装完了
- [ ] **Google / Instagram 外部サービス設定** — マスター作業（下記参照）

---

## Phase 13: Staging環境リリース最終統合

### 1. Cloud Run 環境変数の更新 ✅ 完了
- [x] `FRONTEND_URL` → `https://web-pj-three.vercel.app`（プレーン環境変数）
- [x] Stripe Price ID 10個 → Secret Manager に登録済み
- [x] Cloud Run デプロイ済み（revision `backend-00021-75z`）

### 2. Stripe Webhook の作成

1. [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks) → 「エンドポイントを追加」
2. URL: `https://backend-611370943102.us-east1.run.app/api/webhooks/stripe`
3. イベント選択:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 作成後、「署名シークレット」(`whsec_...`) をコピー → Secret Manager に `STRIPE_WEBHOOK_SECRET` として登録

### 3. Vercel フロントエンド環境変数

**Vercel Dashboard または CLI で以下を登録：**

| 変数名 | 値 |
|---|---|
| `NEXT_PUBLIC_STRIPE_PRICE_ID_LIGHT` | `price_1TCfJ92LUnmFOZdSIip48gnK` |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC` | `price_1TCfJB2LUnmFOZdSrGUixjM9` |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO` | `price_1TCfJC2LUnmFOZdSfCqz6uai` |
| `NEXT_PUBLIC_MOCK_MODE` | `false` |

設定後、再デプロイが必要です。

### 4. Google / Instagram OAuth リダイレクト URI 確認

- **Google Cloud Console** → OAuth 2.0 クライアント → 承認済みリダイレクト URI に以下が含まれること:
  - `https://backend-611370943102.us-east1.run.app/api/auth/google/callback`
- **Meta for Developers** → アプリ設定:
  - アプリドメインに `web-pj-three.vercel.app` を追加
  - 有効なOAuth リダイレクト URI: `https://backend-611370943102.us-east1.run.app/api/auth/instagram/callback`

### 5. 疎通確認チェックリスト

- [ ] Google ログインボタン → ダッシュボード遷移
- [ ] Billing 画面で Light/Basic/Pro の3プラン表示 & 価格表示
- [ ] テストカード (`4242 4242 4242 4242`) で Stripe Checkout 完了
- [ ] Checkout 完了後、`/billing?checkout=success` にリダイレクト
- [ ] アカウント画面でプランが更新されていること（例: `light`）
- [ ] Review 画面に Google 口コミが表示されること
- [ ] Post 画面に Instagram 投稿が表示されること

---

## Phase 14: 決済履歴 API & 次回請求情報の統合 ✅ 完了

- [x] Backend: `GET /api/billing/invoices` — Stripe Invoice 最新10件取得
- [x] Backend: `GET /api/billing/upcoming` — 次回請求情報取得
- [x] Frontend: `useBilling` に `fetchInvoices` / `fetchUpcoming` 追加
- [x] Frontend: `BillingTemplate` モックデータ → 実データ切替
- [x] Frontend: PDF ボタン → Stripe PDF URL 優先、フォールバックで `generateReceiptPDF`

---

## 残りのマスター手動作業

### Stripe Webhook 登録（未完了）
1. [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks) → 「エンドポイントを追加」
2. URL: `https://backend-611370943102.us-east1.run.app/api/webhooks/stripe`
3. イベント: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. 署名シークレット → Secret Manager に `STRIPE_WEBHOOK_SECRET` として登録
5. Cloud Run 再デプロイ

### Vercel 環境変数（未完了）
| 変数名 | 値 |
|---|---|
| `NEXT_PUBLIC_STRIPE_PRICE_ID_LIGHT` | `price_1TCfJ92LUnmFOZdSIip48gnK` |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC` | `price_1TCfJB2LUnmFOZdSrGUixjM9` |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO` | `price_1TCfJC2LUnmFOZdSfCqz6uai` |
| `NEXT_PUBLIC_MOCK_MODE` | `false` |

設定後、Vercel 再デプロイが必要。

### Google / Instagram OAuth リダイレクト URI 確認（未完了）
- **Google Cloud Console**: `https://backend-611370943102.us-east1.run.app/api/auth/google/callback`
- **Meta for Developers**: ドメイン `web-pj-three.vercel.app` + リダイレクト URI `https://backend-611370943102.us-east1.run.app/api/auth/instagram/callback`