import { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, font } from '../../lib/theme';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { useTransactions } from '../../hooks/useStore';

const TYPE_LABELS = {
  purchase: { label: '\u0634\u0631\u0627\u0621', variant: 'gold' },
  win_reward: { label: '\u0645\u0643\u0627\u0641\u0623\u0629', variant: 'success' },
  daily_bonus: { label: '\u064A\u0648\u0645\u064A\u0629', variant: 'info' },
  item_use: { label: '\u0627\u0633\u062A\u062E\u062F\u0627\u0645', variant: 'warning' },
  refund: { label: '\u0627\u0633\u062A\u0631\u062F\u0627\u062F', variant: 'neutral' },
};

export default function TransactionsTab() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useTransactions(filters);

  const items = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20 };

  const columns = [
    {
      key: 'user',
      header: '\u0627\u0644\u0644\u0627\u0639\u0628',
      render: (row) => row.User ? (
        <Link to={`/dashboard/players/${row.User.id}`} style={{ color: colors.gold, textDecoration: 'none', fontWeight: font.weights.semibold }}>
          {row.User.username}
        </Link>
      ) : '-',
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
      key: 'amount',
      header: '\u0627\u0644\u0645\u0628\u0644\u063A',
      render: (row) => (
        <span style={{ color: row.amount >= 0 ? colors.success : colors.danger, fontWeight: font.weights.bold }}>
          {row.amount >= 0 ? '+' : ''}{row.amount}
        </span>
      ),
    },
    { key: 'description', header: '\u0627\u0644\u0648\u0635\u0641', render: (row) => row.description || '-' },
    {
      key: 'createdAt',
      header: '\u0627\u0644\u062A\u0627\u0631\u064A\u062E',
      render: (row) => new Date(row.createdAt).toLocaleString('ar-SA'),
    },
  ];

  return (
    <>
      <Table columns={columns} data={items} loading={isLoading} />
      <Pagination
        page={meta.page}
        pageSize={meta.limit}
        total={meta.total}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </>
  );
}
