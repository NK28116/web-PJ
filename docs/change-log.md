# 変更ログ

## 2026-03-02 (2)

### 概要
CIエラーの解消と基盤安定化 (`docs/task-to-claude.md` 指示書に基づく)

### 詳細

#### 1. テストエラー修正

- **[Claude]** `test/ReviewTemplate.test.tsx` 更新
  - `getAllByText('返信する')` アサーションを削除 (ReviewList.tsx のUI改修でボタン削除済みのため)
  - テストを async 化し、口コミカード (`佐藤 花子`) クリック → `口コミ詳細` モーダル表示を検証するよう修正
  - `waitFor` を `@testing-library/react` のインポートに追加

- **[Claude]** `components/templates/ReportTemplate/ReportTab.tsx` 更新
  - `EmptyState` / `isEmpty` のインポート元を `@/organisms/Report` → `@/organisms/Report/shared` に変更 (バレルエクスポートの循環参照回避)

- **[Claude]** `components/templates/ReportTemplate/AiTab.tsx` 更新
  - `EmptyState` のインポート元を `@/organisms/Report` → `@/organisms/Report/shared` に変更

#### 2. ビルド・リンター修正

- **[Claude]** `.eslintrc.json` 新規作成
  - `{"extends": ["next/core-web-vitals"]}` を定義
  - CI上で `next lint` がインタラクティブ設定確認を表示して停止する問題を解消

#### 3. バックエンド依存関係

- **[Claude]** `backend/go mod tidy` 実行
  - `go.sum` を最新の状態に更新

---

## 2026-03-02

### 概要
認証基盤とデータ分離システムの構築 (`docs/task-to-claude.md` 指示書に基づく)

### 詳細

#### 1. インフラ構築

- **[Claude]** `docker-compose.yml` 新規作成
  - `db` (PostgreSQL 15): Volume永続化, `pg_isready` ヘルスチェック
  - `backend` (Go/Gin): DB healthy 待機後に起動 (`depends_on: condition: service_healthy`)
  - `frontend` (Next.js): backend 依存
  - 環境変数はすべて `.env` 経由で注入

- **[Claude]** `Dockerfile` 新規作成 (frontend / Multi-stage build)
- **[Claude]** `backend/Dockerfile` 新規作成 (Go / Multi-stage build、server + seed バイナリ)
- **[Claude]** `.env.example` 新規作成 (JWT_SECRET 等のサンプル値)

#### 2. データベース設計・マイグレーション

- **[Claude]** `backend/migrations/000001_create_users.up.sql` / `.down.sql`
  - `users` テーブル: id (UUID), email (UNIQUE), password (bcrypt), role, timestamps
- **[Claude]** `backend/migrations/000002_create_posts.up.sql` / `.down.sql`
  - `posts` テーブル: `user_id` 必須 + 外部キー制約 (ON DELETE CASCADE)
  - `idx_posts_user_id` インデックス付与

#### 3. バックエンド実装 (Go/Gin)

- **[Claude]** `backend/go.mod` 新規作成 (module: `webSystemPJ/backend`)
- **[Claude]** `backend/internal/config/config.go` — 環境変数ローダー
- **[Claude]** `backend/internal/models/` — User / Post / Claims 型定義
- **[Claude]** `backend/internal/repository/` — UserRepository / PostRepository
  - **スコープ強制**: `GetAll` / `GetByID` は JWT の `user_id` で `WHERE user_id = $1` を強制付与
  - 他ユーザーの ID を指定しても `nil` 返却 → ハンドラが 404 を返す
- **[Claude]** `backend/internal/middleware/auth.go` — Bearer Token 検証 + `user_id` をコンテキストに設定
  - `alg=none` を明示的に拒否
- **[Claude]** `backend/internal/handlers/auth.go` — `POST /login` (bcrypt 検証 + HS256 JWT 発行)
- **[Claude]** `backend/internal/handlers/health.go` — `GET /health`
- **[Claude]** `backend/internal/handlers/post.go` — GET/POST /posts, GET /posts/:id
- **[Claude]** `backend/cmd/server/main.go` — サーバー起動 + golang-migrate 自動適用
- **[Claude]** `backend/cmd/seed/main.go` — 初期ユーザー生成コマンド
  - Admin / User A / User B / dev用 (test@example.com) の4ユーザーとサンプル投稿を投入

#### 4. フロントエンド更新 (Next.js)

- **[Claude]** `hooks/useAuth.ts` 更新
  - `login()`: モック → 実 API (`POST /login`) 呼び出しに変更 (async化)
  - `login()` 成功時: `localStorage.clear()` で前ユーザーのデータを完全クリアしてから新規保存
  - `logout()`: `localStorage.clear()` (完全クリア) → `/login` へリダイレクト

- **[Claude]** `components/auth/AuthGuard.tsx` 更新
  - `PUBLIC_PATHS` に `/login` を追加
  - 未認証時のリダイレクト先: `/` → `/login` に変更
  - `/login` アクセス時も認証済みなら `/home` へリダイレクト

- **[Claude]** `components/templates/LoginTemplate/index.tsx` 更新
  - `handleLogin` / `handleDevLogin` を async 化 (`await login(...)`)

- **[Claude]** `pages/login.tsx` 新規作成
  - `LoginTemplate` を表示する専用ログインページ

- **[Claude]** `pages/index.tsx` 更新
  - SplashScreen 完了後: 未認証 → `/login` へ遷移 (従来はインライン LoginTemplate 表示)

#### 5. テスト

- **[Claude]** `test/Auth.test.tsx` 更新
  - `global.fetch` モックを追加 (login の API 呼び出し対応)
  - AuthGuard リダイレクト先を `/` → `/login` に修正
  - ログアウト後のリダイレクト先を `/` → `/login` に修正
  - ログイン成功時の localStorage 完全クリアを検証するテスト追加
- **[Claude]** `backend/internal/handlers/auth_test.go` 新規作成 (ユニットテスト)
- **[Claude]** `backend/internal/middleware/auth_test.go` 新規作成 (alg=none 拒否を含む)
- **[Claude]** `backend/test/data_isolation_test.go` 新規作成 (統合テスト / build tag: `integration`)
  - User A のトークンで User B の投稿 ID を取得しようとして 404 になることを検証
  - 投稿一覧が自分のデータのみを返すことを検証

#### 6. CI/CD

- **[Claude]** `.github/workflows/ci.yml` 新規作成
  - `frontend-lint` / `frontend-test`
  - `backend-lint` (golangci-lint) / `backend-unit-test`
  - `backend-integration-test`: PostgreSQL 15 service container 付きで統合テスト実行

---

## 2026-02-25 (続き5)

### 概要
`Review` 型に `waitTime` / `noiseLevel` フィールドを追加し、全13件のモックデータに値を設定。

### 詳細

#### reviewMock.ts — waitTime / noiseLevel フィールド追加
- **[Claude]** `test/mock/reviewMock.ts`
  - `Review` 型に以下を追加:
    - `waitTime: number | null` — `null` は「待ち時間なし」を意味する
    - `noiseLevel: '静か' | 'ふつう' | 'にぎやか'`
  - 全13件のモックデータに `waitTime` / `noiseLevel` の値を設定
    - コメント内容に合わせて自然な値を割り当て (例: 30分待ちのレビューは `waitTime: 30`)

---

## 2026-02-25 (続き4)

### 概要
コメントの省略表示（line-clamp）を整備、長文テストデータを追加。

### 詳細

#### 1.1 ReviewList.tsx — line-clamp を Tailwind クラスに統一
- **[Claude]** `components/organisms/Review/ReviewList.tsx`
  - コメント表示: inline style (`WebkitLineClamp: 3`) → `line-clamp-3` Tailwind クラスに変更
  - カードクリック化・ボタン削除は前回 (続き3) で対応済み

#### 1.1 ReviewDetailModal.tsx — コメント10行制限を追加
- **[Claude]** `components/organisms/Review/ReviewDetailModal.tsx`
  - コメント表示の `<Text>` → `<p>` に変更し `line-clamp-10` を追加

#### 1.3 reviewMock.ts — 長文コメントのテストデータ追加
- **[Claude]** `test/mock/reviewMock.ts`
  - ID `'13'` / 福田 真理子 / 評価4 / 未返信 のエントリを追加
  - コメントは15行相当の長文（3行・10行 clamp 動作確認用）
  - 画像3枚 / サブ評価あり

---

## 2026-02-25 (続き3)

### 概要
口コミリストのクリック挙動を変更。ボタン削除 → カード全体クリックで詳細モーダルを開く。画像データは前回修正済みのため対応不要。

### 詳細

#### 1.1 ReviewList.tsx — カードクリック化
- **[Claude]** `components/organisms/Review/ReviewList.tsx`
  - 「詳細を見る」「返信する」ボタン（アクションセクション）を削除
  - `Button` インポートを削除
  - カードルート `div` に `onClick={() => onDetail(review)}` / `cursor-pointer` / `hover:bg-[#efefef]` / `transition-colors` を追加
  - `onReply` はインターフェース定義を維持（親コンポーネントとの互換性）

#### 1.2 画像データ
- 前回 (2026-02-25 続き2) で対応済み。全12件で `images: []` なし。

---

## 2026-02-25 (続き2)

### 概要
詳細モーダルに画像が表示されない問題を修正。`images: []` だった5件のモックデータに画像を設定。

### 詳細

#### 1.1 test/mock/reviewMock.ts — 空画像配列の修正
- **[Claude]** `test/mock/reviewMock.ts`
  - 以下5件の `images: []` を修正し、全12件で1枚以上の画像を保持するよう変更
    | ID | userName | 修正後 images |
    |---|---|---|
    | 1 | 佐藤 花子 | `['shopReview.png', 'shopReview2.png']` |
    | 5 | 伊藤 拓海 | `['shopReview3.png']` |
    | 7 | 山本 裕子 | `['shopReview4.png', 'shopReview5.png', 'shopReview6.png', 'shopReview.png']` |
    | 10 | 加藤 律子 | `['shopReview2.png', 'shopReview3.png']` |
    | 12 | 井上 修一 | `['shopReview5.png', 'shopReview6.png']` |

