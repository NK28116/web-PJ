import React from 'react';
import { cn } from '@/utils/cn';
import { BaseComponentProps, Size, Variant } from '@/types';

export interface TextProps extends BaseComponentProps {
  as?: 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: Size;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: Variant | 'default' | 'muted';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
}

const sizeClasses: Record<Size, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
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

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

export const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  size = 'md',
  weight = 'normal',
  color = 'default',
  align = 'left',
  truncate = false,
  children,
  className,
  style,
}) => {
  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        colorClasses[color],
        alignClasses[align],
        truncate && 'truncate',
        className
      )}
      style={style}
    >
      {children}
    </Component>
  );
};



