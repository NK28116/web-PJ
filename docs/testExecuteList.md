# テスト実行手順書

## 概要

本ドキュメントは、webSystem-PJプロジェクトにおけるテスト実行の手順を定義します。

---

## 前提条件

### 必要な環境
- Node.js: v18以上
- npm または yarn
- 必要な依存パッケージがインストールされていること

### 依存関係の確認
```bash
npm install
# または
yarn install
```

必要なテストライブラリ:
- `jest`: テストフレームワーク
- `@testing-library/react`: Reactコンポーネントテスト
- `@testing-library/jest-dom`: DOM要素のカスタムマッチャー
- `jest-environment-jsdom`: DOM環境のシミュレーション

---

## テスト実行方法

### 1. 全テストの実行

プロジェクトルートで以下のコマンドを実行します。

```bash
npm test
# または
yarn test
```

### 2. 特定のテストファイルの実行

#### AiTabコンポーネントのテスト
```bash
npm test test/AiTab.test.tsx
# または
yarn test test/AiTab.test.tsx
```

#### ReportTemplateコンポーネントのテスト（タブ切り替え機能）
```bash
npm test test/ReportTemplate.test.tsx
# または
yarn test test/ReportTemplate.test.tsx
```

#### その他の既存テスト
```bash
# Google Business Profileのテスト
npm test test/googleBusiness.test.ts

# Instagramのテスト
npm test test/instagram.test.ts

# MEOダッシュボードのテスト
npm test test/meoDashboard.test.ts
```

### 3. ウォッチモードでの実行

ファイル変更を監視して自動的にテストを再実行します。

```bash
npm test -- --watch
# または
yarn test --watch
```

### 4. カバレッジレポート付きの実行

```bash
npm test -- --coverage
# または
yarn test --coverage
```

---

## テスト項目一覧

### AiTab コンポーネント (`test/AiTab.test.tsx`)

