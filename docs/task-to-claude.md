# 実装指示書 (Phase 11: 課金・サブスクリプション基盤 / Stripe)

## 概要
Stripe を利用した決済基盤を構築してください。フロントエンドでのカード情報管理（登録・更新・削除）と、Stripe Checkout によるサブスクリプション契約フロー、および Webhook によるユーザー状態の自動更新を実装します。

---

## 1. カード情報管理 (Frontend / Stripe Elements)

### 要求事項
- **`BillingTemplate.tsx` の完成**: 
  - Stripe Elements (`CardElement` または `PaymentElement`) を組み込み、カード情報の登録・変更を行えるようにする。
  - **SetupIntent** を利用して、決済を伴わないカード保存フローを実装。
- **カード CRUD**:
  - 保存済みカードの一覧表示、およびデフォルト決済手段の削除機能を実装。
- **UX**: 登録中、削除中のローディング状態と、成功・失敗のフィードバックを表示。

### 修正/新規ファイル
- `frontend/components/templates/BillingTemplate/BillingTemplate.tsx`
- `frontend/hooks/useBilling.ts`

---

## 2. サブスクリプションフロー (Backend / Checkout)

### 要求事項
- **Checkout Session**: 
  - ユーザーがプランを選択した際、Stripe Checkout 画面へ遷移させる API を実装。
  - `success_url` / `cancel_url` をフロントエンドの `/billing?success=true` 等に設定。
- **Portal Session**:
  - 契約済みユーザーがプラン変更や請求履歴確認を行えるよう、Stripe Customer Portal への遷移 API を実装。

### 修正/新規ファイル
- `backend/internal/service/stripe_service.go`
- `backend/internal/handlers/billing.go` (または `report.go` 等に集約)

---

## 3. Webhook ハンドリング & DB同期 (Backend)

### 要求事項
- **署名検証**: `STRIPE_WEBHOOK_SECRET` を用いたリクエストの正当性検証。
- **ユーザー状態の更新**:
  - `customer.subscription.created` / `updated` / `deleted`: ユーザーのプラン区分や Stripe Customer ID を DB (`users` テーブル) に反映。
  - 契約終了時は権限を `free` または適切な初期状態へ戻す処理。

---

## 補足

設定するプランは以下の通り

```
〈Light プラン〉
→連携重視
月額費用：
・ベータ版：10,000円　※事例獲得最優先
・立ち上げ期：19,800円（契約10〜30件）※最初の事例が出た段階
・成長期：24,800円（契約30件以上）※ROI実績が3件以上証明できた段階

〈Basicプラン〉
→自動化重視
月額費用：
・ベータ版：29,800円　※事例獲得最優先
・立ち上げ期：39,800円（契約10〜30件）※最初の事例が出た段階
・成長期：49,800円（契約30件以上）※ROI実績が3件以上証明できた段階

〈Proプラン〉
→戦略重視
月額費用：
・ベータ版：59,800円　※事例獲得最優先
・立ち上げ期：79,800円（契約10〜30件）※最初の事例が出た段階
・成長期：99,800円（契約30件以上）※ROI実績が3件以上証明できた段階
```


---

## 4. 領収書対応 (検証フェーズ)

### 要求事項
- **Stripe デフォルト機能の利用**:
  - 決済完了時に Stripe が自動送信する領収書メールの設定を確認。
  - バックエンドでは、領収書発行フラグ等を管理する必要はない（Stripe側に委ねる）。

---

## 完了定義 (Definition of Done)
1. **カード登録**: フロントエンドからカードを登録し、Stripe Dashboard 上で Customer に紐付いていることを確認。
2. **サブスクリプション**: テスト決済を行い、DB のユーザー情報が自動で更新（プラン昇格）されること。
3. **Webhook 検証**: Stripe CLI 等を用いて Webhook が正常に処理され、DB 整合性が保たれていること。
4. **テスト**: `docs/requirements.md` のセキュリティ・境界値要件を満たしていること。
