import { colors, radii, spacing, font, transitions } from '../../lib/theme';
import Icon from '../icons/Icon';

export default function Input({
  label,
  error,
  hint,
  iconLeft,
  iconRight,
  dir = 'rtl',
  style,
  ...rest
}) {
  const hasIcon = iconLeft || iconRight;

  return (
    <div style={styles.field}>
      {label && <label style={styles.label}>{label}</label>}
      <div style={styles.wrap}>
        {iconLeft && (
          <div style={{ ...styles.icon, left: spacing.md }}>
            <Icon name={iconLeft} size={16} color={colors.textDim} />
          </div>
        )}
        <input
          dir={dir}
          style={{
            ...styles.input,
            paddingLeft: iconLeft ? '40px' : spacing.lg,
            paddingRight: iconRight ? '40px' : spacing.lg,
            borderColor: error ? colors.danger : colors.border,
            ...style,
          }}
          {...rest}
        />
        {iconRight && (
          <div style={{ ...styles.icon, right: spacing.md }}>
            <Icon name={iconRight} size={16} color={colors.textDim} />
          </div>
        )}
      </div>
      {error && <span style={styles.error}>{error}</span>}
      {!error && hint && <span style={styles.hint}>{hint}</span>}
    </div>
  );
}

const styles = {
  field: { display: 'flex', flexDirection: 'column', gap: spacing.sm, width: '100%' },
  label: { fontSize: font.sizes.md, color: colors.textMuted, fontWeight: font.weights.semibold, fontFamily: font.family },
  wrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  input: {
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: '10px 16px',
    fontSize: font.sizes.md,
    color: colors.text,
    outline: 'none',
    width: '100%',
    fontFamily: font.family,
    transition: transitions.base,
  },
  icon: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' },
  error: { fontSize: font.sizes.xs, color: colors.danger, fontFamily: font.family },
  hint: { fontSize: font.sizes.xs, color: colors.textDim, fontFamily: font.family },
};
