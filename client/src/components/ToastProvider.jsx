import { createContext, useCallback, useState } from 'react';
import { colors, radii, spacing, font, shadows } from '../lib/theme';
import Icon from './icons/Icon';

export const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: 'check', color: colors.success, bg: colors.successSoft, border: colors.success + '40' },
  error: { icon: 'alert', color: colors.danger, bg: colors.dangerSoft, border: colors.danger + '40' },
  info: { icon: 'info', color: colors.info, bg: colors.infoSoft, border: colors.info + '40' },
  warning: { icon: 'alert', color: colors.warning, bg: colors.warningSoft, border: colors.warning + '40' },
};

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, variant = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={styles.stack}>
        {toasts.map((t) => {
          const v = VARIANTS[t.variant];
          return (
            <div key={t.id} style={{ ...styles.toast, background: v.bg, borderColor: v.border }}>
              <Icon name={v.icon} size={18} color={v.color} />
              <span style={{ ...styles.message, color: v.color }}>{t.message}</span>
              <button onClick={() => remove(t.id)} style={styles.close}>
                <Icon name="close" size={14} color={v.color} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

const styles = {
  stack: {
    position: 'fixed',
    top: spacing.xl,
    left: spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    zIndex: 2000,
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: radii.lg,
    border: '1px solid',
    minWidth: '280px',
    maxWidth: '400px',
    boxShadow: shadows.card,
    fontFamily: font.family,
  },
  message: {
    fontSize: font.sizes.md,
    fontWeight: font.weights.semibold,
    flex: 1,
  },
  close: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
  },
};
