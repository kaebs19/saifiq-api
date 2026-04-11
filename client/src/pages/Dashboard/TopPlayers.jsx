import { Link } from 'react-router-dom';
import { colors, spacing, font, transitions } from '../../lib/theme';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function TopPlayers({ players, loading }) {
  return (
    <Card>
      <h3 style={styles.title}>{'\u0623\u0641\u0636\u0644 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646'}</h3>
      {loading ? (
        <div style={styles.center}><Spinner /></div>
      ) : !players?.length ? (
        <EmptyState title={'\u0644\u0627 \u064A\u0648\u062C\u062F \u0644\u0627\u0639\u0628\u0648\u0646'} />
      ) : (
        <div style={styles.list}>
          {players.map((p, i) => (
            <Link key={p.id} to={`/dashboard/players/${p.id}`} style={styles.row}>
              <div style={styles.rank}>{i + 1}</div>
              <div style={styles.info}>
                <div style={styles.name}>{p.username}</div>
                <div style={styles.meta}>
                  <Badge variant="info">{`\u0645\u0633\u062A\u0648\u0649 ${p.level}`}</Badge>
                  {p.country && <Badge variant="neutral">{p.country}</Badge>}
                </div>
              </div>
              <div style={styles.points}>
                <div style={styles.pointsValue}>{p.totalPoints?.toLocaleString()}</div>
                <div style={styles.pointsLabel}>{'\u0646\u0642\u0637\u0629'}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

const styles = {
  title: {
    color: colors.text,
    fontSize: font.sizes.lg,
    fontWeight: font.weights.bold,
    fontFamily: font.family,
    margin: `0 0 ${spacing.lg}`,
  },
  center: { display: 'flex', justifyContent: 'center', padding: spacing.xl },
  list: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.sm} ${spacing.md}`,
    background: colors.cardAlt,
    borderRadius: '10px',
    border: `1px solid ${colors.border}`,
    textDecoration: 'none',
    transition: transitions.base,
  },
  rank: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: colors.goldSoft,
    color: colors.gold,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: font.weights.bold,
    fontFamily: font.family,
    fontSize: font.sizes.sm,
    flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0 },
  name: { color: colors.text, fontWeight: font.weights.semibold, fontFamily: font.family },
  meta: { display: 'flex', gap: spacing.xs, marginTop: '4px' },
  points: { textAlign: 'left' },
  pointsValue: { color: colors.gold, fontSize: font.sizes.lg, fontWeight: font.weights.bold, fontFamily: font.family },
  pointsLabel: { color: colors.textDim, fontSize: font.sizes.xs, fontFamily: font.family },
};
