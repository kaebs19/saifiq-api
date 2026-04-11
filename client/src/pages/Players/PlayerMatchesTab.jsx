import { useState } from 'react';
import { colors, font } from '../../lib/theme';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { usePlayerMatches } from '../../hooks/usePlayers';

export default function PlayerMatchesTab({ playerId }) {
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const { data, isLoading } = usePlayerMatches(playerId, filters);

  const items = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 10 };

  const columns = [
    {
      key: 'matchId',
      header: '\u0631\u0642\u0645 \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629',
      render: (row) => <span style={{ fontFamily: 'monospace', color: colors.textMuted, fontSize: font.sizes.xs }}>{row.matchId?.substring(0, 8)}</span>,
    },
    {
      key: 'mode',
      header: '\u0627\u0644\u0646\u0645\u0637',
      render: (row) => <Badge variant="gold">{row.Match?.mode || '-'}</Badge>,
    },
    {
      key: 'status',
      header: '\u062D\u0627\u0644\u062A\u064A',
      render: (row) => {
        const isWinner = row.Match?.winnerId && row.Match.winnerId === row.userId;
        return <Badge variant={isWinner ? 'success' : (row.status === 'eliminated' ? 'danger' : 'neutral')}>{row.status}</Badge>;
      },
    },
    { key: 'phase1Score', header: '\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 1', render: (row) => row.phase1Score },
    { key: 'correctAnswers', header: '\u0625\u062C\u0627\u0628\u0627\u062A \u0635\u062D\u064A\u062D\u0629', render: (row) => row.correctAnswers },
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
