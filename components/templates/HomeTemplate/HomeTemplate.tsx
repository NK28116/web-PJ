import React from 'react';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { Text } from '@/atoms/Text';
import { Button } from '@/atoms/Button';

export interface HomeTemplateProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'auto-reply';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'auto-reply') => void;
  children?: React.ReactNode;
}

export const HomeTemplate: React.FC<HomeTemplateProps> = ({
  className,
  activeTab = 'home',
  onTabChange,
  children,
}) => {
  return (
    <BaseTemplate
      className={className}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      {children}
      <div className="space-y-6">
        {/* アカウント連携セクション */}
        <section className="space-y-4">
          <Text
            as="h2"
            className="text-base font-normal text-black"
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
          >
            アカウント連携
          </Text>

          {/* Google連携カード */}
          <div className="border border-gray-300 rounded bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <Text className="text-xs">G</Text>
                </div>
                <Text
                  className="text-base font-normal text-black"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Google
                </Text>
              </div>
              <Text
                className="text-sm font-normal text-black"
                style={{
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                未連携
              </Text>
            </div>
            <Button
              variant="outline"
              className="w-full"
              style={{
                color: '#00A48D',
                borderColor: '#00A48D',
              }}
            >
              連携する
            </Button>
          </div>
        </section>

        {/* インスタグラム連携セクション */}
        <section className="space-y-4">
          <Text
            as="h2"
            className="text-base font-normal text-black"
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
          >
            インスタグラム連携
          </Text>

          <div className="border border-gray-300 rounded bg-white p-4">
            <Button
              variant="outline"
              className="w-full"
              style={{
                color: '#00A48D',
                borderColor: '#00A48D',
              }}
            >
              ビジネスプロフィールからインポート
            </Button>
          </div>
        </section>

        {/* 店舗一覧セクション */}
        <section className="space-y-4">
          <Text
            as="h2"
            className="text-base font-normal text-black"
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
          >
            店舗一覧
          </Text>

          {/* 店舗カードのプレースホルダー */}
          <div className="border border-gray-300 rounded bg-white p-4">
            <Text
              className="text-sm text-gray-600 text-center"
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
            >
              店舗が登録されていません
            </Text>
          </div>
        </section>
      </div>
    </BaseTemplate>
  );
};

