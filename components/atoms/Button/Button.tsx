import { BaseComponentProps, ButtonVariant, ClickableProps, Size, Variant } from '@/types';
import { cn } from '@/utils/cn';
import React from 'react';

/**
 * 使い方
 * <Button
 *   onClick={() => {}} // クリックイベント
 *   variant="solid"    // スタイルバリエーション ('solid' | 'outline' | 'ghost' | 'link')
 *   color="primary"    // カラーテーマ ('primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info')
 *                      // 未指定(undefined/null)の場合は、黒を基調としたデフォルトの配色になります。
 *                      // variantが未指定の状態でcolorを指定した場合、'solid'バリアントが適用されます。
 *   size="md"          // サイズ ('xs' | 'sm' | 'md' | 'lg' | 'xl')
 *   fullWidth={false}  // 横幅いっぱいにするか
 * >
 *   ボタンコンポーネント
 * </Button>
 */

export interface ButtonProps extends BaseComponentProps, ClickableProps {
  variant?: ButtonVariant;
  color?: Variant;
  size?: Size;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const sizeClasses: Record<Size, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-2.5 text-lg',
  xl: 'px-6 py-3 text-xl',
};

const variantClasses: Record<ButtonVariant, Record<Variant, string>> = {
  solid: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    error: 'bg-red-600 text-white hover:bg-red-700',
    info: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  outline: {
    primary: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    secondary: 'border-2 border-secondary-600 text-secondary-600 hover:bg-secondary-50',
    success: 'border-2 border-green-600 text-green-600 hover:bg-green-50',
    warning: 'border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50',
    error: 'border-2 border-red-600 text-red-600 hover:bg-red-50',
    info: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  },
  ghost: {
    primary: 'text-primary-600 hover:bg-primary-50',
    secondary: 'text-secondary-600 hover:bg-secondary-50',
    success: 'text-green-600 hover:bg-green-50',
    warning: 'text-yellow-600 hover:bg-yellow-50',
    error: 'text-red-600 hover:bg-red-50',
    info: 'text-blue-600 hover:bg-blue-50',
  },
  link: {
    primary: 'text-primary-600 underline hover:text-primary-700',
    secondary: 'text-secondary-600 underline hover:text-secondary-700',
    success: 'text-green-600 underline hover:text-green-700',
    warning: 'text-yellow-600 underline hover:text-yellow-700',
    error: 'text-red-600 underline hover:text-red-700',
    info: 'text-blue-600 underline hover:text-blue-700',
  },
};

const defaultVariantClasses: Record<ButtonVariant, string> = {
  solid: 'bg-black text-white hover:bg-gray-800',
  outline: 'border-2 border-black text-black hover:bg-gray-50',
  ghost: 'text-black hover:bg-gray-100',
  link: 'text-black underline hover:text-gray-800',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  color,
  size = 'md',
  type = 'button',
  fullWidth = false,
  disabled = false,
  onClick = () => alert('※現在開発中です'),
  className,
  style,
}) => {
  const variantStyle =
    variant && color ? variantClasses[variant][color] :
    variant ? defaultVariantClasses[variant] :
    color ? variantClasses['solid'][color] :
    'border border-black text-black bg-transparent hover:bg-gray-50';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-medium rounded-lg transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        sizeClasses[size],
        variantStyle,
        disabled && 'opacity-50 cursor-not-allowed',
        fullWidth && 'w-full',
        className
      )}
      style={style}
    >
      {children}
    </button>
  );
};
