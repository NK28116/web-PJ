import React, { useEffect, useRef, useState } from 'react';

export type SortOption = 'recommended' | 'newest' | 'oldest' | 'ratingHigh' | 'ratingLow';

const SORT_LABELS: Record<SortOption, string> = {
  recommended: '返信推奨順',
  newest: '新しい順',
  oldest: '古い順',
  ratingHigh: '評価の高い順',
  ratingLow: '評価の低い順',
};

interface ReviewSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export const ReviewSort: React.FC<ReviewSortProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SortOption) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 border px-3 py-1 rounded bg-white border-gray-200"
      >
        <span className="text-xs text-gray-600">{SORT_LABELS[value]}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-md min-w-[140px]">
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={[
                'w-full text-left px-4 py-2 text-xs',
                value === option ? 'font-semibold text-[#00A48D]' : 'text-gray-600 hover:bg-gray-50',
              ].join(' ')}
            >
              {SORT_LABELS[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
