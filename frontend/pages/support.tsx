import Head from 'next/head';
import { SupportTemplate } from '@/components/templates/SupportTemplate';

export default function SupportPage() {
  return (
    <>
      <Head>
        <title>サポート・ヘルプ - Wyze System</title>
      </Head>
      <SupportTemplate />
    </>
  );
}
