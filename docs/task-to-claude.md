# Claudeへの実装指示書：通知モーダル (NotificationModal) の新規実装

本ドキュメントは、`docs/requirements.md` (要件定義書) および `docs/design.md` (設計書) に基づき、ヘッダーの通知アイコンから表示される通知モーダルを実装するための指示書です。

**目的**: Figmaデザイン (`docs/figma/notify.jpg`) に視覚的に完全に一致させ、未読通知の確認と該当ページへの遷移機能を実装すること。

---

## 1. コンポーネント実装 (Priority: High)

### 1.1 Header の改修
**対象ファイル**: `components/organisms/Header/Header.tsx`
- **State追加**:
  - `isModalOpen`: モーダルの表示/非表示フラグ。
  - `notifications`: 通知データの配列。初期値としてモックデータをセット。
- **通知アイコン (`MdNotifications`) の更新**:
  - 未読通知が1件以上ある場合、スタイルを白黒反転（またはFigma指定の強調色）に変更。
  - アイコンクリック時に `isModalOpen` を `true` に変更。
- **モーダルの配置**:
  - `Header` 内（または適切なラップ要素内）に `NotificationModal` を配置し、Propsを渡す。

### 1.2 NotificationModal の新規作成
**対象ファイル**: `components/organisms/Modal/NotificationModal.tsx`
- **レイアウト**:
  - モーダル外（背景）: 半透明グレーのオーバーレイ。クリックで `onClose` を実行。
  - モーダル本体: 画面中央固定、幅・高さ75%。
  - 内部スクロール: 通知リストがモーダル高さを超える場合のみ、内部で縦スクロールを有効にする。
- **表示内容**:
  - 上部に「お知らせ ○件」を表示（未読件数を計算）。
  - 通知が1件もない（または全て既読で削除対象外だが表示なしの場合）は「お知らせはありません」を表示。
  - `notifications` 配列を map し、`NotificationItem` を表示。
- **背景スクロール禁止**:
  - モーダル表示時に `body` の `overflow: hidden` を制御する。

### 1.3 NotificationItem の新規作成
**対象ファイル**: `components/molecules/NotificationItem/NotificationItem.tsx`
- **表示内容**:
  - 店舗名 (`storeName`)
  - 通知日時 (`receivedAt` をロジックに基づきフォーマット)
  - 通知本文 (`content`)
  - 「確認する」ボタン
- **スタイリング**:
  - 既読 (`isRead: true`) の場合、背景をグレーアウトする。

---

## 2. ロジック実装 (Priority: High)

### 2.1 日時フォーマットロジック
- 以下のルールで日時を文字列に変換する関数を実装してください。
  - 1日未満: 「○分前」または「○時間前」
  - 1日以上3日未満: 「○日前」
  - 3日以上: 「yyyy/mm/dd」

### 2.2 通知確認と遷移
- 「確認する」ボタン押下時の `handleConfirm` を実装してください。
  - `router.push(redirectPath)` を実行。
  - **バリデーション**: `redirectPath` が `/` で始まり、`http` を含まないことを確認。
  - **成功時**: `isRead` を `true` に更新し、未読件数を再計算。
  - **失敗時**: モーダル内に「確認できませんでした」とエラーメッセージを表示。

---

## 3. データ定義 (Mock)
- 以下の型とモックデータ（5件程度、未読/既読混在）を定義して使用してください。
```typescript
type Notification = {
  id: string;
  storeName: string;
  content: string;
  receivedAt: Date;
  isRead: boolean;
  redirectPath: string;
};
```

---

## 4. スタイリングとフォーマット (Priority: Medium)

- **Figma準拠**: `docs/figma/notify.jpg` に基づき、フォントサイズ、余白、色を忠実に再現してください。
- **レスポンシブ**: スマートフォン表示のみをターゲットとし、横スクロールを禁止してください。

---

## 5. テスト実装 (Priority: Low)

**対象ファイル**: `test/NotificationModal.test.tsx` (新規作成)
1. **モーダル開閉**: 通知アイコンクリックでモーダルが表示され、背景クリックで閉じること。
2. **未読件数表示**: 正しい未読件数が「お知らせ ○件」として表示されていること。
3. **既読更新**: 「確認する」クリック後に背景がグレーアウトし、未読件数が減ること。
4. **バリデーション**: 不正な `redirectPath` の場合に遷移せずエラーが表示されること（必要であればモックで対応）。
