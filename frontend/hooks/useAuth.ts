import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { apiPost } from '@/utils/api';
import type { LoginResponse } from '@/types/api';

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
    const email = localStorage.getItem(USER_EMAIL_KEY);
    const wyzeId = localStorage.getItem(USER_WYZE_ID_KEY);
    setUser({ email, wyzeId });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) return false;
    try {
      const res = await apiPost<LoginResponse>('/login', { email, password });
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      localStorage.setItem(USER_EMAIL_KEY, res.user.email);
      localStorage.setItem(USER_WYZE_ID_KEY, res.user.id);
      setUser({ email: res.user.email, wyzeId: res.user.id });
      return true;
    } catch (err) {
      console.error('[useAuth] Login failed:', err);
      return false;
    }
  };

  const register = async (email: string, password?: string) => {
    try {
      // パスワードがない場合はデフォルト値を設定（SignUpTemplate側の制約に合わせる）
      const res = await apiPost<LoginResponse>('/register', { 
        email, 
        password: password || 'password12345' 
      });
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      localStorage.setItem(USER_EMAIL_KEY, res.user.email);
      localStorage.setItem(USER_WYZE_ID_KEY, res.user.id);
      setUser({ email: res.user.email, wyzeId: res.user.id });
    } catch (err) {
      console.error('[useAuth] Register failed:', err);
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

  return { login, register, logout, isAuthenticated, user };
};
