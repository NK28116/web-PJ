# プラン確認・変更画面 設計書

## 1. 概要 (Overview)

本ドキュメントは、`docs/requirements.md` に基づく「プラン確認・変更画面」の改修に関する設計書である。
Figmaデザイン（`docs/figma/revew-figma.png`）に準拠し、解約および自動更新停止機能を実装するための基本設計および詳細設計を定義する。

## 2. 基本設計 (Basic Design)

### 2.1 アーキテクチャ方針

- **Frontend Only:** 現時点ではAPI未接続のため、クライアントサイドのみで完結させる。
- **Mock Data Pattern:** 画面表示に必要なデータをモックオブジェクトとして定義し、将来的なAPI連携を見越した構造とする。
- **Component Design:** `CurrentFeaturesTemplate` コンポーネント内にロジックを閉じるが、可読性を考慮してUIパーツ（特にメニュー部分）のロジックを分離・整理する。
- **State Management:** Reactの標準フック (`useState`) を使用し、プランの契約状態 (`active` / `inactive`) と自動更新状態 (`on` / `off`) を管理する。

### 2.2 コンポーネント構成

```
components/templates/CurrentFeaturesTemplate/
├── CurrentFeaturesTemplate.tsx  (メインコンポーネント: 表示と状態管理)
```

※ 今回は単一ファイルの改修とするが、内部で以下の論理的な分割を行う。

1.  **Header Section:** タイトル、ステータスバッジ、ミートボールメニュー（操作メニュー）。
2.  **Plan Info Section:** 契約期間、料金、次回更新日などの詳細情報。
3.  **Action Section:** プラン変更ボタン（既存）、再契約ボタン（解約時）。

### 2.3 データフロー

1.  **Initial State:** コンポーネントマウント時にモックデータをロード（または初期値を設定）。
2.  **User Action:**
    - ミートボールメニュークリック -> メニュー展開。
    - 「解約」クリック -> ステータスを `inactive` に更新。
    - 「自動更新を停止」クリック -> 自動更新フラグを `false` に更新。
3.  **Render Update:** Stateの変更を検知し、表示内容（バッジ、更新日表示、ボタンなど）を再レンダリング。

### 2.4 状態遷移

- **初期状態:** `status: 'active'`, `autoRenewal: true`
- **自動更新停止:** `status: 'active'`, `autoRenewal: false`
    - 表示変化: 次回更新日が非表示、「自動更新が設定されていません」と表示。
- **解約:** `status: 'inactive'`, `autoRenewal: false` (解約時は自動更新も停止とみなす)
    - 表示変化: ステータスが「未契約」、次回更新日非表示、契約期間非表示、「契約する」ボタン出現。

---

## 3. 詳細設計 (Detailed Design)

### 3.1 ファイル構成

変更対象: `components/templates/CurrentFeaturesTemplate/CurrentFeaturesTemplate.tsx`

### 3.2 型定義 (Types)

コンポーネント内で以下の型を定義（または `types/index.ts` に追加検討だが、今回はコンポーネント固有として扱う）。

```typescript
// プランのステータス
type PlanStatus = 'active' | 'inactive';

// プラン情報データの構造
interface PlanData {
  name: string;        // プラン名 (例: "Light プラン")
  price: number;       // 税抜価格
  interval: string;    // 契約期間単位 (例: "年契約")
  startDate: string;   // 契約開始日 (YYYY/MM/DD)
  endDate: string;     // 契約終了日 (YYYY/MM/DD)
  nextRenewalDate: string; // 次回更新日 (YYYY/MM/DD)
}
```

### 3.3 State管理

`CurrentFeaturesTemplate` コンポーネント内で以下のStateを持つ。

```typescript
// 契約ステータス ('active' | 'inactive')
const [planStatus, setPlanStatus] = useState<PlanStatus>('active');

// 自動更新設定 (true: 有効, false: 無効)
const [isAutoRenewal, setIsAutoRenewal] = useState<boolean>(true);

// メニューの開閉状態
const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
```

