import React from 'react';
import { cn } from '@/utils/cn';
import { BaseComponentProps, FormElementProps, Size } from '@/types';

export interface InputProps extends BaseComponentProps, FormElementProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  size?: Size;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fullWidth?: boolean;
}

const sizeClasses: Record<Size, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-2.5 text-lg',
  xl: 'px-6 py-3 text-xl',
};

export const Input: React.FC<InputProps> = ({
  type = 'text',
  size = 'md',
  id,
  name,
  placeholder,
  value,
  defaultValue,
  required,
  disabled,
  error,
  fullWidth = false,
  onChange,
  className,
}) => {
  return (
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      required={required}
      disabled={disabled}
      onChange={onChange}
      className={cn(
        'border rounded-lg transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        sizeClasses[size],
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
        disabled && 'bg-gray-100 cursor-not-allowed',
        fullWidth && 'w-full',
        className
      )}
    />
  );
};



