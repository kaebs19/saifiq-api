import { colors, radii, spacing, font, transitions } from '../../lib/theme';
import Icon from '../icons/Icon';

export default function Select({ label, value, onChange, options = [], placeholder, error, disabled, style }) {
  return (
    <div style={styles.field}>
      {label && <label style={styles.label}>{label}</label>}
      <div style={styles.wrap}>
        <select
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          style={{
            ...styles.select,
            borderColor: error ? colors.danger : colors.border,
            opacity: disabled ? 0.5 : 1,
            ...style,
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div style={styles.chevron}>
          <Icon name="chevronDown" size={16} color={colors.textDim} />
        </div>
      </div>
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
}

const styles = {
  field: { display: 'flex', flexDirection: 'column', gap: spacing.sm, width: '100%' },
  label: { fontSize: font.sizes.md, color: colors.textMuted, fontWeight: font.weights.semibold, fontFamily: font.family },
  wrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  select: {
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: '10px 36px 10px 16px',
    fontSize: font.sizes.md,
    color: colors.text,
    outline: 'none',
    width: '100%',
    fontFamily: font.family,
    cursor: 'pointer',
    appearance: 'none',
    transition: transitions.base,
  },
  chevron: { position: 'absolute', left: spacing.md, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' },
  error: { fontSize: font.sizes.xs, color: colors.danger, fontFamily: font.family },
};