---

## 2026-02-25 (続き)

### 概要
ユーザーフィードバック第2弾。口コミリストの画像削除、詳細モーダルのCSS・返信フロー改善、画像ビューアへの前後ナビゲーション追加。

### 詳細

#### 2.1 ReviewList.tsx — 画像セクション削除
- **[Claude]** `components/organisms/Review/ReviewList.tsx`
  - 投稿画像表示ブロック（lines 109-138）を削除
  - 不要になった shopReview 画像インポート・`shopReviewImageMap` を削除

#### 2.2 ReviewDetailModal.tsx — CSS適用・返信フロー改善
- **[Claude]** `components/organisms/Review/ReviewDetailModal.tsx`
  - **レイアウト変更**: ボトムシート → センタード固定モーダル (`max-w-[720px]`)
  - **背景色**: `bg-white` → `bg-[#f3f3f3]`、内部白カード (`bg-white`) でセクション区切り
  - **画像サイズ**: `w-[30%] aspect-square` → `w-[150px] h-[150px] object-cover`
  - **星色**: `#f5b301` → `#ffa500`（`StreamlineStar1` の fill/stroke を更新）
  - **返信フロー**: `mode` prop に加え `isReplying` 内部 state を追加
    - 詳細モードで「返信する」ボタンをクリックすると `isReplying = true` に切り替わる
    - 返信フォーム表示時のフッター: 「下書き保存」「返信を投稿する」「閉じる」の3ボタン
    - 詳細モード時のフッター: 「返信する」（unreplied時）＋「閉じる」
  - **ボタンスタイル統一**: primary = `bg-[#1aa382] text-white`、secondary = `bg-white border border-[#333]`
  - 「下書き保存」はローカル state のテキストを保持したままモーダルを閉じる

#### 2.3 pages/review/image/[id].tsx — 前後ナビゲーション追加
- **[Claude]** `pages/review/image/[id].tsx`
  - `currentIndex` を `useState` で管理（URL の `index` パラメータで初期化）
  - `router.replace` で URL を `shallow` 更新（ブラウザ履歴を汚さない）
  - **矢印ボタン**: 画像左右に前へ/次への丸型ボタン（端では非表示）
  - **タッチスワイプ**: `onTouchStart` / `onTouchEnd` で水平方向50px以上のスワイプを検知し切り替え
  - **ドットインジケーター**: クリック可能（任意の枚数にジャンプ）
  - ヘッダーに現在位置 `N / 合計` を表示

---

## 2026-02-25

### 概要
ユーザーフィードバックに基づき、ReviewSummary・ReviewList・ReviewDetailModal のデザインを修正。KPIカードの星画像削除、口コミリストの2カラムレイアウト刷新、詳細モーダルへのサブ評価追加。

### 詳細

#### 2.1 ReviewSummary.tsx — 星画像削除
- **[Claude]** `components/organisms/Review/ReviewSummary.tsx`
  - rate画像インポート（rate1〜rate5）および `rateImageMap` を全削除
  - 「総合評価」カードを数値 + "/5.0" テキストのみに変更

#### 2.2 ReviewList.tsx — 2カラムレイアウト刷新
- **[Claude]** `components/organisms/Review/ReviewList.tsx`
  - カード全体を `flex gap-6` (Row) に変更
  - **左側 (review-left)**: スコア (`40px / bold / #d4a000`) + テキスト星 (`18px / #f5b301`) を縦中央揃えで表示
  - **右側 (review-right)**:
    - ヘッダー: アバター・名前・日付 + ステータスラベル（未返信: `border red / color red`、返信済み: `border #00A48D`）
    - コメント: 3行省略 (`-webkit-line-clamp: 3`)
    - 投稿画像: 最大3枚サムネイル（+X枚オーバーレイ付き）を右側カラム内に配置
    - アクションボタン: 右寄せ
  - 旧レイアウト（rate画像インポート、旧ヘッダー構造）を削除

#### 2.3 reviewMock.ts — サブ評価フィールド追加
- **[Claude]** `test/mock/reviewMock.ts`
  - `Review` 型に `foodRate`・`atmosphereRate`・`serviceRate` (1〜5) を追加
  - 12件全エントリにサブ評価値を設定

#### 2.4 ReviewDetailModal.tsx — サブ評価表示・ボタン配置修正
- **[Claude]** `components/organisms/Review/ReviewDetailModal.tsx`
  - rate画像インポート・`rateImageMap` を削除
  - ユーザー情報欄の評価をテキスト星 (★☆) + スコア数値に変更
  - `StreamlineStar1` SVGコンポーネントをインライン定義（塗りつぶし: 評価数以下は `#f5b301` fill、超過は `#ccc`）
  - `StarRating` ヘルパーコンポーネントを追加（5個の `StreamlineStar1` を並べる）
  - 食事・雰囲気・サービスのサブ評価セクションを `bg-gray-50` カード内に追加
  - フッターに「閉じる」「返信を投稿する」ボタンを横並びで配置（詳細モードでは「閉じる」のみ）

---

## 2026-02-24 (続き8)

### 概要
口コミ管理機能のレビュー指摘事項を修正。インポートパスエラー修正、未返信タグ文言変更、画像詳細ページ新規作成。

### 詳細

#### 2.1 モジュールインポートパス修正
- **[Claude]** 以下4ファイルの `'test/mock/reviewMock'` → `'@/test/mock/reviewMock'` に変更
  - `components/templates/ReviewTemplate/ReviewTemplate.tsx`
  - `components/organisms/Review/ReviewSummary.tsx`
  - `components/organisms/Review/ReviewList.tsx`
  - `components/organisms/Review/ReviewDetailModal.tsx`
- `@/*` → `./` の tsconfig パス解決を利用

#### 2.2 ステータスタグ文言変更
- **[Claude]** `components/organisms/Review/ReviewList.tsx`
  - 未返信バッジのテキストを `NEW` → `未返信` に変更（赤背景維持）

#### 2.3 画像詳細ページ新規作成
- **[Claude]** `pages/review/image/[id].tsx` を新規作成
  - `useRouter` で `id`・`index` クエリパラメータを取得
  - `reviewMockData` から該当口コミを検索し、指定インデックスの画像を全画面表示
  - 黒背景・中央配置のシンプルなビューア
  - 「閉じる」ボタンで `router.back()`
  - 複数画像時はドットインジケーター表示

---

## 2026-02-24 (続き7)

### 概要
口コミ管理機能（ReviewTemplate）をモック実装。12件のダミーデータ、フィルター・並び替えポップオーバー、詳細・返信モーダルを実装。

### 詳細

#### 新規作成ファイル
- **[Claude]** `test/mock/reviewMock.ts`
  - `Review` 型定義（id, userName, rating, comment, images, createdAt, replyStatus, replyText, replyCreatedAt）
  - 12件のモックデータ（画像なし/1枚/3枚/4枚以上のバリエーションを含む）

- **[Claude]** `components/organisms/Review/ReviewSummary.tsx`
  - 未返信口コミ数・総合評価・返信率をモックデータから動的算出
  - 平均返信時間は固定値 "10.4時間"
  - 総合評価の星画像は `test/mock/rate/` 画像を使用

- **[Claude]** `components/organisms/Review/ReviewFilter.tsx`
  - 「すべて / 返信済み / 未返信」のカスタムポップオーバードロップダウン
  - クリック外で自動クローズ

- **[Claude]** `components/organisms/Review/ReviewSort.tsx`
  - 「返信推奨順 / 新しい順 / 古い順 / 評価の高い順 / 評価の低い順」のカスタムポップオーバー

- **[Claude]** `components/organisms/Review/ReviewList.tsx`
  - 口コミカード一覧（ユーザー名・評価画像・日付・コメント2行制限・ステータスタグ・アクションボタン）
  - データ0件時は空状態UI表示

- **[Claude]** `components/organisms/Review/ReviewDetailModal.tsx`
  - フルスクリーンシート型モーダル（Portal使用）
  - 詳細モード：コメント全文・画像（最大3枚、+X枚オーバーレイ）・返信内容表示
  - 返信モード：テキストエリア＋「返信を投稿する」ボタン
  - 画像タップで `/review/image/[id]?index=N` へルート遷移

- **[Claude]** `components/organisms/Review/index.ts`
  - Review organisms の一括エクスポート

#### 更新ファイル
- **[Claude]** `components/templates/ReviewTemplate/ReviewTemplate.tsx`
  - インライン実装を全て削除し、Review organisms に置き換え
  - `useState` で reviews・filter・sort・selectedReview を管理
  - `useMemo` でフィルター＋ソート済みリストを生成
  - 返信投稿後に対象データの replyStatus を 'replied' に更新

- **[Claude]** `components/organisms/index.ts`
  - `export * from './Review'` を追加

### ソートロジック（返信推奨順）
未返信 > 低評価 > 新しい順（三段階比較）

### 画像処理
- Rate 画像・Shop Review 画像は webpack 静的インポートでモジュール解決
- `shopReviewImageMap` で filename → StaticImageData のルックアップを実施

---

## 2026-02-24 (続き6)

### 概要
SignUpTemplate を5ステップ構造から「3ステップ＋サブステップ」構造に再編。StepIndicatorを3ステップに戻し、Step2内部でサブステップ（メール入力/認証コード/ユーザー情報）を制御。認証コード入力ステップに開発用モックコード自動入力ボタンを追加。

### 詳細

