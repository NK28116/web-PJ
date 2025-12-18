import { CurrentFeaturesTemplate } from '@/templates/CurrentFeaturesTemplate';
import Head from 'next/head';

export default function CurrentFeaturesPage() {
  return (
    <>
      <Head>
        <title>ご利用中の機能 - Wyze System</title>
        <meta name="description" content="Wyze System Web Application - Current Features" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <CurrentFeaturesTemplate />
    </>
  );
}
