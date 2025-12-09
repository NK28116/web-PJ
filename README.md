# Web System Project

## プロジェクト構造

このプロジェクトはAtomic Designの原則に従って、小さなコンポーネント単位で構成されています。

```
components/
  atoms/        # 最小単位のコンポーネント（Button, Input, Text等）
  molecules/    # Atomsを組み合わせたコンポーネント（Form, Card等）
  organisms/    # Moleculesを組み合わせたコンポーネント（Header, Sidebar等）
  templates/    # ページレベルのレイアウト
```

## セットアップ

```bash
npm install
npm run dev
```

## 開発

- 各コンポーネントは小さな単位で作成されています
- コンポーネントは再利用可能なように設計されています
- TypeScriptで型安全に開発できます







