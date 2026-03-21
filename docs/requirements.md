# プロジェクト要件定義書 (Wyze System)

## 要求:ステージング検証で起きた問題 (`docs/testResult.md`) の解決

### 要件1.新規登録時に認証番号が届かない

#### 届くメールの内容

- 送信者:support@wyze-sytem.com
- 受信者:【新規登録の時に入力したメールアドレス】
- 本文:wyze systemをご利用いただきありがとうございます\n 【新規登録の時に入力したメールアドレス】で新規登録していただくための認証番号は **【認証番号】** です

#### 要求動作

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as Next.js Frontend
    participant B as Gin Backend
    participant R as Redis
    participant M as メール(SMTP)

    U->>F: メールアドレス入力
    F->>B: POST /api/auth/register

    B->>B: 6桁コード生成
    B->>R: コード保存 (TTL 10分)
    B->>M: 認証コード送信

    U->>U: メール受信
    U->>F: 認証コード入力
    F->>B: POST /api/auth/verify

    B->>R: コード取得
    B->>B: コード照合

    alt 一致
        B->>B: JWTトークン発行
        B->>B: ユーザー登録完了
        B-->>F: 成功レスポンス(JWT)
    else 不一致
        B-->>F: エラーレスポンス
    end

```
#### 解決策
- デプロイ失敗,もしくは間違ったブランチをデプロイしている?
  - email_verificationsテーブルなど既にロジックは構築済み
  - 複数回のデプロイを試してみてそれでもダメなら新しいvercelプロジェクトを作成しステージングリリースをやり直す

### 要件2.