#### Phase 1: StepIndicator を3ステップに戻す
- **[Claude]** `components/atoms/StepIndicator/index.tsx` を修正。
  - `STEPS` を5項目から3項目へ変更: `['登録方法選択', 'アカウント情報入力', '登録完了']`
  - サークルサイズを `w-7 h-7` → `w-8 h-8` に戻す
  - ラベル幅を `20%` → `33%` に戻す
  - ラベルフォントサイズを `text-[9px]` → `text-xs` に戻す

#### Phase 2: SignUpTemplate を3ステップ＋サブステップ構造に再編
- **[Claude]** `components/templates/SignUpTemplate/index.tsx` を全面改修。
  - **ステート構造変更**: `step` (1|2|3) + `subStep` (1|2|3) の2層管理に変更
    - Step1: 登録方法選択
    - Step2 / SubStep1: メールアドレス入力
    - Step2 / SubStep2: 認証コード入力（6桁）
    - Step2 / SubStep3: ユーザー情報入力
    - Step3: 登録完了
  - **認証コードを4桁→6桁に変更**: `code` ステートを `['','','','','','']` に変更
  - **開発用機能追加（SubStep2-2）**: 「認証コードを取得（開発用）」ボタンを追加
    - `MOCK_AUTH_CODE = ['1','2','3','4','5','6']` を自動入力
    - `// DEV_ONLY` コメントで識別可能
  - **ナビゲーション修正**: Step1→Step2 遷移時に `subStep` を1にリセット
  - **コンポーネント命名**: `Step2/Step3` → `SubStep2_1/SubStep2_2/SubStep2_3` + `Step3` に改名

---

## 2026-02-24 (続き5)

### 概要
新規登録フローを3ステップから5ステップに拡充。認証コード入力ステップとアカウント情報入力ステップを新規追加。

### 詳細

#### Phase 1: useAuth に register メソッドを追加
- **[Claude]** `hooks/useAuth.ts` を修正。
  - `register()` 関数を追加: `localStorage.setItem('auth_token', 'mock_token')` でモック登録を実現
  - 戻り値に `register` を追加

#### Phase 2: StepIndicator を5ステップ対応に更新
- **[Claude]** `components/atoms/StepIndicator/index.tsx` を修正。
  - `STEPS` を3項目から5項目へ変更: `['方法選択', 'メール入力', 'コード認証', '情報入力', '登録完了']`
  - サークルサイズを `w-8 h-8` → `w-7 h-7` に変更（5つ収まるよう微調整）
  - ラベル幅を `33%` → `20%`（1/5）に変更
  - ラベルフォントサイズを `text-xs` → `text-[9px]` に変更（5ラベルが収まるよう調整）

#### Phase 3: SignUpTemplate を5ステップフローに拡充
- **[Claude]** `components/templates/SignUpTemplate/index.tsx` を全面改修。
  - **追加ステート**: `code`（認証コード4桁配列）、`nickname`、`password`、`passwordConfirm`、`gender`（`'男性'|'女性'|'その他'|''`）、`birthday`
  - **パスワードバリデーション** (`validatePassword`): 8文字以上、半角小文字・大文字・数字の2種類以上を要求（stashロジックに準拠）
  - **Step1（登録方法選択）**: メールアドレス登録ボタン + 既存アカウントへのリダイレクトリンク（既存 + 小修正）
  - **Step2（メールアドレス入力）**: メールアドレス入力 + 「認証メールを送信」ボタン（既存の次へボタンを改名）
  - **Step3（認証コード入力）** ★新規:
    - 送信済みメールアドレスの確認表示
    - 4桁の数字入力ボックス（各1文字）
    - 「認証」ボタン（全桁入力チェック）
    - 「認証メールを再送信」「メールアドレスを再設定」リンク
  - **Step4（アカウント情報入力）** ★新規（特に指摘された欠落部分）:
    - メールアドレス（表示のみ、`bg-[#444444]`）
    - パスワード（8文字以上、2種類以上の文字種、表示切替あり）
    - パスワード再入力（一致チェック）
    - ニックネーム（必須）
    - 生年月日（`<input type="date">`）
    - 性別（男性/女性/その他のトグルボタン）
    - 「登録する」ボタン（`bg-[#006355]` Figma準拠）
  - **Step5（登録完了）**: チェックマーク + ニックネーム表示 + 「Wyzeを始める」ボタン（`register()` 呼び出し後 `/home` へ遷移）

### 検証結果
- テスト: ✅ 全13テスト合格（既存テスト全通過）
- TypeScript型チェック: ✅ 実装ファイルにエラーなし（`test/ReportTemplate.test.tsx` の既存エラー1件は無関係）

### 技術的な判断
1. **register() の追加**: `login()` を signup後に呼ぶとMOCK_USERとの照合で失敗するケースがあるため、登録専用の `register()` メソッドを追加。トークンを直接設定し、将来のAPI連携時は差し替え可能な設計。
2. **Step4 に stash ロジックを移植**: `AuthEmailUserInfo.tsx` のパスワードバリデーション・フォームレイアウトをReact Native → Tailwind CSSに変換。BirthDayPicker・AreaPicker は標準 `<input>` に置き換え（依存ライブラリ不要）。
3. **StepIndicator のスケールダウン**: 5ステップで横幅に収めるためサークルを `w-7 h-7`、ラベルを `text-[9px]`、マージンを `mx-0.5` に縮小。コンポーネントの使用箇所は SignUpTemplate のみのため破壊的変更なし。

---

## 2026-02-24 (続き4)

### 概要
サイドメニューの「ログアウト」リンクを `LogoutModal` に接続。クリック時にモーダルが表示されるよう修正。

### 詳細

#### Phase 1: Header へ LogoutModal を統合
- **[Claude]** `components/organisms/Header/Header.tsx` を修正。
  - `LogoutModal` を `@/organisms/Modal` からインポートに追加
  - `isLogoutModalOpen` ステートを追加（初期値: `false`）
  - サイドメニューの「ログアウト」を `<a href="/logout">` から `<button onClick>` に変更:
    - クリック時: `setIsMenuOpen(false)` でサイドメニューを閉じ、`setIsLogoutModalOpen(true)` でモーダルを開く
  - `<LogoutModal isOpen={isLogoutModalOpen} onClose={...} />` をテンプレートに追加
  - ログアウトボタン押下 → LogoutModal表示 → 「ログアウト」確認 → `useAuth().logout()` 実行 → `/` (SplashScreen) へ遷移 の完全なフローが動作

### 検証結果
- TypeScript型チェック: ✅ 実装ファイルにエラーなし（`stash/` の既存エラーは無関係）

### 技術的な判断
1. **サイドメニューを閉じてからモーダルを開く**: `setIsMenuOpen(false)` と `setIsLogoutModalOpen(true)` を同一クリックハンドラ内で実行。サイドメニューとモーダルが重複して表示されない。
2. **LogoutModal 再利用**: 既存の `LogoutModal` (`components/organisms/Modal/LogoutModal.tsx`) をそのままインポート。内部で `useAuth().logout()` を呼ぶため、`Header` 側の追加ロジックは不要。

---

## 2026-02-24 (続き3)

### 概要
SplashScreen統合、AuthGuardの修正、ログアウト後のSplashScreen遷移対応、テスト拡充を完了。

### 詳細

#### Phase 1: SplashScreen に onComplete prop を追加
- **[Claude]** `components/templates/SplashScreen/SplashScreen.tsx` を修正。
  - `SplashScreenProps` に `onComplete?: () => void` を追加
  - `useEffect` 内で `onComplete` が提供されている場合はそれを呼び出し、未指定の場合は従来通り `router.push('/home')` に遷移

#### Phase 2: pages/index.tsx をSplashScreen対応に改修
- **[Claude]** `pages/index.tsx` を改修。
  - `LoginTemplate` の直接レンダリングから、SplashScreen→LoginTemplate のフロー制御に変更
  - `showSplash` ステートで表示を切り替え（初期値: `true`）
  - `handleSplashComplete`: `isAuthenticated()` が真なら `/home` へ遷移、偽なら `showSplash = false` に変更して `LoginTemplate` を表示
  - ログアウト後に `/` へリダイレクトされると、SplashScreen が表示されるようになった

#### Phase 3: AuthGuard の逆ガード修正
- **[Claude]** `components/auth/AuthGuard.tsx` を修正。
  - 変更前: 認証済みユーザーが `PUBLIC_PATHS` (`/`, `/signup`) のいずれかにアクセスすると `/home` へリダイレクト
  - 変更後: 認証済みユーザーが `/signup` にアクセスした場合のみ `/home` へリダイレクト
  - `/` はSplashScreenの `onComplete` 内で認証状態を確認して遷移するため、AuthGuardはリダイレクトしない

#### Phase 4: テスト拡充・修正
- **[Claude]** `test/Auth.test.tsx` を更新。
  - **セレクタ修正**: プレースホルダー `'メールアドレス'` → `'Wyze ID ,メールアドレス'`（現コンポーネントに合わせて修正）
  - **ボタン選択修正**: `getByText('新規でアカウント登録')` → `getAllByRole('button', { name: '新規登録' })[0]`
  - **新規テスト追加** (5件):
    - 誤った認証情報でログインするとエラーメッセージが表示されること
    - 認証済みで `/signup` にアクセスすると `/home` へリダイレクトされること
    - 認証済みで `/` にアクセスするとコンテンツが表示されること（SplashScreenが処理）
    - ログアウト後に `/` へ遷移すること
    - SplashScreen: `onComplete` が2秒後に呼ばれること
    - SplashScreen: `onComplete` 未指定の場合 `/home` へ遷移すること
  - **変更テスト**: 「認証済みでパブリックページにアクセスすると /home へリダイレクト」を `/signup` 対象に変更（`/` の動作変更に対応）
  - インポートに `renderHook`, `act` を追加; `SplashScreen`, `useAuth` のインポートを追加

### 検証結果
- テスト: ✅ 全13テスト合格（既存テストも全通過）
- TypeScript型チェック: ✅ 実装ファイルにエラーなし

