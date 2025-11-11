import React from 'react';
import { cn } from '@/utils/cn';
import { BaseComponentProps, Size, Variant } from '@/types';

export interface IconProps extends BaseComponentProps {
  name: string;
  size?: Size;
  color?: Variant | 'default' | 'muted';
  spin?: boolean;
}

const sizeClasses: Record<Size, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const colorClasses: Record<Variant | 'default' | 'muted', string> = {
  default: 'text-gray-900',
  muted: 'text-gray-600',
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  info: 'text-blue-600',
};

// 簡易的なアイコンコンポーネント（実際には react-icons や SVG を使用）
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'default',
  spin = false,
  className,
}) => {
  // 実際の実装では、react-icons や SVG を使用
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        sizeClasses[size],
        colorClasses[color],
        spin && 'animate-spin',
        className
      )}
      aria-label={name}
    >
      {/* アイコンの実装 */}
      <svg
        className={cn(sizeClasses[size])}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* デフォルトのアイコン */}
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
};



