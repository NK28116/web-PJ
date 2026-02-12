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

---

## 2026-01-29 (続き)

### 概要
投稿タブの機能強化（状態管理・ステータス切替・日付フォーマット）およびレポートタブの新規実装（状態切替機能・Empty State）を完了。

### 詳細

#### Phase 4: 投稿タブ機能強化
- **[Gemini]** レビュー結果に基づき、`docs/task-to-claude.md` に追加実装指示を作成。
- **[Claude]** 以下の機能を実装。
  - `PostTemplate.tsx`:
    - `Post`型定義を追加（id, bgColor, title, content, tags, rate, views, likes, comments, date, username, status, isNew）
    - `useState`でposts配列を管理し、ステータス変更が即時UI反映されるように強化
    - `handleStatusChange`コールバックを追加
    - 件数表示を動的化（ハードコード「27件」→フィルタ後の`postCount`）
    - フィルタボタンのアクティブ状態を視覚的に明示（枠線・背景色）
    - `formatDate`関数を追加（ISO形式→「2025年7月27日」形式）
  - `PostGridItem.tsx`: **新規作成**
    - ステータスバッジ（表示中/非表示）を右上に表示
    - NEWラベル（該当時のみ左上に表示）
    - 非表示時のオーバーレイ表示
  - `PostListItem.tsx`:
    - `Post`型を適用
    - ステータスバッジをサムネイル内に追加
    - 非表示時の視覚的識別（opacity低下）
    - 日付フォーマット対応
  - `PostDetailModal.tsx`:
    - `onStatusChange`プロップを追加
    - ステータス切替ボタンの動的文言（「非表示にする」/「表示する」）
    - ステータスバッジの動的スタイル
    - NEWラベルの条件付き表示
    - 日付フォーマット対応

#### Phase 5: レポートタブ実装
- **[Gemini]** `docs/requirements.md` にレポートタブの要件を定義。`docs/design.md` に設計方針を策定。
- **[Claude]** 以下のコンポーネント・ファイルを実装。
  - `test/mock/reportMockData.ts`: **新規作成**
    - `ReportData`型定義
    - `operationalReportData`（実運用データ）
    - `initialReportData`（初期状態データ）
    - `tooltips`（ツールチップ説明文）
  - `components/templates/ReportTemplate/InitialStateReport.tsx`: **新規作成**
    - リリース時（初期状態）のEmpty State表示
    - 「アカウントを連携すると、レポートが表示されます」メッセージ
  - `components/templates/ReportTemplate/ReportTemplate.tsx`:
    - `ReportState`型を追加（'initial' | 'operational' | 'ai'）
    - `DevStateSelector`コンポーネントを追加（開発用状態切替スイッチ）
    - 状態に応じた表示切替ロジック
  - `components/templates/ReportTemplate/ReportTab.tsx`:
    - モックデータのインポートを`test/mock/reportMockData.ts`から読み込むように変更
    - ローカル定義のダミーデータ・tooltipsを削除

### 検証結果
- TypeScript型チェック: ✅ 成功
- Next.js build: ✅ 成功

### 技術的な判断
1. **状態管理の強化**: 投稿タブで`posts`配列を`useState`で管理し、ステータス変更が即時反映される設計を採用。将来的なAPI連携時の差し替えが容易。
2. **モックデータの分離**: 要件に基づき、テスト用モックデータを`test/mock/`ディレクトリに配置。コンポーネントとデータの責務を分離。
3. **開発用状態切替**: レポートタブに開発用の状態切替スイッチを実装。Initial/Operational/AIの3状態を切り替え可能にし、各状態のUI確認を容易化。
4. **Empty State設計**: リリース時（データなし）の状態を明示的に表示するコンポーネントを用意。ユーザーに状況を伝えるUXを確保。

---

## 2026-02-06

### 概要
レポートタブのUI機能強化。期間選択、サマリー指標、内訳グラフ（ドーナツ）、傾向グラフ（棒グラフ・折れ線グラフ）の汎用コンポーネント化およびEmpty State対応を完了。

### 詳細

