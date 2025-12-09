# API設計書

## 1. API概要

### 1.1 ベースURL

- 開発環境: `http://localhost:3000/api`
- 本番環境: `https://api.example.com`

### 1.2 認証方式

<!-- JWT / OAuth / API Key など -->
- 方式: JWT (JSON Web Token)
- ヘッダー: `Authorization: Bearer {token}`
- トークン有効期限: 24時間

### 1.3 共通レスポンス形式

#### 成功時

```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  }
}
```

#### エラー時

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {} // オプション
  }
}
```

### 1.4 HTTPステータスコード

| コード | 説明 | 使用例 |
|--------|------|--------|
| 200 | OK | 正常なGET/PUT/PATCH |
| 201 | Created | 正常なPOST (リソース作成) |
| 204 | No Content | 正常なDELETE |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 権限エラー |
| 404 | Not Found | リソースが存在しない |
| 409 | Conflict | リソースの競合 (重複など) |
| 500 | Internal Server Error | サーバーエラー |

---

## 2. エンドポイント一覧

| メソッド | エンドポイント | 認証 | 説明 |
|---------|---------------|------|------|
| POST | `/auth/register` | 不要 | ユーザー登録 |
| POST | `/auth/login` | 不要 | ログイン |
| POST | `/auth/logout` | 必要 | ログアウト |
| GET | `/users/me` | 必要 | 自分のユーザー情報取得 |
| PUT | `/users/me` | 必要 | 自分のユーザー情報更新 |
| GET | `/posts` | 不要 | 投稿一覧取得 |
| GET | `/posts/:id` | 不要 | 投稿詳細取得 |
| POST | `/posts` | 必要 | 投稿作成 |
| PUT | `/posts/:id` | 必要 | 投稿更新 |
| DELETE | `/posts/:id` | 必要 | 投稿削除 |

---

## 3. エンドポイント詳細

### 3.1 POST /auth/register

#### 概要
新規ユーザーを登録する

#### リクエスト

**Headers**
```
Content-Type: application/json
```

**Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "山田太郎"
}
```

**パラメータ**

| フィールド | 型 | 必須 | 説明 | バリデーション |
|-----------|-----|------|------|---------------|
| email | string | ✓ | メールアドレス | メール形式、最大255文字 |
| password | string | ✓ | パスワード | 最小8文字、英数字記号を含む |
| name | string | ✓ | ユーザー名 | 1〜100文字 |

#### レスポンス

**成功時 (201 Created)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "name": "山田太郎",
      "createdAt": "2025-12-09T12:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**エラー時 (400 Bad Request)**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": {
      "email": ["メールアドレスの形式が正しくありません"]
    }
  }
}
```

**エラー時 (409 Conflict)**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "このメールアドレスは既に登録されています"
  }
}
```

---

### 3.2 POST /auth/login

#### 概要
ユーザー認証を行い、JWTトークンを発行する

#### リクエスト

**Headers**
```
Content-Type: application/json
```

**Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**パラメータ**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| email | string | ✓ | メールアドレス |
| password | string | ✓ | パスワード |

#### レスポンス

**成功時 (200 OK)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "name": "山田太郎"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**エラー時 (401 Unauthorized)**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "メールアドレスまたはパスワードが正しくありません"
  }
}
```

---

### 3.3 GET /users/me

#### 概要
ログイン中のユーザー情報を取得する

#### リクエスト

**Headers**
```
Authorization: Bearer {token}
```

#### レスポンス

**成功時 (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "email": "user@example.com",
    "name": "山田太郎",
    "avatarUrl": "https://example.com/avatars/user.jpg",
    "createdAt": "2025-12-09T12:00:00Z",
    "updatedAt": "2025-12-09T12:00:00Z"
  }
}
```

**エラー時 (401 Unauthorized)**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です"
  }
}
```

---

### 3.4 GET /posts

#### 概要
投稿一覧を取得する (ページネーション対応)

#### リクエスト

**Query Parameters**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| page | number | - | 1 | ページ番号 |
| limit | number | - | 20 | 1ページあたりの件数 (最大100) |
| status | string | - | published | ステータスフィルター |
| userId | string | - | - | 特定ユーザーの投稿のみ |

**例**
```
GET /posts?page=1&limit=20&status=published
```

#### レスポンス

**成功時 (200 OK)**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid-v4",
        "userId": "uuid-v4",
        "title": "投稿タイトル",
        "content": "投稿本文...",
        "status": "published",
        "publishedAt": "2025-12-09T12:00:00Z",
        "createdAt": "2025-12-09T12:00:00Z",
        "user": {
          "id": "uuid-v4",
          "name": "山田太郎",
          "avatarUrl": "https://example.com/avatars/user.jpg"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

---

### 3.5 POST /posts

#### 概要
新規投稿を作成する

#### リクエスト

**Headers**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**
```json
{
  "title": "投稿タイトル",
  "content": "投稿本文...",
  "status": "published"
}
```

**パラメータ**

| フィールド | 型 | 必須 | 説明 | バリデーション |
|-----------|-----|------|------|---------------|
| title | string | ✓ | 投稿タイトル | 1〜200文字 |
| content | string | ✓ | 投稿本文 | 1文字以上 |
| status | string | - | ステータス | draft/published (デフォルト: draft) |

#### レスポンス

**成功時 (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "userId": "uuid-v4",
    "title": "投稿タイトル",
    "content": "投稿本文...",
    "status": "published",
    "publishedAt": "2025-12-09T12:00:00Z",
    "createdAt": "2025-12-09T12:00:00Z",
    "updatedAt": "2025-12-09T12:00:00Z"
  }
}
```

---

## 4. エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| VALIDATION_ERROR | 400 | バリデーションエラー |
| UNAUTHORIZED | 401 | 認証エラー |
| FORBIDDEN | 403 | 権限エラー |
| NOT_FOUND | 404 | リソースが存在しない |
| EMAIL_ALREADY_EXISTS | 409 | メールアドレス重複 |
| INVALID_CREDENTIALS | 401 | 認証情報が正しくない |
| TOKEN_EXPIRED | 401 | トークンの有効期限切れ |
| INTERNAL_ERROR | 500 | サーバー内部エラー |

---

## 5. レート制限

### 5.1 制限値

- 認証なし: 100リクエスト/時間
- 認証あり: 1000リクエスト/時間

### 5.2 レスポンスヘッダー

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1638360000
```

### 5.3 制限超過時

**429 Too Many Requests**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエスト制限を超えました。しばらくしてから再度お試しください"
  }
}
```

---

## 6. Webhook (オプション)

### 6.1 イベント一覧

| イベント | 説明 |
|---------|------|
| user.created | ユーザー作成時 |
| post.created | 投稿作成時 |
| post.published | 投稿公開時 |

### 6.2 Webhookペイロード例

```json
{
  "event": "post.created",
  "timestamp": "2025-12-09T12:00:00Z",
  "data": {
    "id": "uuid-v4",
    "title": "投稿タイトル",
    "userId": "uuid-v4"
  }
}
```
