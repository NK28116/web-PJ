# Claudeへの実装指示書：アカウント情報画面 (AccountTemplate) の改修

本ドキュメントは、`docs/requirements.md` (要件定義書) および `docs/design.md` (設計書) に基づき、アカウント情報画面 (`AccountTemplate.tsx`) の改修を行うための指示書です。

**目的**: Figmaデザイン (`docs/figma/account.png`) に視覚的に完全に一致させ、店舗プロフィール、オーナーアカウント設定、および通知設定の閲覧・編集（通知設定のみ即時保存）を可能にすること。

---

## 1. コンポーネント実装 (Priority: High)

**対象ファイル**: `components/templates/AccountTemplate/AccountTemplate.tsx`

### 1.1 インポートと型定義の追加
- 必要なインポートを追加してください。
  - `useRouter` (next/router)
  - `useState`, `useEffect` (react)
  - アイコン: `MdKeyboardArrowLeft` (戻る), `MdNotifications` (通知), `MdMenu` (ハンバーガー), `MdEdit` (編集、任意)
  - スイッチコンポーネント: 既存のトグルスイッチがあれば使用、なければ自作 (`Switch` 等)。
- 以下の型定義を追加してください。
  ```typescript
  interface AccountData {
    profile: {
      shopName: string;
      address: string;
      phone: string;
    };
    owner: {
      name: string;
      email: string;
    };
    notifications: {
      monthlyReport: boolean;
      competitorAlert: boolean;
      reviewAlert: boolean;
    };
  }
  ```

### 1.2 モックデータの定義
- コンポーネント外または内部に以下の定数を定義してください。
  ```typescript
  const MOCK_ACCOUNT_DATA: AccountData = {
    profile: {
      shopName: 'サンプル店舗 渋谷店',
      address: '東京都渋谷区神南1-2-3',
      phone: '03-1234-5678',
    },
    owner: {
      name: '山田 太郎',
      email: 'taro.yamada@example.com',
    },
    notifications: {
      monthlyReport: true,
      competitorAlert: false,
      reviewAlert: true,
    },
  };
  ```

### 1.3 State管理とフック
- `router` を初期化してください。
- `notifications` State: 通知設定のON/OFF状態を管理。初期値は `MOCK_ACCOUNT_DATA.notifications`。
- `isSaving` State: 保存処理中のフラグ（排他制御用）。
- **追加**: `profile` State: 店舗プロフィール情報を管理。初期値は `MOCK_ACCOUNT_DATA.profile`。
- **追加**: `owner` State: オーナー情報を管理。初期値は `MOCK_ACCOUNT_DATA.owner`。
- **追加**: `isEditingProfile` State: 店舗プロフィール編集モードフラグ。
- **追加**: `isEditingOwner` State: オーナー設定編集モードフラグ。
- **追加**: `menuOpenProfile` State: 店舗プロフィールミートボールメニュー開閉フラグ。
- **追加**: `menuOpenOwner` State: オーナー設定ミートボールメニュー開閉フラグ。

### 1.4 ヘッダー実装 (Figma準拠)
- **レイアウト**:
  - 左上: 「＜ 店舗・アカウント設定」ボタン (`MdKeyboardArrowLeft`)。クリックで `router.back()`。
  - 右上: 通知アイコン (`MdNotifications`) とハンバーガーメニュー (`MdMenu`) を配置（**必須**）。
- **スタイル**:
  - Figmaデザイン（`docs/figma/account.png`）の背景色、高さ、余白を再現してください。

### 1.5 店舗プロフィール情報セクション
- **カードデザイン**: 白背景、角丸、影、適切なPadding。
- **タイトル**: 「店舗プロフィール情報」。
- **右上のメニュー**:
  - ミートボールメニュー (`BsThreeDotsVertical`) を配置。
  - クリックでメニュー（「変更する」）を表示。
  - 「変更する」クリックで `isEditingProfile` を `true` にし、メニューを閉じる。
- **表示モード (`!isEditingProfile`)**:
  - 店舗名 (`profile.shopName`)
  - 住所 (`profile.address`)
  - 電話番号 (`profile.phone`)
- **編集モード (`isEditingProfile`)**:
  - 各項目を `input` フィールドで表示（現在の値が入った状態）。
  - 下部に「キャンセル」「保存」ボタンを表示。
  - 「キャンセル」: `isEditingProfile` を `false` に戻す。
  - 「保存」: 入力された値で `profile` State を更新し、`isEditingProfile` を `false` に戻す（APIコールはモック/ログ出力）。

### 1.6 オーナーアカウント設定セクション
- **カードデザイン**: 同上。
- **タイトル**: 「オーナーアカウント設定」。
- **右上のメニュー**:
  - ミートボールメニュー (`BsThreeDotsVertical`) を配置。
  - クリックでメニュー（「変更する」）を表示。
  - 「変更する」クリックで `isEditingOwner` を `true` にし、メニューを閉じる。
- **表示モード (`!isEditingOwner`)**:
  - 担当者名 (`owner.name`)
  - ログインメールアドレス (`owner.email`)
  - パスワード: 常に `********` (固定表示)。
- **編集モード (`isEditingOwner`)**:
  - 担当者名、メールアドレスを `input` フィールドで表示。
  - パスワード変更は今回はスコープ外（またはパスワード入力欄を表示するが機能させない）。
  - 下部に「キャンセル」「保存」ボタンを表示。
  - 「キャンセル」: `isEditingOwner` を `false` に戻す。
  - 「保存」: 入力された値で `owner` State を更新し、`isEditingOwner` を `false` に戻す（APIコールはモック/ログ出力）。

### 1.7 通知設定セクション (機能実装)
- **カードデザイン**: 同上。
- **タイトル**: 「通知設定」。
- **トグルリスト**:
  - 「月次レポート」 (`monthlyReport`)
  - 「競合変動アラート」 (`competitorAlert`)
  - 「低評価口コミアラート」 (`reviewAlert`)
- **トグル動作 (`handleToggleNotification`)**:
  - 引数: 更新対象のキー（例: `'monthlyReport'`）。
  - 処理フロー:
    1. `isSaving` が `true` なら処理を中断（排他制御）。
    2. `isSaving` を `true` に設定。
    3. Stateを即時更新 (Optimistic Update)。
    4. `setTimeout` (1秒程度) でAPIコールを模倣。
    5. 成功時: `isSaving` を `false` に戻す。
    6. 失敗時（今回は模倣なしで可）: Stateをロールバックし、エラー表示。

---

## 2. スタイリングとフォーマット (Priority: Medium)

- **Figma準拠**: 余白（Padding/Margin）、フォントサイズ、色使いを `docs/figma/account.png` に近づけてください。
- **レスポンシブ**: スマートフォン表示（SP固定）として実装し、横スクロールが発生しないようにしてください。

---

## 3. テスト実装 (Priority: Low)

**作成ファイル**: `test/AccountTemplate.test.tsx` (新規作成)

以下のテストケースを実装してください。
1. **レンダリング確認**: 各セクション（プロフィール、オーナー、通知）が表示されていること。
2. **値の表示確認**: モックデータの値（店舗名、メールアドレスなど）が正しく表示されていること。
3. **トグル動作**: 通知設定のトグルをクリックすると、ON/OFFが切り替わること（UI上の変化）。
4. **戻るボタン**: ヘッダーの戻るボタンをクリックすると `router.back()` が呼ばれること。