#### Phase 1: Mock Data拡張
- **[Gemini]** `docs/task-to-claude.md` にレポートタブUI実装指示書を作成。
- **[Claude]** `test/mock/reportMockData.ts` を拡張。
  - `mediaBreakdown`: 媒体別内訳データ（Google, Instagram, Webサービス）を追加
  - `timeTrend`: 時間帯傾向データ（9時〜21時の13時間帯）を追加
  - `ReportData`型に上記フィールドを追加
  - `initialReportData`（Empty State用）にも対応フィールドを追加
  - `tooltips`に`mediaBreakdown`, `timeTrend`の説明文を追加

#### Phase 2: 汎用グラフコンポーネント作成
- **[Claude]** 以下のコンポーネントを `components/organisms/Report/` に新規作成。
  - `BarChart.tsx`: 汎用棒グラフコンポーネント
    - 曜日傾向・時間帯傾向の表示に使用
    - Empty State対応（データなし時に「COMING SOON」表示）
    - カスタマイズ可能なプロパティ（height, barColor）
  - `LineChart.tsx`: 汎用折れ線グラフコンポーネント
    - MEO順位推移の表示に使用
    - 複数データセット対応（複数のキーワード順位を同時表示）
    - Y軸ラベル・補助線のカスタマイズ対応
    - Empty State対応

#### Phase 3: ReportTab統合・Empty State対応
- **[Claude]** `components/templates/ReportTemplate/ReportTab.tsx` を更新。
  - `EmptyState`ヘルパーコンポーネントを追加（「COMING SOON」表示）
  - `isEmpty`ヘルパー関数を追加（配列の空判定）
  - 全セクションにEmpty State対応を実装:
    - 統合アクション内訳
    - 統合アクション内訳詳細
    - 媒体別内訳（新規セクション）
    - 曜日・時間帯傾向
    - Google検索ワード内訳
    - Instagram遷移元分析
    - 星（評価）の内訳
    - 口コミ返信パフォーマンス
    - MEO順位推移
  - 曜日傾向・時間帯傾向を`BarChart`コンポーネントに置き換え
  - MEO順位推移を`LineChart`コンポーネントに置き換え
  - 重複コード削除（口コミ平均評価の二重表示、空のgrid）

#### Phase 4: エクスポート更新
- **[Claude]** `components/organisms/Report/index.ts` を更新。
  - `BarChart`, `BarChartDataItem`, `BarChartProps` をエクスポート
  - `LineChart`, `LineChartDataset`, `LineChartProps` をエクスポート

### 検証結果
- TypeScript型チェック: ✅ 実装ファイルにエラーなし
- 検証項目:
  - [x] Period Selector: 動作確認済み（既存機能）
  - [x] Metrics: 4指標表示（Views, Actions, Rate, Rating）
  - [x] Charts: ドーナツグラフ、棒グラフ、折れ線グラフ正常描画
  - [x] Empty State: null/空配列時に「COMING SOON」表示

### 技術的な判断
1. **コンポーネントの汎用化**: 直接JSXで記述されていたグラフ（棒グラフ・折れ線グラフ）を汎用コンポーネント化。再利用性・保守性を向上。
2. **Empty State一元管理**: `EmptyState`コンポーネントと`isEmpty`ヘルパー関数を定義し、全セクションで統一的なEmpty State表示を実現。
3. **データ構造の拡張**: `mediaBreakdown`（媒体別内訳）と`timeTrend`（時間帯傾向）を追加し、設計書の要件を充足。
4. **SVGベースのグラフ実装**: 外部ライブラリ（recharts等）を使用せず、SVGで軽量に実装。モバイルファースト対応。

---

## 2026-02-06 (続き)

### 概要
レポートタブのレビュー対応。コンポーネントモジュール化、レイアウト安定化、ツールチップのタッチ対応、Google検索ワードDonutChart実装を完了。

### 詳細

