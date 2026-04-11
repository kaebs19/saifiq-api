import { colors, spacing, font } from '../../lib/theme';
import Icon from '../icons/Icon';

export default function EmptyState({ icon = 'info', title, description, action }) {
  return (
    <div style={styles.container}>
      <div style={styles.iconWrap}>
        <Icon name={icon} size={28} color={colors.textDim} />
      </div>
      <h3 style={styles.title}>{title}</h3>
      {description && <p style={styles.description}>{description}</p>}
      {action && <div style={{ marginTop: spacing.lg }}>{action}</div>}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
  },
  iconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: colors.cardAlt,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: font.sizes.lg,
    fontWeight: font.weights.bold,
    fontFamily: font.family,
    margin: 0,
  },
  description: {
    color: colors.textDim,
    fontSize: font.sizes.md,
    fontFamily: font.family,
    margin: `${spacing.sm} 0 0`,
    maxWidth: '360px',
  },
};
