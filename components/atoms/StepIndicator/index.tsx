import React from 'react';

const STEPS = ['登録方法選択', 'アカウント情報入力', '登録完了'];

interface StepIndicatorProps {
  step: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ step }) => {
  return (
    <div className="w-[90%] pb-3">
      <div className="flex items-center w-full">
        {STEPS.map((_, index) => {
          const isActiveOrDone = step >= index + 1;
          return (
            <React.Fragment key={index}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  isActiveOrDone
                    ? 'bg-[#00A48D] border-[#00A48D]'
                    : 'border-[#00A48D]'
                }`}
              >
                <span
                  className={`text-xs font-bold ${
                    isActiveOrDone ? 'text-[#FFFFFF]' : 'text-[#00A48D]'
                  }`}
                >
                  {index + 1}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 bg-[#00A48D] mx-0.5" />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        {STEPS.map((label, index) => {
          const isActive = step === index + 1;
          return (
            <span
              key={index}
              className="text-[#00A48D] text-xs text-center"
              style={{ opacity: isActive ? 1 : 0.5, width: '33%' }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
};