#### Phase 5: リファクタリング・共通化
- **[Gemini]** `docs/review.md` にレビュー結果を記載。`docs/task-to-claude.md` に修正指示書を作成。
- **[Claude]** 共通ユーティリティを分離。
  - `components/organisms/Report/shared.tsx`: **新規作成**
    - `EmptyState`コンポーネント（classNameプロップ追加で柔軟なスタイリング対応）
    - `isEmpty`ヘルパー関数
    - 型定義 `EmptyStateProps` をエクスポート
  - `components/organisms/Report/index.ts`: エクスポート追加
  - `ReportTab.tsx`: ローカル定義を削除し、`shared.tsx`からインポート
  - `AiTab.tsx`: 共有`EmptyState`コンポーネントを使用するように変更

#### Phase 6: レイアウト安定化
- **[Claude]** 「前月比」ラベルのレイアウト修正。
  - `KPICard.tsx`: `changeLabel`プロップを追加
    - 「前月比」等のラベルを変化率の上に表示
    - Flexboxレイアウトで安定配置（absolute配置を廃止）
  - `ReportTab.tsx`: 口コミ平均評価セクションの`relative`/`absolute`配置を削除し、`changeLabel="前月比"`を使用

#### Phase 7: ツールチップのタッチ対応
- **[Claude]** `SectionTitle.tsx` を更新。
  - `useRef`と`useEffect`で外側クリック/タップ検知を実装
  - `handleToggle`関数でタップトグル動作を統一
  - `touchstart`イベントリスナーを追加（モバイル対応）
  - アクセシビリティ属性を追加（`aria-label`, `role="button"`, `tabIndex`）
  - `onMouseEnter`/`onMouseLeave`を削除（タップのみで動作）

#### Phase 8: Google検索ワードDonutChart実装
- **[Claude]** `test/mock/reportMockData.ts` を更新。
  - `searchKeywords`型に`count`と`color`フィールドを追加
  - 各キーワードに検索ボリューム（count）と色（color）を設定
- **[Claude]** `ReportTab.tsx` を更新。
  - プレースホルダー円を`DonutChart`コンポーネントに置き換え
  - 凡例に色インジケーターを追加
  - 順位表示のスタイル調整（プライマリカラー適用）

### 検証結果
- TypeScript型チェック: ✅ 実装ファイルにエラーなし
- 検証項目:
  - [x] `EmptyState`と`isEmpty`が`shared.tsx`からインポート（ReportTab, AiTab両方）
  - [x] 「前月比」がFlexboxで安定配置（absolute配置廃止）
  - [x] ツールチップがタップでトグル、外側タップで閉じる
  - [x] Google検索ワードにDonutChart表示（凡例付き）

### 技術的な判断
1. **共通ユーティリティの分離**: `EmptyState`と`isEmpty`を`shared.tsx`に分離し、複数コンポーネントで再利用可能に。DRY原則を遵守。
2. **レイアウトの堅牢化**: absolute配置（`right-1/4`等）をFlexboxに置き換え、画面幅に依存しない安定したレイアウトを実現。
3. **タッチファースト設計**: ツールチップをhoverからタップトグルに変更。モバイルユーザー体験を優先。
4. **データ構造の拡張**: `searchKeywords`に`count`と`color`を追加し、DonutChartとの連携を実現。既存の`rank`と`keyword`は維持。

---

## 2026-02-06 (続き2)

### 概要
レポートタブの最終UI調整。グリッドレイアウト最適化、MEOセクション順序・キーワードソート、Instagram横並びレイアウト、LineChartオーバーフロー修正、タイポグラフィ標準化を完了。

### 詳細

#### Phase 9: MEO順位推移セクション改善
- **[Claude]** `ReportTab.tsx` のMEO順位推移セクションを更新。
  - セクション順序を変更: **チャート → キーワードリスト → 免責事項**
  - `invertYAxis={true}` を追加（1位が上に表示されるよう Y軸反転）
  - キーワードリストをランク昇順でソート（`.sort((a, b) => a.rank - b.rank)`）
  - 免責事項をLineChart内部のdisclaimerプロップから、セクション最下部の独立要素に移動
  - データセットインデックスの正確な紐付け（ソート後も元のcolor参照を維持）

