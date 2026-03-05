import '@/styles/globals.css';
import { AuthGuard } from '@/components/auth/AuthGuard';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <AuthGuard pathname={router.pathname}>
      <Component {...pageProps} />
    </AuthGuard>
  );
}
