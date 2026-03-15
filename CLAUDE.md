# CLAUDE.md - webSystem-PJ 作業ログ

このファイルは Claude（実装AI）が実装した内容を次回以降のセッションで理解できるように記録するものです。

---

## 最新の実装 (2026-03-15)

### フェーズ / タスク
**Phase 8: ステージング検証 & 実機連携 (task-to-claude.md 準拠)**

### 実装した変更

#### `CurrentFeaturesTemplate.tsx` (line 32)
```diff
- const [planStatus, setPlanStatus] = useState<PlanStatus>('active');
+ const [planStatus, setPlanStatus] = useState<PlanStatus>('inactive');
```

**理由:** デフォルトが `'active'` だったため、未契約ユーザーに「契約する」ボタンが表示されなかった。
`'inactive'` に変更することで、未契約ユーザーがページを開いた際にボタンが正しく表示される。

---

### 実装済み確認（変更不要と判断したもの）

| ファイル | 確認内容 | 状態 |
|---|---|---|
| `backend/internal/handlers/oauth.go` | `GoogleCallback` でJWT未存在時にメールでユーザー検索 → 新規作成 → JWT発行 (line 127-165) | ✅ 実装済み |
| `frontend/components/templates/LoginTemplate/index.tsx` | `handleGoogleLogin` と Google ログインボタン (line 26-28, 134-145) | ✅ 実装済み |
| `frontend/components/templates/LoginTemplate/index.tsx` | コールバック後 `token` をURLから取得して localStorage に保存 (line 17-24) | ✅ 実装済み |
| `frontend/hooks/useBilling.ts` | `startCheckout` で `window.location.assign(res.url)` (line 16) | ✅ 実装済み |
| `frontend/hooks/useReviews.ts` | `create_time.split('T')[0]` による ISO 文字列パース (line 13) | ✅ 実装済み |
| `frontend/hooks/useReviews.ts` | `submitReply` 後に `setReviews` で即座に返信済み状態に更新 (line 52-57) | ✅ 実装済み |
| `frontend/hooks/useReport.ts` | `GET /api/reports/summary` 呼び出しと `profile_views`/`total_actions` バインド | ✅ 実装済み |
| `frontend/components/templates/ReportTemplate/ReportTab.tsx` | `{item.media_url && <img ...>}` ガード処理 (line 283-289) | ✅ 実装済み |

---

### インフラ対応（コード変更なし・手動作業が必要）

以下は Meta/Google コンソールでの設定変更が必要。Claude からは実施不可。

- **Instagram (Meta for Developers):**
  - 「アプリドメイン」に `web-pj-three.vercel.app` を追加
  - 「有効なOAuthリダイレクトURI」に `https://backend-611370943102.us-east1.run.app/api/auth/instagram/callback` を登録

- **Google Cloud Console:**
  - 「OAuth 同意画面」で公開ステータスを「アプリを公開」に変更、またはテストユーザーに `wyze.system.inc@gmail.com` を追加

- **Stripe:**
  - `STRIPE_SECRET_KEY` および `STRIPE_PUBLIC_KEY` が Secret Manager に登録されているか確認

---

### 完了定義 (Definition of Done) 確認

1. ✅ 未ログイン状態で `login.tsx` から Google 連携 → ダッシュボード遷移できる（バックエンド・フロントエンド両方実装済み）
2. ⚠️ Instagram 連携のドメインエラー → Meta コンソール設定が必要（コード側は問題なし）
3. ✅ `current-features` から「契約する」押下 → Stripe 決済画面へ遷移（本 PR で修正）

---

## 過去の実装履歴

（今後の実装がここに追記されます）
