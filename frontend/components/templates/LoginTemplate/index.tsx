import { useAuth } from '@/hooks/useAuth';
import { MOCK_ADMIN, MOCK_USER, MOCK_USER_A, MOCK_USER_B } from '@/test/mock/authMockData';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

export const LoginTemplate: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  // Google ソーシャルログイン後のトークン処理
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      router.push('/home');
    }
  }, [router]);

  const handleGoogleLogin = () => {
    window.location.assign(API_URL + '/api/auth/google/login');
  };

  const handleDevLogin = async () => {
    const success = await login(MOCK_USER.email, MOCK_USER.password);
    if (success) {
      router.push('/home');
    }
  };

  const handleDevLoginAs = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      router.push('/home');
    }
  };

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('※未入力の箇所があります');
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push('/home');
    } else {
      setErrorMessage('ログインに失敗しました');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#00A48D] flex flex-col items-center max-w-[393px] mx-auto">
      {/* ヘッダー区切り */}
      <div className="w-full h-[3px] bg-[#A3A19E] mt-10" />

      {/* ブランドロゴ */}
      <p
        className="text-black text-[33px] font-normal mt-[18px] mb-[19px]"
        style={{ fontFamily: "Kdam Thmor Pro, serif" }}
      >
        Wyze
      </p>
      {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === 'develop' && (
        <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded mb-2">[branch:develop]</span>
      )}

      {/* メールアドレス入力 */}
      <input
        type="email"
        placeholder="Wyze ID ,メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoCapitalize="none"
        className="w-[85%] h-10 bg-[#FFFFFF] border border-black rounded-[5px] px-3 mt-[15px] mb-0.5 text-black placeholder-[#00A48D] focus:bg-transparent focus:text-white focus:caret-white focus:border-white focus:outline-none"
      />

      {/* パスワード忘れ */}
      <p className="text-[#FFFFFF] text-[13px] mt-6 mb-6 text-center">
        メールアドレスをお忘れの方はこちら
      </p>

      {/* エラーメッセージ（メールの下） */}
      {errorMessage && (
        <p className="w-[85%] text-red-500 text-[13px] mb-2">{errorMessage}</p>
      )}

      {/* パスワード入力 */}
      <div className="w-[85%] h-10 bg-[#FFFFFF] border border-black rounded-[5px] flex items-center px-3 mt-[15px] mb-0.5 focus-within:bg-transparent focus-within:border-white">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 bg-transparent text-black placeholder-[#00A48D] outline-none focus:text-white focus:caret-white"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-[#707070] text-sm ml-2"
          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
        >
          {showPassword ? '非表示' : '表示'}
        </button>
      </div>

      {/* パスワード忘れ */}
      <p className="text-[#FFFFFF] text-[13px] mt-6 mb-6 text-center">
        パスワードをお忘れの方はこちら
      </p>

      {/* ログインボタン */}
      <button
        onClick={handleLogin}
        className="w-[85%] bg-[#FFF767] text-[#00A48D] text-base font-bold py-[10px] rounded-[5px] mt-4"
      >
        ログイン
      </button>

      {/* 新規登録ボタン */}
      <button
        onClick={() => router.push('/signup')}
        className="w-[85%] bg-[#006355] text-black text-sm font-bold py-[10px] rounded-[5px] border border-black mt-6 mb-4"
      >
        新規登録
      </button>

      {/* Google ソーシャルログインボタン */}
      <button
        onClick={handleGoogleLogin}
        className="w-[85%] bg-white text-gray-700 text-sm font-bold py-[10px] rounded-[5px] border border-gray-300 mb-6 flex items-center justify-center gap-2"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google でログイン
      </button>

      {/* 開発用ログインボタン（開発環境のみ表示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="w-[85%] flex flex-col gap-2 mb-6">
          <button
            onClick={handleDevLogin}
            className="w-full bg-gray-800 text-yellow-300 text-sm font-bold py-[10px] rounded-[5px] border border-dashed border-yellow-400"
          >
            [DEV] 開発用ログイン
          </button>
          <button
            onClick={() => handleDevLoginAs(MOCK_ADMIN.email, MOCK_ADMIN.password)}
            className="w-full bg-gray-800 text-yellow-300 text-sm font-bold py-[10px] rounded-[5px] border border-dashed border-yellow-400"
          >
            [DEV] 開発用ログイン(管理者)
          </button>
          <button
            onClick={() => handleDevLoginAs(MOCK_USER_A.email, MOCK_USER_A.password)}
            className="w-full bg-gray-800 text-yellow-300 text-sm font-bold py-[10px] rounded-[5px] border border-dashed border-yellow-400"
          >
            [DEV] 開発用ログイン(一般ユーザーA)
          </button>
          <button
            onClick={() => handleDevLoginAs(MOCK_USER_B.email, MOCK_USER_B.password)}
            className="w-full bg-gray-800 text-yellow-300 text-sm font-bold py-[10px] rounded-[5px] border border-dashed border-yellow-400"
          >
            [DEV] 開発用ログイン(一般ユーザーB)
          </button>
        </div>
      )}
    </div>
  );
};
