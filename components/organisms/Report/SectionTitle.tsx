import { Text } from '@/atoms/Text';
import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

export interface SectionTitleProps {
  title: string;
  tooltip?: string;
}

/**
 * セクションタイトルとツールチップを表示するコンポーネント
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({ title, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showTooltip]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip((prev) => !prev);
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <Text className="text-sm text-gray-600">{title}</Text>
      {tooltip && (
        <div className="relative" ref={tooltipRef}>
          <AiOutlineQuestionCircle
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors select-none"
            size={16}
            onClick={handleToggle}
            aria-label="ツールチップを表示"
            role="button"
            tabIndex={0}
          />
          {showTooltip && (
            <div className="absolute z-10 left-0 top-6 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
              {tooltip}
              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-800 transform rotate-45" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
