# プロジェクトタスク & 調査報告

## 表示順の画面機能 (User Flow & UI Transitions)

正常系における時系列順の動作と表示の変化を以下に定義します。

### 1. アプリケーション起動 (未認証状態)
1. **ユーザー操作**: ブラウザのアドレスバーにアプリのURL (例: `/home`, `/report` 等) を入力してアクセスする。
2. **内部処理**: `AuthGuard` が実行され、`localStorage` 内の `auth_token` を確認する -> **存在しない**。
3. **表示変化**: **ログイン画面 (`/`)** が強制的に表示される。
   - 背景: 黒ベース (`#1A1A1A`)。
   - コンテンツ: フォーム（メール、パスワード）、「ログイン」ボタン、「新規でアカウント登録」ボタン。

### 2. 新規登録 (サインアップ) フロー
1. **ユーザー操作**: ログイン画面の「新規でアカウント登録」ボタンを押下。
2. **表示変化**: **サインアップ画面 (Step 1)** へ遷移。
   - `StepIndicator`: 「1」がアクティブ。
   - コンテンツ: 各種登録ボタン一覧。
    - planBサービスでは各種SNSでのログインを想定していたがwyzeでは必要ない
    - ここには開発用の「ログイン正常系」，「ログイン時メールアドレス異常」，「ログイン時パスワード異常」などログイン時に各種テストケースを実行するボタンを作成する
3. **ユーザー操作**: 「メールアドレスで登録」を選択し、必要情報（名前、メール、パス、生年月日等）を入力して「次へ」を押下。
4. **表示変化**: **サインアップ画面 (Step 3)** へ切り替わる。
   - `StepIndicator`: 「3」がアクティブ。
   - コンテンツ: 「登録が完了しました」メッセージ。
5. **ユーザー操作**: 「ホームへ移動」ボタンを押下。
6. **内部処理**: `localStorage` に `auth_token` を保存。
7. **表示変化**: **ホーム画面 (`/home`)** へ遷移する。

### 3. ログインフロー
1. **ユーザー操作**: ログイン画面でメールアドレスとパスワードを入力し、「ログイン」ボタンを押下。
2. **内部処理**: バリデーション後、`localStorage` に `auth_token` を保存。
3. **表示変化**: **ホーム画面 (`/home`)** へ遷移する。

### 4. ログアウトフロー
1. **ユーザー操作**: メニューから「ログアウト」を選択。
2. **表示変化**: **ログアウト確認モーダル** が表示される。
3. **ユーザー操作**: モーダル内で「ログアウト」ボタンを押下。
4. **内部処理**: `localStorage` から `auth_token` を削除。
5. **表示変化**: 即座に **ログイン画面 (`/`)** へ遷移する。

---

## 1. 認証機能の実装 (Authentication)

### 1.1 調査報告: `stash/Login` の再構築
- **依存関係の排除**:
    - `react-native`, `expo-router`, `firebase/auth`, `expo-font` への依存を全て削除する。
- **UIコンポーネントの変換**:
    - `View` -> `div`
    - `Text` -> `p`, `span`, `h1`
    - `TextInput` -> `input` (Tailwindで装飾)
    - `TouchableOpacity` -> `button`
- **サインアップ特有のコンポーネント**:
    - `StepIndicator`: Tailwind CSS を用いたステップバー（現在のステップを視覚化）へ再構築。
    - `CustomWheelPicker` (`AreaPicker`, `BirthDayPicker`): Web 標準の `select` 要素、または直感的なボタン選択/入力フォームへ置換。
- **ロジックの変更**:
    - `signInWithEmailAndPassword` を `localStorage.setItem` を用いたモック処理へ置換。
    - サインアップの各ステップ管理は React のローカル State または Context で維持。

### 1.2 タスクリスト
- [ ] **認証ガードの実装**
  - [ ] `AuthGuard` コンポーネントの作成（セッション確認ロジック）
  - [ ] `pages/_app.tsx` への組み込み
- [ ] **ログイン画面の再構築 (`LoginTemplate`)**
  - [ ] `stash/Login/auth/login.tsx` を Next.js 向けに移植
  - [ ] `docs/figma/login.svg` に基づくスタイリング
- [ ] **サインアップ画面の再構築 (`SignUpTemplate`)**
  - [ ] `StepIndicator` の Web 版実装
  - [ ] ピッカーコンポーネントを Web 標準要素へ置換
  - [ ] 各ステップ（方法選択、メール認証、完了）の移植
