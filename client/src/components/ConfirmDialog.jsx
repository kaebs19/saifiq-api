import { colors, spacing, font } from '../lib/theme';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '\u062A\u0623\u0643\u064A\u062F',
  message,
  confirmText = '\u062A\u0623\u0643\u064A\u062F',
  cancelText = '\u0625\u0644\u063A\u0627\u0621',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
        </>
      }
    >
      <p style={{
        color: colors.textMuted,
        fontSize: font.sizes.md,
        fontFamily: font.family,
        margin: 0,
        lineHeight: 1.6,
      }}>
        {message}
      </p>
    </Modal>
  );
}
