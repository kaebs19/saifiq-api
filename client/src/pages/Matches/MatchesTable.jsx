import { useNavigate } from 'react-router-dom';
import { colors, font } from '../../lib/theme';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const STATUS_LABELS = {
  waiting: { label: '\u0641\u064A \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631', variant: 'neutral' },
  phase1: { label: '\u0627\u0644\u0645\u0631\u062D\u0644\u0629 1', variant: 'info' },
  phase2: { label: '\u0627\u0644\u0645\u0631\u062D\u0644\u0629 2', variant: 'info' },
  phase3: { label: '\u0627\u0644\u0645\u0631\u062D\u0644\u0629 3', variant: 'warning' },
  finished: { label: '\u0645\u0646\u062A\u0647\u064A\u0629', variant: 'success' },
};

export default function MatchesTable({ data, loading }) {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'id',
      header: '\u0631\u0642\u0645 \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629',
      render: (row) => <span style={{ color: colors.textMuted, fontFamily: 'monospace', fontSize: font.sizes.xs }}>{row.id.substring(0, 8)}</span>,
    },
    { key: 'mode', header: '\u0627\u0644\u0646\u0645\u0637', render: (row) => <Badge variant="gold">{row.mode}</Badge> },
    {
      key: 'status',
      header: '\u0627\u0644\u062D\u0627\u0644\u0629',
      render: (row) => {
        const s = STATUS_LABELS[row.status] || { label: row.status, variant: 'neutral' };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: 'players',
      header: '\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646',
      render: (row) => <span>{row.MatchPlayers?.length || 0}</span>,
    },
    {
      key: 'winner',
      header: '\u0627\u0644\u0641\u0627\u0626\u0632',
      render: (row) => row.winner?.username || '-',
    },
    {
      key: 'createdAt',
      header: '\u0627\u0644\u062A\u0627\u0631\u064A\u062E',
      render: (row) => new Date(row.createdAt).toLocaleString('ar-SA'),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      actions={(row) => (
        <Button size="sm" variant="ghost" iconLeft="eye" onClick={() => navigate(`/dashboard/matches/${row.id}`)} />
      )}
    />
  );
}
