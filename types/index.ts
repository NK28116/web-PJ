// 共通の型定義

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export interface ClickableProps {
  onClick?: () => void;
  disabled?: boolean;
}

export interface FormElementProps {
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}



