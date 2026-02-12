# プラン確認・変更画面 実装詳細設計

## 1. 目的
`docs/requirements.md` および `docs/design.md` に基づき、プラン確認・変更画面の具体的な実装方針を定義する。

## 2. 実装対象ファイル
- `components/templates/CurrentFeaturesTemplate/CurrentFeaturesTemplate.tsx`

## 3. 型定義・定数の追加
コンポーネントファイル内に以下の型とモックデータを定義する。

```typescript
// 契約ステータス型
type PlanStatus = 'active' | 'inactive';

// モックデータ
const PLAN_DATA = {
  name: 'Light プラン',
  price: '30,000',
  currency: '円(税抜)',
  interval: '年契約',
  paymentMethod: 'Web口座振替',
  startDate: '2026/01/01',
  endDate: '2026/12/31',
  nextRenewalDate: '2027/01/01',
};
```

## 4. 状態管理 (State Management)
`CurrentFeaturesTemplate` コンポーネントに以下の State を追加する。

- `planStatus`: `'active'` | `'inactive'` (初期値: `'active'`)
- `isAutoRenewal`: `boolean` (初期値: `true`)
- `isMenuOpen`: `boolean` (初期値: `false`)

## 5. UI変更詳細

### 5.1 ヘッダーセクション
- **ステータスバッジ**:
  - `planStatus === 'active'` の時: 「契約中」 (背景透明, 枠線 `#00A48D`, 文字色 `#00A48D`)
  - `planStatus === 'inactive'` の時: 「未契約」 (背景透明, 枠線 `#9CA3AF`, 文字色 `#9CA3AF`)
- **ミートボールメニュー**:
  - `react-icons/bs` の `BsThreeDotsVertical` を使用。
  - クリックで `isMenuOpen` をトグル。
  - ドロップダウンメニュー（`absolute`）を表示。
    - 項目1: 「解約」 -> `handleCancel` を実行。
    - 項目2: 「自動更新を停止」 -> `handleStopAutoRenewal` を実行。

### 5.2 プラン情報ブロック
- **契約期間**:
  - `planStatus === 'active'` の時のみ表示。
- **更新日**:
  - `planStatus === 'active'` かつ `isAutoRenewal === true` の場合: `nextRenewalDate (自動更新)` を表示。
  - `planStatus === 'active'` かつ `isAutoRenewal === false` の場合: 「自動更新が設定されていません」を表示。
  - `planStatus === 'inactive'` の場合: 非表示。

### 5.3 アクションボタン
- `planStatus === 'inactive'` の場合、「契約する」ボタン（`Button` アトム）を表示する。

## 6. ハンドラロジック

### handleCancel (解約)
1. `planStatus` を `'inactive'` に変更。
2. `isAutoRenewal` を `false` に変更。
3. `isMenuOpen` を `false` に変更。

### handleStopAutoRenewal (自動更新停止)
1. `isAutoRenewal` を `false` に変更。
2. `isMenuOpen` を `false` に変更。

## 7. テスト方針
`test/CurrentFeaturesTemplate.test.tsx` (新規作成想定) にて以下の項目を検証する。

1. **初期表示**: 「契約中」バッジと更新日が表示されていること。
2. **メニュー動作**: ︙クリックでメニューが表示されること。
3. **解約フロー**: 「解約」タップ後、バッジが「未契約」になり、更新日・契約期間が消え、「契約する」ボタンが表示されること。
4. **自動更新停止フロー**: 「自動更新を停止」タップ後、更新日が「自動更新が設定されていません」に変わること。
