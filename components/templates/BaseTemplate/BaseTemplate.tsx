import React from 'react';
import { Header } from '@/organisms/Header';
import { cn } from '@/utils/cn';

export interface BaseTemplateProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'auto-reply';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'auto-reply') => void;
  children: React.ReactNode;
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  className,
  activeTab = 'home',
  onTabChange,
  children,
}) => {
  return (
    <div
      className={cn(
        'w-full min-h-screen bg-white flex flex-col',
        'max-w-[393px] mx-auto',
        className
      )}
    >
      {/* ヘッター */}
      <Header activeTab={activeTab} onTabChange={onTabChange} />

      {/* メインコンテンツ */}
      <div className="flex-1 px-4 py-6">{children}</div>
    </div>
  );
};

