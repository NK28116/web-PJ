# 手動テスト結果レポート

## ステージング検証テスト結果

|No|画面|関連ファイル|結果|期待値|備考|
|--|----|------------|----|------|---|
|1|新規登録|frontend/components/templates/SignUpTemplate/index.tsx|認証番号が記載されたメールが届く|メールアドレスの登録動作を行っても認証番号が記載されたメールが届かない|ステージング環境でモックの外し忘れ|
|2|新規登録|frontend/components/templates/SignUpTemplate/index.tsx|パスワード作成欄でパスワードを作成する際に表示状態にしたら,フォーカスを外しても表示される|フォーカスを外したら非表示になっておいてほしい|個人情報保護，後日調整の可能性あり|
|3|ログイン|frontend/components/templates/LoginTemplate/index.tsx|未連携の時でもGoogleでログインが表示されている|未連携の時は非表示|後日Googleアカウントを用いて新規登録も実装予定|
|4|スプラッシュ〜新規登録|該当部分を調査|コンテンツ外の背景色が#FFF(white)のまま|全画面 #00A48D で塗りつぶされてほしい||
|5|ホーム|frontend/components/organisms/Home/AccountLinkingSection.tsx|外部アカウント連携できない|外部連携できる,もしくは「このアカウントはビジネスアカウントではないため連携できません」と表示されてほしい||
|6|契約確認画面|frontend/components/templates/BillingTemplate/BillingTemplate.tsx|契約してない時でも「現在のプラン  Lightプラン」と表示されている|初期状態は「未契約」にしてほしい|ステージング環境でモックの外し忘れ|
|7|契約確認画面|frontend/components/templates/BillingTemplate/BillingTemplate.tsx|未契約なのに料金が表示されている|未契約(初期状態)では「現在契約されていません」と表示されてほしい|先日決定した料金プランが反映されているかチェック,ステージング環境でモックの外し忘れ|
|8|契約確認画面|frontend/components/templates/BillingTemplate/BillingTemplate.tsx|未契約なのに支払い方法が表示されている|未契約(初期状態)では「現在契約されていません」と表示されてほしい|カード情報が登録されているかチェック,ステージング環境でモックの外し忘れ|
|9|お支払い情報確認画面|frontend/components/templates/BillingTemplate/BillingTemplate.tsx|未登録状態でも表示されている|未登録状態では「カード情報を登録してください」と情報表示エリアの中心に表示され背景をぼやかす|frontend/components/organisms/Home/DashboardSection.tsxのOverlay for unlinked state の背景と同じにする|
|10|お支払い情報確認画面|frontend/components/templates/BillingTemplate/BillingTemplate.tsx|「キャンセル」ボタンが反映されてない|モックの外し忘れ|
|11|店舗アカウント情報|frontend/components/templates/AccountTemplate/AccountTemplate.tsx|Google ビジネスアカウント情報を登録してないのに店舗情報が表示されている|モックの外し忘れ|
|12|サポートヘルプ情報|存在しない|問い合わせた情報入力フォームと送信ボタンがあり送信を押したら「お問い合わせありがとうございます.後日お問い合わせ内容をメールで送信します」と表示されメールが送信する|作成漏れ？|
|13|frontend/components/molecules/NotificationItem/NotificationItem.tsx|登録したばかりなのに通知が存在している|初期状態では何も通知が存在しない|モックの外し忘れ|
|14|code全体|おそらくデプロイに使われているのがmainブランチになっている|https://web-pj-three.vercel.app/はdevelopブランチでステージング検証中,本番はこちらで取得予定の'wyze-system.com'を使用するが未デプロイ|vercelの状態もチェック|
|15|frontend/components/templates/BillingTemplate/BillingTemplate.tsx|カード情報に関わる動作が全て401エラ-|エラーの解消|mainブランチをデプロイしてることによるミス

## 解決方針

### 1
####  作業者提案
メール認証機能の実装（Next.js + Gin）

📐 全体アーキテクチャ

[ユーザー] → メールアドレス入力
     ↓
[Next.js Frontend] → POST /api/auth/register → [Gin Backend]
                                                      ↓
                                               6桁コード生成
                                               Redisに保存(TTL 10分)
                                                      ↓
                                               メール送信(SMTP)
     ↓
[ユーザー] → メールで受信したコードを入力
     ↓
[Next.js Frontend] → POST /api/auth/verify → [Gin Backend]
                                                   ↓
                                            Redisのコードと照合
                                                   ↓
                                            一致 → JWTトークン発行 & ユーザー登録完了

🗄️ バックエンド（Gin / Go）

ディレクトリ構成

backend/
├── main.go
├── handlers/
│   └── auth.go
├── services/
│   ├── email.go
│   └── otp.go
├── models/
│   └── user.go
└── middleware/
    └── jwt.go

main.go

package main

import (
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "myapp/handlers"
    "myapp/services"
)

func main() {
    r := gin.Default()

    // CORS設定（Next.jsからのリクエストを許可）
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        AllowCredentials: true,
    }))

    // Redis初期化
    services.InitRedis()

    // ルーティング
    auth := r.Group("/api/auth")
    {
        auth.POST("/register", handlers.Register)   // メール送信
        auth.POST("/verify",   handlers.VerifyOTP)  // コード検証
    }

    r.Run(":8080")
}

services/otp.go — OTP生成＆Redis管理

package services

import (
    "context"
    "fmt"
    "math/rand"
    "time"

    "github.com/redis/go-redis/v9"
)

var rdb *redis.Client
var ctx = context.Background()

// Redis初期化
func InitRedis() {
    rdb = redis.NewClient(&redis.Options{
        Addr:     "localhost:6379",
        Password: "",
        DB:       0,
    })
}

// 6桁のOTPを生成してRedisに保存（TTL: 10分）
func GenerateAndStoreOTP(email string) (string, error) {
    otp := fmt.Sprintf("%06d", rand.Intn(1000000))
    key := "otp:" + email

    err := rdb.Set(ctx, key, otp, 10*time.Minute).Err()
    if err != nil {
        return "", err
    }
    return otp, nil
}