### 技術的な判断
1. **SplashScreenの責務分離**: `onComplete` コールバックを追加し、SplashScreen自身は遷移先を知らない設計に変更。`pages/index.tsx` が遷移先を決定する責務を担う。
2. **AuthGuardの範囲限定**: `/` をAuthGuardの逆ガード対象から外すことで、ログアウト後の `/` アクセスでSplashScreenが表示されるようにした。`/signup` のみ認証済みユーザーを弾く設計を維持。
3. **テストの完全性**: 既存テストのセレクタ不一致（プレースホルダー・ボタンテキスト）を修正し、全テストが現コードと一致するよう統一。

---

## 2026-02-24 (続き2)

### 概要
認証ロジックの強化。`MOCK_USER` による入力値検証を追加し、正しい資格情報のみログインを許可するよう変更。

### 詳細

#### Phase 1: モックデータ定義
- **[Gemini]** `docs/task-to-claude.md` にモックデータ定義と認証ロジック変更の指示を追加。
- **[Claude]** `test/mock/authMockData.ts` を新規作成。
  - `MOCK_USER = { email: 'test@example.com', password: 'password123' }` を定義

#### Phase 2: useAuth ロジック更新
- **[Claude]** `hooks/useAuth.ts` を修正。
  - `MOCK_USER` をインポート
  - `login()` に `email !== MOCK_USER.email || password !== MOCK_USER.password` のチェックを追加
  - 不一致の場合 `false` を返してログイン失敗にする（変更前: 非空なら常に成功）

### 検証結果
- テスト: ✅ 全8テスト合格（既存テストも全通過）
- TypeScript型チェック: ✅ 実装ファイルにエラーなし

### 技術的な判断
1. **本番コードへのモックデータ参照**: 設計指示に基づき `hooks/useAuth.ts` から `test/mock/authMockData.ts` を参照する構成を採用。将来的にAPI認証に切り替える際は `useAuth.ts` の検証ロジックのみ差し替え可能。

---

## 2026-02-24 (続き)

### 概要
ヘッダーアイコンのレイアウト修正。通知アイコンとメニューボタンを右側にまとめて配置。

### 詳細

#### Phase 1: Header レイアウト修正
- **[Gemini]** `docs/task-to-claude.md` に修正指示を追加。通知アイコンが `justify-between` により中央に寄る問題を指摘。
- **[Claude]** `components/organisms/Header/Header.tsx` を修正。
  - 通知ボタン (`MdNotifications` を含む `button`) とメニューボタン (`IoMdMenu` を含む `Button`) を `<div className="flex items-center gap-4">` でラップ
  - ロゴ（左）とアイコングループ（右）の2要素構成に変更し、右寄せを実現

### 検証結果
- TypeScript型チェック: ✅ 実装ファイルにエラーなし

### 技術的な判断
1. **ラッパー追加のみ**: `justify-between` の3要素配置を2要素（ロゴ＋アイコングループ）に変更。既存のスタイルクラスは変更せず、最小限の修正で対応。

---

## 2026-02-24

### 概要
認証基盤（Authentication System）の構築。AuthGuard、LoginTemplate、SignUpTemplate、StepIndicator、LogoutModal、useAuth hookの新規実装、およびルーティング統合を完了。

### 詳細

#### Phase 1: フック・ガード実装
- **[Gemini]** `docs/task-to-claude.md` に実装指示書を作成。`docs/design.md` および `stash/Login` 参照ロジックに基づく。
- **[Claude]** 以下のファイルを新規作成。
  - `hooks/useAuth.ts`:
    - `login(email, password)`: 非空バリデーション後 `localStorage.setItem('auth_token', 'mock_token')` を実行
    - `logout()`: `localStorage.removeItem('auth_token')` 実行後 `/` へリダイレクト
    - `isAuthenticated()`: トークン有無の真偽値を返す
  - `components/auth/AuthGuard.tsx`:
    - `PUBLIC_PATHS` (`/`, `/signup`) はガード対象外
    - 未認証で保護ページアクセス時 → `router.replace('/')` にリダイレクト
    - 認証済みでパブリックページアクセス時 → `router.replace('/home')` にリダイレクト
    - チェック中はスピナー表示（`Spinner` コンポーネント使用）

#### Phase 2: コンポーネント実装
- **[Claude]** 以下のファイルを新規作成。
  - `components/atoms/StepIndicator/index.tsx`:
    - 3ステップ（登録方法選択 / アカウント情報登録 / 登録完了）のインジケーター
    - アクティブ/完了ステップ: `#F5C518` 塗りつぶし、未到達: `#1A1A1A` 塗りつぶし + `#F5C518` ボーダー
    - Flexレイアウトによるサークル + 接続ライン構成
  - `components/templates/LoginTemplate/index.tsx`:
    - 背景: `#1A1A1A`、ブランドロゴ（Tiro Telugu フォント）
    - ソーシャルログインボタン（LINE / Apple / Google / Yahoo! - UIのみ）
    - メールアドレス・パスワード入力フォーム
    - ログインボタン（`#00A48D` プライマリカラー）
    - 成功時: `/home` へ遷移、失敗時: エラーメッセージ表示
    - 新規登録ボタン → `/signup` へ遷移
  - `components/templates/SignUpTemplate/index.tsx`:
    - Step 1: 登録方法選択（ソーシャル + メールアドレスボタン、UIのみ）
    - Step 2: メールアドレス入力・モック認証
    - Step 3: 完了表示 + 「PlanBを始める」ボタン（`/home` へ遷移）
    - `StepIndicator` を使用した進捗表示
  - `components/organisms/Modal/LogoutModal.tsx`:
    - ログアウト確認メッセージ表示
    - 「ログアウト」押下で `useAuth().logout()` 実行 → ログイン画面へ遷移
    - 「キャンセル」でモーダルを閉じる
    - Figmaデザイン準拠: 220×130px、白背景、`#006355` ボーダー

#### Phase 3: ルーティング統合・ページ更新
- **[Claude]** 以下のファイルを更新・作成。
  - `pages/_app.tsx`:
    - `AuthGuard` を全ページコンポーネントのラッパーとして追加
    - `router.pathname` を `AuthGuard` に渡してページ判定
  - `pages/index.tsx`:
    - `SplashScreen` を `LoginTemplate` に差し替え（ログインページとして機能）
    - フォントリンク（Tiro Telugu）を追加
  - `pages/signup.tsx`: **新規作成**
    - `SignUpTemplate` を使用する新規登録ページ

#### Phase 4: エクスポート更新
- **[Claude]** 以下のファイルを更新。
  - `components/atoms/index.ts`: `StepIndicator` エクスポートを追加
  - `components/organisms/Modal/index.ts`: `LogoutModal` エクスポートを追加
  - `components/templates/index.ts`: `LoginTemplate`、`SignUpTemplate` エクスポートを追加

#### Phase 5: テスト実装
- **[Claude]** `test/Auth.test.tsx` を新規作成。
  - ログインフロー（4テスト）:
    - 未入力でエラーメッセージ表示
    - 正しい入力でトークン保存
    - 正しい入力で `/home` へ遷移
    - 新規登録ボタンで `/signup` へ遷移
  - AuthGuard ガード機能（3テスト）:
    - 未認証で保護ページ → ルートへリダイレクト
    - 認証済みでパブリックページ → `/home` へリダイレクト
    - 認証済みで保護ページ → コンテンツ表示
  - ログアウト（1テスト）:
    - トークン削除で認証状態が解除されること

### 検証結果
- テスト: ✅ 全8テスト合格
- TypeScript型チェック: ✅ 実装ファイルにエラーなし
- Next.js build: ⚠️ `stash/` ディレクトリの React Native ファイルによるビルドエラーあり（実装とは無関係の既存問題）

### 技術的な判断
1. **localStorage によるクライアントサイド認証**: 設計書の指定通り `localStorage` の `auth_token` でセッション管理。
2. **AuthGuard の双方向ガード**: 未認証→保護ページアクセス時はリダイレクト、認証済み→パブリックページアクセス時も `/home` へリダイレクトし、ループを防止。
3. **`pages/index.tsx` をログインページとして使用**: 設計書の仕様 (`ログインページ /`) に準拠し、旧 `SplashScreen` を `LoginTemplate` に差し替え。
4. **LogoutModal のサイズ**: `docs/figma/logoutModal.svg`（220×130px）を参照し、コンパクトなモーダルを実装。

---

## 2025-12-28

### 概要
AIタブに「Coming Soon」メッセージを表示する機能実装と、それに対するテスト作成指示。

### 詳細
- **[Gemini]** 要件定義とアーキテクチャレビューを実施し、実装方針を策定。
- **[Gemini]** 上記方針に基づき、Claudeへの実装指示書を作成。
- **[Claude]** 指示書に基づき、以下のファイルを変更してUIを実装。
  - `styles/globals.css` (フォント導入)
  - `tailwind.config.js` (フォント設定追加)
  - `components/templates/ReportTemplate/AiTab.tsx` (コンポーネント実装)
- **[Gemini]** Claudeの実装内容をレビューし、正当性を確認。
- **[Gemini]** 実装されたコンポーネントを検証するための、テストコード作成指示書をClaude向けに作成。

## 2026-01-22

### 概要
ホームタブ（ダッシュボード）のリファクタリングと機能実装。サブコンポーネント作成、HomeTemplate統合、Geminiレビュー対応まで完了。

### 詳細

