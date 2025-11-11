import React, { useState } from 'react';
import { BaseTemplate } from '@/templates/BaseTemplate';
import Head from 'next/head';

export default function AutoReplyPage() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'post' | 'report' | 'auto-reply'
  >('auto-reply');

  return (
    <>
      <Head>
        <title>自動返信 - Wyze System</title>
        <meta
          name="description"
          content="Wyze System Web Application - Auto Reply"
        />
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
      <BaseTemplate activeTab={activeTab} onTabChange={setActiveTab}>
        <h1>自動返信</h1>
      </BaseTemplate>
    </>
  );
}