// OTPを検証
func VerifyOTP(email, inputOTP string) (bool, error) {
    key := "otp:" + email
    storedOTP, err := rdb.Get(ctx, key).Result()

    if err == redis.Nil {
        return false, nil // 期限切れまたは存在しない
    }
    if err != nil {
        return false, err
    }

    if storedOTP == inputOTP {
        rdb.Del(ctx, key) // 使用済みコードを削除
        return true, nil
    }
    return false, nil
}

services/email.go — メール送信

package services

import (
    "fmt"
    "net/smtp"
    "os"
)

func SendVerificationEmail(toEmail, otp string) error {
    from    := os.Getenv("SMTP_FROM")
    pass    := os.Getenv("SMTP_PASSWORD")
    host    := os.Getenv("SMTP_HOST")   // "smtp.gmail.com"
    port    := os.Getenv("SMTP_PORT")   // "587"

    auth := smtp.PlainAuth("", from, pass, host)

    subject := "【認証コード】メールアドレスの確認"
    body := fmt.Sprintf(`
こんにちは！

以下の認証コードを入力してください：

  ━━━━━━━━━━━━
      %s
  ━━━━━━━━━━━━

このコードは10分間有効です。
身に覚えのない場合は無視してください。
    `, otp)

    msg := []byte(
        "From: " + from + "\r\n" +
        "To: " + toEmail + "\r\n" +
        "Subject: " + subject + "\r\n" +
        "Content-Type: text/plain; charset=UTF-8\r\n" +
        "\r\n" +
        body,
    )

    return smtp.SendMail(host+":"+port, auth, from, []string{toEmail}, msg)
}

handlers/auth.go — ハンドラー

package handlers

import (
    "net/http"
    "myapp/services"
    "github.com/gin-gonic/gin"
)

// --- リクエスト構造体 ---

type RegisterRequest struct {
    Email    string json:"email"    binding:"required,email"
    Password string json:"password" binding:"required,min=8"
}

type VerifyRequest struct {
    Email string json:"email" binding:"required,email"
    OTP   string json:"otp"   binding:"required,len=6"
}

// --- Step 1: メールアドレス登録 → OTP送信 ---

func Register(c *gin.Context) {
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // OTP生成＆Redis保存
    otp, err := services.GenerateAndStoreOTP(req.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "OTPの生成に失敗しました"})
        return
    }

    // メール送信
    if err := services.SendVerificationEmail(req.Email, otp); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "メール送信に失敗しました"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "認証コードを送信しました。メールをご確認ください。",
    })
}

// --- Step 2: OTP検証 → JWT発行 ---

func VerifyOTP(c *gin.Context) {
    var req VerifyRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ok, err := services.VerifyOTP(req.Email, req.OTP)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "検証中にエラーが発生しました"})
        return
    }
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "認証コードが無効または期限切れです"})
        return
    }

    // ✅ 認証成功 → DBにユーザー登録 & JWT発行
    token, err := services.GenerateJWT(req.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "トークン生成に失敗しました"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "認証に成功しました",
        "token":   token,
    })
}

🖥️ フロントエンド（Next.js）

ディレクトリ構成

frontend/
├── app/
│   ├── register/
│   │   └── page.tsx        ← Step1: メール入力
│   └── verify/
│       └── page.tsx        ← Step2: コード入力
└── lib/
    └── api.ts

lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function registerEmail(email: string, password: string) {
  const res = await fetch(${API_BASE}/api/auth/register, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function verifyOTP(email: string, otp: string) {
  const res = await fetch(${API_BASE}/api/auth/verify, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

app/register/page.tsx — Step 1

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerEmail } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerEmail(email, password);
      // メールアドレスをクエリパラメータで渡す
      router.push(/verify?email=${encodeURIComponent(email)});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    
      
        新規登録
        
           setEmail(e.target.value)}
            required
          />
           setPassword(e.target.value)}
            required
          />
          {error && {error}}
          
            {loading ? "送信中..." : "認証コードを送信"}
          
        
      
    
  );
}

app/verify/page.tsx — Step 2（6桁入力UI）

"use client";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOTP } from "@/lib/api";

