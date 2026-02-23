# Claudeへの実装指示書：認証基盤 (Authentication System) の改善と修正

本ドキュメントは、これまでの実装に対するユーザーレビュー (`docs/review.md`) に基づき、認証基盤および関連UIの改善を行うための指示書です。

## 1. コンポーネント実装・修正 (Priority: High)

### 1.1 LoginTemplate (ログイン画面)
**対象ファイル**: `components/templates/LoginTemplate/index.tsx`
- **スタイル修正**: 背景色、ボタンの色、フォントサイズ、余白等を `docs/figma/login.svg` に厳密に準拠させてください。特に背景色は Figma の指定に従ってください（現在の緑色が異なっている可能性があります）。
- **機能限定**: ログイン方法は「メールアドレスとパスワード」のみに限定してください（ソーシャルログインボタンはUIのみ、または非表示）。
- **ログインロジック**: `test/mock/authMockData.ts`（新規作成）から有効なユーザー情報を取得して検証するようにしてください。

### 1.2 LogoutModal (ログアウトモーダル)
**対象ファイル**: `components/organisms/Modal/LogoutModal.tsx`
- **機能修正**: 「ログアウト」ボタン押下時に、`localStorage` をクリアした後、**`components/templates/SplashScreen/SplashScreen.tsx` を表示する画面（ルートパス `/`）へ遷移**するようにしてください。
  - 現在の実装では `LoginTemplate` が直接表示されている可能性がありますが、ユーザーは「SplashScreenに戻る」挙動を求めています。

### 1.3 SplashScreen と ルーティング (Splash Screen Integration)
**対象ファイル**: `pages/index.tsx`, `components/templates/SplashScreen/SplashScreen.tsx`
- **現状**: `pages/index.tsx` が `LoginTemplate` を直接レンダリングしているため、Splash Screen が表示されません。
- **修正**:
  - `pages/index.tsx` を改修し、初期表示時に `SplashScreen` コンポーネントを表示するようにしてください。
  - `SplashScreen` 表示後、一定時間（例: 2秒）経過後に `LoginTemplate` に切り替わる（または遷移する）ロジックを実装してください。
  - 認証済みの場合は `SplashScreen` 後に `/home` へ遷移してください。
  - これにより、ログアウト後に `/` へリダイレクトされた際も `SplashScreen` が表示されるようになります。

## 2. データ定義 (Mock) (Priority: High)

**対象ファイル**: `test/mock/authMockData.ts` (新規作成)
- ログイン検証に使用するテストアカウントデータを定義してください。
```typescript
export const MOCK_USER = {
  email: 'test@example.com',
  password: 'password123',
};
```

## 3. ロジック実装 (Priority: High)

### 3.1 認証ロジック (useAuth)
- **認証**: ログイン時は `MOCK_USER` と一致するかチェックしてください。
- **メールアドレス認証**: 現時点ではメールアドレスでのログインのみをサポートするようにロジックを構成してください。

## 4. UI改善：ヘッダーアイコンのレイアウト修正 (Priority: Medium)

**対象ファイル**: `components/organisms/Header/Header.tsx`
- **現状の課題**: ロゴ、通知アイコン、メニューボタンが `justify-between` で等間隔に配置されており、通知アイコンが中央に寄ってしまっている。
- **修正内容**:
  - 通知アイコン (`MdNotifications` を含む button) とメニューボタン (`IoMdMenu` を含む Button) を `div` 等のラッパーで囲む。
  - ラッパーに `flex items-center gap-4`（または適切な余白）を適用し、これら2つのアイコンを右側にまとめて配置すること。
- **サイドメニューのリンク修正**:
  - 「サポート・ヘルプ」: 適切なリンク先（例: `/support` または外部URL、未定なら `#` のまま）を設定してください。
  - 「ログアウト」: `href="#"` ではなく、クリック時に `LogoutModal` を表示する `onClick` ハンドラを設定してください（`Header` コンポーネント内に `isLogoutModalOpen` ステートを追加し、制御すること）。
  - そのため、`LogoutModal` コンポーネントを `Header.tsx` にインポートして使用してください。

## 5. デザイン仕様 (Priority: Medium)

- **Figma準拠**: `docs/figma/` 配下の画像アセットを参照し、マージン、フォントサイズ、配色を再現すること。特にログイン画面の差異を解消すること。
- **レスポンシブ**: モバイルファーストで実装し、PC表示でも崩れないようにする。

## 6. 新規登録フローの拡充 (Priority: High)

**対象ファイル**: `components/templates/SignUpTemplate/index.tsx`
- **現状の課題**: 現在の実装は「メール入力 -> 完了」の簡易フローですが、ユーザーレビューにより `stash/Login/components/signUp` に存在した詳細なステップ（情報入力など）の不足が指摘されています。
- **修正内容**: 
  - `docs/figma/mailAdress**.svg` シリーズのデザインと `stash/Login/components/signUp` のロジックに基づき、以下の構成で実装してください。
  - **Step 1: 登録方法選択** (`SignUpWay` / `mailAdress1.svg`): メールアドレス登録ボタン等。
  - **Step 2: アカウント情報入力** (以下のサブステップを包含するメインステップ):
    - **2-1: メールアドレス入力** (`AuthEmailInput` / `mailAdress2.svg`)
    - **2-2: 認証コード入力** (`AuthEmailNumber` / `mailAdress3.svg`): モック認証。
      - **開発用機能**: 「認証コードを取得（開発用）」ボタンを追加し、クリック時にモックコード（例: "123456"）をアラート表示または自動入力する機能を実装してください。
    - **2-3: ユーザー情報入力** (`AuthEmailUserInfo` / `mailAdress4.svg`): ユーザー名、パスワード等の詳細入力。**これが欠落していた主要な画面です。**
  - **Step 3: 登録完了** (`FinishSingUp`): 完了画面。
- **UI/UX設計**: 
  - `StepIndicator` は引き続き **3ステップ**（1:登録方法選択 / 2:アカウント情報入力 / 3:完了）を表示し、内部的にサブステップを遷移させてください。
- **データ管理**: 
  - 各ステップの入力値を `useState` で管理し、最終ステップで `useAuth` の `login` (または新規作成メソッド) を呼び出して遷移してください。

## 7. テスト実装 (Priority: Low)

**対象ファイル**: `test/Auth.test.tsx` (更新)
- **ログインフロー**: モックユーザーを使用した成功/失敗パターンのテスト。
- **ログアウト**: ログアウト後に `/` (Splash Screen) へ遷移することを確認。
- **SplashScreen**: `/` アクセス時に `SplashScreen` が表示され、その後 `LoginTemplate` (または `/home`) に遷移することを確認。
