# 実装指示書 (Phase 12: Staging検証に向けた最終統合)

## 概要
GitHub Issue #30「Staging検証」の要件に基づき、未実装のアカウント管理、動的なメール認証、および詳細なプラン管理を完遂してください。これが Staging 環境での全機能統合の最終フェーズとなります。

---

## 1. アカウント・プロフィール編集機能 (Account)

### 要求事項
- **Profile API**: ログインユーザーのニックネームおよびメールアドレスを取得・更新する。
- **ユニーク制約**: メールアドレス変更時、既に他ユーザーが使用している場合はエラー（409 Conflict）を返す。
- **フロントエンド統合**: `AccountTemplate.tsx` に編集モードを実装し、保存時に API を叩く。

### 修正/新規ファイル
- `backend/internal/handlers/user.go` (新規/修正)
- `frontend/hooks/useProfile.ts` (新規)
- `frontend/components/templates/AccountTemplate/AccountTemplate.tsx`

---

## 2. 本番用メール認証シーケンス (Sign Up)

### 要求事項
- **動的コード生成**: 6桁のランダム数字を生成し、DB 等に一時保存（有効期限10分）。
- **メール送信モック**: Staging環境では実際にメールを送る代わりに、バックエンドのログに「【Verification Code】: 123456」のように出力し、検証可能にする。
- **API連携**: `SignUpTemplate` の認証コード入力ステップにて、実際の API を使用して検証を行う。

### 修正/新規ファイル
- `backend/internal/service/auth_service.go`
- `frontend/components/templates/SignUpTemplate/index.tsx`

---

## 3. 3段階プラン & サブスクリプション制御 (Stripe)

### プラン定義
- **Light / Basic / Pro** の 3 段階をサポートする。
- 各プランの `price_id` を環境変数として管理し、Stripe Checkout 時に使用する。

### タスク
- **Webhook**: 支払い完了時に、取得した `price_id` からプラン種別を判定し、DB の `users.plan_tier` (新規追加) を更新。
- **UI表示**: `BillingTemplate` に現在のプラン（Light 等）を明示し、上位プランへのアップグレードを促す表示。

---

## 4. 外部コンテンツの表示統合

### 要求事項
- **Review**: Google Business Profile から取得した「実際の口コミ」を `ReviewTemplate` に表示。
- **Post**: Instagram から取得した「実際の投稿」を `PostTemplate` に表示。
- **モックとの切り替え**: `MOCK_MODE=false` 時は、必ず実 API からのデータを使用すること。

---

## 完了定義 (Definition of Done)
1. **アカウント編集**: プロフィール画面で名前とメールを変更し、リロード後も反映されていること。
2. **メール認証**: 新規登録時、ログに出力された動的なコードを入力して登録が完了すること。
3. **プラン反映**: Stripe テスト決済後、ユーザーのプラン種別が DB 上で正しく（例: Basic）更新されること。
4. **表示統合**: レビュー画面および投稿画面に、モックではない実データが表示されること。
