# ビルドステージ
FROM node:20-alpine AS builder
WORKDIR /app

# プロジェクト全体の package.json をコピー（モノレポ構造に依存する場合）
# 今回は frontend/ のみビルドを想定
COPY package.json ./
RUN npm install

COPY . .
# 開発環境向けのビルド (Staging)
RUN npm run build

# 実行ステージ
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# ビルド成果物のコピー
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["npm", "start"]
