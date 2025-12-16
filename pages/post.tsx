import React from 'react';
import { PostTemplate } from '@/templates/PostTemplate';
import Head from 'next/head';

export default function PostPage() {
  return (
    <>
      <Head>
        <title>投稿 - Wyze System</title>
        <meta name="description" content="Wyze System Web Application - Post" />
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
      <PostTemplate />
    </>
  );
}