export default function VerifyPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const inputRefs = useRef([]);

  // 1マス入力するたびに次のマスへ自動フォーカス
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // 数字のみ
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1); // 1文字だけ保持
    setDigits(newDigits);
    if (value && index  {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) return;

    setLoading(true);
    setError("");
    try {
      const data = await verifyOTP(email, otp);
      // JWTをlocalStorageに保存
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    
      
        メール認証
        
          {email} に
          6桁の認証コードを送信しました
        

        
          {/* 6桁入力ボックス */}
          
            {digits.map((digit, i) => (
               { if (el) inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg
                           focus:outline-none focus:border-blue-500 transition
                           border-gray-300"
              />
            ))}
          

          {error && {error}}

          
            {loading ? "確認中..." : "認証する"}
          
        

        
          コードは10分間有効です
        
      
    
  );
}

🔐 セキュリティ対策まとめ

| 対策 | 実装箇所 | 内容 |
|------|---------|------|
| TTL（有効期限） | Redis | コードは10分で自動削除 |
| 使い捨て | VerifyOTP() | 検証成功後に即座にRedisから削除 |
| レート制限 | Gin Middleware | 同一IPへの送信回数制限（下記参照） |
| 数字のみ | フロントエンド | inputMode="numeric" + 正規表現 |
| HTTPS | インフラ | 本番環境では必須 |

レート制限ミドルウェア（追加推奨）

// go get github.com/ulule/limiter/v3
import (
    "github.com/ulule/limiter/v3"
    mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
    redisstore "github.com/ulule/limiter/v3/drivers/store/redis"
)

// 1時間に5回まで
rate, _ := limiter.NewRateFromFormatted("5-H")
store, _ := redisstore.NewStore(rdb)
rateMiddleware := mgin.NewMiddleware(limiter.New(store, rate))

auth.POST("/register", rateMiddleware, handlers.Register)

🚀 環境変数（.env）

Backend (.env)
SMTP_FROM=your@gmail.com
SMTP_PASSWORD=your_app_password   # Gmailのアプリパスワード
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
REDIS_ADDR=localhost:6379
JWT_SECRET=your_super_secret_key

Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080

📦 必要なパッケージ

Go (Gin backend)
go get github.com/gin-gonic/gin
go get github.com/gin-contrib/cors
go get github.com/redis/go-redis/v9
go get github.com/golang-jwt/jwt/v5
go get github.com/ulule/limiter/v3

Next.js (特に追加パッケージ不要、標準fetch APIを使用)

---

既存プロジェクトへのメール認証機能実装ガイド

📊 現状分析

| 項目 | 現状 |
|------|------|
| SignUpTemplate | 3ステップフロー実装済み、OTP検証はハードコード(123456) |
| バックエンド | Register/Login 実装済み、メール送信・OTP機能なし |
| DB | PostgreSQL使用（Redisなし） |
| useAuth.ts | モックデータで動作、実API呼び出しなし |

🔄 変更するファイル一覧

📁 変更が必要なファイル

backend/
  ├── internal/config/config.go               ← SMTP設定追加
  ├── internal/handlers/auth.go               ← OTPハンドラー追加
  ├── internal/repository/interfaces.go       ← OTPインターフェース追加
  ├── internal/service/email_service.go       ← 🆕 新規作成
  ├── internal/repository/otp.go             ← 🆕 新規作成
  ├── migrations/000005_create_otp.up.sql    ← 🆕 新規作成
  ├── migrations/000005_create_otp.down.sql  ← 🆕 新規作成
  └── cmd/server/main.go                     ← ルート追加

frontend/
  ├── components/templates/SignUpTemplate/index.tsx ← モック→実APIへ変更
  └── hooks/useAuth.ts                             ← 実API呼び出しへ変更

.env.example                                 ← SMTP環境変数追加
docker-compose.yml                           ← SMTP環境変数追加

🗄️ Step 1: DBマイグレーション

backend/migrations/000005_create_otp.up.sql （新規作成）

CREATE TABLE IF NOT EXISTS otp_codes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT        NOT NULL,
    code       TEXT        NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- メールアドレスで高速検索するためのインデックス
CREATE INDEX idx_otp_codes_email ON otp_codes(email);

backend/migrations/000005_create_otp.down.sql （新規作成）

DROP TABLE IF EXISTS otp_codes;

⚙️ Step 2: バックエンド設定

backend/internal/config/config.go （SMTP設定を追加）

package config

import "os"

type Config struct {
    DatabaseURL   string
    JWTSecret     string
    Port          string
    GinMode       string
    EncryptionKey string

    // OAuth: Google
    GoogleClientID     string
    GoogleClientSecret string
    GoogleRedirectURL  string

    // OAuth: Instagram (Facebook)
    InstagramClientID     string
    InstagramClientSecret string
    InstagramRedirectURL  string

    FrontendURL string

    // Stripe
    StripeSecretKey     string
    StripeWebhookSecret string

    // ✅ 追加: SMTP設定
    SMTPHost     string
    SMTPPort     string
    SMTPUser     string
    SMTPPassword string
    SMTPFrom     string
}

func Load() *Config {
    return &Config{
        DatabaseURL:   mustEnv("DATABASE_URL"),
        JWTSecret:     mustEnv("JWT_SECRET"),
        Port:          getEnv("PORT", "8080"),
        GinMode:       getEnv("GIN_MODE", "debug"),
        EncryptionKey: getEnv("ENCRYPTION_KEY", ""),

        GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
        GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
        GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "..."),

        InstagramClientID:     getEnv("INSTAGRAM_CLIENT_ID", ""),
        InstagramClientSecret: getEnv("INSTAGRAM_CLIENT_SECRET", ""),
        InstagramRedirectURL:  getEnv("INSTAGRAM_REDIRECT_URL", "..."),

        FrontendURL: getEnv("FRONTEND_URL", "..."),

        StripeSecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
        StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),

        // ✅ 追加
        SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
        SMTPPort:     getEnv("SMTP_PORT", "587"),
        SMTPUser:     getEnv("SMTP_USER", ""),
        SMTPPassword: getEnv("SMTP_PASSWORD", ""),
        SMTPFrom:     getEnv("SMTP_FROM", ""),
    }
}

func mustEnv(key string) string {
    v := os.Getenv(key)
    if v == "" {
        panic("required environment variable not set: " + key)
    }
    return v
}

func getEnv(key, defaultVal string) string {
    if v := os.Getenv(key); v != "" {
        return v
    }
    return defaultVal
}

📧 Step 3: メール送信サービス

backend/internal/service/email_service.go （新規作成）

package service

import (
    "fmt"
    "net/smtp"

    "webSystemPJ/backend/internal/config"
)

type EmailService struct {
    cfg *config.Config
}

func NewEmailService(cfg *config.Config) *EmailService {
    return &EmailService{cfg: cfg}
}

func (s *EmailService) SendOTPEmail(toEmail, otp string) error {
    auth := smtp.PlainAuth("", s.cfg.SMTPUser, s.cfg.SMTPPassword, s.cfg.SMTPHost)

    subject := "【Wyze】メールアドレス認証コード"
    body := fmt.Sprintf(`
Wyzeをご利用いただきありがとうございます。

以下の認証コードを入力してください：

  ━━━━━━━━━━━━━━━━━━
        %s
  ━━━━━━━━━━━━━━━━━━

このコードは10分間有効です。
このメールに心当たりがない場合は無視してください。

Wyze サポートチーム
`, otp)

    msg := []byte(
        "From: " + s.cfg.SMTPFrom + "\r\n" +
            "To: " + toEmail + "\r\n" +
            "Subject: " + subject + "\r\n" +
            "Content-Type: text/plain; charset=UTF-8\r\n" +
            "\r\n" +
            body,
    )

    addr := s.cfg.SMTPHost + ":" + s.cfg.SMTPPort
    return smtp.SendMail(addr, auth, s.cfg.SMTPFrom, []string{toEmail}, msg)
}

🗃️ Step 4: OTPリポジトリ

backend/internal/repository/otp.go （新規作成）

package repository

import (
    "database/sql"
    "time"
)

type OTPRepository struct {
    db *sql.DB
}

func NewOTPRepository(db *sql.DB) *OTPRepository {
    return &OTPRepository{db: db}
}

// SaveOTP: 既存コードを削除してから新しいコードを保存
func (r *OTPRepository) SaveOTP(email, code string, expiresAt time.Time) error {
    // 既存コードを削除（再送信対応）
    _, err := r.db.Exec("DELETE FROM otp_codes WHERE email = $1", email)
    if err != nil {
        return err
    }
    _, err = r.db.Exec(
        "INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)",
        email, code, expiresAt,
    )
    return err
}