#### Phase 10: Instagram遷移元分析レイアウト修正
- **[Claude]** `ReportTab.tsx` のInstagram遷移元分析セクションを更新。
  - 縦並び（`flex-col`）から横並び（`flex items-center justify-around`）に変更
  - チャート左・リスト右の配置に統一
  - DonutChartサイズを媒体別内訳と統一（size=140, thickness=25）
  - 凡例リストのスタイルを媒体別内訳と統一（`space-y-4`, `w-28`）

#### Phase 11: LineChartオーバーフロー修正
- **[Claude]** `components/organisms/Report/LineChart.tsx` を更新。
  - SVG要素のクラスを `overflow-visible` から `overflow-hidden` に変更
  - データポイントがチャート領域外に描画されないよう制限
  - コメントで変更理由を明記

#### Phase 12: 口コミ返信パフォーマンス タイポグラフィ修正
- **[Claude]** `ReportTab.tsx` の口コミ返信パフォーマンスセクションを更新。
  - 任意値 `text-[2rem]` を標準Tailwindクラス `text-4xl` に変更
  - 任意値 `text-[10px]` を標準Tailwindクラス `text-xs` に変更
  - カラーを `text-[#00A48D]` から `text-wyze-primary` に統一（KPICardと同等）
  - 単位テキストを `text-sm` から `text-base` に拡大
  - コメントでKPICardとのサイズ対応を明記

### 検証結果
- 検証項目:
  - [x] グリッドレイアウト: 2列表示（モバイル1列）が正常動作
  - [x] MEO順序: チャート → キーワードリスト → 免責事項
  - [x] キーワードソート: ランク昇順（4位 → 8位 → 17位）
  - [x] Instagram: チャート左・リスト右の横並び配置
  - [x] LineChart: データポイントがチャート領域内に収まる
  - [x] タイポグラフィ: 任意値を標準Tailwindクラスに置換

### 技術的な判断
1. **Y軸反転**: ランキングチャートでは1位を上に表示するのが直感的。`invertYAxis`プロップで制御。
2. **ソート後のデータセット紐付け**: ソート時に元インデックスを失わないよう、`findIndex`でcolor参照を正確に維持。
3. **レイアウト一貫性**: Instagram遷移元分析を媒体別内訳と同じ横並びスタイルに統一し、視覚的一貫性を確保。
4. **Tailwind標準化**: 任意値（`text-[2rem]`等）を標準クラス（`text-4xl`等）に置換し、コードの保守性・可読性を向上。

---

## 2026-02-06 (続き3)

### 概要
レポートタブのレイアウトをシングルカラム（1列）に変更。レビュアーフィードバックに基づき、全画面幅で縦積み表示に統一。

### 詳細

#### Phase 13: シングルカラムレイアウト適用
- **[Gemini]** `docs/review.md` にレビュー結果を記載。2列レイアウトが不自然との指摘。
- **[Claude]** `components/templates/ReportTemplate/ReportTab.tsx` を更新。
  - ルートコンテナを `grid grid-cols-1 sm:grid-cols-2 gap-4` から `flex flex-col gap-4` に変更
  - 全ての `sm:col-span-2` クラスを削除（統合アクション内訳、統合アクション内訳詳細）
  - `col-span-1` クラスを削除（星の評価内訳）
  - コメントを「シングルカラムレイアウト」に更新
  - 「2列表示」「全幅」等のコメントを簡潔化

### 検証結果
- TypeScript型チェック: ✅ 成功
- Next.js build: ✅ 成功
- 検証項目:
  - [x] シングルカラム: 全要素が画面幅に関係なく縦積み表示
  - [x] フル幅: 各カード/セクションが親コンテナの幅いっぱいに表示
  - [x] 内部レイアウト維持: 媒体別内訳、Instagram遷移元等のチャート横並びは維持
  - [x] gap-4: 縦方向の間隔が一貫

### 技術的な判断
1. **flexbox採用**: `grid grid-cols-1` でも同等の結果だが、単純な縦積みには `flex flex-col` がより明示的で軽量。
2. **内部レイアウト維持**: カード内部の横並びレイアウト（チャート左・リスト右）は変更せず、視覚的な情報密度を維持。

