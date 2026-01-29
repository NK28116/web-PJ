# 変更ログ

## 2025-12-28

### 概要
AIタブに「Coming Soon」メッセージを表示する機能実装と、それに対するテスト作成指示。

### 詳細
- **[Gemini]** 要件定義とアーキテクチャレビューを実施し、実装方針を策定。
- **[Gemini]** 上記方針に基づき、Claudeへの実装指示書を作成。
- **[Claude]** 指示書に基づき、以下のファイルを変更してUIを実装。
  - `styles/globals.css` (フォント導入)
  - `tailwind.config.js` (フォント設定追加)
  - `components/templates/ReportTemplate/AiTab.tsx` (コンポーネント実装)
- **[Gemini]** Claudeの実装内容をレビューし、正当性を確認。
- **[Gemini]** 実装されたコンポーネントを検証するための、テストコード作成指示書をClaude向けに作成。

## 2026-01-22

### 概要
ホームタブ（ダッシュボード）のリファクタリングと機能実装。サブコンポーネント作成、HomeTemplate統合、Geminiレビュー対応まで完了。

### 詳細

#### Phase 1: サブコンポーネント作成
- **[Gemini]** 実装指示書 `docs/task-to-claude.md` を作成。Figma準拠のUI要件と設計方針を定義。
- **[Claude]** 指示書に基づき、以下のファイルを新規作成。
  - `components/organisms/Home/DashboardSection.tsx`
    - ダッシュボードヘッダー（タイトル + 更新ボタン）
    - AIによる最優先アクションセクション
    - 統計情報リスト（システム稼働状況、AI返信待ち口コミ等）
    - Google未連携時のオーバーレイ表示（ブラー効果 + メッセージ）
  - `components/organisms/Home/AccountLinkingSection.tsx`
    - Google/Instagramを単一の「アカウント連携」カード内に統合
    - 連携/解除トグルボタン
  - `components/organisms/Home/ShopListSection.tsx`
    - 店舗カードリスト表示
    - ステータスインジケーター
  - `components/organisms/Home/index.ts`

#### Phase 2: HomeTemplate統合
- **[Claude]** `components/templates/HomeTemplate/HomeTemplate.tsx` をリファクタリング。
  - ハードコードされたJSXを削除し、サブコンポーネントを使用
  - `useState`で`linkingState`（google/instagram）を管理
  - Google連携状態に応じた統計データの切り替え（INITIAL_STATS / LINKED_STATS）
  - イベントハンドラ（handleToggleGoogle, handleToggleInstagram等）を実装

#### Phase 3: Geminiレビュー対応
- **[Gemini]** レビュー指示書を `docs/task-to-claude.md` に更新。余白の二重適用、単一カード構造の確認を指摘。
- **[Claude]** レビュー指摘に基づき修正。
  - `DashboardSection.tsx`: `pt-6`を削除（余白の二重適用を解消）
  - `HomeTemplate.tsx`: コンテナに`pt-6`を追加（余白を親で一元管理）

### 検証結果
- TypeScript型チェック: ✅ 成功
- ESLint: ✅ エラーなし
- Next.js build: ✅ 成功

### 技術的な判断
1. **コンポーネント分割**: Atomic Design原則に従い、organisms配下にHome専用ディレクトリを作成。
2. **状態管理**: `HomeTemplate`上位で`useState`を使用。将来的なAPI連携への差し替えが容易な設計。
3. **余白管理**: 各セクションコンポーネントから上部余白を削除し、親コンポーネントで一元管理。

---

## 2026-01-29

### 概要
投稿タブ（Post Tab）の新規実装。一覧表示（グリッド/リスト）、詳細モーダル、フィルタ・ソート機能の実装完了。

### 詳細

#### Phase 1: 要件定義・設計
- **[Gemini]** `docs/requirements.md` に投稿タブの要件を定義（Figmaデザイン準拠）。
- **[Gemini]** `docs/design.md` にUI/UX設計およびコンポーネント構成を策定。

#### Phase 2: コンポーネント実装
- **[Claude]** 以下のコンポーネントを新規作成し、機能実装を行った。
  - `pages/post.tsx`: 投稿ページのエントリーポイント。
  - `components/templates/PostTemplate/PostTemplate.tsx`: 状態管理（表示モード、ソート、フィルタ）とレイアウト統括。
  - `components/templates/PostTemplate/PostGridItem.tsx`: グリッド表示用カードコンポーネント。
  - `components/templates/PostTemplate/PostListItem.tsx`: リスト表示用カードコンポーネント。
  - `components/templates/PostTemplate/PostDetailModal.tsx`: 投稿詳細表示および編集・ステータス変更用モーダル。

#### Phase 3: 機能検証
- **[Gemini]** 実装コードをレビューし、以下の要件充足を確認。
  - 表示形式切替（グリッド/リスト）
  - ソート機能（投稿順、集客効果順など5種）
  - ステータス管理（表示/非表示の即時反映）
  - フィルタリング機能
  - レスポンシブ対応（スマホ表示前提）
  - ダミーデータによる動作確認

### 技術的な判断
1. **テンプレート内コンポーネント配置**: `PostTemplate`固有のサブコンポーネント（GridItem, ListItem, Modal）は、汎用的な`organisms`ではなく、テンプレートディレクトリ内にコロケーション配置を採用。メンテナンス性を向上。
2. **ローカル状態管理**: バックエンド未接続のため、`useState`によるローカル状態管理でCRUD（Read/Update）を模倣し、インタラクションの即時性を確保。