// VerifyOTP: コードを検証し、成功したら削除（使い捨て）
func (r *OTPRepository) VerifyOTP(email, code string) (bool, error) {
    var storedCode string
    var expiresAt time.Time

    err := r.db.QueryRow(
        "SELECT code, expires_at FROM otp_codes WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
        email,
    ).Scan(&storedCode, &expiresAt)

    if err == sql.ErrNoRows {
        return false, nil // コード未送信または期限切れで削除済み
    }
    if err != nil {
        return false, err
    }
    if time.Now().After(expiresAt) {
        // 期限切れ → 削除して false
        r.db.Exec("DELETE FROM otp_codes WHERE email = $1", email)
        return false, nil
    }
    if storedCode != code {
        return false, nil
    }

    // 一致 → 削除（使い捨て）
    _, err = r.db.Exec("DELETE FROM otp_codes WHERE email = $1", email)
    return true, err
}

backend/internal/repository/interfaces.go （OTPインターフェース追加）

package repository

import (
    "time"
    "webSystemPJ/backend/internal/models"
)

type UserRepositoryInterface interface {
    FindByEmail(email string) (*models.User, error)
    FindByID(id string) (*models.User, error)
    Create(email, hashedPassword, role string) (*models.User, error)
}

type PostRepositoryInterface interface {
    GetAll(userID string) ([]models.Post, error)
    GetByID(userID, postID string) (*models.Post, error)
    Create(userID, title, body string) (*models.Post, error)
}

// ✅ 追加
type OTPRepositoryInterface interface {
    SaveOTP(email, code string, expiresAt time.Time) error
    VerifyOTP(email, code string) (bool, error)
}

🔧 Step 5: ハンドラーにOTPエンドポイント追加

backend/internal/handlers/auth.go （SendOTP と VerifyOTP を追加）

package handlers

import (
    "fmt"
    "math/rand"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    jwt "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"

    "webSystemPJ/backend/internal/config"
    "webSystemPJ/backend/internal/models"
    "webSystemPJ/backend/internal/repository"
    "webSystemPJ/backend/internal/service"
)

// ─── 既存の構造体はそのまま ───

type loginRequest struct {
    Email    string json:"email" binding:"required,email"
    Password string json:"password" binding:"required"
}
type userProfile struct {
    ID    string json:"id"
    Email string json:"email"
    Role  string json:"role"
}
type loginResponse struct {
    Token string      json:"token"
    User  userProfile json:"user"
}
type registerRequest struct {
    Email    string json:"email" binding:"required,email"
    Password string json:"password" binding:"required,min=8"
}

// ─── 追加: OTPリクエスト構造体 ───

type sendOTPRequest struct {
    Email string json:"email" binding:"required,email"
}

type verifyOTPRequest struct {
    Email string json:"email" binding:"required,email"
    Code  string json:"code"  binding:"required,len=6"
}

// ─── 追加: OTP送信ハンドラー ───

func SendOTP(
    otpRepo repository.OTPRepositoryInterface,
    emailSvc *service.EmailService,
) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req sendOTPRequest
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "有効なメールアドレスを入力してください"})
            return
        }

        // 6桁のランダムコード生成
        code := fmt.Sprintf("%06d", rand.Intn(1000000))
        expiresAt := time.Now().Add(10 * time.Minute)

        if err := otpRepo.SaveOTP(req.Email, code, expiresAt); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "認証コードの保存に失敗しました"})
            return
        }

        if err := emailSvc.SendOTPEmail(req.Email, code); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "メール送信に失敗しました"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "認証コードを送信しました"})
    }
}

// ─── 追加: OTP検証ハンドラー ───

func VerifyOTP(otpRepo repository.OTPRepositoryInterface) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req verifyOTPRequest
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "入力内容が正しくありません"})
            return
        }

        ok, err := otpRepo.VerifyOTP(req.Email, req.Code)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "検証中にエラーが発生しました"})
            return
        }
        if !ok {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "認証コードが無効または期限切れです"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "認証に成功しました"})
    }
}

// ─── 既存: Register ─── （変更なし）

func Register(cfg *config.Config, userRepo repository.UserRepositoryInterface) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req registerRequest
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
            return
        }

        existing, err := userRepo.FindByEmail(req.Email)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
            return
        }
        if existing != nil {
            c.JSON(http.StatusConflict, gin.H{"error": "email already registered"})
            return
        }

        hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
            return
        }

        user, err := userRepo.Create(req.Email, string(hashed), "user")
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
            return
        }

        claims := &models.Claims{
            UserID: user.ID,
            Role:   user.Role,
            RegisteredClaims: jwt.RegisteredClaims{
                ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
                IssuedAt:  jwt.NewNumericDate(time.Now()),
            },
        }
        token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
        tokenString, err := token.SignedString([]byte(cfg.JWTSecret))
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
            return
        }

        c.JSON(http.StatusCreated, loginResponse{
            Token: tokenString,
            User:  userProfile{ID: user.ID, Email: user.Email, Role: user.Role},
        })
    }
}

// ─── 既存: Login ─── （変更なし）
func Login(cfg *config.Config, userRepo repository.UserRepositoryInterface) gin.HandlerFunc {
    // ... 既存コードそのまま
}

🚀 Step 6: ルーティング登録

backend/cmd/server/main.go （2行追加）

// 既存のリポジトリ初期化の後に追加
otpRepo := repository.NewOTPRepository(db)
emailSvc := service.NewEmailService(cfg)

// ルーティングに追加（r.POST("/register", ...) の近くに）
r.POST("/api/auth/send-otp",  handlers.SendOTP(otpRepo, emailSvc))
r.POST("/api/auth/verify-otp", handlers.VerifyOTP(otpRepo))

main.go の変更箇所（差分）:

// 既存
userRepo := repository.NewUserRepository(db)
postRepo := repository.NewPostRepository(db)
extAcctRepo := repository.NewExternalAccountRepository(db)

// ✅ 追加（この2行を追加）
otpRepo  := repository.NewOTPRepository(db)
emailSvc := service.NewEmailService(cfg)

// ... (既存コード) ...

r.POST("/register", handlers.Register(cfg, userRepo))
r.POST("/login", handlers.Login(cfg, userRepo))

