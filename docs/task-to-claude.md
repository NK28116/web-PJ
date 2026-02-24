# Claudeへの実装指示書：投稿詳細・編集機能の実装

本ドキュメントは、`docs/requirements.md` に定義された「投稿を編集」機能を実装するための詳細指示書です。
現状のコードベース (`components/templates/PostTemplate/`) を解析し、不足しているデータモデルの拡張や具体的なUI挙動を補完しています。

## 0. 実装方針：モックデータの利用 (Priority: High)

本実装では、API連携は行わず、すべて**モックデータに対する操作**として完結させてください。
- **データソース**: `PostTemplate.tsx` 内の `useState` で管理されている `posts` 配列を「データベース」と見なして操作してください。
- **永続化**: 編集や削除の結果は、親コンポーネントの状態（`setPosts`）に反映させることで疑似的に永続化してください。ブラウザのリロードで消えてしまっても問題ありません。

## 1. データモデルの拡張 (Priority: High)

**対象ファイル**: `components/templates/PostTemplate/PostTemplate.tsx` (および型定義箇所)

現状の `Post` 型には画像データを保持するフィールドがありません（`bgColor`のみ）。要件「画像エリアの画像を変更できる」を満たすため、モデルを拡張してください。

- **型定義の変更**:
  ```typescript
  export interface Post {
    // ...既存のプロパティ
    imageUrl?: string; // 追加: 画像のURL (ローカルプレビュー用blob URL含む)
  }
  ```
- **モックデータの更新**:
  - 画像アセットの場所: `test/mock/post/`
    - 利用可能なファイル: `privatePost.png`, `publicPost.png`
  - `generateMockPosts` 関数を修正し、一部の投稿にこれらの画像パスを設定してください。
  - **注意**: `test/` ディレクトリ内の画像は Next.js の `public/` 配下ではないため、直接のURL文字列（例: `/test/...`）では表示されない可能性があります。必要に応じて `import` 文でアセットとして読み込むか、表示可能な形式に変換して使用してください。
  - 画像がない場合は既存通り `bgColor` を使用するフォールバックロジックを維持してください。

## 2. 親コンポーネントの改修 (Priority: High)

**対象ファイル**: `components/templates/PostTemplate/PostTemplate.tsx`

詳細モーダルからデータ更新・削除を受け取るためのハンドラを実装し、状態 (`posts`) を更新するロジックを追加してください。

- **追加ロジック**:
  - `handleUpdatePost(updatedPost: Post)`: IDが一致する投稿を更新データで置換する。
  - `handleDeletePost(postId: number)`: IDが一致する投稿をリストから削除し、モーダルを閉じる。
- **Propsの伝達**:
  - `PostDetailModal` に上記2つの関数を渡せるようPropsを追加してください。

## 3. PostDetailModal コンポーネントの改修 (Priority: High)

**対象ファイル**: `components/templates/PostTemplate/PostDetailModal.tsx`

要件に基づき、閲覧モードと編集モードの切り替え、および各編集機能を実装してください。

### 3.1 Propsの拡張
```typescript
interface PostDetailModalProps {
  // ...既存
  onUpdate: (post: Post) => void; // 追加
  onDelete: (postId: number) => void; // 追加
}
```

### 3.2 内部Stateの管理
- `isEditing`: boolean - 編集モードかどうか。
- `editingPost`: Post - 編集中のデータ（一時保存用）。
- `previewImage`: string | null - 画像変更時のプレビュー用URL。

### 3.3 UI実装詳細

#### A. 閲覧モード (isEditing === false)
- 基本的に既存通り。
- **画像表示**: `post.imageUrl` があれば `img` タグで表示、なければ `bgColor` の `div` を表示。
- **フッター**: 「投稿を編集」ボタン押下で `isEditing = true` にし、`editingPost` を初期化。

#### B. 編集モード (isEditing === true)
- **画像エリア**:
  - クリックまたは「画像を変更」ボタンでファイル選択ダイアログ (`input type="file"`) を起動。
  - 選択された画像を `URL.createObjectURL` でプレビュー表示。