#### Phase 1: サブコンポーネント作成
- **[Gemini]** 実装指示書 `docs/task-to-claude.md` を作成。Figma準拠のUI要件と設計方針を定義。
- **[Claude]** 指示書に基づき、以下のファイルを新規作成。
  - `components/organisms/Home/DashboardSection.tsx`
    - ダッシュボードヘッダー（タイトル + 更新ボタン）
    - AIによる最優先アクションセクション
    - 統計情報リスト（システム稼働状況、AI返信待ち口コミ等）
    - Google未連携時のオーバーレイ表示（ブラー効果 + メッセージ）
  - `components/organisms/Home/AccountLinkingSection.tsx`
    - Google/Instagramを単一の「アカウント連携」カード内に統合
    - 連携/解除トグルボタン
  - `components/organisms/Home/ShopListSection.tsx`
    - 店舗カードリスト表示
    - ステータスインジケーター
  - `components/organisms/Home/index.ts`

#### Phase 2: HomeTemplate統合
- **[Claude]** `components/templates/HomeTemplate/HomeTemplate.tsx` をリファクタリング。
  - ハードコードされたJSXを削除し、サブコンポーネントを使用
  - `useState`で`linkingState`（google/instagram）を管理
  - Google連携状態に応じた統計データの切り替え（INITIAL_STATS / LINKED_STATS）
  - イベントハンドラ（handleToggleGoogle, handleToggleInstagram等）を実装

#### Phase 3: Geminiレビュー対応
- **[Gemini]** レビュー指示書を `docs/task-to-claude.md` に更新。余白の二重適用、単一カード構造の確認を指摘。
- **[Claude]** レビュー指摘に基づき修正。
  - `DashboardSection.tsx`: `pt-6`を削除（余白の二重適用を解消）
  - `HomeTemplate.tsx`: コンテナに`pt-6`を追加（余白を親で一元管理）

### 検証結果
- TypeScript型チェック: ✅ 成功
- ESLint: ✅ エラーなし
- Next.js build: ✅ 成功

### 技術的な判断
1. **コンポーネント分割**: Atomic Design原則に従い、organisms配下にHome専用ディレクトリを作成。
2. **状態管理**: `HomeTemplate`上位で`useState`を使用。将来的なAPI連携への差し替えが容易な設計。
3. **余白管理**: 各セクションコンポーネントから上部余白を削除し、親コンポーネントで一元管理。

---

## 2026-01-29

### 概要
投稿タブ（Post Tab）の新規実装。一覧表示（グリッド/リスト）、詳細モーダル、フィルタ・ソート機能の実装完了。

### 詳細

#### Phase 1: 要件定義・設計
- **[Gemini]** `docs/requirements.md` に投稿タブの要件を定義（Figmaデザイン準拠）。
- **[Gemini]** `docs/design.md` にUI/UX設計およびコンポーネント構成を策定。

#### Phase 2: コンポーネント実装
- **[Claude]** 以下のコンポーネントを新規作成し、機能実装を行った。
  - `pages/post.tsx`: 投稿ページのエントリーポイント。
  - `components/templates/PostTemplate/PostTemplate.tsx`: 状態管理（表示モード、ソート、フィルタ）とレイアウト統括。
  - `components/templates/PostTemplate/PostGridItem.tsx`: グリッド表示用カードコンポーネント。
  - `components/templates/PostTemplate/PostListItem.tsx`: リスト表示用カードコンポーネント。
  - `components/templates/PostTemplate/PostDetailModal.tsx`: 投稿詳細表示および編集・ステータス変更用モーダル。

#### Phase 3: 機能検証
- **[Gemini]** 実装コードをレビューし、以下の要件充足を確認。
  - 表示形式切替（グリッド/リスト）
  - ソート機能（投稿順、集客効果順など5種）
  - ステータス管理（表示/非表示の即時反映）
  - フィルタリング機能
  - レスポンシブ対応（スマホ表示前提）
  - ダミーデータによる動作確認

### 技術的な判断
1. **テンプレート内コンポーネント配置**: `PostTemplate`固有のサブコンポーネント（GridItem, ListItem, Modal）は、汎用的な`organisms`ではなく、テンプレートディレクトリ内にコロケーション配置を採用。メンテナンス性を向上。
2. **ローカル状態管理**: バックエンド未接続のため、`useState`によるローカル状態管理でCRUD（Read/Update）を模倣し、インタラクションの即時性を確保。

---

## 2026-01-29 (続き)

### 概要
投稿タブの機能強化（状態管理・ステータス切替・日付フォーマット）およびレポートタブの新規実装（状態切替機能・Empty State）を完了。

### 詳細

#### Phase 4: 投稿タブ機能強化
- **[Gemini]** レビュー結果に基づき、`docs/task-to-claude.md` に追加実装指示を作成。
- **[Claude]** 以下の機能を実装。
  - `PostTemplate.tsx`:
    - `Post`型定義を追加（id, bgColor, title, content, tags, rate, views, likes, comments, date, username, status, isNew）
    - `useState`でposts配列を管理し、ステータス変更が即時UI反映されるように強化
    - `handleStatusChange`コールバックを追加
    - 件数表示を動的化（ハードコード「27件」→フィルタ後の`postCount`）
    - フィルタボタンのアクティブ状態を視覚的に明示（枠線・背景色）
    - `formatDate`関数を追加（ISO形式→「2025年7月27日」形式）
  - `PostGridItem.tsx`: **新規作成**
    - ステータスバッジ（表示中/非表示）を右上に表示
    - NEWラベル（該当時のみ左上に表示）
    - 非表示時のオーバーレイ表示
  - `PostListItem.tsx`:
    - `Post`型を適用
    - ステータスバッジをサムネイル内に追加
    - 非表示時の視覚的識別（opacity低下）
    - 日付フォーマット対応
  - `PostDetailModal.tsx`:
    - `onStatusChange`プロップを追加
    - ステータス切替ボタンの動的文言（「非表示にする」/「表示する」）
    - ステータスバッジの動的スタイル
    - NEWラベルの条件付き表示
    - 日付フォーマット対応

#### Phase 5: レポートタブ実装
- **[Gemini]** `docs/requirements.md` にレポートタブの要件を定義。`docs/design.md` に設計方針を策定。
- **[Claude]** 以下のコンポーネント・ファイルを実装。
  - `test/mock/reportMockData.ts`: **新規作成**
    - `ReportData`型定義
    - `operationalReportData`（実運用データ）
    - `initialReportData`（初期状態データ）
    - `tooltips`（ツールチップ説明文）
  - `components/templates/ReportTemplate/InitialStateReport.tsx`: **新規作成**
    - リリース時（初期状態）のEmpty State表示
    - 「アカウントを連携すると、レポートが表示されます」メッセージ
  - `components/templates/ReportTemplate/ReportTemplate.tsx`:
    - `ReportState`型を追加（'initial' | 'operational' | 'ai'）
    - `DevStateSelector`コンポーネントを追加（開発用状態切替スイッチ）
    - 状態に応じた表示切替ロジック
  - `components/templates/ReportTemplate/ReportTab.tsx`:
    - モックデータのインポートを`test/mock/reportMockData.ts`から読み込むように変更
    - ローカル定義のダミーデータ・tooltipsを削除

### 検証結果
- TypeScript型チェック: ✅ 成功
- Next.js build: ✅ 成功

### 技術的な判断
1. **状態管理の強化**: 投稿タブで`posts`配列を`useState`で管理し、ステータス変更が即時反映される設計を採用。将来的なAPI連携時の差し替えが容易。
2. **モックデータの分離**: 要件に基づき、テスト用モックデータを`test/mock/`ディレクトリに配置。コンポーネントとデータの責務を分離。
3. **開発用状態切替**: レポートタブに開発用の状態切替スイッチを実装。Initial/Operational/AIの3状態を切り替え可能にし、各状態のUI確認を容易化。
4. **Empty State設計**: リリース時（データなし）の状態を明示的に表示するコンポーネントを用意。ユーザーに状況を伝えるUXを確保。

---

## 2026-02-06

### 概要
レポートタブのUI機能強化。期間選択、サマリー指標、内訳グラフ（ドーナツ）、傾向グラフ（棒グラフ・折れ線グラフ）の汎用コンポーネント化およびEmpty State対応を完了。

### 詳細

#### Phase 1: Mock Data拡張
- **[Gemini]** `docs/task-to-claude.md` にレポートタブUI実装指示書を作成。
- **[Claude]** `test/mock/reportMockData.ts` を拡張。
  - `mediaBreakdown`: 媒体別内訳データ（Google, Instagram, Webサービス）を追加
  - `timeTrend`: 時間帯傾向データ（9時〜21時の13時間帯）を追加
  - `ReportData`型に上記フィールドを追加
  - `initialReportData`（Empty State用）にも対応フィールドを追加
  - `tooltips`に`mediaBreakdown`, `timeTrend`の説明文を追加

#### Phase 2: 汎用グラフコンポーネント作成
- **[Claude]** 以下のコンポーネントを `components/organisms/Report/` に新規作成。
  - `BarChart.tsx`: 汎用棒グラフコンポーネント
    - 曜日傾向・時間帯傾向の表示に使用
    - Empty State対応（データなし時に「COMING SOON」表示）
    - カスタマイズ可能なプロパティ（height, barColor）
  - `LineChart.tsx`: 汎用折れ線グラフコンポーネント
    - MEO順位推移の表示に使用
    - 複数データセット対応（複数のキーワード順位を同時表示）
    - Y軸ラベル・補助線のカスタマイズ対応
    - Empty State対応

#### Phase 3: ReportTab統合・Empty State対応
- **[Claude]** `components/templates/ReportTemplate/ReportTab.tsx` を更新。
  - `EmptyState`ヘルパーコンポーネントを追加（「COMING SOON」表示）
  - `isEmpty`ヘルパー関数を追加（配列の空判定）
  - 全セクションにEmpty State対応を実装:
    - 統合アクション内訳
    - 統合アクション内訳詳細
    - 媒体別内訳（新規セクション）
    - 曜日・時間帯傾向
    - Google検索ワード内訳
    - Instagram遷移元分析
    - 星（評価）の内訳
    - 口コミ返信パフォーマンス
    - MEO順位推移
  - 曜日傾向・時間帯傾向を`BarChart`コンポーネントに置き換え
  - MEO順位推移を`LineChart`コンポーネントに置き換え
  - 重複コード削除（口コミ平均評価の二重表示、空のgrid）

