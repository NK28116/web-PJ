# Claudeへの実装指示書：ReplyからReviewへの移行

本ドキュメントは、`docs/requirements.md` および `docs/design.md` の要求事項「1. Reply 機能の Review への置き換え」を完遂するための指示書です。

## 1. プロジェクト全体のリファクタリング (Priority: High)

**目的**: プロジェクト内の `Reply` 関連の名称をすべて `Review` に統一し、責務の変更に備える。

### 1.1 ファイル・ディレクトリの移動とリネーム
- [ ] `pages/reply.tsx` を `pages/review.tsx` へリネーム。
- [ ] `components/templates/ReplyTemplate/` を `components/templates/ReviewTemplate/` へディレクトリごとリネーム。
- [ ] 上記ディレクトリ内の `ReplyTemplate.tsx` を `ReviewTemplate.tsx` へリネーム。

### 1.2 コード内の定義更新
- [ ] `ReviewTemplate.tsx` 内のコンポーネント名を `ReplyTemplate` から `ReviewTemplate` へ変更。
- [ ] `components/templates/index.ts` および `ReviewTemplate/index.ts` のエクスポートを修正。
- [ ] `pages/review.tsx` 内でのインポートおよび使用コンポーネント名を `ReviewTemplate` に更新。
- [ ] `pages/review.tsx` の `Head` タイトルおよびメタディスクリプション内の "Reply" を "Review" に更新。

### 1.3 ナビゲーションおよびルーティングの更新
- [ ] `components/organisms/Header/Header.tsx` におけるタブ定義を更新：
  - ID: `auto-reply` または `reply` -> `review`
  - 表示ラベル: 「口コミ・返信」
- [ ] `Header.tsx` 内の型定義（`activeTab` 等）および `router.push` の遷移先パスを `/review` に更新。
- [ ] その他、プロジェクト全体で `Reply` ページへのリンクや参照がある箇所をすべて `/review` および `review` ID に書き換える。

## 2. 整合性確認
- [ ] 実装後、ビルドエラーが発生しないことを確認。
- [ ] ブラウザで `/review` にアクセスし、ヘッダーのタブ切り替えが正常に動作することを確認。