- **タイトル**: `<input>` で編集可能にする。
- **本文**: `<textarea>` (または `rows` を指定したInput) で編集可能にする。
- **タグ**: `<input>` で文字列として編集可能にする（例: "#タグ1 #タグ2"）。
- **フッターボタン**:
  1. **「編集内容を保存する」**:
     - `editingPost` の内容で `onUpdate` を実行。
     - 編集モード終了。
  2. **「編集を一時保存する」** (元の「非表示にする」ボタン位置):
     - 仕様補完: 投稿のステータスを「非表示」に変更した上で、編集内容を保存 (`onUpdate`) する。
     - ユーザーへのフィードバック（トースト等）があれば望ましい。

#### C. 特殊なボタン挙動と確認フロー
- **ヘッダーの閉じるボタン (×)**:
  - **UI変更**: 編集モード中 (`isEditing === true`) は、アイコンを「ゴミ箱」に変更し、色を赤系（例: `text-red-500`）にして削除機能であることを明確にしてください。
  - **要件**: 編集モード時は「投稿を削除する」機能になる。
  - **安全策**: 誤操作防止のため、押下時に**「本当にこの投稿を削除しますか？」という確認ダイアログ（ブラウザ標準のconfirm等でも可、できればModal上のオーバーレイ）を表示**し、承認された場合のみ `onDelete` を実行してください。
- **モーダル外部タップ / 背景クリック**:
  - **要件**: 「編集をキャンセルしますか？」モーダルを表示。
  - **実装**: 「はい」で編集破棄して閲覧モードへ（またはモーダル閉じる）、「いいえ」で編集継続。

## 4. 一覧・グリッド表示の画像対応 (Priority: High)

**対象ファイル**: 
- `components/templates/PostTemplate/PostListItem.tsx`
- `components/templates/PostTemplate/PostGridItem.tsx`

詳細モーダルと同様に、一覧およびグリッド表示でも `post.imageUrl` を表示するように修正してください。

- **実装内容**:
  - `post.imageUrl` が存在する場合、既存の `bgColor` 指定の `div` 内（または代替として） `img` タグを使用して画像を表示してください。
  - **スタイリング**:
    - `object-cover` を使用し、既存の枠線やサイズ（ListItemは `w-[128px] h-[160px]`、GridItemは `aspect-square`）に合わせて適切に拡大縮小・トリミングして表示すること。
    - 画像がない場合は、既存の `bgColor` による表示をフォールバックとして維持してください。
  - **非表示ステータスの扱い**:
    - `isHidden` 時の不透明度（`opacity-60`）やオーバーレイ（`bg-black/30`）が画像に対しても正しく適用されるようにしてください。

## 5. 日本語入力（IME）の不具合修正 (Priority: High)

**対象ファイル**: `components/templates/PostTemplate/PostDetailModal.tsx`

編集モードでの入力時、日本語の変換確定まで文字が表示されない、あるいは入力が消えるといった不具合を修正してください。

- **原因と対策**:
  - `editingPost` オブジェクト全体を `onChange` ごとに更新すると、コンポーネントの再描画負荷やオブジェクトの再生成により IME の挙動が不安定になることがあります。
  - **個別ステートの導入**: タイトル、本文、タグの各入力項目について、`useState<string>` を個別に用意してください（例: `editTitle`, `editContent`, `editTags`）。
  - **入力中の処理**: `onChange` ではこれらの個別ステートのみを更新するようにします。
  - **保存時の処理**: 「保存する」または「一時保存する」ボタンが押された際に、これらの個別ステートの値を `editingPost` (または `onUpdate` に渡すオブジェクト) にマージして反映させてください。

## 6. 留意事項
- 画像アップロードはフロントエンドのみのモック実装（Blob URL使用）で構いません。
- スタイルは既存のTailwind CSSクラスを流用し、デザイン崩れがないようにしてください。