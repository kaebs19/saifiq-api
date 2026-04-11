import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { colors, radii, spacing, font, shadows } from '../../lib/theme';
import Icon from '../icons/Icon';

const SIZES = { sm: '400px', md: '560px', lg: '760px' };

export default function Modal({ open, onClose, title, children, footer, size = 'md', closeOnBackdrop = true }) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      style={styles.backdrop}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        style={{ ...styles.panel, maxWidth: SIZES[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button onClick={onClose} style={styles.close}>
            <Icon name="close" size={18} color={colors.textMuted} />
          </button>
        </div>
        <div style={styles.body}>{children}</div>
        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: spacing.lg,
  },
  panel: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.xl,
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: shadows.overlay,
    fontFamily: font.family,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.lg} ${spacing.xl}`,
    borderBottom: `1px solid ${colors.border}`,
  },
  title: {
    color: colors.text,
    fontSize: font.sizes.xl,
    fontWeight: font.weights.bold,
    margin: 0,
    fontFamily: font.family,
  },
  close: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    borderRadius: '6px',
  },
  body: {
    padding: spacing.xl,
    overflow: 'auto',
    flex: 1,
  },
  footer: {
    padding: `${spacing.lg} ${spacing.xl}`,
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
};
