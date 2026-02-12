# Claudeへの実装指示書：お支払い情報画面 (BillingTemplate) の改修

本ドキュメントは、`docs/requirements.md` (要件定義書) および `docs/design.md` (設計書) に基づき、お支払い情報画面 (`BillingTemplate.tsx`) の改修を行うための指示書です。

**目的**: Figmaデザイン (`docs/figma/Billing.png`) に準拠し、クレジットカード情報の表示・編集（UIのみ）、お支払い履歴の確認、PDF出力機能（モック）を実装すること。

---

## 1. コンポーネント実装 (Priority: High)

**対象ファイル**: `components/templates/BillingTemplate/BillingTemplate.tsx`

### 1.1 インポートと型定義の追加
- 必要なインポートを追加してください。
  - `useRouter` (next/router)
  - `useState` (react)
  - アイコン: `MdKeyboardArrowLeft` (戻るボタン用), `MdCreditCard` (カードアイコン用, 任意), `MdEdit` (編集アイコン用, 任意), `MdPictureAsPdf` (PDFアイコン用, 任意)
- 以下の型定義を追加してください。
  ```typescript
  interface PaymentHistory {
    id: string;
    date: string; // YYYY/MM/DD
    amount: number;
  }

  interface CardInfo {
    brand: string;
    last4: string;
    expiry: string; // MM/YY
  }
  ```

### 1.2 モックデータの定義
- コンポーネント外または内部に以下の定数を定義してください。
  ```typescript
  const MOCK_CARD_INFO: CardInfo = {
    brand: 'Visa',
    last4: '1234',
    expiry: '12/28',
  };

  const MOCK_PAYMENT_HISTORY: PaymentHistory[] = [
    { id: '1', date: '2026/01/01', amount: 33000 },
    { id: '2', date: '2025/12/01', amount: 33000 },
    { id: '3', date: '2025/11/01', amount: 33000 },
  ];

  const MOCK_NEXT_PAYMENT = {
    date: '2026/02/01',
    amount: 33000,
  };
  ```

### 1.3 State管理とフック
- `router` を初期化してください: `const router = useRouter();`
- カード編集モーダルの開閉状態を管理してください: `const [isEditModalOpen, setIsEditModalOpen] = useState(false);`

### 1.4 ヘッダー実装
- 既存の「ご請求内容」ヘッダーを置き換えてください。
- 左上に「＜ お支払い情報」ボタンを配置してください。
  - アイコン: `MdKeyboardArrowLeft`
  - アクション: `onClick={() => router.back()}`
  - スタイル: テキストボタン形式、黒またはダークグレー。

### 1.5 クレジットカード情報セクション
- タイトル「登録クレジットカード」を表示してください。
- カード情報を表示するカードUIを作成してください。
  - ブランド名 (`MOCK_CARD_INFO.brand`)
  - マスクされた番号 (`**** **** **** ${MOCK_CARD_INFO.last4}`)
  - 有効期限 (`有効期限: ${MOCK_CARD_INFO.expiry}`)
- 「カード情報を変更する」ボタンを配置してください。
  - クリックで `setIsEditModalOpen(true)`。

### 1.6 お支払い履歴セクション
- タイトル「お支払い履歴」を表示してください。
- 「領収書 / PDF」ボタンを**セクションタイトルの右側**に1つだけ配置してください（各行には配置しないでください）。
  - クリック時に以下のフォーマットで全履歴と合計金額を `console.log` に出力してください（モック）。
    ```text
    領収書.pdf
    2026年01月01日 ¥33,000
    2025年12月01日 ¥33,000
    2025年11月01日 ¥33,000
    -----------------------
    合計         ¥99,000
    ```
  - **追加**: `console.log` の後に `window.alert('領収書(PDF)を出力しました。コンソールを確認してください。')` を実行し、開発者ツールを開かなくても動作確認ができるようにしてください。
    - ※将来的に `docs/template.pdf` を使用した税務署提出用フォーマットに対応する予定です。

### 1.7 次回お支払い表示
- 履歴リストの下部に配置してください。
- スタイル: 中央寄せ、グレーアウト (`text-gray-500` / `text-sm`)。
- 内容:
  - `MOCK_NEXT_PAYMENT` がある場合: `次回のお支払い：${MOCK_NEXT_PAYMENT.date} ¥${formatCurrency(MOCK_NEXT_PAYMENT.amount)}`
  - ない場合: 「次回のお支払い予定はありません」

### 1.8 カード編集モーダル (UIのみ)
- `isEditModalOpen` が `true` の時に表示される簡易モーダルを実装してください。
- **オーバーレイ**: モーダル背景（黒半透明部分）をクリックした際にもモーダルが閉じる (`setIsEditModalOpen(false)`) ように実装してください。
- 内容:
  - タイトル「カード情報の変更」
  - ダミーの入力フィールド（カード番号、有効期限、CVC）
  - 「保存する」ボタン（クリックで `setIsEditModalOpen(false)`）
  - 「キャンセル」ボタン（クリックで `setIsEditModalOpen(false)`）

---

## 2. スタイリングとフォーマット (Priority: Medium)

- **数値フォーマット**: 金額は必ずカンマ区切り、円マーク付きで表示してください。
- **日付フォーマット**: `YYYY/MM/DD` 形式を厳守してください。
- **レスポンシブ**: スマートフォン表示に最適化し、横スクロールが発生しないようにしてください。

---

## 3. テスト実装 (Priority: Low)

**作成ファイル**: `test/BillingTemplate.test.tsx` (新規作成)

以下のテストケースを実装してください。
1. **レンダリング確認**: ヘッダー、カード情報、履歴リストが正しく表示されること。
2. **戻るボタン**: 「＜ お支払い情報」クリックで `router.back()` が呼ばれること。
3. **モーダル動作**: 「カード情報を変更する」クリックでモーダルが開き、「キャンセル」で閉じること。
4. **PDFボタン**: クリックでログ出力（またはハンドラ呼び出し）が行われること。
