import { Text } from '@/atoms/Text';
import React from 'react';
import { IoIosArrowRoundDown, IoIosArrowRoundUp } from 'react-icons/io';
import { SectionTitle } from './SectionTitle';

export interface KPICardProps {
  title: string;
  value: number | string;
  unit: string;
  tooltip?: string;
  change?: string; // "+25%" | "-3.2%"
  changeLabel?: string; // "前月比" など
  className?: string;
}

/**
 * KPIカード共通コンポーネント
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  tooltip,
  change,
  changeLabel,
  className,
}) => {
  const isPositive =
    change?.trim().startsWith('+') ||
    (!!change && !change.trim().startsWith('-'));

  const isNegative = change?.trim().startsWith('-');

  const ArrowIcon = isNegative ? IoIosArrowRoundDown : IoIosArrowRoundUp;

  const changeColor = isNegative ? 'text-[#E54848]' : 'text-[#3C84FF]';

  return (
    <div
      className={['bg-white', 'p-4', 'rounded-lg', 'border border-gray-200', className].join(' ')}
    >
      <div className="flex flex-col h-full">
        <SectionTitle title={title} tooltip={tooltip} />

        <div className="flex items-end justify-between">
          {/* Value + Unit */}
          <div className="flex items-end gap-1">
            <Text className="text-4xl sm:text-5xl font-semibold tracking-tight text-wyze-primary">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>

            <Text className="mb-1 text-xl sm:text-2xl font-bold text-gray-900">
              {unit}
            </Text>
          </div>

          {/* Change */}
          {change && (isPositive || isNegative) && (
            <div className="flex flex-col items-end mb-1">
              {changeLabel && (
                <Text className="text-sm text-gray-500 mb-1">{changeLabel}</Text>
              )}
              <div className="flex items-center">
                <ArrowIcon size={32} className={changeColor} />
                <span
                  className={`text-xl sm:text-2xl font-normal ${changeColor}`}
                >
                  {change}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