---

## 2026-02-09

### 概要
Reply機能のReviewへの置き換え。プロジェクト全体で `Reply` / `auto-reply` 関連の名称を `Review` / `review` に統一し、ルーティング・型定義・ナビゲーションを更新。

### 詳細

#### Phase 1: ReviewTemplateコンポーネント作成
- **[Claude]** 以下のファイルを新規作成。
  - `components/templates/ReviewTemplate/ReviewTemplate.tsx`
    - `ReplyTemplate`の内容をベースに、コンポーネント名を`ReviewTemplate`に変更
    - `activeTab`を`"review"`に変更
    - `customTabLabels`を`{ 'review': '口コミ・返信' }`に変更
  - `components/templates/ReviewTemplate/index.ts`
    - `ReviewTemplate`をエクスポート

#### Phase 2: ページファイル作成
- **[Claude]** `pages/review.tsx` を新規作成。
  - `ReviewTemplate`をインポートして使用
  - Headタイトル: 「口コミ・返信 - Wyze System」
  - metaディスクリプション: "Wyze System Web Application - Review"

#### Phase 3: エクスポート・ナビゲーション更新
- **[Claude]** 以下のファイルを更新。
  - `components/templates/index.ts`:
    - `export { ReplyTemplate } from './ReplyTemplate'` → `export { ReviewTemplate } from './ReviewTemplate'`
  - `components/organisms/Header/Header.tsx`:
    - タブID: `'auto-reply'` → `'review'`
    - タブラベル: 「自動返信」→「口コミ・返信」
    - `router.push('/auto-reply')` → `router.push('/review')`
    - 型定義: `'home' | 'post' | 'report' | 'auto-reply'` → `'home' | 'post' | 'report' | 'review'`

#### Phase 4: 全テンプレート型定義更新
- **[Claude]** 以下のファイルの`activeTab`型定義を `'auto-reply'` → `'review'` に変更。
  - `components/templates/BaseTemplate/BaseTemplate.tsx`
  - `components/templates/HomeTemplate/HomeTemplate.tsx`
  - `components/templates/CurrentFeaturesTemplate/CurrentFeaturesTemplate.tsx`
  - `components/templates/AccountTemplate/AccountTemplate.tsx`
  - `components/templates/BillingTemplate/BillingTemplate.tsx`
  - `pages/home.tsx`

#### Phase 5: 旧ファイル削除
- **[Claude]** 以下のファイル・ディレクトリを削除。
  - `pages/reply.tsx`
  - `pages/auto-reply.tsx`
  - `components/templates/ReplyTemplate/` (ディレクトリごと)

### 検証結果
- Next.js build: ✅ 成功
- ルート生成確認: `/review` が正しく生成（86.5 kB）
- `auto-reply` / `ReplyTemplate` の残存参照: ✅ なし（grep確認済み）

### 技術的な判断
1. **タブID変更**: `'auto-reply'` → `'review'` に統一。URLパス `/review` と一致させ、命名の一貫性を確保。
2. **旧ファイル完全削除**: `pages/reply.tsx`（未使用の古いページ）と `pages/auto-reply.tsx`（ReplyTemplate使用ページ）の両方を削除し、`pages/review.tsx` に一本化。
3. **型定義の一括更新**: 6ファイルの型ユニオンを変更。TypeScriptコンパイラにより未更新箇所があればビルド時に検出可能。

---

## 2026-02-12

### 概要
プラン確認・変更画面の改修。契約ステータス管理（解約・自動更新停止）、ミートボールメニュー、条件付き表示ロジックの実装およびテスト作成を完了。

### 詳細

