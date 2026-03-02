import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_EMAIL_KEY = 'user_email';
const USER_WYZE_ID_KEY = 'user_wyze_id';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

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
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      // 別ユーザーのキャッシュ・状態が残らないよう完全クリア
      localStorage.clear();
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(USER_EMAIL_KEY, data.user.email);
      localStorage.setItem(USER_WYZE_ID_KEY, data.user.id);
      setUser({ email: data.user.email, wyzeId: data.user.id });
      return true;
    } catch {
      return false;
    }
  };

  const register = (email: string, wyzeId: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'mock_token');
    localStorage.setItem(USER_EMAIL_KEY, email);
    localStorage.setItem(USER_WYZE_ID_KEY, wyzeId);
    setUser({ email, wyzeId });
  };

  const logout = () => {
    // 前ユーザーのキャッシュ・状態が一切残らないよう完全クリア
    localStorage.clear();
    setUser({ email: null, wyzeId: null });
    router.push('/login');
  };

  const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  };

  return { login, register, logout, isAuthenticated, user };
};
