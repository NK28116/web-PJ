import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
* Modal component that portals its children to document.body.
* @example
* Modal({ isOpen: true, onClose: () => {}, children: <div /> })
* React.ReactPortal | null
* @param {boolean} isOpen - Whether the modal is open and should be rendered.
* @param {() => void} onClose - Callback invoked to request closing the modal (e.g. overlay click).
* @param {React.ReactNode} children - Content to render inside the modal.
* @returns {React.ReactPortal | null} A portal containing the modal when open; otherwise null.
* @description
*   - Renders only after a client-side mount to avoid SSR/rehydration mismatches.
*   - Toggles document.body.style.overflow to disable page scrolling while open and always resets on cleanup.
*   - Returns null if not mounted or not open.
*   - The full-viewport overlay handles clicks and forwards them to onClose.
*/
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        {children}
      </div>
    </div>,
    document.body
  );
};