### 3.4 ロジック詳細

#### (1) モックデータ定義

```typescript
const MOCK_PLAN_DATA: PlanData = {
  name: 'Light プラン',
  price: 30000,
  interval: '年契約', // 現状のUIに合わせて調整
  startDate: '2026/01/01',
  endDate: '2026/12/31',
  nextRenewalDate: '2027/01/01',
};
```

#### (2) ハンドラ関数

- **handleToggleMenu:** メニューの開閉をトグルする。
- **handleCancelPlan:**
    - `setPlanStatus('inactive')` を実行。
    - `setIsAutoRenewal(false)` を実行（解約時は自動更新も無効化）。
    - `setIsMenuOpen(false)` でメニューを閉じる。
- **handleStopAutoRenewal:**
    - `setIsAutoRenewal(false)` を実行。
    - `setIsMenuOpen(false)` でメニューを閉じる。
- **handleReactivate:** (解約状態から戻す場合の実装、要件にはないが「契約する」ボタンの動作として想定)
    - `setPlanStatus('active')`
    - `setIsAutoRenewal(true)`

### 3.5 UI実装詳細 (Figma準拠)

#### ヘッダー (Header)
- **レイアウト:** Flexbox (`justify-between`)
- **左側:** 「現在のプラン」テキスト
- **右側:**
    - プラン名 + ステータスバッジ (`status === 'active'` ? "契約中"(緑) : "未契約"(グレー))
    - ミートボールメニュー (`ThreeDotsIcon` 等を使用)。クリックでドロップダウン表示。

#### ミートボールメニュー (Dropdown)
- **表示条件:** `isMenuOpen === true`
- **位置:** アイコンの直下（`absolute` positioning）。
- **項目:**
    1.  **解約:** `onClick={handleCancelPlan}`
    2.  **自動更新を停止:** `onClick={handleStopAutoRenewal}`
        - ※既に停止中の場合は非表示にするか「自動更新を再開」にする等の考慮が必要だが、要件通り「停止」のみ実装する。

#### 契約情報エリア (Info Area)
- **契約期間:**
    - `status === 'active'` の場合: `startDate` - `endDate` を表示。
    - `status === 'inactive'` の場合: 非表示 (null)。
- **月額料金:**
    - 常に表示: `price` 円(税抜)。
- **支払方法:**
    - 静的表示: "Web口座振替" (要件に変動記述なし)。
- **更新日:**
    - `status === 'active'` かつ `isAutoRenewal === true` の場合: `nextRenewalDate` + " (自動更新)"
    - `status === 'active'` かつ `isAutoRenewal === false` の場合: 非表示にし、「自動更新が設定されていません」というメッセージ（または項目ごと非表示でメッセージエリアを別途設けるか、Figma/要件に従い項目内で文言切り替え）。
        - *要件4:* 「次回更新日を非表示にする」「『自動更新が設定されていません』と表示する」
    - `status === 'inactive'` の場合: 非表示。

#### アクションエリア (Action Area)
- **プラン変更:** 既存の実装を維持。
- **契約再開:**
    - `status === 'inactive'` の時のみ、「契約する」ボタンを表示（場所は要検討、ヘッダー内またはプラン情報下部）。
        - *要件3:* 「『契約する』ボタンを表示する」

### 3.6 使用ライブラリ

- **Icon:** `react-icons/bs` (BsThreeDotsVertical) または `react-icons/md` (MdMoreVert) を使用。
- **Styling:** Tailwind CSS (既存構成維持)。

## 4. 懸念点・確認事項

- **解約後の表示:** 「契約期間は表示しない」とあるが、契約期間中に解約した場合、残りの期間はどう扱うか？（通常は期間満了まで使えるが、本要件では「未契約」即時変更となっているため、即時利用停止のような挙動になる）。
- **メニューの閉じる動作:** メニュー外クリックで閉じる挙動の実装が必要（OverlayまたはEvent Listener）。今回は簡易的にメニュー内クリックで閉じる実装とする。