#### Phase 1: コンポーネント改修
- **[Gemini]** `docs/task-to-claude.md` に実装指示書を作成。`docs/design.md` および `docs/Implementation/PlanConfirmationDetails.md` に基づく。
- **[Claude]** `components/templates/CurrentFeaturesTemplate/CurrentFeaturesTemplate.tsx` を改修。
  - `PlanStatus` 型定義（`'active' | 'inactive'`）を追加
  - `PLAN_DATA` モックデータ定数を追加（ハードコード値を置換）
  - State管理を導入: `planStatus`, `isAutoRenewal`, `isMenuOpen`
  - ヘッダーにステータスバッジを追加（契約中: 緑色 / 未契約: グレー）
  - ミートボールメニュー（`BsThreeDotsVertical`）を追加。「解約」「自動更新を停止」の2項目
  - 契約情報ブロックの条件付き表示:
    - `inactive`時: 契約期間・更新日を非表示
    - `active` かつ `isAutoRenewal === false`時: 「自動更新が設定されていません」を表示
  - `inactive`時に「契約する」ボタンを表示
  - ハンドラ関数: `handleCancel`, `handleStopAutoRenewal`, `handleSubscribe`
  - 未使用インポート（`MdCheckBox`, `MdCheckBoxOutlineBlank`）を削除
  - プラン変更ボタン文言を「アップグレード」に変更

#### Phase 2: 開発用状態リセットボタン追加
- **[Claude]** DEV_ONLYブロックを追加。
  - `[DEV] 自動更新を再開` ボタン: `active` かつ `isAutoRenewal === false` の時に表示
  - `DEV_ONLY` コメントで囲み、リリース前の検索・削除を容易化

#### Phase 3: テスト実装
- **[Claude]** `test/CurrentFeaturesTemplate.test.tsx` を新規作成。
  - 初期表示の確認（3テスト）:
    - ステータスが「契約中」であること
    - 次回更新日が表示されていること
    - 契約期間が表示されていること
  - メニューの動作確認（1テスト）:
    - ミートボールアイコンクリックでメニュー表示
  - 解約フローの確認（3テスト）:
    - ステータスが「未契約」に変化
    - 更新日と契約期間が非表示
    - 「契約する」ボタンが表示
  - 自動更新停止フローの確認（2テスト）:
    - 更新日が「自動更新が設定されていません」に変化
    - ステータスは「契約中」のまま

### 検証結果
- テスト: ✅ 全9テスト合格
- TypeScript型チェック: ✅ 実装ファイルにエラーなし（既存の `ReportTemplate.test.tsx` に無関係の型エラー1件あり）

### 技術的な判断
1. **クライアントサイドState管理**: API未接続のため `useState` で契約状態を管理。将来的なAPI連携時の差し替えが容易。
2. **モックデータの定数化**: ハードコード値を `PLAN_DATA` 定数に集約し、保守性を向上。
3. **DEV_ONLYパターン**: 開発用リセットボタンを `DEV_ONLY` コメントブロックで囲み、`grep DEV_ONLY` で一括検索・削除可能にした。
4. **テスト設計**: 既存テストファイル（`ReviewTemplate.test.tsx`）のパターンに準拠。BaseTemplateとSideMenuをモック化し、コンポーネント単体の動作を検証。

---

## 2026-02-12 (続き)

### 概要
お支払い情報画面（BillingTemplate）の改修。Figmaデザイン準拠で、クレジットカード情報の表示・編集モーダル（UIのみ）、お支払い履歴の一覧表示、PDF出力ボタン（モック）、次回お支払い表示を実装。

### 詳細