- [ ] **ログアウト機能の実装**
  - [ ] `LogoutModal` の作成 (`docs/figma/logoutModal.svg` 準拠)
  - [ ] ログアウト時のセッションクリア処理
- [ ] **スタイルの変更**
  - [ ] Wyzeで主に使われているのは背景が白ベースでprimaryが`#00A48D`
  - [ ] 最終的なUIの調整で変更しやすい様にどこで使われているのかをコメントアウトしておく

---
### fixDepoloyProblemFrontの目的
```
4s
Run npm test -- --ci --passWithNoTests

> web-system-pj@0.1.0 test
> jest --ci --passWithNoTests

PASS test/ReportTemplate.test.tsx
PASS test/Auth.test.tsx
PASS test/ReviewTemplate.test.tsx
PASS test/BillingTemplate.test.tsx
FAIL test/ReportTab.test.tsx
  ● ReportTab Component - Data Rendering › should render action distribution with correct legends

    TestingLibraryElementError: Found multiple elements with the text: Google

    Here are the matching elements:

    Ignored nodes: comments, script, style
    <span
      class="text-sm text-gray-600"
    >
      Google
    </span>

    Ignored nodes: comments, script, style
    <span
      class="text-sm text-gray-600"
    >
      Google
    </span>

    (If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

    Ignored nodes: comments, script, style
    <body>
      <div>
        <div
          class="px-4 flex flex-col gap-4"
        >
          <div
            data-testid="kpi-統合プロフィール閲覧総数"
          >
            <span>
              統合プロフィール閲覧総数
            </span>
            <span>
              9,375
            </span>
            <span>
              件
            </span>
            <span>
              +25%
            </span>
          </div>
          <div
            data-testid="kpi-統合アクション総数"
          >
            <span>
              統合アクション総数
            </span>
            <span>
              2,605
            </span>
            <span>
              件
            </span>
            <span>
              +29%
            </span>
          </div>
          <div
            class="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div
              data-testid="section-統合アクション内訳"
            >
              統合アクション内訳
            </div>
            <div
              class="flex items-center justify-around"
            >
              <div
                class="w-[120px]"
              >
                <div
                  data-segments="2"
                  data-testid="donut-chart"
                />
              </div>
              <div
                class="space-y-4"
              >
                <div
                  class="flex items-center gap-4"
                >
                  <div
                    class="flex items-center gap-2 w-24"
                  >
                    <div
                      class="w-3 h-3 rounded-full"
                      style="background-color: rgb(66, 133, 244);"
                    />
                    <span
                      class="text-sm text-gray-600"
                    >
                      Google
                    </span>
                  </div>
                  <span
                    class="text-lg font-medium"
                  >
                    1,400
                    <span
                      class="text-sm text-gray-500 ml-1"
                    >
                      件
                    </span>
                  </span>
                </div>
                <div
                  class="flex items-center gap-4"
                >
                  <div
                    class="flex items-center gap-2 w-24"
                  >
                    <div
                      class="w-3 h-3 rounded-full"
                      style="background-color: rgb(207, 46, 146);"
                    />
                    <span
                      class="text-sm text-gray-600"
                    >
                      Instagram
                    </span>
                  </div>
                  <span
                    class="text-lg font-medium"
                  >
                    1,205
                    <span
                      class="text-sm text-gray-500 ml-1"
                    >
                      件
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            data-testid="kpi-来店誘導率"
          >
            <span>
              来店誘導率
            </span>
            <span>
              27.8
            </span>
            <span>
              %
            </span>
            <span>
              +1.6%
            </span>
          </div>
          <div
            data-testid="kpi-口コミ平均評価"
          >
            <span>
              口コミ平均評価
            </span>
            <span>
              4.2
            </span>
            <span>
              pt
            </span>
            <span>
              +0.2pt
            </span>
          </div>
          <div
            class="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div
              data-testid="section-統合アクション内訳詳細"
            >
              統合アクション内訳詳細
            </div>
            <div
              class="flex items-center gap-4"
            >
              <div
                class="w-1/2 flex-shrink-0"
              >
                <div
                  data-segments="3"
                  data-testid="donut-chart"
                />
              </div>
              <div
                class="flex-1 space-y-4"
              >
                <div
                  class="flex flex-col gap-1 items-start w-full"
                >
                  <div
                    class="flex items-center gap-2"
                  >
                    <div
                      class="w-3 h-3 rounded-full"
                      style="background-color: rgb(66, 133, 244);"
                    />
                    <span
                      class="text-lg font-medium text-gray-700"
                    >
                      電話
                    </span>
                  </div>
                  <div
                    class="flex items-end ml-auto"
                  >
                    <span
                      class="text-lg font-medium "
                    >
                      120
                      <span
                        class="text-lg text-gray-500 ml-1"
                      >
                        件
                      </span>
                    </span>
                  </div>
                </div>
                <div
                  class="flex flex-col gap-1 items-start w-full"
     ...

       96 |
       97 |     // 凡例が表示されること
    >  98 |     expect(screen.getByText('Google')).toBeInTheDocument();
          |                   ^
       99 |     expect(screen.getByText('Instagram')).toBeInTheDocument();
      100 |
      101 |     // 各凡例の値が表示されること（同じ値が複数箇所に表示されるためgetAllByTextを使用）

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at getElementError (node_modules/@testing-library/dom/dist/query-helpers.js:20:35)
      at getMultipleElementsFoundError (node_modules/@testing-library/dom/dist/query-helpers.js:23:10)
      at node_modules/@testing-library/dom/dist/query-helpers.js:55:13
      at node_modules/@testing-library/dom/dist/query-helpers.js:95:19
      at Object.getByText (test/ReportTab.test.tsx:98:19)

PASS test/CurrentFeaturesTemplate.test.tsx
PASS test/googleBusiness.test.ts
FAIL test/AiTab.test.tsx
  ● AiTab Component › renders the "COMING SOON..." message

    expect(element).toHaveClass("font-kdam-thmor-pro")

    Expected the element to have class:
      font-kdam-thmor-pro
    Received:
      text-base font-normal text-gray-900 text-left text-sm text-gray-400

      25 |     const comingSoonElement = screen.getByText(/coming soon.../i)
      26 |     expect(comingSoonElement).toBeInTheDocument()
    > 27 |     expect(comingSoonElement).toHaveClass('font-kdam-thmor-pro')
         |                               ^
      28 |     expect(comingSoonElement).toHaveClass('text-[32pt]')
      29 |     expect(comingSoonElement).toHaveClass('text-[#00A48D]')
      30 |   })

      at Object.toHaveClass (test/AiTab.test.tsx:27:31)

  ● AiTab Component › renders the "現在開発中です。" message

    TestingLibraryElementError: Unable to find an element with the text: 現在開発中です。. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    <body>
      <div>
        <div
          class="px-4 py-8"
        >
          <div
            class="flex items-center justify-center h-[120px] bg-gray-50 border border-gray-100 rounded h-[200px]"
          >
            <p
              class="text-base font-normal text-gray-900 text-left text-sm text-gray-400"
            >
              COMING SOON - 現在開発中です。
            </p>
          </div>
        </div>
      </div>
    </body>

      40 |   test('renders the "現在開発中です。" message', () => {
      41 |     render(<AiTab />)
    > 42 |     const developmentMessageElement = screen.getByText('現在開発中です。')
         |                                              ^
      43 |     expect(developmentMessageElement).toBeInTheDocument()
      44 |     expect(developmentMessageElement).toHaveClass('font-tiro-telugu')
      45 |     expect(developmentMessageElement).toHaveClass('text-[14pt]')

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at node_modules/@testing-library/dom/dist/query-helpers.js:95:19
      at Object.getByText (test/AiTab.test.tsx:42:46)

  ● AiTab Component › renders with correct layout structure

    expect(element).toHaveClass("flex")

    Expected the element to have class:
      flex
    Received:
      px-4 py-8

      58 |     const rootDiv = container.firstChild as HTMLElement
      59 |
    > 60 |     expect(rootDiv).toHaveClass('flex')
         |                     ^
      61 |     expect(rootDiv).toHaveClass('h-full')
      62 |     expect(rootDiv).toHaveClass('flex-col')
      63 |     expect(rootDiv).toHaveClass('items-center')

      at Object.toHaveClass (test/AiTab.test.tsx:60:21)

PASS test/instagram.test.ts
PASS test/meoDashboard.test.ts
PASS test/AccountTemplate.test.tsx

Test Suites: 2 failed, 9 passed, 11 total
Tests:       4 failed, 87 passed, 91 total
Snapshots:   0 total
Time:        3.235 s
Ran all test suites.
Error: Process completed with exit code 1.
```