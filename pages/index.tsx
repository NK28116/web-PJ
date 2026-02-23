import { LoginTemplate } from '@/templates/LoginTemplate';
import { SplashScreen } from '@/templates/SplashScreen';
import { useAuth } from '@/hooks/useAuth';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

export default function IndexPage() {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSplashComplete = () => {
    if (isAuthenticated()) {
      router.push('/home');
    } else {
      setShowSplash(false);
    }
  };

  return (
    <>
      <Head>
        <title>Wyze System</title>
        <meta name="description" content="Wyze System Web Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Telugu&display=swap"
          rel="stylesheet"
        />
      </Head>
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <LoginTemplate />
      )}
    </>
  );
}
