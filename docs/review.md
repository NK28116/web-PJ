# 実装レビュー (Phase 7 完了 & Phase 8 実機連携設計)

## レビュー日: 2026-03-15
## レビュアー: 河崎 紗夜

### 1. 総評
Phase 7「Stagingリリース」の主要課題であったビルドエラーは解消されましたが、**ユーザーレビューにより外部 API 連携（OAuth）および Stripe 決済フローにおいて致命的な設定不備が複数判明しました。** 現在のステージング環境は「画面は表示されるが、主要機能が動作しない」状態です。Phase 8 の実装においては、これらのインフラ・設定面の修正を最優先で実施する必要があります。

---

### 2. 項目別詳細レビュー

#### A. OAuth 連携設定のエラー (❌ 要修正)
- **Instagram (Meta)**: `このURLのドメインはアプリのドメインに含まれていません` というエラーが発生。
  - **原因**: Meta for Developers のアプリ設定で、「アプリドメイン」に `web-pj-three.vercel.app` が追加されていない、あるいは「有効なOAuthリダイレクトURI」にステージング用の URL が登録されていません。
- **Google**: `Google hasn’t verified this app`（このアプリは確認されていません）という警告が発生。
  - **原因**: Google Cloud Console の OAuth 同意画面が「テスト」モードのままであり、かつユーザーがテストユーザーとして登録されていない、またはアプリの検証プロセスが未完了です。

#### B. Stripe 決済フローの未接続 (❌ 要修正)
- **現状**: `current-features` ページの「契約する」ボタンがバックエンドの `/api/billing/checkout` にバインドされておらず、クリックしても反応がない、または適切な遷移が行われません。
- **対策**: フロントエンドのボタンイベントに、Stripe Checkout セッション作成 API の呼び出しを実装する必要があります。

#### C. ステージング環境の正常化 (✅ 完了)
- ビルドと配信自体は正常であり、`NEXT_PUBLIC_API_URL` を介した API 通信の準備は整っています。

---

### 3. ユーザーによる確認方法 (Validation Guide)

実装・設定修正後、以下の手順で再度確認をお願いします。

#### ① OAuth 連携の再テスト
- **Meta (Instagram)**: 連携ボタンを押し、Facebook のログイン画面が正常に表示されるか。
- **Google**: 警告画面（検証中）が表示されても「詳細」→「...に移動（安全ではありません）」で進めるか確認してください（テストモード時の挙動）。

#### ② Stripe 決済の導線確認
- `current-features` または `billing` ページから「契約する」を押し、Stripe のチェックアウトページ（`checkout.stripe.com`）にリダイレクトされるか確認。

---

### 4. 判定
**[条件付き承認 / 要再修正]**
インフラ設定（Meta/Google/Stripe）の不備により、アプリケーションの価値である「連携」と「決済」が機能していません。`docs/task-to-claude.md` にこれらの修正手順を具体的に追記し、最優先で対応してください。

### 5. ユーザーレビュー（フィードバック記録）
#### ユーザー指摘事項
- **外部 API 連携の失敗**: Instagram でドメイン不一致エラー、Google で未検証アプリの警告。
- **決済画面への不遷移**: `current-features` ページで「契約する」を押しても Stripe へ遷移しない。

---
#### 設定修正のための技術ガイド

**1. Meta (Instagram) 設定の修正:**
- [Meta for Developers](https://developers.facebook.com/) > アプリを選択 > 設定 > ベーシック
  - 「アプリドメイン」に `web-pj-three.vercel.app` を追加。
- 設定 > 高度な設定
  - 「有効なOAuthリダイレクトURI」に `https://backend-611370943102.us-east1.run.app/api/auth/instagram/callback` が含まれているか確認。

**2. Google Cloud Console 設定の修正:**
- [GCP Console](https://console.cloud.google.com/) > APIとサービス > OAuth同意画面
  - 公開ステータスを「アプリを公開」にするか、または「テストユーザー」にユーザーのアドレスを追加してください。

**3. Stripe の接続:**
- `frontend/components/templates/CurrentFeaturesTemplate` 等の「契約する」ボタンに、バックエンド API への `fetch` 処理を追加してください。


### 3.ユーザーレビュー
- https://web-pj-three.vercel.app/postでinstagramデータを取得できているかのAPIをconsole.logで確認したい
- https://web-pj-three.vercel.app/reviewでGoogleMapsレビューを取得できているかのAPIをconsole.logで確認したい
