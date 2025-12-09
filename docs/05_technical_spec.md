# 技術仕様書

## 1. アーキテクチャ概要

### 1.1 システム構成図

```mermaid
graph TB
    subgraph "クライアント"
        A[Webブラウザ]
    end
    
    subgraph "フロントエンド"
        B[Next.js / React]
        C[状態管理]
    end
    
    subgraph "バックエンド"
        D[API Server]
        E[認証サービス]
    end
    
    subgraph "データ層"
        F[(Database)]
        G[ファイルストレージ]
        H[キャッシュ]
    end
    
    A --> B
    B --> C
    B --> D
    D --> E
    D --> F
    D --> G
    D --> H
```

### 1.2 技術スタック

#### フロントエンド

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| フレームワーク | Next.js | 14.x | Reactフレームワーク |
| UI ライブラリ | React | 18.x | UIコンポーネント |
| 言語 | TypeScript | 5.x | 型安全な開発 |
| スタイリング | CSS Modules / Tailwind CSS | - | スタイリング |
| 状態管理 | Zustand / Redux Toolkit | - | グローバル状態管理 |
| フォーム | React Hook Form | - | フォーム管理 |
| バリデーション | Zod | - | スキーマバリデーション |
| HTTP クライアント | Axios / Fetch API | - | API通信 |

#### バックエンド

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| ランタイム | Node.js | 20.x | サーバーサイド実行環境 |
| フレームワーク | Express / Fastify | - | APIサーバー |
| 言語 | TypeScript | 5.x | 型安全な開発 |
| ORM | Prisma / TypeORM | - | データベースアクセス |
| 認証 | JWT / Passport.js | - | 認証・認可 |
| バリデーション | Zod / Joi | - | リクエストバリデーション |

#### データベース

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| RDBMS | PostgreSQL / MySQL | メインデータベース |
| キャッシュ | Redis | セッション・キャッシュ |
| ファイルストレージ | AWS S3 / GCS | 画像・ファイル保存 |

#### インフラ・DevOps

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| ホスティング | Vercel / AWS / GCP | アプリケーションデプロイ |
| CI/CD | GitHub Actions | 自動テスト・デプロイ |
| コンテナ | Docker | 開発環境統一 |
| 監視 | Sentry / Datadog | エラー監視・パフォーマンス監視 |

---

## 2. ディレクトリ構成

### 2.1 フロントエンド

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # ダッシュボード
│   │   ├── posts/
│   │   └── settings/
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # トップページ
├── components/            # 再利用可能なコンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── features/         # 機能別コンポーネント
│   │   ├── auth/
│   │   └── posts/
│   └── layouts/          # レイアウトコンポーネント
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/                  # ユーティリティ・ヘルパー
│   ├── api.ts           # API クライアント
│   ├── auth.ts          # 認証ヘルパー
│   └── utils.ts         # 汎用ユーティリティ
├── hooks/               # カスタムフック
│   ├── useAuth.ts
│   └── usePosts.ts
├── store/               # 状態管理
│   ├── authStore.ts
│   └── postsStore.ts
├── types/               # TypeScript型定義
│   ├── api.ts
│   └── models.ts
└── styles/              # グローバルスタイル
    └── globals.css
```

### 2.2 バックエンド

```
server/
├── src/
│   ├── controllers/      # コントローラー層
│   │   ├── authController.ts
│   │   └── postsController.ts
│   ├── services/         # ビジネスロジック層
│   │   ├── authService.ts
│   │   └── postsService.ts
│   ├── repositories/     # データアクセス層
│   │   ├── userRepository.ts
│   │   └── postRepository.ts
│   ├── middleware/       # ミドルウェア
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/          # ルート定義
│   │   ├── auth.ts
│   │   └── posts.ts
│   ├── models/          # データモデル
│   │   ├── User.ts
│   │   └── Post.ts
│   ├── utils/           # ユーティリティ
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── config/          # 設定ファイル
│   │   ├── database.ts
│   │   └── env.ts
│   └── index.ts         # エントリーポイント
├── prisma/              # Prisma設定
│   └── schema.prisma
└── tests/               # テストコード
    ├── unit/
    └── integration/
```

---

## 3. 開発環境セットアップ

### 3.1 必要な環境

- Node.js: 20.x 以上
- npm / yarn / pnpm
- Docker (オプション)
- PostgreSQL 15.x (ローカル or Docker)

### 3.2 環境変数

#### フロントエンド (.env.local)

```bash
# API設定
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# 認証
NEXT_PUBLIC_JWT_SECRET=your-secret-key

