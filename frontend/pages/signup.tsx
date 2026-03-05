import { SignUpTemplate } from '@/templates/SignUpTemplate';
import Head from 'next/head';
import React from 'react';

export default function SignUpPage() {
  return (
    <>
      <Head>
        <title>新規登録 - Wyze System</title>
        <meta name="description" content="Wyze System Web Application - Sign Up" />
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
      <SignUpTemplate />
    </>
  );
}
