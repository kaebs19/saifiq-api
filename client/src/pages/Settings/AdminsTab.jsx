import { useState } from 'react';
import { colors, spacing, font } from '../../lib/theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import ConfirmDialog from '../../components/ConfirmDialog';
import AddAdminModal from './AddAdminModal';
import { useAdmins, useCreateAdmin, useRemoveAdmin } from '../../hooks/useSettings';

export default function AdminsTab() {
  const { data: admins, isLoading } = useAdmins();
  const createAdmin = useCreateAdmin();
  const removeAdmin = useRemoveAdmin();
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSave = async (data) => {
    await createAdmin.mutateAsync(data);
    setAdding(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await removeAdmin.mutateAsync(confirmDelete.id);
    setConfirmDelete(null);
  };

  const columns = [
    { key: 'username', header: '\u0627\u0644\u0627\u0633\u0645', render: (row) => <span style={{ color: colors.text, fontWeight: font.weights.semibold }}>{row.username}</span> },
    { key: 'email', header: '\u0627\u0644\u0628\u0631\u064A\u062F', render: (row) => <span style={{ color: colors.textMuted, direction: 'ltr', display: 'inline-block' }}>{row.email}</span> },
    { key: 'createdAt', header: '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621', render: (row) => new Date(row.createdAt).toLocaleDateString('ar-SA') },
  ];

  return (
    <Card>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{'\u0627\u0644\u0623\u062F\u0645\u0646\u0648\u0646'}</h3>
          <p style={styles.subtitle}>{`${admins?.length || 0} \u0623\u062F\u0645\u0646`}</p>
        </div>
        <Button variant="primary" iconLeft="plus" onClick={() => setAdding(true)}>
          {'\u0625\u0636\u0627\u0641\u0629 \u0623\u062F\u0645\u0646'}
        </Button>
      </div>

      <Table
        columns={columns}
        data={admins || []}
        loading={isLoading}
        actions={(row) => (
          <Button size="sm" variant="ghost" iconLeft="trash" onClick={() => setConfirmDelete(row)} style={{ color: colors.danger }} />
        )}
      />

      <AddAdminModal
        open={adding}
        onClose={() => setAdding(false)}
        onSave={handleSave}
        loading={createAdmin.isPending}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title={'\u062D\u0630\u0641 \u0627\u0644\u0623\u062F\u0645\u0646'}
        message={`\u0647\u0644 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 "${confirmDelete?.username}"\u061F`}
        confirmText={'\u062D\u0630\u0641'}
        loading={removeAdmin.isPending}
      />
    </Card>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: font.sizes.lg, fontWeight: font.weights.bold, fontFamily: font.family, margin: 0 },
  subtitle: { color: colors.textDim, fontSize: font.sizes.sm, fontFamily: font.family, margin: `${spacing.xs} 0 0` },
};
