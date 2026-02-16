# 設計書 (Design Document)

## 1. 基本設計 (Basic Design)

### 1.1 概要と目的
`docs/requirements.md` に基づき、ヘッダーの通知アイコン押下時に表示される通知モーダルを新規に実装する。
Figmaデザイン (`docs/figma/notify.jpg`) との視覚的な一致を最優先とし、ユーザーに未読の通知を一覧表示し、各通知へのアクセスを容易にすることを目的とする。

### 1.2 アーキテクチャ方針
- **Frontend Only**: API未接続のため、モックデータとローカルStateで動作を完結させる。状態は画面リロードで初期化される。
- **Component-Based**: モーダル全体を管理するコンテナコンポーネントと、個々の通知を表示するプレゼンテーショナルコンポーネントに分割する。
- **Atomic Design**: 既存の `atoms` コンポーネント（Button, Icon, Text など）を積極的に再利用する。
- **State Management**: `useState` を利用してモーダルの表示状態と通知データの状態を管理する。

### 1.3 コンポーネント分割案

| コンポーネント名 | 種類 | 配置場所 | 責務 |
| :--- | :--- | :--- | :--- |
| `Header` | Organism | `components/organisms/Header` | (既存) MdNotificationsアイコンの表示と、未読件数に応じたスタイル変更、モーダル表示トリガーの管理。 |
| `NotificationModal` | Organism | `components/organisms/Modal` | モーダル全体のレイアウト、表示/非表示の制御、背景のオーバレイ、通知リストのラップ。 |
| `NotificationItem` | Molecule | `components/molecules/NotificationItem` | 個々の通知情報の表示（店舗名、日時、本文）、および「確認する」ボタンの配置。 |

### 1.4 処理フロー
1.  **初期表示**:
    *   `Header` コンポーネントがマウントされる。
    *   通知データ（モック）をフェッチし、未読件数を計算する。
    *   未読件数が1件以上ある場合、`MdNotifications` アイコンを強調表示する。
2.  **モーダル表示**:
    *   ユーザーが `MdNotifications` アイコンをクリックする。
    *   `Header` のStateが更新され、`NotificationModal` が表示される。
    *   背景はスクロールが禁止される。
3.  **通知確認**:
    *   ユーザーが `NotificationItem` 内の「確認する」ボタンをクリックする。
    *   `router.push` で指定された `redirectPath` へ画面遷移を試みる。
    *   **成功時**:
        *   対象通知の `isRead` を `true` に更新する。
        *   未読件数を再計算し、`Header` のアイコン表示とモーダル内の件数表示を更新する。
        *   対象通知の背景をグレーアウトする。
    *   **失敗時**:
        *   モーダル内にエラーメッセージ「確認できませんでした」を表示する。
4.  **モーダル非表示**:
    *   ユーザーがモーダル外の背景をクリックする。
    *   `NotificationModal` が非表示になる。
    *   背景のスクロール禁止が解除される。

## 2. 詳細設計 (Detailed Design)

### 2.1 状態管理 (State Definition)
`Header` コンポーネント、および `NotificationModal` コンポーネントで以下のState変数を定義する。

**`Header.tsx`**
| State変数 | 型 | 初期値 | 説明 |
| :--- | :--- | :--- | :--- |
| `isModalOpen` | `boolean` | `false` | 通知モーダルの表示状態 |
| `notifications` | `Notification[]` | `[]` | 全通知データのリスト |
| `unreadCount` | `number` | `0` | 未読通知の件数 |

**`NotificationModal.tsx`** (Props経由で `notifications` を受け取る)
| State変数 | 型 | 初期値 | 説明 |
| :--- | :--- | :--- | :--- |
| `errorMessage` | `string` | `''` | 画面遷移失敗時のエラーメッセージ |

### 2.2 コンポーネント Props

**`NotificationModal.tsx`**
| Prop名 | 型 | 必須 | 説明 |
| :--- | :--- | :--- | :--- |
| `isOpen` | `boolean` | ✅ | モーダルの表示状態 |
| `onClose` | `() => void` | ✅ | モーダルを閉じるためのコールバック関数 |
| `notifications` | `Notification[]` | ✅ | 表示する通知データの配列 |
| `onUpdateNotification` | `(id: string) => void` | ✅ | 通知を既読にするためのコールバック関数 |

**`NotificationItem.tsx`**
| Prop名 | 型 | 必須 | 説明 |
| :--- | :--- | :--- | :--- |
| `notification` | `Notification` | ✅ | 表示する単体の通知データ |
| `onConfirm` | `(notification: Notification) => Promise<void>` | ✅ | 「確認する」ボタン押下時の処理 |

### 2.3 ロジック詳細
- **日時表示ロジック (`formatDate`)**:
    - `Date` オブジェクトを受け取り、現在時刻との差を計算する。
    - 差が1日未満なら「○分前」「○時間前」。
    - 差が1日以上3日未満なら「○日前」。
    - 差が3日以上なら「yyyy/mm/dd」。
- **通知確認ロジック (`handleConfirm`)**:
    - `NotificationItem` 内で `onConfirm` Propとして実行される。
    - `try-catch` ブロックで `router.push(redirectPath)` を実行する。
        - `redirectPath` のバリデーション（'/'で始まるか、'http'を含まないか）を行う。
    - **成功時**: `onUpdateNotification(id)` を呼び出し、親コンポーネントのStateを更新する。
    - **失敗時**: `errorMessage` Stateを更新し、モーダル内にメッセージを表示する。

### 2.4 データ定義 (Mock)
`docs/requirements.md` で定義されたデータ構造を使用する。

```typescript
type Notification = {
  id: string;
  storeName: string;
  content: string;
  receivedAt: Date;
  isRead: boolean;
  redirectPath: string;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  // ... モックデータ
];
```