#### Phase 1: コンポーネント改修
- **[Gemini]** `docs/task-to-claude.md` に実装指示書を作成。`docs/requirements.md`、`docs/design.md`、`docs/figma/Billing.png` に基づく。
- **[Claude]** `components/templates/BillingTemplate/BillingTemplate.tsx` を全面改修。
  - 型定義を追加: `PaymentHistory`（id, date, amount）、`CardInfo`（brand, last4, expiry）
  - モックデータを定義: `MOCK_CARD_INFO`, `MOCK_PAYMENT_HISTORY`（3件）, `MOCK_NEXT_PAYMENT`
  - `formatCurrency` ヘルパー関数を追加（`Intl.NumberFormat` で `¥33,000` 形式）
  - State管理: `isEditModalOpen`（カード編集モーダル開閉）
  - ヘッダー: 「＜ お支払い情報」戻るボタン（`MdKeyboardArrowLeft` + `router.back()`）
  - クレジットカード情報セクション:
    - マスクされたカード番号（`**** **** **** 1234`）
    - 有効期限表示（`**/**`）
    - 編集アイコン（`MdEdit`）
    - 「カード情報を変更する」ボタン
  - お支払い履歴セクション:
    - `MOCK_PAYMENT_HISTORY` を `map` でリストレンダリング
    - 各行に日付・金額・「領収書 / PDF」ボタンを配置
    - PDFボタンクリックで `console.log` 出力（モック）
  - 次回お支払い表示:
    - 履歴下部に中央寄せ・グレーテキストで配置
    - データ不在時は「次回のお支払い予定はありません」を表示
  - カード編集モーダル（UIのみ）:
    - カード番号・有効期限・CVC のダミー入力欄（`readOnly`）
    - 「保存する」「キャンセル」ボタンでモーダル閉じる
  - 既存のハードコードされた契約情報ブロック・履歴ブロックを全て置換

#### Phase 2: テスト実装
- **[Claude]** `test/BillingTemplate.test.tsx` を新規作成。
  - レンダリング確認（5テスト）:
    - ヘッダーに「お支払い情報」が表示
    - カード情報セクション（マスク番号）が表示
    - お支払い履歴3件が表示
    - 金額がカンマ区切り円マーク付き（`¥33,000`）
    - 次回お支払い情報が表示
  - 戻るボタン（1テスト）:
    - クリックで `router.back()` が呼ばれる
  - モーダル動作（3テスト）:
    - 「カード情報を変更する」でモーダルが開く
    - 「キャンセル」でモーダルが閉じる
    - 「保存する」でモーダルが閉じる
  - PDFボタン（1テスト）:
    - クリックで `console.log` が呼ばれる

### 検証結果
- テスト: ✅ 全10テスト合格
- TypeScript型チェック: ✅ 実装ファイルにエラーなし

### 技術的な判断
1. **Figma準拠のレイアウト**: `docs/figma/Billing.png` に基づき、カード情報→履歴→次回支払いの縦積みレイアウトを採用。
2. **`Intl.NumberFormat` 使用**: 金額フォーマットに `Intl.NumberFormat('ja-JP')` を使用し、ロケール対応の通貨表示を実現。
3. **モーダルの `readOnly` 入力欄**: API未接続のため入力欄は `readOnly` に設定。将来的なフォーム実装時に `readOnly` を外すだけで対応可能。
4. **各行PDF出力ボタン**: Figmaに準拠し、履歴一覧の各行に「領収書 / PDF」ボタンを配置。一括出力ではなく行単位の出力UIとした。

---

## 2026-02-12 (続き2)

### 概要
アカウント情報画面（AccountTemplate）の改修。店舗プロフィール情報・オーナーアカウント設定の閲覧/編集（ミートボールメニュー経由）、通知設定のトグル（排他制御付き即時保存）を実装。Geminiレビュー対応として編集モード・ヘッダーアイコン追加も完了。

### 詳細

