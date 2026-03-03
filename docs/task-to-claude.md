# Claudeへの修正指示書：テストスイートの修正とコンポーネントの改善

`npm test`で失敗するテストスイートが複数確認されたため、以下の指示に従って修正を実施してください。
テストの正常化と、それに伴うコンポーネントの改善が目的です。

## 1. 修正対象ファイルと優先度

- **Priority: High**
    - `test/ReviewTemplate.test.tsx`
    - `components/organisms/Review/ReviewList.tsx`
    - `test/ReportTab.test.tsx`
    - `components/templates/ReportTemplate/ReportTab.tsx`
    - `test/AiTab.test.tsx`

## 2. 修正詳細

### 2.1. `ReviewTemplate`のテスト修正 (Priority: High)

- **現象:** `test/ReviewTemplate.test.tsx`内のテスト`should display review list in ReviewTemplate`が失敗している。原因は、`ReviewList`コンポーネントに「返信する」ボタンが存在しないため。

- **指示:**
    1. **`components/organisms/Review/ReviewList.tsx`を修正してください。**
        - `ReviewListProps`のinterfaceに`onReply: (review: Review) => void;`を追加します。
        - コンポーネントのprops受け取り部分を`({ reviews, onDetail, onReply })`に変更します。
        - 各口コミアイテムのJSX内、コメント(`line-clamp-3`の`<p>`タグ)の下に、「返信する」ボタンを追加してください。
            - このボタンは`review.replyStatus === 'unreplied'`の場合にのみ表示します。
            - ボタンにはクリックイベントを追加し、イベントが親要素に伝播しないように`e.stopPropagation()`を呼び出した上で、`onReply(review)`を実行してください。
            - ボタンのスタイリングは`bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600`を適用してください。

### 2.2. `ReportTab`のテスト修正 (Priority: High)

- **現象:** チャートライブラリに `Recharts` を導入するにあたり、JSDOM環境(Jest)において `ResponsiveContainer` のサイズ計算ができない、あるいは `ResizeObserver` が存在しないために依存コンポーネントのテストが失敗するケースが想定されます。現在一部のコンポーネントはモック化されていますが、Rechartsの実装に合わせて適切にテストを通す必要があります。

- **指示:**
    1. **`test/ReportTab.test.tsx` （またはテストのセットアップファイル）に `Recharts` 用のモックを追加してください。**
        - JSDOM環境でもRechartsのエラーを回避してテストが通るよう、`ResponsiveContainer` を固定サイズの `div` 等にフォールバックさせるモックを追加してください。
          ```typescript
          // 例: RechartsのResponsiveContainerをモック化
          jest.mock('recharts', () => {
            const OriginalModule = jest.requireActual('recharts');
            return {
              ...OriginalModule,
              ResponsiveContainer: ({ children }: any) => (
                <div style={{ width: 800, height: 800 }}>
                  {children}
                </div>
              ),
            };
          });
          ```
        - 既存の `@/organisms/Report` コンポーネントのモック設定（例: `<div data-testid="line-chart-mock" />` などの簡略化モック）が残っている場合は、テスト要件に合わせて「Rechartsを実際に描画させる」か「既存のモックのままテストを通す」かを判断し、`npm test test/ReportTab.test.tsx` がエラーなく通る状態にしてください。

    2. **（関連エラー）`isEmpty` のインポート修正**
        - なお、`TypeError: (0 , _Report.isEmpty) is not a function` エラーが残る場合は、`components/templates/ReportTemplate/ReportTab.tsx` を修正し、`isEmpty` を `import { isEmpty } from '@/organisms/Report/shared';` から直接インポートするようにしてください。

    3. **（新規追加）重複要素エラーへの対応 (`getAllByText` 等の利用)**
        - ユーザーの再テスト結果より、`should render action distribution with correct legends` テストにおいて `TestingLibraryElementError: Found multiple elements with the text: Google` エラーが発生しています。
        - 画面内に "Google" や "Instagram" といったテキストが複数箇所（例: 媒体別内訳やアクション内訳など）で表示されているため、`test/ReportTab.test.tsx`（113行目付近）のアサーションを `expect(screen.getAllByText('Google').length).toBeGreaterThan(0)` に変更するか、`within(対象セクション要素)` を用いて検索範囲を限定するなどし、テストスイート全体がクリーンにパスするように修正してください。

### 2.3. `AiTab`のテスト修正 (Priority: Medium)

- **現象:** `test/AiTab.test.tsx`が、UIコンポーネントの実装とテストコードの期待値の不一致により失敗している。

- **指示:**
    1. **`test/AiTab.test.tsx`を修正してください。**
        - **テキスト検索の修正:**
            - `screen.getByText('現在開発中です。')`を、`screen.getByText(/現在開発中です。/i)`のように正規表現を用いた部分一致検索に変更してください。
        - **CSSクラスのテスト修正:**
            - `toHaveClass('font-kdam-thmor-pro')`や`toHaveClass('flex')`など、失敗しているアサーションを、現在のコンポーネントの正しいCSSクラスに修正するか、あるいはテストの意図にそぐわない場合は一時的にコメントアウトしてください。UIの現状を正としてテストを追従させてください。

---
*以前の指示書の内容も残しておきます。*

# Claudeへの修正指示書：口コミ管理機能の表示・挙動修正

ユーザーからの追加フィードバックに基づき、以下の修正を行ってください。

## 1. 修正詳細 (Priority: High)

### 1.1 コメント表示の省略（Line Clamp）
- **口コミリスト (`ReviewList.tsx`)**:
  - コメント本文を **3行** で省略表示し、末尾に「...」を表示してください（Tailwindの `line-clamp-3` を使用）。
- **詳細モーダル (`ReviewDetailModal.tsx`)**:
  - コメント本文を **10行程度** で省略表示し、末尾に「...」を表示してください（Tailwindの `line-clamp-10` または等価なCSSを使用）。

### 1.2 ReviewList.tsx の修正（クリック挙動）
- **ボタン削除**:
  - カード内の「詳細を見る」「返信する」ボタンを削除してください。
- **カード全体のクリッカブル化**:
  - カード全体をクリック可能にし、詳細モーダルを開くようにしてください。
  - ホバー時の視覚的フィードバック（`hover:bg-gray-50` 等）を追加してください。

### 1.3 test/mock/reviewMock.ts の修正
- **画像データの補完**:
  - 全ての口コミに画像（`shopReview.png` 〜 `shopReview6.png`）を1枚以上設定してください。
- **テスト用データの追加**:
  - 3行および10行の制限をテストするため、**非常に長いコメント（15行以上）** を持つ口コミデータを1件追加してください。

## 2. 確認事項
- リストでは3行、モーダルでは10行でコメントが省略され、末尾に「...」が表示されていること。
- リストのカード全体がクリック可能で、画像付きのモーダルが開くこと。