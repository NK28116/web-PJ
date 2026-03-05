import React from 'react';
import { Text } from '@/atoms/Text';
import { Button } from '@/atoms/Button';
import { cn } from '@/utils/cn';

export interface DashboardStats {
  systemStatus: string;
  aiReplyWaiting: number | null;
  newReviews: number | null;
  todayProfileViews: number | null;
  todaySearchCount: number | null;
  weekOverWeek: string | null;
  monthOverMonth: string | null;
}

export interface DashboardSectionProps {
  className?: string;
  isGoogleLinked: boolean;
  aiPriorityAction: string | null;
  stats: DashboardStats;
  onRefresh?: () => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  className,
  isGoogleLinked,
  aiPriorityAction,
  stats,
  onRefresh,
}) => {
  const formatValue = (value: number | null): string => {
    return value !== null ? String(value) : '-';
  };

  return (
    <section className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <Text className="text-[15px] font-normal text-black">
          ダッシュボード
        </Text>
        <Button
          className="bg-[#C4C4C4] rounded-full px-4 py-1"
          onClick={onRefresh}
        >
          <Text className="text-[11px] text-black">更新する</Text>
        </Button>
      </div>

      <div className="border-t border-[#D9D9D9] pt-4 space-y-4">
        {/* AI Priority Action */}
        <div className="bg-[#D5F6F2] rounded-md p-4 text-center space-y-2 mx-1">
          <Text className="text-[15px] text-black block">
            AIによる最優先アクション
          </Text>
          <Text className="text-[15px] text-black block font-medium">
            {aiPriorityAction ?? '-'}
          </Text>
        </div>

        {/* Stats Area */}
        <div className="relative">
          {/* Overlay for unlinked state */}
          {!isGoogleLinked && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 p-4 rounded text-center">
                <Text className="text-[15px] text-black whitespace-pre-wrap leading-relaxed">
                  Googleで連携すると{'\n'}使用できます
                </Text>
              </div>
            </div>
          )}

          {/* Stats List */}
          <div
            className={cn(
              'space-y-0',
              !isGoogleLinked && 'opacity-50 blur-[1px] pointer-events-none select-none'
            )}
          >
            {/* システム稼働状況 */}
            <StatRow label="システム稼働状況" value={stats.systemStatus} />

            {/* AI返信待ち口コミ */}
            <StatRow
              label="AI返信待ち口コミ"
              value={formatValue(stats.aiReplyWaiting)}
              unit="件"
            />

            {/* 新しい口コミ */}
            <StatRow
              label="新しい口コミ"
              value={formatValue(stats.newReviews)}
              unit="件"
            />

            {/* 本日のプロフィール閲覧数 */}
            <StatRow
              label="本日のプロフィール閲覧数"
              value={formatValue(stats.todayProfileViews)}
              unit="件"
            />

            {/* 本日の検索数 */}
            <StatRow
              label="本日の検索数"
              value={formatValue(stats.todaySearchCount)}
              unit="件"
            />

            {/* 前週比 / 前月比 */}
            <StatRow
              label="前週比 / 前月比"
              value={
                stats.weekOverWeek && stats.monthOverMonth
                  ? `${stats.weekOverWeek} / ${stats.monthOverMonth}`
                  : '-% / -%'
              }
              isLast
            />
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatRowProps {
  label: string;
  value: string;
  unit?: string;
  isLast?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, unit, isLast }) => {
  return (
    <div
      className={cn(
        'py-3 px-2 flex justify-between items-center',
        !isLast && 'border-b border-[#E5E5E5]'
      )}
    >
      <Text className="text-[15px] text-black">{label}</Text>
      <div className="flex items-center gap-2">
        <Text className="text-[15px] text-black font-bold">{value}</Text>
        {unit && <Text className="text-[15px] text-black">{unit}</Text>}
      </div>
    </div>
  );
};
