import { colors, radii, spacing, font, transitions } from '../../lib/theme';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div style={styles.tabs}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{ ...styles.tab, ...(active === t.id ? styles.tabActive : {}) }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

const styles = {
  tabs: {
    display: 'flex',
    gap: spacing.xs,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    width: 'fit-content',
  },
  tab: {
    background: 'transparent',
    border: 'none',
    color: colors.textMuted,
    fontSize: font.sizes.md,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
    padding: '8px 20px',
    borderRadius: radii.md,
    cursor: 'pointer',
    transition: transitions.base,
  },
  tabActive: { background: colors.goldSoft, color: colors.gold },
};
