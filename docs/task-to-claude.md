# 実装指示書 (Phase 8: ステージング検証 & 実機連携)

## 概要
本フェーズでは、バックエンドに実装済みの外部 API (Google/Instagram/Stripe) をフロントエンドと統合し、実際のデータを用いた検証および決済フローを完遂させてください。**ユーザーレビューにより判明した OAuth 設定不備、ログインフローの拡張、および決済導線の未実装が最優先事項です。**

---

## 1. OAuth 連携・ログイン機能の修正と拡張 (最優先)

### A. Google ソーシャルログインの実装 (新規登録・ログイン対応)
- **要求:** 非ログイン状態からの Google 認証を「新規登録」または「既存ユーザーのログイン」として処理してください。
- **バックエンド (`backend/internal/handlers/oauth.go`):**
    - `GoogleCallback` 内で、Cookie に JWT が存在しない場合のロジックを追加。
    - 取得したメールアドレスで `UserRepository.FindByEmail` を実行。
    - 存在すればそのユーザーで JWT 発行。存在しなければ新規作成後に JWT 発行。
- **フロントエンド (`frontend/pages/login.tsx`):**
    - 「Google でログイン」ボタンを追加。
    - `NEXT_PUBLIC_API_URL + "/api/auth/google/login"` へリダイレクトする処理を実装。

### B. OAuth 設定不備の解消 (インフラ設定)
- **Instagram (Meta):**
    - **症状:** 「このURLのドメインはアプリのドメインに含まれていません」
    - **方法:** Meta for Developers の「アプリドメイン」に `web-pj-three.vercel.app` を追加。「有効なOAuthリダイレクトURI」に `https://backend-611370943102.us-east1.run.app/api/auth/instagram/callback` を登録。
- **Google:**
    - **症状:** 「Google hasn’t verified this app」
    - **方法:** Google Cloud Console の「OAuth 同意画面」で公開ステータスを「アプリを公開」に移行、またはテストユーザーに `wyze.system.inc@gmail.com` を追加。

---

## 2. 決済フローの有効化 (`CurrentFeaturesTemplate`)

- **症状:** 「契約する」ボタンを押しても反応がない、または遷移しない。
- **実装方法:**
    - `frontend/components/templates/CurrentFeaturesTemplate/CurrentFeaturesTemplate.tsx` を修正。
    - 現在の `planStatus` がデフォルトで `'active'` になっているため、未契約状態のユーザーに対して「契約する」ボタンが正しく表示・動作するように調整。
    - `useBilling` フックの `startCheckout(priceId)` を呼び出し、`apiPost` の結果得られた `res.url` へ `window.location.assign(res.url)` で確実に遷移させてください。
    - バックエンドの `STRIPE_SECRET_KEY` および `STRIPE_PUBLIC_KEY` が Secret Manager に登録されているか再確認。

---

## 3. 口コミ管理・レポートの実機連携

### 口コミ管理 (`ReviewTemplate`)
- **実装方法:** 
    - `frontend/hooks/useReviews.ts` を開き、`toReview` 関数が `GoogleReview` 型の `create_time` (ISO文字列) を正しくパースして `Review` 型に変換していることを確認。
    - `submitReply` 後の `setReviews` で、フロントエンドの状態が即座に「返信済み」に更新されるようにロジックを担保してください。

### レポート・ダッシュボード (`ReportTemplate`)
- **実装方法:**
    - `GET /api/reports/summary` を呼び出し、返却された `profile_views`, `total_actions` などの数値をダッシュボードのカードにバインドしてください。
    - Instagram のメディア表示では、`media_url` が存在する場合のみ `img` タグ等で描画するガード処理を追加してください。

---

## 4. 完了定義 (Definition of Done)
1. 未ログイン状態で `login.tsx` から Google 連携し、ダッシュボードへ遷移できること。
2. Instagram 連携時にドメインエラーが出ず、認可画面が表示されること。
3. `current-features` から「契約する」を押し、Stripe の決済画面が表示されること。

## 参考資料
- `docs/review.md` (詳細なエラーメッセージとレビュー)
- `frontend/hooks/useAuth.ts` (認証管理)
- `frontend/hooks/useBilling.ts` (決済処理)
- `frontend/hooks/useReviews.ts` (口コミ処理)
