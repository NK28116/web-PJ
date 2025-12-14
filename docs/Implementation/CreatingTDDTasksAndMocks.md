# TDDタスクとMock作成の実装ログ

## 概要

本ドキュメントでは、Web System PJのTDD環境構築手順、およびタスクリスト作成のプロセスを記録します。

## 実施日

2025-12-14

## 実施手順

### 1. 依存関係のインストール

Jestおよび関連ライブラリをインストールしました。

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom mockdate ts-node
```

### 2. Jestの設定

`jest.config.js` と `jest.setup.js` を作成し、Next.js環境でテストが実行できるように構成しました。

- `testEnvironment: 'jest-environment-jsdom'` を指定。
- `jest.setup.js` で `@testing-library/jest-dom` をインポート。

### 3. タスクリストの作成

`docs/01_requirements.md` (要件定義書) を元に、MVP機能の実装タスクを抽出し、`docs/Task.md` にTDD形式のチェックリストとしてまとめました。

- Instagram連携
- Google Business Profile連携
- MEOダッシュボード

### 4. テスト雛形の作成

抽出したタスクに対応するテストファイルを `test/` ディレクトリに作成しました。
全てのテストファイルで `mockdate` を使用し、テスト実行時の日付を固定化 (`2025-01-01T12:00:00Z`) しました。

#### 作成したファイル

- `test/instagram.test.ts`
- `test/googleBusiness.test.ts`
- `test/meoDashboard.test.ts`

```typescript
// 共通パターン
import MockDate from 'mockdate';

describe('Feature', () => {
  beforeEach(() => {
    MockDate.set('2025-01-01T12:00:00Z');
  });
  afterEach(() => {
    MockDate.reset();
  });
  // ... tests
});
```

### 5. 動作確認

`npm test` コマンドを実行し、テスト環境が正しく動作することを確認しました。
