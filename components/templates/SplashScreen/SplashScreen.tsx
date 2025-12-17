import { Text } from '@/atoms/Text';
import { cn } from '@/utils/cn';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

export interface SplashScreenProps {
  className?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ className }) => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/home');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);
  return (
    <div
      className={cn(
        'w-full min-h-screen bg-white flex flex-col',
        'max-w-[393px] mx-auto',
        className
      )}
      style={{ height: '852px' }}
    >
      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* 背景色の矩形 */}
        <div
          className="absolute inset-x-0 top-0 bottom-0"
          style={{ backgroundColor: '#00A48D' }}
        />

        {/* ロゴテキスト */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
          <Text
            as="h1"
            className="text-[48px] leading-[1.546em] text-center"
            style={{
              fontFamily: "'Kdam Thmor Pro', sans-serif",
              fontWeight: 400,
              color: '#FFFAFA',
            }}
          >
            wyze
          </Text>
        </div>

        {/* コピーライト */}
        <div className="relative z-10 pb-8">
          <Text
            as="p"
            className="text-xs leading-[1.21em] text-center text-white"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
            }}
          >
            Copyright Wyze System Inc. All Right Reserved.
          </Text>
        </div>
      </div>
    </div>
  );
};
