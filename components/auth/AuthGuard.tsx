import { Spinner } from '@/atoms/Spinner';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const PUBLIC_PATHS = ['/', '/login', '/signup'];

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
      router.replace('/login');
    } else if ((pathname === '/signup' || pathname === '/login') && token) {
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