// ✅ 追加（この2行を追加）
r.POST("/api/auth/send-otp",   handlers.SendOTP(otpRepo, emailSvc))
r.POST("/api/auth/verify-otp", handlers.VerifyOTP(otpRepo))

🖥️ Step 7: フロントエンド修正

frontend/hooks/useAuth.ts （実API呼び出しに変更）

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const AUTH_TOKEN_KEY  = 'auth_token';
const USER_EMAIL_KEY  = 'user_email';
const USER_WYZE_ID_KEY = 'user_wyze_id';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export interface User {
  email: string | null;
  wyzeId: string | null;
}

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState({ email: null, wyzeId: null });

  useEffect(() => {
    const email  = localStorage.getItem(USER_EMAIL_KEY);
    const wyzeId = localStorage.getItem(USER_WYZE_ID_KEY);
    setUser({ email, wyzeId });
  }, []);

  // ── 既存: ログイン（モックのまま or 実API化） ──
  const login = async (email: string, password: string): Promise => {
    try {
      const res = await fetch(${API_BASE}/login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(USER_EMAIL_KEY,  data.user.email);
      localStorage.setItem(USER_WYZE_ID_KEY, data.user.id);
      setUser({ email: data.user.email, wyzeId: data.user.id });
      return true;
    } catch {
      return false;
    }
  };

  // ── 追加: OTP送信 ──
  const sendOTP = async (email: string): Promise => {
    try {
      const res = await fetch(${API_BASE}/api/auth/send-otp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { ok: res.ok, message: data.message ?? data.error ?? '' };
    } catch {
      return { ok: false, message: 'ネットワークエラーが発生しました' };
    }
  };

  // ── 追加: OTP検証 ──
  const verifyOTP = async (
    email: string,
    code: string
  ): Promise => {
    try {
      const res = await fetch(${API_BASE}/api/auth/verify-otp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      return { ok: res.ok, message: data.message ?? data.error ?? '' };
    } catch {
      return { ok: false, message: 'ネットワークエラーが発生しました' };
    }
  };

  // ── 変更: 実APIでユーザー登録 ──
  const register = async (
    email: string,
    password: string,
    wyzeId: string
  ): Promise => {
    try {
      const res = await fetch(${API_BASE}/register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error ?? '登録に失敗しました' };

      localStorage.setItem(AUTH_TOKEN_KEY,   data.token);
      localStorage.setItem(USER_EMAIL_KEY,   data.user.email);
      localStorage.setItem(USER_WYZE_ID_KEY, wyzeId);
      setUser({ email: data.user.email, wyzeId });
      return { ok: true, message: '登録成功' };
    } catch {
      return { ok: false, message: 'ネットワークエラーが発生しました' };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_WYZE_ID_KEY);
    setUser({ email: null, wyzeId: null });
    router.push('/');
  };

  const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  };

  return { login, register, sendOTP, verifyOTP, logout, isAuthenticated, user };
};

frontend/components/templates/SignUpTemplate/index.tsx （モック → 実API）

変更箇所のみ抜粋：

// ❌ 削除
const MOCK_AUTH_CODE = ['1', '2', '3', '4', '5', '6'];

// ✅ 変更後のSignUpTemplate（useAuthからsendOTP/verifyOTPを取得）
export const SignUpTemplate: React.FC = () => {
  // ... 既存のstate宣言はそのまま ...

  // ✅ sendOTP / verifyOTP を追加で取得
  const { register, sendOTP, verifyOTP } = useAuth();

  // ── ✅ handleEmailSubmit: 実APIでOTP送信 ──
  const handleEmailSubmit = async () => {
    setErrorMessage('');
    if (!email) {
      setErrorMessage('※メールアドレスを入力してください');
      return;
    }
    // メールアドレス形式チェック
    if (!/^+@+\.+$/.test(email)) {
      setErrorMessage('有効なメールアドレスを入力してください');
      return;
    }
    const result = await sendOTP(email);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    setSubStep(2);
  };

  // ── ✅ handleCodeVerify: 実APIでOTP検証 ──
  const handleCodeVerify = async () => {
    setErrorMessage('');
    if (code.some((c) => !c)) {
      setErrorMessage('※6桁の認証コードを入力してください');
      return;
    }
    const result = await verifyOTP(email, code.join(''));
    if (!result.ok) {
      setErrorMessage('認証コードが無効または期限切れです');
      return;
    }
    setSubStep(3);
  };

  // ── ✅ handleUserInfoSubmit: 実APIでユーザー登録 ──
  const handleUserInfoSubmit = async () => {
    setErrorMessage('');
    if (!nickname) { setErrorMessage('※ニックネームを入力してください'); return; }
    const pwError = validatePassword(password);
    if (pwError) { setErrorMessage(pwError); return; }
    if (password !== passwordConfirm) { setErrorMessage('パスワードが一致しません'); return; }
    if (!shopName) { setErrorMessage('※店舗名を入力してください'); return; }
    if (!agree) { setErrorMessage('利用規約・プライバシーポリシーに同意してください'); return; }

    const newWyzeId = wyze_${Date.now().toString(36)};
    const result = await register(email, password, newWyzeId);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    setWyzeId(newWyzeId);
    setStep(3);
  };

  // handleFinish はそのまま（ただしregisterは既に呼び済みなのでrouter.replaceのみ）
  const handleFinish = () => {
    router.replace('/home');
  };

  // ... renderStep() 以降はほぼ変更なし
  // SubStep2_1のonSubmitをasync handleEmailSubmitに
  // SubStep2_2のonVerifyをasync handleCodeVerifyに
  // SubStep2_3のonSubmitをasync handleUserInfoSubmitに
};

SubStep2_2 の handleVerify 内部も変更：

// ❌ 削除（モック検証ロジック）
const handleVerify = () => {
  if (code.every((c) => c !== '')) {
    setShowVerifyNotification(true);
    setTimeout(() => {
      setShowVerifyNotification(false);
      onVerify(); // ← これがhandleCodeVerifyに変わる
    }, 1000);
  } else {
    onVerify();
  }
};
// ✅ 変更なし（onVerify の中身が実APIになるため、このラッパーはそのまま使える）

🌿 Step 8: 環境変数

.env.example に追加

Database
POSTGRES_DB=webSystemDB
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME_password

JWT (minimum 32 characters)
JWT_SECRET=CHANGE_ME_minimum_32_characters_xxxxxxxxxxxxxxxx

Backend
GIN_MODE=debug
PORT=8080

Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080

✅ 追加: SMTP（Gmailの場合）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your_app_password_here   # Googleアプリパスワード(16文字)
SMTP_FROM=your@gmail.com

docker-compose.yml の backend.environment に追加

backend:
  environment:
    DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?sslmode=disable
    JWT_SECRET: ${JWT_SECRET}
    GIN_MODE: ${GIN_MODE:-debug}
    PORT: ${PORT:-8080}
✅ 追加
    SMTP_HOST:     ${SMTP_HOST:-smtp.gmail.com}
    SMTP_PORT:     ${SMTP_PORT:-587}
    SMTP_USER:     ${SMTP_USER}
    SMTP_PASSWORD: ${SMTP_PASSWORD}
    SMTP_FROM:     ${SMTP_FROM}

📋 実装チェックリスト

バックエンド
  ☐ migrations/000005_create_otp.up.sql   作成
  ☐ migrations/000005_create_otp.down.sql 作成
  ☐ internal/service/email_service.go     作成
  ☐ internal/repository/otp.go            作成
  ☐ internal/repository/interfaces.go     OTPInterface追加
  ☐ internal/config/config.go             SMTP設定追加
  ☐ internal/handlers/auth.go             SendOTP/VerifyOTP追加
  ☐ cmd/server/main.go                    ルート2本追加

フロントエンド
  ☐ hooks/useAuth.ts                      sendOTP/verifyOTP/register実装
  ☐ SignUpTemplate/index.tsx              MOCK_AUTH_CODE削除 & 実API呼び出し

環境設定
  ☐ .env に SMTP_* 設定
  ☐ docker-compose.yml に SMTP_* 追加
  ☐ Gmail の「アプリパスワード」発行

💡 Gmailアプリパスワードの取得方法

SMTP_PASSWORD には通常のGmailパスワードではなくアプリパスワードが必要です

1. Googleアカウント → セキュリティ → 2段階認証をON
2. セキュリティ → アプリパスワード → 「メール」を選択
3. 生成された 16文字 のパスワードを SMTP_PASSWORD に設定

#### Gemini提案
作業者提案のアーキテクチャは合理的ですが、本プロジェクトの文脈に合わせて以下の点を改善・調整することを提案いたします。

1. **ミドルウェアの選定:** 提案では Redis を使用していますが、現在のプロジェクト構成（PostgreSQL + Gin）を維持し、インフラの追加コストと管理負荷を避けるため、**PostgreSQL に `otp_codes` テーブルを作成する** アプローチ（Step 4以降の内容）を強く推奨します。
2. **ディレクトリ構成の遵守:** 提案コードでは `myapp` パッケージが使用されていますが、既存の `webSystemPJ/backend/internal/...` 構成およびインターフェース定義に従って実装する必要があります。
3. **セキュリティ向上:** OTP生成には `math/rand` ではなく、暗号学的に安全な `crypto/rand` を使用すべきです。
4. **フロントエンドの整合性:** 提案では App Router（`app/`）が想定されていますが、本プロジェクトは Pages Router（`pages/`）を採用しているため、既存の `SignUpTemplate` および `useAuth` フックへの機能追加として実装するのが適切です。
5. **SMTP設定:** 開発・テスト環境では Mailtrap や Mailpit 等の利用を検討し、本番環境の認証情報は `.env` で厳密に管理します。

#### Claude提案

**現状認識**: Phase 12 Task 2 で既に `email_verifications` テーブル + `/api/auth/send-code` + `/api/auth/verify-code` が実装済み（CLAUDE.md 参照）。作業者提案の Redis + 新規OTPテーブル方式は既存実装と重複する。

**提案**: 既存実装の環境変数設定漏れが原因の可能性が高い。

1. Cloud Run の Secret Manager に `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` が登録されているか確認
2. 未登録なら Secret Manager に追加 → `cd-staging.yml` の `--set-secrets` に追加 → 再デプロイ
3. フロントエンドの `NEXT_PUBLIC_MOCK_MODE=false` が Vercel 環境変数に設定されているか確認
4. 上記設定後にメール送信が動作するかステージングで再検証

**実装作業**: 環境変数確認・設定はマスター作業。コード変更は不要の見込み。

#### 決定案

### 2

#### 作業者提案
#### Gemini提案
セキュリティと利便性のバランスを考慮し、パスワード入力コンポーネントに `onBlur` イベントを追加して、フォーカスが外れた際に自動的に表示状態を `false`（非表示）に戻す実装を提案いたします。
- **Frontend:** `SignUpTemplate` 内の該当コンポーネントに `onBlur={() => setShowPassword(false)}` を追加。

#### Claude提案

**Gemini提案に同意。** `onBlur` による非表示化で対応可能。

```tsx
<input
  type={showPassword ? 'text' : 'password'}
  onBlur={() => setShowPassword(false)}
  // ... 既存props
/>
```

- パスワード確認欄（`passwordConfirm`）にも同様の `onBlur` を追加
- 影響範囲: `SignUpTemplate/index.tsx` のパスワード入力部分のみ
- 即実装可能

#### 決定案
### 3
#### 作業者提案
#### Gemini提案
後日のGoogle新規登録実装を見据え、現状は「連携済みの場合のみ表示」するフラグをバックエンドから取得するか、フロントエンドの `useAuth` で連携状態をチェックするロジックを組み込みます。
- **API:** メールアドレス入力時にGoogle連携済みかを確認するエンドポイント（例: `GET /api/auth/check-provider`）の導入。
- **Frontend:** ボタンの表示・非表示をAPIレスポンスに基づいて制御。

#### Claude提案

**設計判断が必要。** 2つの方針あり。

- **方針A（Gemini案: API追加）**: `GET /api/auth/check-provider` を新設し連携状態を取得 → 未連携時はボタン非表示。工数: バックエンド+フロントエンド両方の変更が必要。
- **方針B（現状維持）**: 備考に「後日Googleアカウントを用いて新規登録も実装予定」とあるため、Google新規登録フロー実装時にまとめて対応。工数: ゼロ。

**マスターへの確認事項**: Google 新規登録の実装時期が近いなら方針B、遠いなら方針A。

#### 決定案
### 4
#### 作業者提案
#### Gemini提案
認証・登録フロー全体に一貫したブランドカラーを適用するため、共通のレイアウトコンポーネント（`AuthLayout`）の作成を推奨いたします。
- **Frontend:** `frontend/components/templates/AuthLayout.tsx` を新規作成し、`min-h-screen bg-[#00A48D]` を適用。Splash, SignUp, Login の各ページをこの Layout でラップ。

#### Claude提案

**Gemini提案の `AuthLayout` 共通化に同意。** ただし、既存の `_app.tsx` やページ構成を確認してから着手すべき。

**最小限の対応案**（`AuthLayout` 新設が過剰な場合）:
- スプラッシュ・新規登録ページのルート `<div>` に `className="min-h-screen bg-[#00A48D]"` を直接追加
- `body` タグへの適用は他ページに影響するため避ける

**調査が必要**: 該当ファイルの特定（テスト結果に「該当部分を調査」とある）。対象ファイル特定後に即実装可能。

#### 決定案
### 5
#### 作業者提案
#### Gemini提案
Facebook Graph API 等のレスポンスに含まれる詳細なエラー情報を活用し、ユーザーが「ビジネスアカウントへの切り替え」などの具体的なアクションを取れるようトーストやモーダルで案内します。
- **Frontend:** 連携エラー時に、エラーメッセージから「ビジネスアカウントではない」旨を判別し、解決手順へのリンクを含む警告を表示。

#### Claude提案

**2つの原因を切り分ける必要あり。**

1. **OAuth リダイレクト URI 未設定**（インフラ側）: Phase 8 の CLAUDE.md に「Meta/Google コンソールでの設定変更が必要」と記録済み。未対応ならまずこちらを解消。
2. **エラーハンドリング不足**（コード側）: Gemini提案のエラーメッセージ表示に同意。`AccountLinkingSection.tsx` で連携失敗時の条件分岐を追加し「このアカウントはビジネスアカウントではないため連携できません」メッセージを表示。

**対応順序**: まずマスターが OAuth リダイレクト URI を設定 → 再検証 → それでもエラーならコード側のエラーハンドリングを実装。

#### 決定案
### 6
#### 作業者提案
#### Gemini提案
バックエンドの `Subscription` モデルに `status` (none, active, trialing, canceled) を持たせ、`none` の場合はすべての項目を初期状態（未契約）として表示するレンダリング制御を徹底します。
- **Backend:** 契約状態に応じたフラグをレスポンスに付与。
- **Frontend:** `subscription.status === 'none'` の場合に「未契約」と表示。

#### Claude提案

**原因**: `NEXT_PUBLIC_MOCK_MODE` が未設定（デフォルト `true`）のため、`useBilling` がモックデータを返却している可能性が高い。

**提案（段階的）**:
1. まず Vercel 環境変数 `NEXT_PUBLIC_MOCK_MODE=false` を設定 → 再デプロイ → 再検証（マスター作業）
2. 解消されない場合、Phase 12 Task 3 で実装済みの `useProfile()` による `plan_tier` 分岐が正しく動作しているか確認
3. `plan_tier === 'free'` の場合に「未契約」と表示するロジックが不足していれば追加

**Gemini提案との差異**: バックエンド側の `Subscription` モデル変更は不要の見込み。既存の `useProfile` + `plan_tier` で十分対応可能。

#### 決定案
### 7
#### 作業者提案
#### Gemini提案
未契約時には、モックデータを表示せずにプラン比較や「契約手続きへ」の案内のみをレンダリングします。
- **Frontend:** 有効なデータが存在する場合のみ、各情報を `&&` 演算子等で条件付き表示。

#### Claude提案

**No.6 と同一原因（モックデータ優先）。** `NEXT_PUBLIC_MOCK_MODE=false` 設定後に解消される見込み。

解消されない場合、`BillingTemplate.tsx` の料金表示部分に条件分岐を追加:
```tsx
{plan_tier !== 'free' && (
  <div>{/* 料金表示 */}</div>
)}
```

**補足**: Phase 13 で 10 Price ID を設定済み。Stripe Dashboard 上の価格設定との整合確認はマスター作業。

#### 決定案
### 8
#### 作業者提案
#### Gemini提案
支払い情報のセクションを非表示にし、「カード情報が登録されていません」などの案内へ切り替えます。
- **Frontend:** 未登録状態での条件レンダリング。

#### Claude提案

**No.6, No.7 と同一原因（モックデータ優先）。** `NEXT_PUBLIC_MOCK_MODE=false` 設定後に解消される見込み。

解消されない場合、`BillingTemplate.tsx` の支払い方法セクションに条件分岐を追加:
```tsx
{paymentMethods.length === 0 && plan_tier === 'free' ? (
  <p>現在契約されていません</p>
) : (
  <div>{/* 既存の支払い方法表示 */}</div>
)}
```

**カード情報確認**: Phase 11 で Stripe Elements + SetupIntent フロー実装済み。`GET /api/billing/payment-methods` の動作検証はモック解除後に実施。

#### 決定案
### 9
#### 作業者提案
#### Gemini提案
`DashboardSection.tsx` で採用されているオーバーレイの実装を、共通のUIコンポーネント（`UnlinkedStateOverlay`）として抽象化し、再利用します。
- **Frontend:** 背景ぼかし、メッセージ中央配置のオーバーレイ共通化。

#### Claude提案

**Gemini提案の共通コンポーネント化に同意。** ただし、現時点で使用箇所が `DashboardSection` と `BillingTemplate` の2箇所のみなら、共通化は過剰な可能性あり。

**最小限の対応案**（`DashboardSection.tsx` の Overlay パターンをコピー）:
```tsx
// BillingTemplate.tsx の支払い情報セクション
{paymentMethods.length === 0 && (
  <div style={{ position: 'relative' }}>
    <div style={{ filter: 'blur(4px)', pointerEvents: 'none' }}>
      {/* 既存コンテンツ */}
    </div>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.7)'
    }}>
      <p>カード情報を登録してください</p>
    </div>
  </div>
)}
```

**判断ポイント**: 今後3箇所以上で使うなら共通化、2箇所なら直接実装。マスター判断。

#### 決定案
### 10
#### 作業者提案
#### Gemini提案
Stripe API のサブスクリプション更新（`cancel_at_period_end`）を利用し、バックエンド経由で解約予約を実行する機能を実装します。
- **Backend:** `POST /api/billing/cancel` の実装。成功時に `cancel_at_period_end` を True に。
- **Frontend:** キャンセル実行後の「解約予約中」ステータスの反映。

#### Claude提案

**Phase 11 で Stripe Customer Portal を実装済み。** Customer Portal 経由でキャンセルが可能なはず。

**確認事項**:
1. `NEXT_PUBLIC_MOCK_MODE=false` 設定後にキャンセルボタンが動作するか再検証
2. ボタンの `onClick` が `useBilling` の Customer Portal 呼び出し（`POST /api/billing/portal-session`）に接続されているか確認
3. Stripe Dashboard で Customer Portal の設定（キャンセル許可）が有効か確認（マスター作業）

**Gemini提案との差異**: 独自の `POST /api/billing/cancel` は不要の見込み。Stripe Customer Portal で対応可能。新規 API 追加はモック外し後に動作しない場合のみ検討。

#### 決定案
### 11
#### 作業者提案
#### Gemini提案
Google Business Profile API の連携状態をフロントエンドで検知し、データが null の場合は Empty State（店舗情報未連携の案内）を表示するよう条件分岐させます。
- **Frontend:** `AccountTemplate` で店舗情報の有無に応じた表示切り替え。

#### Claude提案

**Gemini提案に同意。** `AccountTemplate.tsx` で以下の対応が必要:

1. `NEXT_PUBLIC_MOCK_MODE` による分岐が未実装なら追加
2. Google ビジネスアカウント未連携時（データが `null` or 空）の場合:
   - 「Google ビジネスアカウントを連携してください」と表示
   - 連携ボタンを表示
3. 連携済みの場合: 既存の店舗情報表示

**実装作業**: `AccountTemplate.tsx` の現状確認後に即実装可能。

#### 決定案
### 12
#### 作業者提案
#### Gemini提案
`pages/support.tsx` を新規作成し、シンプルな問い合わせフォームを設置します。バックエンドは前述の `EmailService` を流用し、管理者宛にメールを飛ばすサービスを実装します。
- **Frontend:** 問い合わせフォーム画面作成。
- **Backend:** `POST /api/support/contact` の実装。

#### Claude提案

**新規機能のため設計判断が必要。** Gemini に設計を依頼すべき。

**最低限の要件（テスト結果より）**:
- お問い合わせ情報入力フォーム（名前、メール、カテゴリ、本文）
- 送信ボタン
- 送信後「お問い合わせありがとうございます。後日お問い合わせ内容をメールで送信します」の表示
- メール送信（既存の `EmailService` を流用可能）

**Gemini に確認すべき点**:
- フォームの項目設計（カテゴリ一覧等）
- バックエンドの問い合わせ保存先（DBテーブル or メール転送のみ）
- ルーティング（`/support` or `/help`）
- 通知メールのテンプレート
- ナビゲーションへの追加箇所

**実装作業**: 設計決定後に即実装可能。

#### 決定案
### 13
#### 作業者提案
#### Gemini提案
`NotificationItem` コンポーネントにハードコードされているモックデータを空配列 `[]` に変更し、通知がゼロの場合の Empty State（「現在通知はありません」）のデザインを実装します。
- **Frontend:** 通知データの有無に応じた条件レンダリング。

#### Claude提案

**Gemini提案に同意。** 対応:

1. `NotificationItem.tsx` またはその親コンポーネントでモックデータのハードコードを確認
2. `NEXT_PUBLIC_MOCK_MODE` 分岐を追加: `IS_MOCK === false` 時はモックデータを使用しない
3. 通知 API が存在する場合は実 API から取得、空なら「通知はありません」を表示
4. 通知 API が未実装の場合は空配列を返却し「通知はありません」を表示

**実装作業**: 通知周りの現状確認後に即実装可能。

#### 決定案
### 14
#### 作業者提案
#### Gemini提案
Vercelのダッシュボードより、Production Branch（本番）を `main`、Preview Deployments（ステージング）を `develop` に明示的に設定します。
- **Infra:** 独自ドメインの紐付けと、ブランチごとの環境変数設定の見直し。

#### Claude提案

**Gemini提案に同意。** Vercel Dashboard で以下を設定:

1. Project Settings → Git → Production Branch: `main`
2. `develop` ブランチの Preview Deployment URL をステージング用として使用
3. 環境変数は Preview / Production で分離設定（`NEXT_PUBLIC_API_URL` 等がブランチごとに正しいか確認）

**注意**: No.15 の 401 エラーもこのブランチ設定ミスが原因。`develop` ブランチのコードがデプロイされれば解消される見込み。

**実装作業**: Vercel Dashboard の設定変更はマスター作業。コード変更不要。

#### 決定案

### 15
#### 作業者提案
#### Gemini提案
環境変数の不一致（JWT_SECRET 等）や CORS 設定の不足が考えられます。`main` ブランチがステージングURLで動いている場合、環境変数の不整合が生じる可能性があるため、プレビュー環境の設定を再確認します。
- **Infra:** 各ブランチにおける環境変数の完全一致を確認。
- **Backend:** 許可されたオリジンの再設定。

#### Claude提案

**No.14 の解消で連鎖的に解決される見込み。**

`main` ブランチがデプロイされている状態では、`develop` ブランチで追加した Stripe 関連のコード（Phase 11 の SetupIntent フロー等）が存在しないため 401 エラーが発生している。

**対応順序**:
1. No.14 を解決（`develop` ブランチをデプロイ）
2. 再検証 → まだ 401 なら以下を確認:
   - `STRIPE_SECRET_KEY` が Vercel 環境変数に設定されているか
   - バックエンドの CORS 設定（`cors.go`）にステージング URL が含まれているか
   - JWT_SECRET がフロントエンド・バックエンド間で一致しているか

**実装作業**: インフラ設定はマスター作業。コード変更は No.14 解消後に再判断。

#### 決定案


#### localhost　テスト結果
##### プラン確認変更
- プラン確認変更にプラン選択がない
  - お支払い情報にあるプラン選択コンポーネントを持ってくる

#### お支払い情報
- 「カードを登録する」を押しても「クレジットカードを登録してください」のレイヤーが外れない