import { Link } from 'react-router-dom';
import { colors, spacing, font } from '../../lib/theme';
import Icon from '../icons/Icon';

export default function PageHeader({ title, subtitle, actions, backTo }) {
  return (
    <div style={styles.header}>
      <div style={styles.left}>
        {backTo && (
          <Link to={backTo} style={styles.back}>
            <Icon name="chevronRight" size={20} color={colors.textMuted} />
          </Link>
        )}
        <div>
          <h1 style={styles.title}>{title}</h1>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={styles.actions}>{actions}</div>}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  left: { display: 'flex', alignItems: 'center', gap: spacing.md },
  back: {
    display: 'flex',
    padding: '6px',
    borderRadius: '8px',
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    textDecoration: 'none',
  },
  title: {
    fontSize: font.sizes.xxl,
    fontWeight: font.weights.bold,
    color: colors.text,
    fontFamily: font.family,
    margin: 0,
  },
  subtitle: {
    fontSize: font.sizes.md,
    color: colors.textDim,
    fontFamily: font.family,
    margin: `${spacing.xs} 0 0`,
  },
  actions: { display: 'flex', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' },
};