#### Phase 1: コンポーネント改修
- **[Gemini]** `docs/task-to-claude.md` に実装指示書を作成。`docs/requirements.md`、`docs/design.md`、`docs/figma/account.png` に基づく。
- **[Claude]** `components/templates/AccountTemplate/AccountTemplate.tsx` を全面改修。
  - 型定義を追加: `AccountData`（profile, owner, notifications）、`NotificationKey`
  - モックデータを定義: `MOCK_ACCOUNT_DATA`、`NOTIFICATION_LABELS`
  - State管理:
    - `profile`, `owner`, `notifications`: 各セクションのデータ管理
    - `isSaving`: 通知設定の排他制御フラグ
    - `isEditingProfile`, `isEditingOwner`: 編集モードフラグ
    - `menuOpenProfile`, `menuOpenOwner`: ミートボールメニュー開閉フラグ
    - `editProfile`, `editOwner`: 編集用一時State（キャンセル時の復元用）
  - ヘッダー:
    - 左: 「＜ 店舗・アカウント設定」戻るボタン（`MdKeyboardArrowLeft` + `router.back()`）
    - 右: 通知アイコン（`MdNotifications`）+ ハンバーガーメニュー（`MdMenu`）
  - 店舗プロフィール情報セクション:
    - ミートボールメニュー（`BsThreeDotsVertical`）→「変更する」で編集モード切替
    - 表示モード: 店舗名・住所・電話番号を表示
    - 編集モード: `input` フィールド + 「キャンセル」「保存」ボタン
    - 保存: `profile` Stateを更新、キャンセル: `editProfile`を元に戻す
  - オーナーアカウント設定セクション:
    - 同様のミートボールメニュー → 編集モード切替
    - 表示モード: 担当者名・メールアドレス・パスワード（`********`固定）
    - 編集モード: 担当者名・メールアドレスの `input` + パスワード欄（`readOnly`）
    - 保存/キャンセルの動作はプロフィールと同様
  - 通知設定セクション:
    - 3項目のトグルスイッチ: 月次レポート、競合変動アラート、低評価口コミアラート
    - `role="switch"` + `aria-checked` でアクセシビリティ対応
    - `isSaving` フラグによる排他制御（`setTimeout` 1秒でAPI模倣）
    - Optimistic Update パターン

#### Phase 2: テスト実装
- **[Claude]** `test/AccountTemplate.test.tsx` を新規作成。
  - レンダリング確認（4テスト）:
    - ヘッダーに「店舗・アカウント設定」が表示
    - 店舗プロフィール情報セクションが表示
    - オーナーアカウント設定セクションが表示
    - 通知設定セクションが表示
  - 値の表示確認（6テスト）:
    - 店舗名「サンプル店舗 渋谷店」が表示
    - 住所「東京都渋谷区神南1-2-3」が表示
    - 電話番号「03-1234-5678」が表示
    - 担当者名「山田 太郎」が表示
    - メールアドレス「taro.yamada@example.com」が表示
    - パスワード「********」がマスク表示
  - トグル動作（3テスト）:
    - 月次レポートのトグルクリックでOFFに切り替わる（初期ON）
    - 競合変動アラートのトグルクリックでONに切り替わる（初期OFF）
    - 通知設定の3項目が全て表示
  - 戻るボタン（1テスト）:
    - クリックで `router.back()` が呼ばれる

#### Phase 3: Geminiレビュー対応
- **[Gemini]** `docs/task-to-claude.md` にレビュー結果を反映。編集モード・ミートボールメニュー・ヘッダーアイコンの追加を指示。
- **[Claude]** レビュー指摘に基づきコンポーネントを更新。
  - `profile`/`owner` を `useState` で管理し、編集・保存可能に
  - `editProfile`/`editOwner` 一時Stateでキャンセル時の復元に対応
  - ミートボールメニュー（`BsThreeDotsVertical`）を両セクションに追加
  - ヘッダー右側に `MdNotifications` + `MdMenu` アイコンを追加
  - 編集モード: `input` フィールド + 「キャンセル」「保存」ボタンの実装

### 検証結果
- テスト: ✅ 全14テスト合格（レビュー反映後も既存テスト全パス）
- TypeScript型チェック: ✅ 実装ファイルにエラーなし

### 技術的な判断
1. **編集用一時State**: `editProfile`/`editOwner` を `profile`/`owner` とは別に保持し、キャンセル時に元の値に復元可能にした。保存時のみ本体Stateを更新する設計。
2. **ミートボールメニュー**: テキストボタンではなく `BsThreeDotsVertical` アイコンからのドロップダウンメニューを採用。Figmaデザインに準拠し、UIの一貫性を確保。
3. **通知設定の排他制御**: `isSaving` フラグで連続クリックを抑制。`setTimeout` でAPI呼び出しを模倣し、将来的なバックエンド連携時の差し替えが容易。
4. **アクセシビリティ**: トグルスイッチに `role="switch"` と `aria-checked` を付与し、スクリーンリーダー対応。`aria-label` でラベルを明示。