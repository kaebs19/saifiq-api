import { colors, radii, spacing, font, transitions } from '../../lib/theme';

export default function Textarea({ label, error, hint, rows = 4, style, ...rest }) {
  return (
    <div style={styles.field}>
      {label && <label style={styles.label}>{label}</label>}
      <textarea
        rows={rows}
        style={{
          ...styles.textarea,
          borderColor: error ? colors.danger : colors.border,
          ...style,
        }}
        {...rest}
      />
      {error && <span style={styles.error}>{error}</span>}
      {!error && hint && <span style={styles.hint}>{hint}</span>}
    </div>
  );
}

const styles = {
  field: { display: 'flex', flexDirection: 'column', gap: spacing.sm, width: '100%' },
  label: { fontSize: font.sizes.md, color: colors.textMuted, fontWeight: font.weights.semibold, fontFamily: font.family },
  textarea: {
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: '12px 16px',
    fontSize: font.sizes.md,
    color: colors.text,
    outline: 'none',
    width: '100%',
    fontFamily: font.family,
    resize: 'vertical',
    transition: transitions.base,
  },
  error: { fontSize: font.sizes.xs, color: colors.danger, fontFamily: font.family },
  hint: { fontSize: font.sizes.xs, color: colors.textDim, fontFamily: font.family },
};
