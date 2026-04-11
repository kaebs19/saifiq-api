import { Link } from 'react-router-dom';
import { colors, font } from '../../lib/theme';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

const TYPE_LABELS = {
  match_invite: { label: '\u062F\u0639\u0648\u0629 \u0645\u0628\u0627\u0631\u0627\u0629', variant: 'info' },
  match_result: { label: '\u0646\u062A\u064A\u062C\u0629', variant: 'success' },
  gem_reward: { label: '\u0645\u0643\u0627\u0641\u0623\u0629', variant: 'gold' },
  system: { label: '\u0646\u0638\u0627\u0645', variant: 'neutral' },
  admin_custom: { label: '\u0645\u0646 \u0627\u0644\u0623\u062F\u0645\u0646', variant: 'warning' },
};

export default function NotificationsTable({ data, loading }) {
  const columns = [
    {
      key: 'title',
      header: '\u0627\u0644\u0639\u0646\u0648\u0627\u0646',
      render: (row) => <span style={{ color: colors.text, fontWeight: font.weights.semibold }}>{row.title}</span>,
    },
    {
      key: 'body',
      header: '\u0627\u0644\u0646\u0635',
      render: (row) => (
        <span style={{ color: colors.textMuted, maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
          {row.body}
        </span>
      ),
    },
    {
      key: 'type',
      header: '\u0627\u0644\u0646\u0648\u0639',
      render: (row) => {
        const t = TYPE_LABELS[row.type] || { label: row.type, variant: 'neutral' };
        return <Badge variant={t.variant}>{t.label}</Badge>;
      },
    },
    {
      key: 'recipient',
      header: '\u0627\u0644\u0645\u0633\u062A\u0644\u0645',
      render: (row) => row.User ? (
        <Link to={`/dashboard/players/${row.User.id}`} style={{ color: colors.gold, textDecoration: 'none', fontWeight: font.weights.semibold }}>
          {row.User.username}
        </Link>
      ) : '-',
    },
    {
      key: 'createdAt',
      header: '\u0627\u0644\u062A\u0627\u0631\u064A\u062E',
      render: (row) => new Date(row.createdAt).toLocaleString('ar-SA'),
    },
  ];

  return <Table columns={columns} data={data} loading={loading} />;
}
