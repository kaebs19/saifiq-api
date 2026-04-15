import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useClansSearch, useDeleteClan } from '../../hooks/useAdminClans';
import { colors, font, spacing } from '../../lib/theme';

export default function ClansListTab() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1, limit: 20, q: '' });
  const [deleting, setDeleting] = useState(null);

  const { data, isLoading } = useClansSearch(filters);
  const deleteClan = useDeleteClan();

  const clans = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20 };

  const handleDelete = async () => {
    await deleteClan.mutateAsync(deleting.id);
    setDeleting(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'العشيرة',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div style={{ ...styles.badge, background: row.color || colors.gold }}>
            {row.name?.[0] || '⚔'}
          </div>
          <div>
            <div style={{ color: colors.text, fontWeight: font.weights.semibold }}>{row.name}</div>
            {row.description && <div style={{ color: colors.textDim, fontSize: font.sizes.xs }}>{row.description}</div>}
          </div>
        </div>
      ),
    },
    { key: 'level', header: 'المستوى', render: (row) => <Badge variant="info">Lv.{row.level}</Badge> },
    {
      key: 'memberCount',
      header: 'الأعضاء',
      render: (row) => <span>{row.memberCount}/{row.maxMembers}</span>,
    },
    {
      key: 'weeklyPoints',
      header: 'نقاط أسبوعية',
      render: (row) => <span style={{ color: colors.warning, fontWeight: font.weights.bold }}>{row.weeklyPoints}</span>,
    },
    {
      key: 'isOpen',
      header: 'الحالة',
      render: (row) => (
        <Badge variant={row.isOpen ? 'success' : 'warning'}>
          {row.isOpen ? 'مفتوحة' : 'مغلقة'}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <div style={styles.searchBox}>
        <Input
          placeholder="ابحث عن عشيرة..."
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
          iconLeft="search"
        />
      </div>

      <Table
        columns={columns}
        data={clans}
        loading={isLoading}
        onRowClick={(row) => navigate(`/dashboard/clans/${row.id}`)}
        actions={(row) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="danger" iconLeft="trash" onClick={() => setDeleting(row)}>
              حذف
            </Button>
          </div>
        )}
      />

      <Pagination
        page={meta.page}
        pageSize={meta.limit}
        total={meta.total}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="حذف العشيرة"
        message={`هل تريد حذف عشيرة "${deleting?.name}"؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.`}
        confirmText="حذف نهائي"
        variant="danger"
        loading={deleteClan.isPending}
      />
    </div>
  );
}

const styles = {
  searchBox: { marginBottom: spacing.lg, maxWidth: '520px' },
  badge: {
    width: '40px', height: '40px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: font.weights.extrabold, fontSize: font.sizes.lg,
    fontFamily: font.family, flexShrink: 0,
  },
};
