# Claudeへの実装指示書：プラン確認・変更画面の改修

本ドキュメントは、`docs/design.md` (プラン確認・変更画面設計) および `docs/Implementation/PlanConfirmationDetails.md` (実装詳細設計) に基づき、`CurrentFeaturesTemplate` コンポーネントの改修を行うための指示書です。

**目的**: Figmaデザインに準拠し、プランの「解約」および「自動更新停止」機能を疑似的（クライアントサイドState管理）に実装すること。

---

## 1. コンポーネント実装 (Priority: High)

**対象ファイル**: `components/templates/CurrentFeaturesTemplate/CurrentFeaturesTemplate.tsx`

### 1.1 型定義とモックデータの追加
- コンポーネント内に以下の型定義を追加してください。
  ```typescript
  type PlanStatus = 'active' | 'inactive';
  ```
- 以下のモックデータを定義してください（既存のハードコード箇所を置き換える準備）。
  ```typescript
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

### 1.2 State管理の導入
- 以下の `useState` フックを追加し、画面の状態を管理してください。
  1. `planStatus`: 初期値 `'active'`
  2. `isAutoRenewal`: 初期値 `true`
  3. `isMenuOpen`: 初期値 `false` (ミートボールメニュー開閉用)

### 1.3 ヘッダーセクションの改修
- **レイアウト**: Figmaに従い、右上に「現在のプラン名」と「ステータスバッジ」を配置し、そのさらに右に「ミートボールメニュー (︙)」を配置してください。
- **ステータスバッジ**:
  - `planStatus === 'active'` の場合: 「契約中」 (緑色系スタイル)
  - `planStatus === 'inactive'` の場合: 「未契約」 (グレー色系スタイル: `border-gray-400 text-gray-400` 等)
- **ミートボールメニュー**:
  - `react-icons/bs` の `BsThreeDotsVertical` (または同等のアイコン) を使用。
  - クリックで `isMenuOpen` をトグル。
  - `isMenuOpen` が `true` の時、絶対配置(`absolute`)でドロップダウンメニューを表示。
  - **メニュー項目**:
    1. 「解約」: クリックで `handleCancel` を実行。
    2. 「自動更新を停止」: クリックで `handleStopAutoRenewal` を実行。

### 1.4 プラン情報ブロックの表示ロジック変更
- **契約期間**: `planStatus === 'inactive'` の場合は非表示にしてください。
- **更新日**:
  - `active` かつ `autoRenewal === true`: `PLAN_DATA.nextRenewalDate` + " (自動更新)" を表示。
  - `active` かつ `autoRenewal === false`: 「自動更新が設定されていません」という警告テキストを表示。
  - `inactive`: 非表示。

### 1.5 アクションボタンの追加
- プラン変更ブロック（既存）に加え、`planStatus === 'inactive'` の場合のみ表示される「契約する」ボタンを追加してください。
  - クリック時の動作は現時点では定義不要（または `status` を `active` に戻すダミー処理でも可）。

### 1.6 ハンドラ関数の実装
- **`handleCancel`**:
  - `planStatus` -> `'inactive'`
  - `isAutoRenewal` -> `false`
  - `isMenuOpen` -> `false`
- **`handleStopAutoRenewal`**:
  - `isAutoRenewal` -> `false`
  - `isMenuOpen` -> `false`

### 1.7 開発用ユーティリティの追加 (重要)
- **開発モードリセットボタン**:
  - テストおよびデモのため、状態を初期状態（契約中・自動更新ON）に戻すボタンを、画面下部等の目立たない場所に追加してください。
  - このボタンは `active` かつ `autoRenewal === false` の時（自動更新停止中）にのみ表示されるようにしてください。
  - コード内には `DEV_ONLY` というコメントブロックで囲み、リリース時に容易に特定・削除できるようにしてください。
  - ボタン文言例: `[DEV] 自動更新を再開`

---

## 2. テスト実装 (Priority: Medium)

**作成ファイル**: `test/CurrentFeaturesTemplate.test.tsx`

以下のテストケースを実装してください（`@testing-library/react` 使用）。

1. **初期表示の確認**:
   - ステータスが「契約中」であること。
   - 次回更新日が表示されていること。
2. **メニューの動作確認**:
   - ミートボールアイコンをクリックするとメニューが表示されること。
3. **解約フローの確認**:
   - メニューから「解約」をクリック。
   - ステータスが「未契約」に変化すること。
   - 更新日と契約期間が非表示になること。
   - 「契約する」ボタンが表示されること。
4. **自動更新停止フローの確認**:
   - (リセット後) メニューから「自動更新を停止」をクリック。
   - 更新日の表示が「自動更新が設定されていません」に変化すること。
   - ステータスは「契約中」のままであること。

---

## 3. 注意事項
- デザインは `docs/figma/revew-figma.png` (実際にはファイル名 `revew-figma.png` だが文脈的に `current-features` 相当) および `docs/design.md` を参照してください。
- 既存の `CurrentFeaturesTemplate.tsx` の構造（Header, Info Block, Plan Change Block）を維持しつつ、上記ロジックを組み込んでください。
- Tailwind CSS のクラスは既存のスタイルガイド（`text-[16px]` 等のハードコード含む）に合わせてください。