import React from 'react';

export interface ChartSegment {
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: ChartSegment[];
  size?: number;
  thickness?: number;
}

/**
 * 汎用ドーナツグラフコンポーネント
 */
export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 130,
  thickness = 20,
}) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  let currentOffset = 0;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {segments.map((segment, index) => {
          const dash = (segment.value / total) * circumference;
          const offset = currentOffset;
          currentOffset += dash;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-offset}
            />
          );
        })}
      </svg>
    </div>
  );
};
