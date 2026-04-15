import { useState } from 'react';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import { useAuditLog } from '../../hooks/useAdminUsers';
import { colors, font } from '../../lib/theme';

export default function AuditLogTab() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useAuditLog(filters);

  const actions = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20 };

  const columns = [
    {
      key: 'admin',
      header: 'الأدمن',
      render: (row) => <span style={{ color: colors.text }}>{row.admin?.username || '-'}</span>,
    },
    {
      key: 'target',
      header: 'المستخدم',
      render: (row) => <span style={{ color: colors.text }}>{row.target?.username || '-'}</span>,
    },
    {
      key: 'action',
      header: 'العملية',
      render: (row) => <Badge variant="info">{row.action}</Badge>,
    },
    {
      key: 'currency',
      header: 'العملة',
      render: (row) => {
        const c = row.metadata?.currency;
        if (!c) return '-';
        return <Badge variant={c === 'gold' ? 'warning' : 'gold'}>{c === 'gold' ? 'ذهب' : 'جواهر'}</Badge>;
      },
    },
    {
      key: 'amount',
      header: 'الكمية',
      render: (row) => {
        const amt = row.metadata?.amount;
        if (amt == null) return '-';
        return (
          <span style={{ color: amt > 0 ? colors.success : colors.danger, fontWeight: font.weights.bold }}>
            {amt > 0 ? `+${amt}` : amt}
          </span>
        );
      },
    },
    {
      key: 'reason',
      header: 'السبب',
      render: (row) => <span style={{ color: colors.textMuted, fontSize: font.sizes.sm }}>{row.metadata?.reason || '-'}</span>,
    },
    {
      key: 'createdAt',
      header: 'التاريخ',
      render: (row) => (
        <span style={{ color: colors.textDim, fontSize: font.sizes.sm }}>
          {new Date(row.createdAt).toLocaleString('ar-SA')}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Table columns={columns} data={actions} loading={isLoading} />
      <Pagination
        page={meta.page}
        pageSize={meta.limit}
        total={meta.total}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}
