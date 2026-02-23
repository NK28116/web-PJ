import { MOCK_USER } from '@/test/mock/authMockData';
import { useRouter } from 'next/router';

const AUTH_TOKEN_KEY = 'auth_token';

export const useAuth = () => {
  const router = useRouter();

  const login = (email: string, password: string): boolean => {
    if (!email || !password) return false;
    if (email !== MOCK_USER.email || password !== MOCK_USER.password) return false;
    localStorage.setItem(AUTH_TOKEN_KEY, 'mock_token');
    return true;
  };

  const register = () => {
    // モック登録: トークンを発行してログイン状態にする
    localStorage.setItem(AUTH_TOKEN_KEY, 'mock_token');
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    router.push('/');
  };

  const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  };

  return { login, register, logout, isAuthenticated };
};
