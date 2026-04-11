import { colors, radii, spacing, font } from '../../lib/theme';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function PlayerInfoCard({ player }) {
  const initial = (player.username?.[0] || '?').toUpperCase();
  const created = new Date(player.createdAt).toLocaleDateString('ar-SA');

  return (
    <Card>
      <div style={styles.header}>
        {player.avatarUrl ? (
          <img src={player.avatarUrl} alt="" style={styles.avatarImg} />
        ) : (
          <div style={styles.avatar}>{initial}</div>
        )}
        <div style={{ flex: 1 }}>
          <h2 style={styles.username}>{player.username}</h2>
          <p style={styles.email}>{player.email}</p>
          <div style={{ display: 'flex', gap: spacing.xs, marginTop: spacing.sm }}>
            <Badge variant={player.isBanned ? 'danger' : 'success'}>
              {player.isBanned ? '\u0645\u062D\u0638\u0648\u0631' : '\u0646\u0634\u0637'}
            </Badge>
            {player.country && <Badge variant="neutral">{player.country}</Badge>}
            <Badge variant="info">{`\u0645\u0633\u062A\u0648\u0649 ${player.level}`}</Badge>
          </div>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <Stat label={'\u0627\u0644\u062C\u0648\u0627\u0647\u0631'} value={player.gems} color={colors.gold} />
        <Stat label={'\u0627\u0644\u0641\u0648\u0632'} value={player.wins} color={colors.success} />
        <Stat label={'\u0627\u0644\u062E\u0633\u0627\u0631\u0629'} value={player.losses} color={colors.danger} />
        <Stat label={'\u0627\u0644\u0646\u0642\u0627\u0637'} value={player.totalPoints} color={colors.text} />
        <Stat label={'\u0646\u0642\u0627\u0637 \u0627\u0644\u0623\u0633\u0628\u0648\u0639'} value={player.weeklyPoints} color={colors.info} />
        <Stat label={'\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621'} value={created} color={colors.textMuted} />
      </div>
    </Card>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.stat}>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xl },
  avatar: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: colors.bg, fontSize: '28px', fontWeight: font.weights.extrabold,
    fontFamily: font.family, flexShrink: 0,
  },
  avatarImg: {
    width: '72px', height: '72px', borderRadius: '50%',
    objectFit: 'cover', border: `1px solid ${colors.border}`, flexShrink: 0,
  },
  username: { color: colors.text, fontSize: font.sizes.xxl, fontWeight: font.weights.bold, fontFamily: font.family, margin: 0 },
  email: { color: colors.textDim, fontSize: font.sizes.sm, fontFamily: font.family, margin: '4px 0 0' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: spacing.md,
  },
  stat: {
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: spacing.md,
    textAlign: 'center',
  },
  statValue: { fontSize: font.sizes.xxl, fontWeight: font.weights.bold, fontFamily: font.family },
  statLabel: { color: colors.textDim, fontSize: font.sizes.xs, fontFamily: font.family, marginTop: '4px' },
};
