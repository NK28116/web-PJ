# デプロイエラーおよびテスト失敗の修正指示書

## 1. 概要
デプロイパイプライン（GitHub Actions）にて発生している「バックエンドの Lint エラー」「フロントエンドのテスト失敗」「バックエンドの統合テスト失敗」を修正してください。

---

## 2. バックエンドの修正

### A. 統合テストの引数不足修正
- **対象ファイル:** `backend/test/data_isolation_test.go`
- **内容:** `handlers.GoogleCallback` の呼び出しに引数 `userRepo` が不足しています。
- **対応:**
  ```go
  // repository.NewUserRepository(db) を追加し、GoogleCallback の第3引数に渡す
  userRepo := repository.NewUserRepository(db)
  r.GET("/api/auth/google/callback", handlers.GoogleCallback(cfg, extAcctRepo, userRepo))
  ```
  *(注: ローカル環境では修正済みですが、CI 環境で反映されることを確認してください)*

### B. Go バージョンと依存関係の整理
- **対象ファイル:** `backend/go.mod`
- **症状:** CI 環境で `undefined` エラー（migrate, jwt, stripe 等）が発生。
- **原因:** `go 1.25.0` という実在しない（または不安定な）バージョン指定が原因でパッケージ解決に失敗している可能性があります。
- **対応:** 
  1. `go 1.23.0` 等の安定版にバージョンダウン。
  2. `cd backend && go mod tidy` を実行。

---

## 3. フロントエンドの修正 (Jest テスト環境)

### A. グローバル Polyfill の追加
- **対象ファイル:** `frontend/jest.setup.js`
- **内容:** `fetch`, `TextEncoder`, `window.location` が Jest (jsdom) 環境に存在しないため、テストがクラッシュしています。
- **対応:** 以下の Polyfill を追加してください。
  ```javascript
  import { TextEncoder, TextDecoder } from 'util';
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;

  // fetch のモック
  global.fetch = jest.fn((url) => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ /* デフォルトレスポンス */ }),
  }));

  // window.location のモック (navigation error 回避)
  const mockLocation = new URL('http://localhost');
  mockLocation.assign = jest.fn();
  mockLocation.replace = jest.fn();
  delete window.location;
  window.location = mockLocation;
  ```

### B. 非同期テストへの移行
- **対象ファイル:** `frontend/test/ReportTemplate.test.tsx` 等
- **内容:** 初期表示が `Loading` 状態であるため、同期的な `screen.getByTestId` が失敗します。
- **対応:** 
  1. テスト関数を `async` に変更。
  2. `await screen.findByTestId('report-tab')` を使用して、データ取得後の表示を待機するように修正。

---

## 4. 検証手順
修正後、ローカルで以下のコマンドが通ることを確認してください。
- バックエンド: `cd backend && go build ./... && go test ./...`
- フロントエンド: `cd frontend && npm test`
