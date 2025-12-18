import { cn } from '@/utils/cn';
import React from 'react';
import { createPortal } from 'react-dom';

export interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  top?: number;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, children, top = 0 }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 transition-opacity',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={cn(
          'absolute right-0 bg-white shadow-xl w-full max-w-xs transition-transform transform',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ top: `${top}px` }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
