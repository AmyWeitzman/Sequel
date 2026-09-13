'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export default function Toast({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000); // Auto-remove after 5 seconds

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const bgColor = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-indigo-500',
    warning: 'bg-amber-500',
  }[toast.type];

  const icon = {
    success: '🎉',
    error: '⚠️',
    info: 'ℹ️',
    warning: '⏳',
  }[toast.type];

  return (
    <div
      className={`${bgColor} text-white px-5 py-4 rounded-2xl shadow-xl mb-3 flex items-center gap-3 min-w-[300px] max-w-[500px] animate-slide-in`}
      role="alert"
    >
      <span className="text-xl leading-none">{icon}</span>
      <p className="font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/80 hover:text-white font-bold text-lg leading-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
