import { Header } from '@/organisms/Header';
import { cn } from '@/utils/cn';
import React from 'react';

export interface BaseTemplateProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'review';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'review') => void;
  customTabLabels?: { [key: string]: string };
  children: React.ReactNode;
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  className,
  activeTab = 'home',
  onTabChange,
  customTabLabels,
  children,
}) => {
  return (
    <div
      className={cn(
        'w-full min-h-screen bg-white flex flex-col',
        className
      )}
    >
      {/* ヘッター */}
      <Header 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        customTabLabels={customTabLabels}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 px-4 py-6">{children}</div>
    </div>
  );
};
