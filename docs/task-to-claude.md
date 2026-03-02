# Claudeへの修正指示書: CIエラーの解消と基盤の安定化

`docs/review.md` に記録された GitHub Actions の失敗ログおよび、開発環境の不備を解消してください。
今回のタスクでは、**デザイン修正やUIの微調整はスコープ外**とし、テストの正常化とビルド基盤の修正に専念してください。

## 1. テストエラーの修正 (Priority: High)

### 1.1 ReviewTemplate.test.tsx の修正
- **現象**: `Unable to find an element with the text: 返信する` によりテストが失敗しています。
- **原因**: 以前のUI改修で `ReviewList.tsx` から「返信する」ボタンが削除され、カード全体がクリック可能になったためです。
- **対応**: 
  - `test/ReviewTemplate.test.tsx` を更新し、ボタンの存在を確認・クリックするのではなく、口コミカード（またはユーザー名等のテキスト）をクリックして詳細モーダルが開くことを検証するように修正してください。

### 1.2 ReportTab.test.tsx の修正
- **現象**: `TypeError: (0 , _Report.isEmpty) is not a function` によりテストが失敗しています。
- **原因**: `components/organisms/Report/index.ts` を介したバレルエクスポートが、Jest環境下で循環参照または初期化順序の問題を引き起こしている可能性があります。
- **対応**:
  - `components/templates/ReportTemplate/ReportTab.tsx` および `AiTab.tsx` において、`isEmpty` と `EmptyState` のインポート元を `@/organisms/Report` から `@/organisms/Report/shared` へ直接参照するように変更してください。

## 2. ビルド・リンターの修正 (Priority: High)

### 2.1 ESLint 設定の固定
- **現象**: CI上で `next lint` がインタラクティブな設定確認（"? How would you like to configure ESLint?"）を表示して停止しています。
- **対応**:
  - プロジェクトルートに以下の内容で `.eslintrc.json` を作成（または既存を修正）し、非対話形式で実行可能にしてください。
    ```json
    {
      "extends": ["next/core-web-vitals"]
    }
    ```
  - `eslint.config.mjs` との共存に問題がある場合は、`package.json` の `lint` スクリプトを `next lint --config eslint.config.mjs` または適切な形式に調整してください。

### 2.2 Backend 依存関係の解決
- **現象**: `docker-compose up` 時に依存関係の不整合が発生する可能性があります。
- **対応**:
  - `backend/` ディレクトリで `go mod tidy` を実行し、`go.sum` を最新の状態に更新してください。

## 3. 保留事項（今回の実装範囲外） (Out of Scope)

以下のデザイン・UIに関するフィードバックは、今回の基盤修正フェーズでは**実施しないでください**。これらは次回のUI改善フェーズで対応します。
- KPI部分の画像削除
- 口コミリストのレイアウト・フォントサイズ・配色修正
- 詳細モーダルのボタン配置・配色の変更
- 口コミ画像のランダム表示ロジック
- サブ評価の星の色変更

## 4. 確認事項
- `npm test` が全てのテスト（ReportTab, ReviewTemplate 等）をパスすること。
- `npm run lint` が CI 環境でエラーなく完了すること。
- `docker-compose build` が正常に通ること。
