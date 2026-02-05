import React from 'react';

export interface BarChartDataItem {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartDataItem[];
  height?: number;
  barColor?: string;
  className?: string;
}

/**
 * 汎用棒グラフコンポーネント
 * 曜日・時間帯傾向などの表示に使用
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 150,
  barColor = '#D9D9D9',
  className = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 border border-gray-100 rounded ${className}`}
        style={{ height }}
      >
        <span className="text-sm text-gray-400">COMING SOON</span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value));
  const barAreaHeight = height - 24; // ラベル用のスペースを確保

  return (
    <div className={className}>
      <div className="flex items-end justify-between px-2 gap-2 border-b border-gray-200">
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * barAreaHeight : 0;
          return (
            <div key={index} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{
                  height: `${Math.max(barHeight, item.value > 0 ? 4 : 0)}px`,
                  backgroundColor: barColor,
                }}
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
