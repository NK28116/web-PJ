import React from 'react';
import { SplashScreen } from '@/templates/SplashScreen';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Wyze System - Web System PJ</title>
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Kdam+Thmor+Pro&display=swap"
          rel="stylesheet"
        />
      </Head>
      <SplashScreen />
    </>
  );
}

