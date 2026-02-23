import { Spinner } from '@/atoms/Spinner';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const PUBLIC_PATHS = ['/', '/signup'];

interface AuthGuardProps {
  children: React.ReactNode;
  pathname: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, pathname }) => {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!isPublic && !token) {
      router.replace('/');
    } else if (pathname === '/signup' && token) {
      // 認証済みユーザーが /signup にアクセスした場合のみリダイレクト
      // / (SplashScreen) は onComplete で認証チェックするためリダイレクトしない
      router.replace('/home');
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1A1A]">
        <Spinner size="xl" />
      </div>
    );
  }

  return <>{children}</>;
};