# その他
NEXT_PUBLIC_APP_NAME=My Web App
```

#### バックエンド (.env)

```bash
# サーバー設定
PORT=3001
NODE_ENV=development

# データベース
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# ファイルストレージ
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=ap-northeast-1

# Redis
REDIS_URL=redis://localhost:6379
```

### 3.3 セットアップ手順

```bash
# 1. リポジトリクローン
git clone https://github.com/your-org/your-repo.git
cd your-repo

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env.local
# .env.local を編集

# 4. データベースセットアップ
npx prisma migrate dev
npx prisma db seed

# 5. 開発サーバー起動
npm run dev
```

---

## 4. コーディング規約

### 4.1 TypeScript

- **厳格モード**: `strict: true` を使用
- **型定義**: `any` の使用を避け、適切な型を定義
- **命名規則**:
  - 変数・関数: camelCase
  - クラス・型: PascalCase
  - 定数: UPPER_SNAKE_CASE
  - ファイル名: kebab-case または PascalCase (コンポーネント)

### 4.2 React / Next.js

- **関数コンポーネント**: アロー関数で定義
- **Hooks**: カスタムフックは `use` プレフィックス
- **Props**: 型定義を必ず行う
- **ファイル構成**: 1ファイル1コンポーネント

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
};
```

### 4.3 CSS

- **BEM記法** または **CSS Modules** を使用
- **レスポンシブ**: モバイルファースト
- **命名**: 意味のある名前を使用

---

## 5. テスト戦略

### 5.1 テストの種類

| 種類 | ツール | 対象 | カバレッジ目標 |
|------|--------|------|---------------|
| 単体テスト | Jest | 関数・コンポーネント | 80%以上 |
| 統合テスト | Jest + Testing Library | API・画面フロー | 主要機能100% |
| E2Eテスト | Playwright / Cypress | ユーザーシナリオ | クリティカルパス100% |

### 5.2 テストコマンド

```bash
# 単体テスト
npm run test

# カバレッジ付き
npm run test:coverage

# E2Eテスト
npm run test:e2e
```

---

## 6. デプロイ戦略

### 6.1 環境

| 環境 | 用途 | URL |
|------|------|-----|
| Development | 開発環境 | http://localhost:3000 |
| Staging | 検証環境 | https://staging.example.com |
| Production | 本番環境 | https://example.com |

### 6.2 CI/CDパイプライン

```mermaid
graph LR
    A[Git Push] --> B[Lint & Type Check]
    B --> C[Unit Tests]
    C --> D[Build]
    D --> E{Branch?}
    E -->|main| F[Deploy to Production]
    E -->|develop| G[Deploy to Staging]
    F --> H[E2E Tests]
    G --> H
```

### 6.3 デプロイコマンド

```bash
# ビルド
npm run build

# 本番サーバー起動
npm run start

# Docker デプロイ
docker build -t myapp .
docker run -p 3000:3000 myapp
```

---

## 7. セキュリティ対策

### 7.1 認証・認可

- JWT トークンの使用
- HTTPS 通信の強制
- CORS 設定の適切な管理
- パスワードのハッシュ化 (bcrypt)

### 7.2 入力検証

- すべてのユーザー入力をバリデーション
- SQLインジェクション対策 (ORM使用)
- XSS対策 (エスケープ処理)
- CSRF対策 (トークン使用)

### 7.3 依存関係管理

- 定期的な依存関係の更新
- 脆弱性スキャン (`npm audit`)
- Dependabot の使用

---

## 8. パフォーマンス最適化

### 8.1 フロントエンド

- コード分割 (Dynamic Import)
- 画像最適化 (Next.js Image)
- キャッシング戦略
- Lazy Loading

### 8.2 バックエンド

- データベースインデックス
- クエリ最適化
- Redis キャッシング
- レスポンス圧縮 (gzip)

---

## 9. 監視・ロギング

### 9.1 エラー監視

- Sentry によるエラートラッキング
- エラーログの集約

### 9.2 パフォーマンス監視

- レスポンスタイム
- データベースクエリ時間
- メモリ使用量

### 9.3 ログレベル

- ERROR: エラー発生時
- WARN: 警告
- INFO: 重要な情報
- DEBUG: デバッグ情報 (開発環境のみ)
