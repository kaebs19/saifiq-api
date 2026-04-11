import { useContext } from 'react';
import { ToastContext } from '../components/ToastProvider';

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');

  return {
    success: (msg) => ctx.show(msg, 'success'),
    error: (msg) => ctx.show(msg, 'error'),
    info: (msg) => ctx.show(msg, 'info'),
    warning: (msg) => ctx.show(msg, 'warning'),
  };
}