| No | テストケース名 | テスト区分 | 検証内容 | 期待結果 |
|----|---------------|-----------|---------|---------|
| 1  | renders the "COMING SOON..." message | 正常系 | "COMING SOON..."テキストの表示確認 | ・テキストが表示されること<br>・font-kdam-thmor-proクラスが適用されていること<br>・text-[32pt]クラスが適用されていること<br>・text-[#00A48D]クラスが適用されていること |
| 2  | renders the "現在開発中です。" message | 正常系 | "現在開発中です。"テキストの表示確認 | ・テキストが表示されること<br>・font-tiro-teleguクラスが適用されていること<br>・text-[14pt]クラスが適用されていること<br>・text-blackクラスが適用されていること |
| 3  | renders with correct layout structure | 正常系 | レイアウト構造の確認 | ・flexクラスが適用されていること<br>・h-fullクラスが適用されていること<br>・flex-colクラスが適用されていること<br>・items-centerクラスが適用されていること<br>・justify-centerクラスが適用されていること<br>・text-centerクラスが適用されていること |
| 4  | does not render empty content | 異常系 | 空コンテンツでないことの確認 | ・textContentが空でないこと<br>・"COMING SOON"が含まれること<br>・"現在開発中です"が含まれること |

---

### ReportTemplate コンポーネント - タブ切り替え機能 (`test/ReportTemplate.test.tsx`)

| No | テストケース名 | テスト区分 | 検証内容 | 期待結果 |
|----|---------------|-----------|---------|---------|
| 1  | should display report tab by default on initial render | 正常系 | レポートタブの初期表示 | ・「運用実績レポート」タブがアクティブであること<br>・レポートタブの内容が表示されていること<br>・AIタブの内容が表示されていないこと |
| 2  | should switch to AI tab when AI tab button is clicked | 正常系 | AIタブへの切り替え | ・「AI分析」タブをクリックするとAIタブがアクティブになること<br>・AIタブの内容が表示されること<br>・レポートタブの内容が非表示になること |
| 3  | should display correct content in AI tab with proper styling | 正常系 | AIタブの表示内容とスタイル | ・"COMING SOON..."テキストが正しいフォント・色で表示されること<br>・"現在開発中です。"テキストが正しいフォント・色で表示されること |
| 4  | should switch back to report tab when report tab button is clicked again | 正常系 | レポートタブへの再切り替え | ・AIタブ表示中に「運用実績レポート」タブをクリックすると元のレポート画面に戻ること<br>・レポートタブがアクティブになること<br>・AIタブの内容が非表示になること |
| 5  | should handle multiple tab switches correctly | 正常系 | タブの複数回切り替え | ・タブを複数回切り替えても正しく動作すること<br>・各タブクリックで適切なコンテンツが表示されること |
| 6  | should render both tab buttons | 異常系 | タブボタンの存在確認 | ・「運用実績レポート」タブボタンが存在すること<br>・「AI分析」タブボタンが存在すること |
| 7  | should not display both tabs simultaneously | 異常系 | タブの同時表示防止 | ・レポートタブとAIタブが同時に表示されないこと |
| 8  | should display period selector in both tabs | 異常系 | 期間選択コンポーネントの表示 | ・期間選択機能が両方のタブで利用可能であること<br>・タブ切り替え時も期間選択が維持されること |

---

## テスト結果の確認

### 成功時の出力例

#### AiTab.test.tsx
```
PASS  test/AiTab.test.tsx
  AiTab Component
    ✓ renders the "COMING SOON..." message (XX ms)
    ✓ renders the "現在開発中です。" message (XX ms)
    ✓ renders with correct layout structure (XX ms)
    ✓ does not render empty content (XX ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

#### ReportTemplate.test.tsx
```
PASS  test/ReportTemplate.test.tsx
  ReportTemplate Component - Tab Switching Functionality
    ✓ should display report tab by default on initial render (XX ms)
    ✓ should switch to AI tab when AI tab button is clicked (XX ms)
    ✓ should display correct content in AI tab with proper styling (XX ms)
    ✓ should switch back to report tab when report tab button is clicked again (XX ms)
    ✓ should handle multiple tab switches correctly (XX ms)
    ✓ should render both tab buttons (XX ms)
    ✓ should not display both tabs simultaneously (XX ms)
    ✓ should display period selector in both tabs (XX ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

### 失敗時の対応

テストが失敗した場合、以下を確認してください:

1. **依存関係の確認**
   ```bash
   npm install
   ```

2. **コンポーネントファイルの存在確認**
   - `components/templates/ReportTemplate/AiTab.tsx` が存在すること
   - `components/templates/ReportTemplate/ReportTab.tsx` が存在すること
   - `components/templates/ReportTemplate/ReportTemplate.tsx` が存在すること

3. **Tailwind設定の確認**
   - `tailwind.config.js` にフォント設定が存在すること
   - `styles/globals.css` にGoogle Fontsのimportが存在すること

4. **タブ切り替え実装の確認（ReportTemplateの場合）**
   - `activeTab` stateが正しく定義されていること
   - タブボタンのonClickイベントが正しく設定されていること
   - 条件分岐レンダリングが正しく実装されていること

5. **エラーメッセージの確認**
   - 出力されたエラーメッセージを読み、該当箇所を修正

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. `Cannot find module` エラー
```bash
# キャッシュをクリア
npm test -- --clearCache

# node_modulesを再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 2. `toBeInTheDocument is not a function` エラー
`@testing-library/jest-dom` のインポートが不足している可能性があります。
テストファイルに以下が含まれているか確認:
```typescript
import '@testing-library/jest-dom'
```

#### 3. タイムアウトエラー
テスト実行時間が長い場合、タイムアウト設定を延長:
```bash
npm test -- --testTimeout=10000
```

---

## 継続的インテグレーション (CI)

### GitHub Actions での実行

`.github/workflows/test.yml` に以下のような設定を追加することで、
プルリクエスト時に自動的にテストを実行できます:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

---

## テストの追加・更新

新しいコンポーネントやフィーチャーを追加した場合:

1. `test/` ディレクトリに対応するテストファイルを作成
2. 本ドキュメントの「テスト項目一覧」に新規テスト情報を追加
3. テストを実行して正常に動作することを確認
4. 変更をコミット

---

## 補足

- テストコードは実装の変更に応じて定期的に更新してください
- カバレッジ目標: 80%以上を目指します
- テスト実行時間: 各テストファイルは5秒以内を目標とします

---

**最終更新日**: 2025-12-28
**作成者**: CSS-28 (Claude)
