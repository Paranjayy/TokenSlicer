import React, { useEffect } from 'react';
import { CheckIcon } from './icons';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

/**
 * Toast Component
 * Displays temporary notification messages to the user
 */
const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const bgColor =
    toast.type === 'success'
      ? 'bg-green-500'
      : toast.type === 'error'
        ? 'bg-red-500'
        : 'bg-blue-500';

  const icon =
    toast.type === 'success' ? (
      <CheckIcon className="w-5 h-5 text-white flex-shrink-0" />
    ) : toast.type === 'error' ? (
      <svg
        className="w-5 h-5 text-white flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    ) : (
      <svg
        className="w-5 h-5 text-white flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    );

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex gap-3 items-start animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-auto`}
      role="alert"
    >
      {icon}
      <p className="text-sm font-medium flex-grow">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white hover:opacity-80 flex-shrink-0"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