#### Phase 4: エクスポート更新
- **[Claude]** `components/organisms/Report/index.ts` を更新。
  - `BarChart`, `BarChartDataItem`, `BarChartProps` をエクスポート
  - `LineChart`, `LineChartDataset`, `LineChartProps` をエクスポート

### 検証結果
- TypeScript型チェック: ✅ 実装ファイルにエラーなし
- 検証項目:
  - [x] Period Selector: 動作確認済み（既存機能）
  - [x] Metrics: 4指標表示（Views, Actions, Rate, Rating）
  - [x] Charts: ドーナツグラフ、棒グラフ、折れ線グラフ正常描画
  - [x] Empty State: null/空配列時に「COMING SOON」表示

### 技術的な判断
1. **コンポーネントの汎用化**: 直接JSXで記述されていたグラフ（棒グラフ・折れ線グラフ）を汎用コンポーネント化。再利用性・保守性を向上。
2. **Empty State一元管理**: `EmptyState`コンポーネントと`isEmpty`ヘルパー関数を定義し、全セクションで統一的なEmpty State表示を実現。
3. **データ構造の拡張**: `mediaBreakdown`（媒体別内訳）と`timeTrend`（時間帯傾向）を追加し、設計書の要件を充足。
4. **SVGベースのグラフ実装**: 外部ライブラリ（recharts等）を使用せず、SVGで軽量に実装。モバイルファースト対応。

---

## 2026-02-06 (続き)

### 概要
レポートタブのレビュー対応。コンポーネントモジュール化、レイアウト安定化、ツールチップのタッチ対応、Google検索ワードDonutChart実装を完了。

### 詳細

#### Phase 5: リファクタリング・共通化
- **[Gemini]** `docs/review.md` にレビュー結果を記載。`docs/task-to-claude.md` に修正指示書を作成。
- **[Claude]** 共通ユーティリティを分離。
  - `components/organisms/Report/shared.tsx`: **新規作成**
    - `EmptyState`コンポーネント（classNameプロップ追加で柔軟なスタイリング対応）
    - `isEmpty`ヘルパー関数
    - 型定義 `EmptyStateProps` をエクスポート
  - `components/organisms/Report/index.ts`: エクスポート追加
  - `ReportTab.tsx`: ローカル定義を削除し、`shared.tsx`からインポート
  - `AiTab.tsx`: 共有`EmptyState`コンポーネントを使用するように変更

#### Phase 6: レイアウト安定化
- **[Claude]** 「前月比」ラベルのレイアウト修正。
  - `KPICard.tsx`: `changeLabel`プロップを追加
    - 「前月比」等のラベルを変化率の上に表示
    - Flexboxレイアウトで安定配置（absolute配置を廃止）
  - `ReportTab.tsx`: 口コミ平均評価セクションの`relative`/`absolute`配置を削除し、`changeLabel="前月比"`を使用

#### Phase 7: ツールチップのタッチ対応
- **[Claude]** `SectionTitle.tsx` を更新。
  - `useRef`と`useEffect`で外側クリック/タップ検知を実装
  - `handleToggle`関数でタップトグル動作を統一
  - `touchstart`イベントリスナーを追加（モバイル対応）
  - アクセシビリティ属性を追加（`aria-label`, `role="button"`, `tabIndex`）
  - `onMouseEnter`/`onMouseLeave`を削除（タップのみで動作）

#### Phase 8: Google検索ワードDonutChart実装
- **[Claude]** `test/mock/reportMockData.ts` を更新。
  - `searchKeywords`型に`count`と`color`フィールドを追加
  - 各キーワードに検索ボリューム（count）と色（color）を設定
- **[Claude]** `ReportTab.tsx` を更新。
  - プレースホルダー円を`DonutChart`コンポーネントに置き換え
  - 凡例に色インジケーターを追加
  - 順位表示のスタイル調整（プライマリカラー適用）

### 検証結果
- TypeScript型チェック: ✅ 実装ファイルにエラーなし
- 検証項目:
  - [x] `EmptyState`と`isEmpty`が`shared.tsx`からインポート（ReportTab, AiTab両方）
  - [x] 「前月比」がFlexboxで安定配置（absolute配置廃止）
  - [x] ツールチップがタップでトグル、外側タップで閉じる
  - [x] Google検索ワードにDonutChart表示（凡例付き）

### 技術的な判断
1. **共通ユーティリティの分離**: `EmptyState`と`isEmpty`を`shared.tsx`に分離し、複数コンポーネントで再利用可能に。DRY原則を遵守。
2. **レイアウトの堅牢化**: absolute配置（`right-1/4`等）をFlexboxに置き換え、画面幅に依存しない安定したレイアウトを実現。
3. **タッチファースト設計**: ツールチップをhoverからタップトグルに変更。モバイルユーザー体験を優先。
4. **データ構造の拡張**: `searchKeywords`に`count`と`color`を追加し、DonutChartとの連携を実現。既存の`rank`と`keyword`は維持。

---

## 2026-02-06 (続き2)

### 概要
レポートタブの最終UI調整。グリッドレイアウト最適化、MEOセクション順序・キーワードソート、Instagram横並びレイアウト、LineChartオーバーフロー修正、タイポグラフィ標準化を完了。

### 詳細

#### Phase 9: MEO順位推移セクション改善
- **[Claude]** `ReportTab.tsx` のMEO順位推移セクションを更新。
  - セクション順序を変更: **チャート → キーワードリスト → 免責事項**
  - `invertYAxis={true}` を追加（1位が上に表示されるよう Y軸反転）
  - キーワードリストをランク昇順でソート（`.sort((a, b) => a.rank - b.rank)`）
  - 免責事項をLineChart内部のdisclaimerプロップから、セクション最下部の独立要素に移動
  - データセットインデックスの正確な紐付け（ソート後も元のcolor参照を維持）

#### Phase 10: Instagram遷移元分析レイアウト修正
- **[Claude]** `ReportTab.tsx` のInstagram遷移元分析セクションを更新。
  - 縦並び（`flex-col`）から横並び（`flex items-center justify-around`）に変更
  - チャート左・リスト右の配置に統一
  - DonutChartサイズを媒体別内訳と統一（size=140, thickness=25）
  - 凡例リストのスタイルを媒体別内訳と統一（`space-y-4`, `w-28`）

#### Phase 11: LineChartオーバーフロー修正
- **[Claude]** `components/organisms/Report/LineChart.tsx` を更新。
  - SVG要素のクラスを `overflow-visible` から `overflow-hidden` に変更
  - データポイントがチャート領域外に描画されないよう制限
  - コメントで変更理由を明記

#### Phase 12: 口コミ返信パフォーマンス タイポグラフィ修正
- **[Claude]** `ReportTab.tsx` の口コミ返信パフォーマンスセクションを更新。
  - 任意値 `text-[2rem]` を標準Tailwindクラス `text-4xl` に変更
  - 任意値 `text-[10px]` を標準Tailwindクラス `text-xs` に変更
  - カラーを `text-[#00A48D]` から `text-wyze-primary` に統一（KPICardと同等）
  - 単位テキストを `text-sm` から `text-base` に拡大
  - コメントでKPICardとのサイズ対応を明記

### 検証結果
- 検証項目:
  - [x] グリッドレイアウト: 2列表示（モバイル1列）が正常動作
  - [x] MEO順序: チャート → キーワードリスト → 免責事項
  - [x] キーワードソート: ランク昇順（4位 → 8位 → 17位）
  - [x] Instagram: チャート左・リスト右の横並び配置
  - [x] LineChart: データポイントがチャート領域内に収まる
  - [x] タイポグラフィ: 任意値を標準Tailwindクラスに置換

### 技術的な判断
1. **Y軸反転**: ランキングチャートでは1位を上に表示するのが直感的。`invertYAxis`プロップで制御。
2. **ソート後のデータセット紐付け**: ソート時に元インデックスを失わないよう、`findIndex`でcolor参照を正確に維持。
3. **レイアウト一貫性**: Instagram遷移元分析を媒体別内訳と同じ横並びスタイルに統一し、視覚的一貫性を確保。
4. **Tailwind標準化**: 任意値（`text-[2rem]`等）を標準クラス（`text-4xl`等）に置換し、コードの保守性・可読性を向上。

---

## 2026-02-06 (続き3)

### 概要
レポートタブのレイアウトをシングルカラム（1列）に変更。レビュアーフィードバックに基づき、全画面幅で縦積み表示に統一。

### 詳細

#### Phase 13: シングルカラムレイアウト適用
- **[Gemini]** `docs/review.md` にレビュー結果を記載。2列レイアウトが不自然との指摘。
- **[Claude]** `components/templates/ReportTemplate/ReportTab.tsx` を更新。
  - ルートコンテナを `grid grid-cols-1 sm:grid-cols-2 gap-4` から `flex flex-col gap-4` に変更
  - 全ての `sm:col-span-2` クラスを削除（統合アクション内訳、統合アクション内訳詳細）
  - `col-span-1` クラスを削除（星の評価内訳）
  - コメントを「シングルカラムレイアウト」に更新
  - 「2列表示」「全幅」等のコメントを簡潔化

### 検証結果
- TypeScript型チェック: ✅ 成功
- Next.js build: ✅ 成功
- 検証項目:
  - [x] シングルカラム: 全要素が画面幅に関係なく縦積み表示
  - [x] フル幅: 各カード/セクションが親コンテナの幅いっぱいに表示
  - [x] 内部レイアウト維持: 媒体別内訳、Instagram遷移元等のチャート横並びは維持
  - [x] gap-4: 縦方向の間隔が一貫

