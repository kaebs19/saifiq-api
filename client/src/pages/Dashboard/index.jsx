import { spacing } from '../../lib/theme';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from './StatCard';
import TopPlayers from './TopPlayers';
import DailyChart from './DailyChart';
import { useOverview, useTopPlayers } from '../../hooks/useStats';

export default function DashboardHome() {
  const { data: overview, isLoading } = useOverview();
  const { data: topPlayers, isLoading: topLoading } = useTopPlayers();

  const stats = overview || {};

  return (
    <div>
      <PageHeader
        title={'\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629'}
        subtitle={'\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0644\u0639\u0628\u0629'}
      />

      <div style={styles.grid}>
        <StatCard label={'\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646 \u0627\u0644\u0646\u0634\u0637\u0648\u0646'} value={isLoading ? null : stats.activePlayers} icon="users" color="#3b82f6" />
        <StatCard label={'\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646'} value={isLoading ? null : stats.totalPlayers} icon="users" color="#22c55e" />
        <StatCard label={'\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0627\u0644\u064A\u0648\u0645'} value={isLoading ? null : stats.matchesToday} icon="trophy" color="#f59e0b" />
        <StatCard label={'\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0645\u0646\u062A\u0647\u064A\u0629'} value={isLoading ? null : stats.finishedToday} icon="check" color="#22c55e" />
        <StatCard label={'\u062C\u0648\u0627\u0647\u0631 \u0645\u0634\u062A\u0631\u0627\u0629'} value={isLoading ? null : stats.gemsPurchased} icon="gem" color="#c9a84c" />
        <StatCard label={'\u062C\u0648\u0627\u0647\u0631 \u0627\u0644\u064A\u0648\u0645'} value={isLoading ? null : stats.gemsDistributedToday} icon="gem" color="#a8893a" />
        <StatCard label={'\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0623\u0633\u0626\u0644\u0629'} value={isLoading ? null : stats.totalQuestions} icon="question" color="#3b82f6" />
        <StatCard label={'\u0623\u0633\u0626\u0644\u0629 \u0645\u0641\u0639\u0644\u0629'} value={isLoading ? null : stats.activeQuestions} icon="check" color="#22c55e" />
      </div>

      <div style={{ marginTop: spacing.xl }}>
        <DailyChart />
      </div>

      <div style={{ marginTop: spacing.xl }}>
        <TopPlayers players={topPlayers} loading={topLoading} />
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: spacing.md,
  },
};
