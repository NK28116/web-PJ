import React from 'react';

export interface LineChartDataset {
  label: string;
  color: string;
  data: number[];
}

export interface LineChartProps {
  labels: string[];
  datasets: LineChartDataset[];
  height?: number;
  maxValue?: number;
  yAxisLabels?: string[];
  className?: string;
  disclaimer?: string;
  invertYAxis?: boolean;
}

/**
 * 汎用折れ線グラフコンポーネント
 * MEO順位推移などの時系列データ表示に使用
 */
export const LineChart: React.FC<LineChartProps> = ({
  labels,
  datasets,
  height = 150,
  maxValue = 20,
  yAxisLabels = ['1位', '10位', '20位'],
  className = '',
  disclaimer,
  invertYAxis = false,
}) => {
  const calculateY = (value: number) => {
    const normalized = (value / maxValue) * 100;
    return invertYAxis ? 100 - normalized : normalized;
  };
  if (!datasets || datasets.length === 0 || !labels || labels.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 border border-gray-100 rounded ${className}`}
        style={{ height }}
      >
        <span className="text-sm text-gray-400">COMING SOON</span>
      </div>
    );
  }

  return (
    <div className={`mt-6 pl-8 ${className}`}>
      <div className="border-b border-l border-gray-300 relative mt-4" style={{ height }}>
        {/* Y軸ラベル */}
        {yAxisLabels.map((label, index) => {
          const basePosition = index === 0 ? 5 : index === 1 ? 50 : 100;
          const position = invertYAxis ? 100 - basePosition : basePosition;
          return (
            <div
              key={index}
              className="absolute -left-8 -translate-y-1/2 text-xs text-gray-400"
              style={{ top: `${position}%` }}
            >
              {label}
            </div>
          );
        })}

        <div className="absolute top-0 left-0 w-full h-full">
          {/* overflow-hidden: データポイントがチャート領域外に描画されないよう制限 */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="overflow-hidden"
          >
            {/* 補助線（横） */}
            <line
              x1="0"
              y1="5"
              x2="100"
              y2="5"
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="0"
              y1="50"
              x2="100"
              y2="50"
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="0"
              y1="100"
              x2="100"
              y2="100"
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />

            {/* 補助線（縦） */}
            {labels.map((_, i) => {
              const x = (i / (labels.length - 1)) * 100;
              return (
                <line
                  key={`vgrid-${i}`}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="100"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {/* データライン */}
            {datasets.map((dataset, index) => (
              <g key={index}>
                <polyline
                  points={dataset.data
                    .map((value, i) => {
                      const x = (i / (labels.length - 1)) * 100;
                      const y = calculateY(value);
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke={dataset.color}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                {dataset.data.map((value, i) => (
                  <circle
                    key={i}
                    cx={(i / (labels.length - 1)) * 100}
                    cy={calculateY(value)}
                    r="2"
                    fill={dataset.color}
                    stroke="white"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* X軸ラベル */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {labels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      {/* 免責事項 */}
      {disclaimer && (
        <p className="mt-4 text-[10px] text-gray-400 leading-relaxed">{disclaimer}</p>
      )}
    </div>
  );
};
