import React from 'react';
import { cn } from '@/utils/cn';
import { BaseComponentProps, FormElementProps, Size } from '@/types';

export interface LabelProps extends BaseComponentProps, Omit<FormElementProps, 'placeholder'> {
  htmlFor?: string;
  size?: Size;
  required?: boolean;
}

const sizeClasses: Record<Size, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export const Label: React.FC<LabelProps> = ({
  id,
  htmlFor,
  size = 'sm',
  required = false,
  children,
  className,
}) => {
  return (
    <label
      htmlFor={htmlFor || id}
      className={cn(
        'block font-medium text-gray-700',
        sizeClasses[size],
        className
      )}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

