import { Text } from '@/components/atoms/Text';
import { BaseTemplate } from '@/components/templates/BaseTemplate';
import { operationalReportData } from '@/test/mock/reportMockData';
import React, { useEffect, useRef, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import AiTab from './AiTab';
import ReportTab from './ReportTab';

/**
 * 期間選択モーダルコンポーネント
 */
const PeriodSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { label: '先月', value: 'lastMonth' },
    { label: '直近 7 日間', value: 'lastWeek' },
    { label: '直近 2 週間', value: 'last2Week' },
    { label: '月間別', value: 'thisYear' },
  ];

  const selectedLabel = options.find((opt) => opt.value === value)?.label || '選択してください';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-sm font-medium text-gray-800">{selectedLabel}</span>
        <IoIosArrowDown
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-40 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
          {/* 吹き出しの三角 */}
          <div className="absolute -top-2 right-6 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100" />

          <div className="relative py-2 bg-white rounded-lg">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 text-gray-700 ${
                  value === option.value
                    ? 'font-bold underline decoration-[#00A48D] decoration-2 underline-offset-4'
                    : ''
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const formatDate = (date: Date): string => {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

const getDateRange = (period: string): string => {
  const now = new Date();

  if (period === 'lastMonth') {
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    return `${formatDate(lastMonthStart)}〜${formatDate(lastMonthEnd)}`;
  }

  if (period === 'lastWeek') {
    const end = new Date(now);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    return `${formatDate(start)}〜${formatDate(end)}`;
  }

  if (period === 'last2Week') {
    const end = new Date(now);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 13);
    return `${formatDate(start)}〜${formatDate(end)}`;
  }

  if (period === 'thisYear') {
    return `${now.getFullYear()}年1月1日〜${now.getFullYear()}年12月31日`;
  }

  return '';
};

export const ReportTemplate: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'ai'>('report');
  const [selectedPeriod, setSelectedPeriod] = useState('lastMonth');

  return (
    <BaseTemplate activeTab="report">
      <div className="flex flex-col gap-6 pb-20 bg-[#F5F5F5] min-h-screen">
        {/* タブ・期間選択 */}
        <div className="bg-white sticky top-0 z-10 shadow-sm">
          <div className="px-4 pt-4 pb-0 flex items-center justify-between border-b border-gray-200 ">
            <div className="flex gap-6 items-center w-full">
              <button
                onClick={() => setActiveTab('report')}
                className={`pb-3 text-base font-medium transition-colors border-b-2 flex-1 text-center ${
                  activeTab === 'report'
                    ? 'text-[#00A48D] border-[#00A48D]'
                    : 'text-gray-400 border-transparent'
                }`}
              >
                運用実績レポート
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`pb-3 text-base font-medium transition-colors border-b-2 flex-1 text-center ${
                  activeTab === 'ai'
                    ? 'text-[#00A48D] border-[#00A48D]'
                    : 'text-gray-400 border-transparent'
                }`}
              >
                AI分析
              </button>
            </div>
          </div>
          <div className="px-4 py-3 bg-[#F9FAFB] flex justify-between items-center border-b border-gray-200">
            <Text className="text-base font-medium text-gray-800">
              {getDateRange(selectedPeriod)}
            </Text>
            <div className="flex items-center gap-2">
              <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
            </div>
          </div>
        </div>

        {/* タブコンテンツの表示 */}
        {activeTab === 'report' && <ReportTab data={operationalReportData} />}
        {activeTab === 'ai' && <AiTab />}
      </div>
    </BaseTemplate>
  );
};
