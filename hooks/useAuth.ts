import { MOCK_USER } from '@/test/mock/authMockData';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_EMAIL_KEY = 'user_email';
const USER_WYZE_ID_KEY = 'user_wyze_id';

export interface User {
  email: string | null;
  wyzeId: string | null;
}

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User>({ email: null, wyzeId: null });

  useEffect(() => {
    // クライアントサイドでのみ実行
    const email = localStorage.getItem(USER_EMAIL_KEY);
    const wyzeId = localStorage.getItem(USER_WYZE_ID_KEY);
    setUser({ email, wyzeId });
  }, []);

  const login = (email: string, password: string): boolean => {
    if (!email || !password) return false;
    if (email !== MOCK_USER.email || password !== MOCK_USER.password) return false;
    
    localStorage.setItem(AUTH_TOKEN_KEY, 'mock_token');
    localStorage.setItem(USER_EMAIL_KEY, email);
    localStorage.setItem(USER_WYZE_ID_KEY, 'mock_user_id'); // ログイン時は固定ID
    setUser({ email, wyzeId: 'mock_user_id' });
    return true;
  };

  const register = (email: string, wyzeId: string) => {
    // モック登録: トークンとユーザー情報を保存
    localStorage.setItem(AUTH_TOKEN_KEY, 'mock_token');
    localStorage.setItem(USER_EMAIL_KEY, email);
    localStorage.setItem(USER_WYZE_ID_KEY, wyzeId);
    setUser({ email, wyzeId });
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

  return { login, register, logout, isAuthenticated, user };
};
