# Vercel ビルドエラー修正および環境設定 指示書

## 1. エラー内容
Vercel でのビルド時に以下のエラーが発生し、デプロイに失敗しています。
```text
Error: > Couldn't find any pages or app directory. Please create one under the project root
...
Error: Command "npm run vercel-build" exited with 1
```

## 2. 原因
Vercel がプロジェクトのルートディレクトリ（`/`）で Next.js のビルドプロセスを開始しようとしていますが、実際の Next.js プロジェクトは `/frontend` ディレクトリにあるため、必須の `pages` または `app` ディレクトリを検出できていません。

## 3. 解決策 (推奨：案A)

Vercel の管理コンソールから以下の設定変更を行ってください。

### 手順
1. Vercel Dashboard で対象のプロジェクトを選択。
2. **Settings** > **General** を開く。
3. **Root Directory** の項目に `frontend` と入力して保存。
4. **Settings** > **Environment Variables** を開く。
5. 以下の環境変数を追加して保存。
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://backend-611370943102.us-east1.run.app`
6. **Deployments** タブから、失敗した最新のビルドの「...」メニューをクリックし、**Redeploy** を実行。

---

## 4. 代替策 (設定ファイルで解決する場合：案B)
Vercel の管理画面の設定を変更せず、リポジトリ内のコードで解決する場合は、**プロジェクトのルートディレクトリ**に以下のファイルを作成してください。

### `vercel.json` (ルート用)
```json
{
  "buildCommand": "cd frontend && npm run build",
  "installCommand": "cd frontend && npm install",
  "outputDirectory": "frontend/.next"
}
```

---

## 5. 完了後の確認事項
デプロイが成功した後、以下の疎通確認を行ってください。
- [ ] 画面が正常に表示されるか（ホワイトアウトしていないか）。
- [ ] ログイン画面からバックエンド API (`https://backend-611370943102.us-east1.run.app`) へのリクエストが送信されているか（ブラウザの DevTools で確認）。
- [ ] 404 エラーや CORS エラーが発生していないか。
