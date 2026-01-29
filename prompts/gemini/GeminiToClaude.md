# Claudeへの実装指示書

**ゴール**: `report` ページの `AiTab` に、「Coming Soon」メッセージを要件通りに表示する。

---

### Task 1: フォントの導入

**対象ファイル**: `styles/globals.css`

**内容**:
Google Fontsから `Kdam Thmor Pro` と `Tiro Telugu` を `@import` するCSSをファイルの先頭に追加してください。

```diff
+ @import url('https://fonts.googleapis.com/css2?family=Kdam+Thmor+Pro&family=Tiro+Telugu&display=swap');
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
```

---

### Task 2: Tailwind CSS の設定変更

**対象ファイル**: `tailwind.config.js`

**内容**:
`theme.extend.fontFamily` に、導入したフォントを追加してください。

```diff
   theme: {
     extend: {
+      fontFamily: {
+        'kdam-thmor-pro': ['"Kdam Thmor Pro"', 'sans-serif'],
+        'tiro-telugu': ['"Tiro Telugu"', 'serif'],
+      },
       backgroundImage: {
         'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
         'gradient-conic':
```

---

### Task 3: コンポーネントの実装

**対象ファイル**: `components/templates/ReportTemplate/AiTab.tsx`

**内容**:
`AiTab` コンポーネントの内容を、指定されたスタイルで「Coming Soon」メッセージを表示するように変更してください。

```diff
- const AiTab = () => {
-  return (
-    <div>
-      <p>AI</p>
-    </div>
-  )
- }
-
- export default AiTab

+ const AiTab = () => {
+  return (
+    <div className="flex h-full flex-col items-center justify-center text-center">
+      <div className="mb-4">
+        <p className="font-kdam-thmor-pro text-[32pt] text-[#00A48D]">COMING SOON...</p>
+      </div>
+      <div>
+        <p className="font-tiro-telugu text-[14pt] text-black">現在開発中です。</p>
+      </div>
+    </div>
+  )
+ }
+
+ export default AiTab
```

---
### Task 4: 動作確認テスト

**内容**:
ローカル環境で開発サーバーを起動し、以下の項目を **人間の目** で確認してください。

**手順**:
1.  `npm run dev` コマンドで開発サーバーを起動する。
2.  ブラウザで `http://localhost:3000/report` にアクセスする。

**確認項目**:

1.  **レポートタブの初期表示**
    - [ ] ページを開いたとき、デフォルトで「レポート」タブの内容が表示されていること。

2.  **AIタブへの切り替え**
    - [ ] 「AI」タブをクリックすると、画面の内容が切り替わること。

3.  **AIタブの表示内容**
    - [ ] "COMING SOON..." というテキストが画面中央に表示されていること。
    - [ ] "COMING SOON..." のフォントが `Kdam Thmor Pro` になっていること。（特徴的なデザインフォント）
    - [ ] "COMING SOON..." の文字色が緑色 (`#00A48D`) になっていること。
    - [ ] "現在開発中です。" というテキストが "COMING SOON..." の下に表示されていること。
    - [ ] "現在開発中です。" のフォントが `Tiro Telugu` になっていること。（セリフ体フォント）
    - [ ] "現在開発中です。" の文字色が黒色 (`#000000`) になっていること。

4.  **レポートタブへの再切り替え**
    - [ ] 再度「レポート」タブをクリックすると、元のレポート画面に戻ること。

---
