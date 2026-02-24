import React, { useEffect, useRef, useState } from 'react';

export type FilterOption = 'all' | 'replied' | 'unreplied';

const FILTER_LABELS: Record<FilterOption, string> = {
  all: 'すべて',
  replied: '返信済み',
  unreplied: '未返信',
};

interface ReviewFilterProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
}

export const ReviewFilter: React.FC<ReviewFilterProps> = ({ value, onChange }) => {
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

  const handleSelect = (option: FilterOption) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 font-medium text-base"
      >
        {FILTER_LABELS[value]}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-md min-w-[120px]">
          {(Object.keys(FILTER_LABELS) as FilterOption[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={[
                'w-full text-left px-4 py-2 text-sm',
                value === option ? 'font-semibold text-[#00A48D]' : 'text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {FILTER_LABELS[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
