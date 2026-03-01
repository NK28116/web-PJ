import { LoginTemplate } from '@/templates/LoginTemplate';
import Head from 'next/head';
import React from 'react';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Wyze System - ログイン</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <LoginTemplate />
    </>
  );
}
