# 実装レビューレポート (口コミ管理機能)

## 1. 概要
本レポートは、`ReviewTemplate` および関連機能の最終検証結果です。
前回レビュー (`2026-02-24`) で指摘された課題修正を含め、全ての機能要件が満たされていることを確認しました。

## 2. 修正確認結果

### 2.1 モジュールインポートエラー
- **状況**: `test/mock/reviewMock` のインポートが解決できない問題。
- **確認**: `ReviewTemplate.tsx`, `ReviewList.tsx` 等のインポートパスが `@/test/mock/reviewMock` に修正され、正しく解決されています。

### 2.2 ステータスタグの表記
- **状況**: 未返信ステータスが「NEW」と表示されていた問題。
- **確認**: `ReviewList.tsx` にて「未返信」（赤色背景）に変更されていることを確認しました。要件定義と一致します。

### 2.3 詳細画像のルーティング
- **状況**: 画像クリック時の遷移先ページが存在しなかった問題。
- **確認**: `pages/review/image/[id].tsx` が新規実装されました。
  - 画像のフルスクリーン表示、閉じるボタン（ブラウザバック）、複数画像のインジケーター表示が正しく実装されています。
  - モックデータとの連携も正常です。

## 3. 全体機能検証

| 機能 | 判定 | 備考 |
|---|---|---|
| **サマリー表示** | ✅ 合格 | 未返信数、評価、返信率、平均時間が正しく表示される。 |
| **リスト表示** | ✅ 合格 | ユーザー情報、評価画像、コメント、ステータスが適切に表示される。 |
| **フィルター** | ✅ 合格 | 全て/返信済み/未返信 の切り替えが動作する。 |
| **並び替え** | ✅ 合格 | 返信推奨順を含む5種類のソートが正常に動作する。 |
| **詳細モーダル** | ✅ 合格 | コメント全文表示、画像表示、返信投稿（ローカルState更新）が動作する。 |
| **画像詳細** | ✅ 合格 | リスト/モーダルからの遷移および表示が正常。 |

## 4. 結論
口コミ管理機能（Review Management）は、機能要件・デザイン要件・指摘事項の修正を含め、完全に実装されました。
本機能の実装を **完了** と判断します。

---

## ユーザーレビュー
- KPI部分にrate画像は必要ありません
- 口コミリストのrate画像が小さすぎます
cssっぽく表すと
```css
.review-card {
  display: flex;
  gap: 24px;
  padding: 20px;
  border-bottom: 1px solid #ddd;
  background: #f7f7f7;
  font-family: sans-serif;
}

/* 左側（星＋点数） */
.review-left {
  display: flex;
  align-items: center;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  color: #f5b301;
  font-size: 18px;
}

.score {
  font-size: 40px;
  font-weight: bold;
  color: #d4a000;
}

/* 右側 */
.review-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ヘッダー部分 */
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ユーザー情報 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #cfd8dc;
  border-radius: 50%;
}

.username {
  font-weight: 600;
}

.date {
  color: #777;
  font-size: 14px;
}

/* 未返信ラベル */
.reply-status {
  border: 1px solid red;
  color: red;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
}

/* レビュー本文 */
.review-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;

  /* 3行で省略 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

```
です
参考画像はtest/mock/reviewList.pngです

- 詳細画面に「返信を投稿する」「閉じる」などfigmaとのずれがある
- figmaは`docs/figma/review3.svg`で，画像部分にGoogleMapの口コミに載せられた画像(ここでは`test/mock/shop-review`内の画像をランダムに付与)，「食事」「雰囲気」「サービス」に該当する星の数(各口コミに付与.現在はmockで設定,)
```
})\
export function StreamlineStar1(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 14 14" {...props}>{/* Icon from Streamline by Streamline - https://creativecommons.org/licenses/by/4.0/ */}<path fill="none" stroke="#888888" strokeLinecap="round" strokeLinejoin="round" d="M7.49 1.09L9.08 4.3a.51.51 0 0 0 .41.3l3.51.52a.54.54 0 0 1 .3.93l-2.53 2.51a.53.53 0 0 0-.16.48l.61 3.53a.55.55 0 0 1-.8.58l-3.16-1.67a.59.59 0 0 0-.52 0l-3.16 1.67a.55.55 0 0 1-.8-.58L3.39 9a.53.53 0 0 0-.16-.48L.67 6.05A.54.54 0 0 1 1 5.12l3.51-.52a.51.51 0 0 0 .41-.3l1.59-3.21a.54.54 0 0 1 .98 0" /></svg>
  )
}
```
や
```svg
<svg width="67" height="18" viewBox="0 0 67 18" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="67" height="18" fill="url(#pattern0_509_206)"/>
<defs>
<pattern id="pattern0_509_206" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_509_206" transform="matrix(0.00488467 0 0 0.0181818 -0.00312076 0)"/>
</pattern>
<image id="image0_509_206" width="206" height="55" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>

```
を用いて星の数を表す

- sub reviewは`#ffa500`で色付け
- Listに画像は表示しなくていいがモーダルには必要
モーダルのCSSは
```css
body {
  font-family: sans-serif;
  margin: 0;
}

/* 背景オーバーレイ */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* モーダル本体 */
.modal {
  background: #f3f3f3;
  width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  border-radius: 8px;
  border: 1px solid #ccc;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ×ボタン */
.close-x {
  position: absolute;
  right: 16px;
  top: 16px;
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
}

/* ヘッダー */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #ccc;
  border-radius: 50%;
}

.username {
  font-weight: bold;
}

.date {
  color: #777;
}

.status {
  border: 2px solid red;
  color: red;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: bold;
}

/* セクション */
.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-weight: bold;
}

/* 星 */
.stars {
  color: #f58220;
  letter-spacing: 2px;
}

/* コメント */
.comment {
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 画像一覧 */
.image-list {
  display: flex;
  gap: 16px;
}

.image-list img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

/* 評価グリッド */
.rating-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* その他 */
.other-grid {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px 16px;
}

/* フッター */
.footer {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.btn-primary {
  background: #1aa382;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.btn-secondary {
  background: white;
  padding: 12px 24px;
  border-radius: 6px;
  border: 1px solid #333;
  cursor: pointer;
}
```

- 「返信を投稿する」ボタンを押すとinput form,「下書き保存」「返信を投稿する」「閉じる」ボタンを配置する
- モーダルで画像をタップすると画像を拡大表示してスワイプで次の画像を表示する