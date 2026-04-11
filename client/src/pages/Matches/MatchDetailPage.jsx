import { Link, useParams } from 'react-router-dom';
import { colors, spacing, font } from '../../lib/theme';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { useMatch } from '../../hooks/useMatches';

export default function MatchDetailPage() {
  const { id } = useParams();
  const { data: match, isLoading } = useMatch(id);

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: spacing.xxl }}><Spinner size={28} /></div>;
  if (!match) return null;

  return (
    <div>
      <PageHeader
        title={`\u0645\u0628\u0627\u0631\u0627\u0629 #${match.id.substring(0, 8)}`}
        subtitle={`${match.mode} \u2014 ${match.status}`}
        backTo="/dashboard/matches"
      />

      <Card style={{ marginBottom: spacing.lg }}>
        <div style={styles.metaGrid}>
          <Meta label={'\u0627\u0644\u062D\u0627\u0644\u0629'} value={<Badge variant="info">{match.status}</Badge>} />
          <Meta label={'\u0627\u0644\u0646\u0645\u0637'} value={<Badge variant="gold">{match.mode}</Badge>} />
          <Meta label={'\u0627\u0644\u0641\u0627\u0626\u0632'} value={
            match.winner ? (
              <Link to={`/dashboard/players/${match.winner.id}`} style={{ color: colors.gold, textDecoration: 'none' }}>
                {match.winner.username}
              </Link>
            ) : '-'
          } />
          <Meta label={'\u0627\u0644\u062C\u0648\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629'} value={match.currentRound} />
        </div>
      </Card>

      <Card>
        <h3 style={styles.title}>{`\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646 (${match.MatchPlayers?.length || 0})`}</h3>
        <div style={styles.players}>
          {match.MatchPlayers?.map((mp) => (
            <div key={mp.id} style={styles.playerCard}>
              <div style={styles.playerHeader}>
                {mp.User ? (
                  <Link to={`/dashboard/players/${mp.User.id}`} style={{ ...styles.playerName, textDecoration: 'none' }}>
                    {mp.User.username}
                  </Link>
                ) : (
                  <span style={styles.playerName}>{mp.userId}</span>
                )}
                <Badge variant={mp.status === 'eliminated' ? 'danger' : 'success'}>{mp.status}</Badge>
              </div>
              <div style={styles.statRow}>
                <Stat label={'\u0627\u0644\u0645\u0648\u0642\u0639'} value={mp.position} />
                <Stat label={'\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 1'} value={mp.phase1Score} />
                <Stat label={'\u0627\u0644\u0625\u062C\u0627\u0628\u0627\u062A'} value={mp.correctAnswers} />
                <Stat label={'\u0627\u0644\u0647\u062C\u0645\u0627\u062A'} value={mp.attacksLanded} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div style={{ color: colors.textDim, fontSize: font.sizes.sm, marginBottom: '4px' }}>{label}</div>
      <div style={{ color: colors.text, fontWeight: font.weights.semibold }}>{value}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: colors.gold, fontWeight: font.weights.bold, fontSize: font.sizes.lg }}>{value}</div>
      <div style={{ color: colors.textDim, fontSize: font.sizes.xs }}>{label}</div>
    </div>
  );
}

const styles = {
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: spacing.lg },
  title: { color: colors.text, fontSize: font.sizes.lg, fontWeight: font.weights.bold, fontFamily: font.family, margin: `0 0 ${spacing.lg}` },
  players: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: spacing.md },
  playerCard: {
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    padding: spacing.md,
  },
  playerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  playerName: { color: colors.text, fontWeight: font.weights.semibold, fontFamily: font.family },
  statRow: { display: 'flex', justifyContent: 'space-between', gap: spacing.sm },
};