### 技術的な判断
1. **flexbox採用**: `grid grid-cols-1` でも同等の結果だが、単純な縦積みには `flex flex-col` がより明示的で軽量。
2. **内部レイアウト維持**: カード内部の横並びレイアウト（チャート左・リスト右）は変更せず、視覚的な情報密度を維持。

---

## 2026-02-09

### 概要
Reply機能のReviewへの置き換え。プロジェクト全体で `Reply` / `auto-reply` 関連の名称を `Review` / `review` に統一し、ルーティング・型定義・ナビゲーションを更新。

### 詳細

#### Phase 1: ReviewTemplateコンポーネント作成
- **[Claude]** 以下のファイルを新規作成。
  - `components/templates/ReviewTemplate/ReviewTemplate.tsx`
    - `ReplyTemplate`の内容をベースに、コンポーネント名を`ReviewTemplate`に変更
    - `activeTab`を`"review"`に変更
    - `customTabLabels`を`{ 'review': '口コミ・返信' }`に変更
  - `components/templates/ReviewTemplate/index.ts`
    - `ReviewTemplate`をエクスポート

#### Phase 2: ページファイル作成
- **[Claude]** `pages/review.tsx` を新規作成。
  - `ReviewTemplate`をインポートして使用
  - Headタイトル: 「口コミ・返信 - Wyze System」
  - metaディスクリプション: "Wyze System Web Application - Review"

#### Phase 3: エクスポート・ナビゲーション更新
- **[Claude]** 以下のファイルを更新。
  - `components/templates/index.ts`:
    - `export { ReplyTemplate } from './ReplyTemplate'` → `export { ReviewTemplate } from './ReviewTemplate'`
  - `components/organisms/Header/Header.tsx`:
    - タブID: `'auto-reply'` → `'review'`
    - タブラベル: 「自動返信」→「口コミ・返信」
    - `router.push('/auto-reply')` → `router.push('/review')`
    - 型定義: `'home' | 'post' | 'report' | 'auto-reply'` → `'home' | 'post' | 'report' | 'review'`

#### Phase 4: 全テンプレート型定義更新
- **[Claude]** 以下のファイルの`activeTab`型定義を `'auto-reply'` → `'review'` に変更。
  - `components/templates/BaseTemplate/BaseTemplate.tsx`
  - `components/templates/HomeTemplate/HomeTemplate.tsx`
  - `components/templates/CurrentFeaturesTemplate/CurrentFeaturesTemplate.tsx`
  - `components/templates/AccountTemplate/AccountTemplate.tsx`
  - `components/templates/BillingTemplate/BillingTemplate.tsx`
  - `pages/home.tsx`

#### Phase 5: 旧ファイル削除
- **[Claude]** 以下のファイル・ディレクトリを削除。
  - `pages/reply.tsx`
  - `pages/auto-reply.tsx`
  - `components/templates/ReplyTemplate/` (ディレクトリごと)

### 検証結果
- Next.js build: ✅ 成功
- ルート生成確認: `/review` が正しく生成（86.5 kB）
- `auto-reply` / `ReplyTemplate` の残存参照: ✅ なし（grep確認済み）

### 技術的な判断
1. **タブID変更**: `'auto-reply'` → `'review'` に統一。URLパス `/review` と一致させ、命名の一貫性を確保。
2. **旧ファイル完全削除**: `pages/reply.tsx`（未使用の古いページ）と `pages/auto-reply.tsx`（ReplyTemplate使用ページ）の両方を削除し、`pages/review.tsx` に一本化。
3. **型定義の一括更新**: 6ファイルの型ユニオンを変更。TypeScriptコンパイラにより未更新箇所があればビルド時に検出可能。

---

## 2026-02-12

### 概要
プラン確認・変更画面の改修。契約ステータス管理（解約・自動更新停止）、ミートボールメニュー、条件付き表示ロジックの実装およびテスト作成を完了。

### 詳細

#### Phase 1: コンポーネント改修
- **[Gemini]** `docs/task-to-claude.md` に実装指示書を作成。`docs/design.md` および `docs/Implementation/PlanConfirmationDetails.md` に基づく。
- **[Claude]** `components/templates/CurrentFeaturesTemplate/CurrentFeaturesTemplate.tsx` を改修。
  - `PlanStatus` 型定義（`'active' | 'inactive'`）を追加
  - `PLAN_DATA` モックデータ定数を追加（ハードコード値を置換）
  - State管理を導入: `planStatus`, `isAutoRenewal`, `isMenuOpen`
  - ヘッダーにステータスバッジを追加（契約中: 緑色 / 未契約: グレー）
  - ミートボールメニュー（`BsThreeDotsVertical`）を追加。「解約」「自動更新を停止」の2項目
  - 契約情報ブロックの条件付き表示:
    - `inactive`時: 契約期間・更新日を非表示
    - `active` かつ `isAutoRenewal === false`時: 「自動更新が設定されていません」を表示
  - `inactive`時に「契約する」ボタンを表示
  - ハンドラ関数: `handleCancel`, `handleStopAutoRenewal`, `handleSubscribe`
  - 未使用インポート（`MdCheckBox`, `MdCheckBoxOutlineBlank`）を削除
  - プラン変更ボタン文言を「アップグレード」に変更

#### Phase 2: 開発用状態リセットボタン追加
- **[Claude]** DEV_ONLYブロックを追加。
  - `[DEV] 自動更新を再開` ボタン: `active` かつ `isAutoRenewal === false` の時に表示
  - `DEV_ONLY` コメントで囲み、リリース前の検索・削除を容易化

#### Phase 3: テスト実装
- **[Claude]** `test/CurrentFeaturesTemplate.test.tsx` を新規作成。
  - 初期表示の確認（3テスト）:
    - ステータスが「契約中」であること
    - 次回更新日が表示されていること
    - 契約期間が表示されていること
  - メニューの動作確認（1テスト）:
    - ミートボールアイコンクリックでメニュー表示
  - 解約フローの確認（3テスト）:
    - ステータスが「未契約」に変化
    - 更新日と契約期間が非表示
    - 「契約する」ボタンが表示
  - 自動更新停止フローの確認（2テスト）:
    - 更新日が「自動更新が設定されていません」に変化
    - ステータスは「契約中」のまま

### 検証結果
- テスト: ✅ 全9テスト合格
- TypeScript型チェック: ✅ 実装ファイルにエラーなし（既存の `ReportTemplate.test.tsx` に無関係の型エラー1件あり）

### 技術的な判断
1. **クライアントサイドState管理**: API未接続のため `useState` で契約状態を管理。将来的なAPI連携時の差し替えが容易。
2. **モックデータの定数化**: ハードコード値を `PLAN_DATA` 定数に集約し、保守性を向上。
3. **DEV_ONLYパターン**: 開発用リセットボタンを `DEV_ONLY` コメントブロックで囲み、`grep DEV_ONLY` で一括検索・削除可能にした。
4. **テスト設計**: 既存テストファイル（`ReviewTemplate.test.tsx`）のパターンに準拠。BaseTemplateとSideMenuをモック化し、コンポーネント単体の動作を検証。

---

## 2026-02-12 (続き)

### 概要
お支払い情報画面（BillingTemplate）の改修。Figmaデザイン準拠で、クレジットカード情報の表示・編集モーダル（UIのみ）、お支払い履歴の一覧表示、PDF出力ボタン（モック）、次回お支払い表示を実装。

### 詳細

#### Phase 1: コンポーネント改修
- **[Gemini]** `docs/task-to-claude.md` に実装指示書を作成。`docs/requirements.md`、`docs/design.md`、`docs/figma/Billing.png` に基づく。
- **[Claude]** `components/templates/BillingTemplate/BillingTemplate.tsx` を全面改修。
  - 型定義を追加: `PaymentHistory`（id, date, amount）、`CardInfo`（brand, last4, expiry）
  - モックデータを定義: `MOCK_CARD_INFO`, `MOCK_PAYMENT_HISTORY`（3件）, `MOCK_NEXT_PAYMENT`
  - `formatCurrency` ヘルパー関数を追加（`Intl.NumberFormat` で `¥33,000` 形式）
  - State管理: `isEditModalOpen`（カード編集モーダル開閉）
  - ヘッダー: 「＜ お支払い情報」戻るボタン（`MdKeyboardArrowLeft` + `router.back()`）
  - クレジットカード情報セクション:
    - マスクされたカード番号（`**** **** **** 1234`）
    - 有効期限表示（`**/**`）
    - 編集アイコン（`MdEdit`）
    - 「カード情報を変更する」ボタン
  - お支払い履歴セクション:
    - `MOCK_PAYMENT_HISTORY` を `map` でリストレンダリング
    - 各行に日付・金額・「領収書 / PDF」ボタンを配置
    - PDFボタンクリックで `console.log` 出力（モック）
  - 次回お支払い表示:
    - 履歴下部に中央寄せ・グレーテキストで配置
    - データ不在時は「次回のお支払い予定はありません」を表示
  - カード編集モーダル（UIのみ）:
    - カード番号・有効期限・CVC のダミー入力欄（`readOnly`）
    - 「保存する」「キャンセル」ボタンでモーダル閉じる
  - 既存のハードコードされた契約情報ブロック・履歴ブロックを全て置換

#### Phase 2: テスト実装
- **[Claude]** `test/BillingTemplate.test.tsx` を新規作成。
  - レンダリング確認（5テスト）:
    - ヘッダーに「お支払い情報」が表示
    - カード情報セクション（マスク番号）が表示
    - お支払い履歴3件が表示
    - 金額がカンマ区切り円マーク付き（`¥33,000`）
    - 次回お支払い情報が表示
  - 戻るボタン（1テスト）:
    - クリックで `router.back()` が呼ばれる
  - モーダル動作（3テスト）:
    - 「カード情報を変更する」でモーダルが開く
    - 「キャンセル」でモーダルが閉じる
    - 「保存する」でモーダルが閉じる
  - PDFボタン（1テスト）:
    - クリックで `console.log` が呼ばれる

