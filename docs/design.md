# 設計書 (Design Document)

## 1. 基本設計 (Basic Design)

### 1.1 概要と目的
`docs/requirements.md` に基づき、アカウント情報画面 (`AccountTemplate.tsx`) の改修を行う。
Figmaデザイン (`docs/figma/account.png`) に視覚的に完全に一致させ、店舗プロフィール、オーナーアカウント設定、および通知設定の閲覧・編集（通知設定のみ即時保存）を可能にする。

### 1.2 アーキテクチャ方針
- **Frontend Only**: API未接続のため、モックデータとローカルStateで動作を完結させるが、非同期処理を模倣して将来的なAPI連携に備える。
- **Component-Based**: `AccountTemplate` 内に主要なレイアウトを配置し、各セクション（プロフィール、オーナー設定、通知設定）をコンポーネントまたは論理ブロックとして構成する。
- **Optimistic UI (通知設定)**: トグル切り替え時に即座にUIを更新し、バックグラウンドで保存処理（モック）を実行。失敗時にロールバックする。

### 1.3 処理フロー
1.  **初期表示**: モックデータを非同期的にロードし、各セクションに値を表示。ロード中はローディング表示（必要であれば）。
2.  **画面戻る操作**: ヘッダーの「＜ 店舗・アカウント設定」をタップし、直前の画面へ戻る。
3.  **編集遷移**: プロフィールまたはオーナー設定の「変更する」ボタンで、それぞれの編集画面へ遷移（今回は遷移先の指定がないため、`console.log` またはダミー遷移とする）。
4.  **通知設定変更**: トグルスイッチをタップ -> UI即時反映 -> 保存処理（Mock API）実行 -> 完了。

## 2. 詳細設計 (Detailed Design)

### 2.1 状態管理 (State Definition)
以下のState変数を定義し、画面の状態を制御する。

| State変数 | 型 | 初期値 | 説明 |
| :--- | :--- | :--- | :--- |
| `profile` | `object` | `null` | 店舗名、住所、電話番号 |
| `owner` | `object` | `null` | 担当者名、メールアドレス |
| `notifications` | `object` | `null` | 各通知設定のON/OFF状態 |
| `isSaving` | `boolean` | `false` | 保存処理中フラグ（排他制御用） |

### 2.2 ロジック詳細
- **データ取得 (`fetchAccountData`)**:
    - `setTimeout` を使用して非同期取得を模倣。
- **通知設定更新 (`handleToggleNotification`)**:
    - 引数: 更新対象のキー（例: `'monthlyReport'`）。
    - 処理:
        1. 現在のStateをコピー（ロールバック用）。
        2. UIを即時更新（Optimistic Update）。
        3. `isSaving` を `true` に設定。
        4. Mock API (`saveNotificationSettings`) を呼び出し。
        5. 成功時: `isSaving` を `false` に戻す。
        6. 失敗時: Stateをロールバックし、エラーメッセージを表示。

### 2.3 UI実装方針
- **ヘッダー**:
    - 左上: 「＜ 店舗・アカウント設定」（戻るボタン）。
    - 右上: 通知アイコン、ハンバーガーメニュー（Figma準拠）。
    - スタイル: 固定高さ、背景色、余白をFigmaから正確に再現。
- **セクション共通デザイン**:
    - カード型レイアウト（白背景、角丸、影、Padding）。
    - タイトルとコンテンツの階層構造を明確化。
- **通知設定トグル**:
    - iOSスタイルのスイッチコンポーネントを使用（または自作）。
    - `isSaving` 中は操作を無効化（`disabled`）して連打防止。

### 2.4 データ定義 (Mock)
以下の構造でモックデータを定義する。
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

const MOCK_ACCOUNT_DATA: AccountData = {
  profile: {
    shopName: 'サンプル店舗 渋谷店',
    address: '東京都渋谷区...',
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
