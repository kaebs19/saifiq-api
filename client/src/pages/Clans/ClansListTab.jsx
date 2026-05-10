import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useClansSearch, useDeleteClan, useUpdateClan } from '../../hooks/useAdminClans';
import { colors, font, spacing } from '../../lib/theme';

export default function ClansListTab() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1, limit: 20, q: '' });
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);   // { id, name, description }
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const { data, isLoading } = useClansSearch(filters);
  const deleteClan = useDeleteClan();
  const updateClan = useUpdateClan(editing?.id);

  const clans = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20 };

  const handleDelete = async () => {
    await deleteClan.mutateAsync(deleting.id);
    setDeleting(null);
  };

  const openEdit = (row, e) => {
    e.stopPropagation();
    setEditing(row);
    setEditForm({ name: row.name || '', description: row.description || '' });
  };

  const handleEdit = async () => {
    await updateClan.mutateAsync(editForm);
    setEditing(null);
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
            {row.description && (
              <div style={{ color: colors.textDim, fontSize: font.sizes.xs }}>{row.description}</div>
            )}
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
      render: (row) => (
        <span style={{ color: colors.warning, fontWeight: font.weights.bold }}>{row.weeklyPoints}</span>
      ),
    },
    {
      key: 'isOpen',
      header: 'الحالة',
      render: (row) => (
        <Badge variant={row.isOpen ? 'success' : 'warning'}>{row.isOpen ? 'مفتوحة' : 'مغلقة'}</Badge>
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
          <div style={{ display: 'flex', gap: spacing.xs }} onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="secondary" iconLeft="edit" onClick={(e) => openEdit(row, e)}>
              تعديل
            </Button>
            <Button size="sm" variant="danger" iconLeft="trash" onClick={(e) => { e.stopPropagation(); setDeleting(row); }}>
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

      {/* ── حذف ── */}
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

      {/* ── تعديل ── */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`تعديل العشيرة: ${editing?.name || ''}`}
        size="sm"
        footer={
          <>
            <Button variant="primary" onClick={handleEdit} loading={updateClan.isPending}>
              حفظ
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              إلغاء
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <Input
            label="اسم العشيرة"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="اسم العشيرة"
          />
          <Input
            label="الوصف (اختياري)"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            placeholder="وصف قصير..."
          />
        </div>
      </Modal>
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
