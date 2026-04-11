import { colors, radii, spacing, font } from '../../lib/theme';
import Icon from '../../components/icons/Icon';

export default function StatCard({ label, value, icon, color = colors.gold }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.iconWrap, background: color + '15', color }}>
        <Icon name={icon} size={22} color={color} />
      </div>
      <div style={styles.text}>
        <div style={styles.value}>{value?.toLocaleString() ?? '-'}</div>
        <div style={styles.label}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.xl,
    padding: spacing.lg,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: radii.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: { display: 'flex', flexDirection: 'column', gap: '2px' },
  value: {
    color: colors.text,
    fontSize: font.sizes.xxl,
    fontWeight: font.weights.extrabold,
    fontFamily: font.family,
    lineHeight: 1,
  },
  label: {
    color: colors.textDim,
    fontSize: font.sizes.sm,
    fontFamily: font.family,
  },
};
