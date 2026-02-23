import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

export const LoginTemplate: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('※未入力の箇所があります');
      return;
    }

    const success = login(email, password);
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
        className="text-white text-[33px] font-normal mt-[18px] mb-[19px]"
        style={{ fontFamily: "Kdam Thmor Pro, serif" }}
      >
        Wyze
      </p>

      {/* メールアドレス入力 */}
      <input
        type="email"
        placeholder="Wyze ID ,メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoCapitalize="none"
        className="w-[85%] h-10 bg-[#FFFFFF] border border-black rounded-[5px] px-3 mt-[15px] mb-0.5 text-black placeholder-[#00A48D]"
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
      <div className="w-[85%] h-10 bg-[#FFFFFF] border border-black rounded-[5px] flex items-center px-3 mt-[15px] mb-0.5">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 bg-transparent text-black placeholder-[#00A48D] outline-none"
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
        className="w-[85%] bg-[#006355] text-white text-sm font-bold py-[10px] rounded-[5px] border border-black mt-6 mb-6"
      >
        新規登録
      </button>
    </div>
  );
};