### 検証結果
- テスト: ✅ 全10テスト合格
- TypeScript型チェック: ✅ 実装ファイルにエラーなし

### 技術的な判断
1. **Figma準拠のレイアウト**: `docs/figma/Billing.png` に基づき、カード情報→履歴→次回支払いの縦積みレイアウトを採用。
2. **`Intl.NumberFormat` 使用**: 金額フォーマットに `Intl.NumberFormat('ja-JP')` を使用し、ロケール対応の通貨表示を実現。
3. **モーダルの `readOnly` 入力欄**: API未接続のため入力欄は `readOnly` に設定。将来的なフォーム実装時に `readOnly` を外すだけで対応可能。
4. **各行PDF出力ボタン**: Figmaに準拠し、履歴一覧の各行に「領収書 / PDF」ボタンを配置。一括出力ではなく行単位の出力UIとした。

---

## 2026-02-12 (続き2)

### 概要
アカウント情報画面（AccountTemplate）の改修。店舗プロフィール情報・オーナーアカウント設定の閲覧/編集（ミートボールメニュー経由）、通知設定のトグル（排他制御付き即時保存）を実装。Geminiレビュー対応として編集モード・ヘッダーアイコン追加も完了。

### 詳細

#### Phase 1: コンポーネント改修
- **[Gemini]** `docs/task-to-claude.md` に実装指示書を作成。`docs/requirements.md`、`docs/design.md`、`docs/figma/account.png` に基づく。
- **[Claude]** `components/templates/AccountTemplate/AccountTemplate.tsx` を全面改修。
  - 型定義を追加: `AccountData`（profile, owner, notifications）、`NotificationKey`
  - モックデータを定義: `MOCK_ACCOUNT_DATA`、`NOTIFICATION_LABELS`
  - State管理:
    - `profile`, `owner`, `notifications`: 各セクションのデータ管理
    - `isSaving`: 通知設定の排他制御フラグ
    - `isEditingProfile`, `isEditingOwner`: 編集モードフラグ
    - `menuOpenProfile`, `menuOpenOwner`: ミートボールメニュー開閉フラグ
    - `editProfile`, `editOwner`: 編集用一時State（キャンセル時の復元用）
  - ヘッダー:
    - 左: 「＜ 店舗・アカウント設定」戻るボタン（`MdKeyboardArrowLeft` + `router.back()`）
    - 右: 通知アイコン（`MdNotifications`）+ ハンバーガーメニュー（`MdMenu`）
  - 店舗プロフィール情報セクション:
    - ミートボールメニュー（`BsThreeDotsVertical`）→「変更する」で編集モード切替
    - 表示モード: 店舗名・住所・電話番号を表示
    - 編集モード: `input` フィールド + 「キャンセル」「保存」ボタン
    - 保存: `profile` Stateを更新、キャンセル: `editProfile`を元に戻す
  - オーナーアカウント設定セクション:
    - 同様のミートボールメニュー → 編集モード切替
    - 表示モード: 担当者名・メールアドレス・パスワード（`********`固定）
    - 編集モード: 担当者名・メールアドレスの `input` + パスワード欄（`readOnly`）
    - 保存/キャンセルの動作はプロフィールと同様
  - 通知設定セクション:
    - 3項目のトグルスイッチ: 月次レポート、競合変動アラート、低評価口コミアラート
    - `role="switch"` + `aria-checked` でアクセシビリティ対応
    - `isSaving` フラグによる排他制御（`setTimeout` 1秒でAPI模倣）
    - Optimistic Update パターン

#### Phase 2: テスト実装
- **[Claude]** `test/AccountTemplate.test.tsx` を新規作成。
  - レンダリング確認（4テスト）:
    - ヘッダーに「店舗・アカウント設定」が表示
    - 店舗プロフィール情報セクションが表示
    - オーナーアカウント設定セクションが表示
    - 通知設定セクションが表示
  - 値の表示確認（6テスト）:
    - 店舗名「サンプル店舗 渋谷店」が表示
    - 住所「東京都渋谷区神南1-2-3」が表示
    - 電話番号「03-1234-5678」が表示
    - 担当者名「山田 太郎」が表示
    - メールアドレス「taro.yamada@example.com」が表示
    - パスワード「********」がマスク表示
  - トグル動作（3テスト）:
    - 月次レポートのトグルクリックでOFFに切り替わる（初期ON）
    - 競合変動アラートのトグルクリックでONに切り替わる（初期OFF）
    - 通知設定の3項目が全て表示
  - 戻るボタン（1テスト）:
    - クリックで `router.back()` が呼ばれる

#### Phase 3: Geminiレビュー対応
- **[Gemini]** `docs/task-to-claude.md` にレビュー結果を反映。編集モード・ミートボールメニュー・ヘッダーアイコンの追加を指示。
- **[Claude]** レビュー指摘に基づきコンポーネントを更新。
  - `profile`/`owner` を `useState` で管理し、編集・保存可能に
  - `editProfile`/`editOwner` 一時Stateでキャンセル時の復元に対応
  - ミートボールメニュー（`BsThreeDotsVertical`）を両セクションに追加
  - ヘッダー右側に `MdNotifications` + `MdMenu` アイコンを追加
  - 編集モード: `input` フィールド + 「キャンセル」「保存」ボタンの実装

### 検証結果
- テスト: ✅ 全14テスト合格（レビュー反映後も既存テスト全パス）
- TypeScript型チェック: ✅ 実装ファイルにエラーなし

### 技術的な判断
1. **編集用一時State**: `editProfile`/`editOwner` を `profile`/`owner` とは別に保持し、キャンセル時に元の値に復元可能にした。保存時のみ本体Stateを更新する設計。
2. **ミートボールメニュー**: テキストボタンではなく `BsThreeDotsVertical` アイコンからのドロップダウンメニューを採用。Figmaデザインに準拠し、UIの一貫性を確保。
3. **通知設定の排他制御**: `isSaving` フラグで連続クリックを抑制。`setTimeout` でAPI呼び出しを模倣し、将来的なバックエンド連携時の差し替えが容易。
4. **アクセシビリティ**: トグルスイッチに `role="switch"` と `aria-checked` を付与し、スクリーンリーダー対応。`aria-label` でラベルを明示。

---

## 2026-02-16

### 概要
通知モーダル（NotificationModal）の新規実装。ヘッダーの通知アイコンからモーダルを表示し、未読通知の確認と該当ページへの遷移機能を実装。

### 詳細

#### Phase 1: NotificationItem コンポーネント作成
- **[Gemini]** `docs/task-to-claude.md` に実装指示書を作成。`docs/requirements.md`、`docs/design.md`、`docs/figma/notify.jpg` に基づく。
- **[Claude]** `components/molecules/NotificationItem/NotificationItem.tsx` を新規作成。
  - `Notification` 型定義（id, storeName, content, receivedAt, isRead, redirectPath）
  - `formatNotificationDate` 日時フォーマット関数:
    - 1日未満: 「○分前」「○時間前」
    - 1〜3日: 「○日前」
    - 3日以上: 「yyyy/mm/dd」
  - 店舗名・日時・通知本文・「確認する」ボタンを表示
  - 既読時は背景グレーアウト（`bg-gray-100`）
  - `redirectPath` バリデーション: `/` で始まり `http` を含まないことを確認
  - バリデーション失敗時に「確認できませんでした」エラー表示
- **[Claude]** `components/molecules/NotificationItem/index.ts` を新規作成。

#### Phase 2: NotificationModal コンポーネント作成
- **[Claude]** `components/organisms/Modal/NotificationModal.tsx` を新規作成。
  - 半透明グレーのオーバーレイ（クリックで閉じる）
  - モーダル本体: 画面中央固定、幅・高さ75%
  - ヘッダーに「お知らせ ○件」を未読件数で表示
  - 通知0件時は「お知らせはありません」を表示
  - 内部スクロール（`overflow-y-auto`）対応
  - 背景スクロール禁止（`body.overflow: hidden`）
- **[Claude]** `components/organisms/Modal/index.ts` にエクスポートを追加。

#### Phase 3: Header 改修
- **[Claude]** `components/organisms/Header/Header.tsx` を改修。
  - State追加: `isModalOpen`（モーダル開閉）、`notifications`（通知データ配列）
  - モックデータ `MOCK_NOTIFICATIONS`（5件、未読3件/既読2件）を定義
  - 通知アイコン（`MdNotifications`）を `<button>` でラップ:
    - 未読ありの場合: 白色アイコン + 赤い未読インジケータードット
    - 未読なしの場合: グレーアイコン
  - アイコンクリックで `isModalOpen` を `true` に設定
  - `handleNotificationConfirm`: 指定IDの通知を既読に更新し未読件数を再計算
  - `NotificationModal` をSideMenuの前に配置

### 検証結果
- TypeScript型チェック: ✅ 実装ファイルにエラーなし（既存の `ReportTemplate.test.tsx` に無関係の型エラー1件あり）
- Next.js build: ✅ 成功

### 技術的な判断
1. **既存Modalコンポーネントの不使用**: 通知モーダルは幅75%/高さ75%の特殊レイアウトが必要であり、既存の `Modal` コンポーネント（`max-w-lg` 固定）ではなく専用コンポーネントとして実装。
2. **日時フォーマット関数の配置**: `NotificationItem` と密結合のため、同ファイル内に配置。他コンポーネントでの再利用が必要になった場合に `utils/` へ移動可能。
3. **モックデータのHeader内配置**: API未接続のため `Header` 内に `MOCK_NOTIFICATIONS` を定義。将来的にAPI連携時はカスタムHookまたはContextに置き換え可能。
4. **Figmaデザイン準拠**: 通知アイコンの色切替、モーダル内の「お知らせ ○件」表示、店舗名の【】囲み、日時の右寄せ配置をFigmaに合わせて実装。