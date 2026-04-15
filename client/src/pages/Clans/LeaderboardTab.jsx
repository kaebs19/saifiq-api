import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { useClansLeaderboard } from '../../hooks/useAdminClans';
import { colors, font } from '../../lib/theme';

export default function LeaderboardTab() {
  const { data, isLoading } = useClansLeaderboard(100);

  const columns = [
    {
      key: 'rank',
      header: '#',
      width: '60px',
      render: (row) => {
        const colorMap = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
        return (
          <span style={{ color: colorMap[row.rank] || colors.textMuted, fontWeight: font.weights.extrabold, fontSize: font.sizes.lg }}>
            {row.rank}
          </span>
        );
      },
    },
    {
      key: 'name',
      header: 'العشيرة',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: row.color || colors.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: font.weights.bold, fontSize: font.sizes.sm }}>
            {row.name?.[0] || '⚔'}
          </div>
          <span style={{ color: colors.text, fontWeight: font.weights.semibold }}>{row.name}</span>
        </div>
      ),
    },
    { key: 'level', header: 'المستوى', render: (row) => <Badge variant="info">Lv.{row.level}</Badge> },
    { key: 'memberCount', header: 'الأعضاء' },
    {
      key: 'weeklyPoints',
      header: 'نقاط أسبوعية',
      render: (row) => <span style={{ color: colors.warning, fontWeight: font.weights.bold }}>{row.weeklyPoints}</span>,
    },
    {
      key: 'totalPoints',
      header: 'نقاط كلية',
      render: (row) => <span style={{ color: colors.text }}>{row.totalPoints}</span>,
    },
  ];

  return <Table columns={columns} data={data || []} loading={isLoading} />;
}
