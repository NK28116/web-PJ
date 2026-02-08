import React, { useState } from 'react';
import { HomeTemplate } from '@/templates/HomeTemplate';
import Head from 'next/head';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'post' | 'report' | 'review'
  >('home');

  return (
    <>
      <Head>
        <title>ホーム - Wyze System</title>
        <meta name="description" content="Wyze System Web Application - Home" />
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
      <HomeTemplate activeTab={activeTab} onTabChange={setActiveTab}>
        <h1>ホーム</h1>
      </HomeTemplate>
    </>
  );
}

