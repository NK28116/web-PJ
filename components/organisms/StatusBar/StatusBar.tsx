import React from 'react';
import { cn } from '@/utils/cn';

export interface StatusBarProps {
  className?: string;
  time?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  className,
  time = '10:28',
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-[30px] pt-[15px] pb-0',
        className
      )}
    >
      {/* 時刻 */}
      <span className="text-base font-normal text-[#141414] leading-[1.21em]">
        {time}
      </span>

      {/* ステータスアイコン群 */}
      <div className="flex items-center gap-2">
        {/* 信号強度インジケーター */}
        <div className="flex items-end gap-0.5">
          <div className="w-[3px] h-[3px] bg-[#707070] rounded-full" />
          <div className="w-[3px] h-[5px] bg-[#707070] rounded-full" />
          <div className="w-[3px] h-[7px] bg-[#707070] rounded-full" />
          <div className="w-[3px] h-[9px] bg-[#707070] rounded-full" />
        </div>

        {/* WiFiアイコン */}
        <div className="w-[17px] h-[17px] flex items-center justify-center">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white"
          >
            <path
              d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* バッテリーアイコン */}
        <div className="w-[23px] h-[23px] flex items-center justify-center">
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white"
          >
            <path
              d="M15.67 4H14V2c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

