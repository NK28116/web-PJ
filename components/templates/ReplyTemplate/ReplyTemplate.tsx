import React from 'react';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { Text } from '@/atoms/Text';
import { cn } from '@/utils/cn';
import { Button } from '@/components/atoms/Button';

export const ReplyTemplate: React.FC = () => {
  // ダミーデータ（口コミありの状態）
  const reviews = [
    {
      id: 1,
      user: '佐藤 花子',
      rating: 5,
      date: '2025/09/15',
      content: '店員さんの対応がとても丁寧で、料理も美味しかったです。特にハンバーグが絶品でした！また来ます。',
      status: 'unreplied',
      isNew: true,
    },
    {
      id: 2,
      user: '田中 健太',
      rating: 4,
      date: '2025/09/14',
      content: 'ランチで利用しました。コスパが良いと思います。少し混んでいたので待ち時間がありましたが、許容範囲内です。',
      status: 'unreplied',
      isNew: true,
    },
    {
      id: 3,
      user: '鈴木 一郎',
      rating: 3,
      date: '2025/09/10',
      content: '味は普通でしたが、提供時間が少し遅かったです。改善を期待します。',
      status: 'replied',
      isNew: false,
    },
  ];

  const hasReviews = reviews.length > 0;

  return (
    <BaseTemplate 
      activeTab="auto-reply" 
      customTabLabels={{ 'auto-reply': '口コミ返信' }}
    >
      <div className="flex flex-col gap-6 h-full pb-10">
        {/* 統計情報エリア */}
        <div className="grid grid-cols-2 gap-3">
            {/* 未返信口コミ数 */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
                <Text className="text-sm text-gray-600 mb-2">未返信口コミ数</Text>
                <div className="flex items-end justify-end gap-1">
                    <Text className="text-xl font-medium">{hasReviews ? '2' : '-'}</Text>
                    <Text className="text-xs text-gray-500 mb-1">件</Text>
                </div>
            </div>
            {/* 総合評価 */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
                <Text className="text-sm text-gray-600 mb-2">総合評価</Text>
                <div className="flex items-end justify-end gap-1">
                    <Text className="text-xl font-medium">{hasReviews ? '4.0' : '-'}</Text>
                    <Text className="text-xs text-gray-500 mb-1">/5.0</Text>
                </div>
            </div>
            {/* 返信率 */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
                <Text className="text-sm text-gray-600 mb-2">返信率（％）</Text>
                <div className="flex items-end justify-end gap-1">
                    <Text className="text-xl font-medium">{hasReviews ? '85' : '-'}</Text>
                    <Text className="text-xs text-gray-500 mb-1">％</Text>
                </div>
            </div>
            {/* 平均返信時間 */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
                <Text className="text-sm text-gray-600 mb-2">平均返信時間</Text>
                <div className="flex items-end justify-end gap-1">
                    <Text className="text-xl font-medium">{hasReviews ? '24' : '-'}</Text>
                    <Text className="text-xs text-gray-500 mb-1">時間</Text>
                </div>
            </div>
        </div>

        {/* フィルター・ソート */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 cursor-pointer">
                    <Text className="font-medium text-base">すべて</Text>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <Text className="text-gray-500 text-sm">{hasReviews ? reviews.length : 0} 件</Text>
            </div>
            <div className="flex items-center gap-2 cursor-pointer border px-3 py-1 rounded bg-white border-gray-200">
                <Text className="text-xs text-gray-600">返信推奨順</Text>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </div>

        {/* メインコンテンツ */}
        {hasReviews ? (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      {review.user[0]}
                    </div>
                    <div>
                      <Text className="text-sm font-bold">{review.user}</Text>
                      <div className="flex items-center text-yellow-400 text-xs">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        <Text className="ml-2 text-gray-400">{review.date}</Text>
                      </div>
                    </div>
                  </div>
                  {review.isNew && (
                    <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full">NEW</span>
                  )}
                </div>
                <Text className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {review.content}
                </Text>
                <div className="flex justify-end gap-2">
                  <Button className="text-xs px-3 py-1.5 border border-gray-300 rounded text-gray-600">
                    詳細を見る
                  </Button>
                  <Button className="text-xs px-3 py-1.5 bg-[#00A48D]  rounded">
                    返信する
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 mt-4 bg-[#F9FAFB] rounded-lg border border-dashed border-gray-300">
              <div className="w-[120px] h-[120px] bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
              </div>
              <Text className="text-base font-medium mb-3 text-gray-900">集客改善のチャンスです！</Text>
              <Text className="text-sm text-gray-500 leading-relaxed max-w-[280px]">
                  Googleマップの口コミを増やす施策を実施し、<br/>お店の魅力を見える化しましょう。
              </Text>
          </div>
        )}
      </div>
    </BaseTemplate>
  );
};
