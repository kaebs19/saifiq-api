import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import PlayersFilters from './PlayersFilters';
import PlayersTable from './PlayersTable';
import EditGemsModal from './EditGemsModal';
import { usePlayersList, useUpdateGems, useToggleBan } from '../../hooks/usePlayers';

const DEFAULT_FILTERS = { page: 1, limit: 20 };

export default function PlayersPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [editing, setEditing] = useState(null);
  const [banning, setBanning] = useState(null);

  const { data: listData, isLoading } = usePlayersList(filters);
  const updateGems = useUpdateGems();
  const toggleBan = useToggleBan();

  const players = listData?.data || [];
  const meta = listData?.meta || { total: 0, page: 1, limit: 20 };

  const handleSaveGems = async (payload) => {
    await updateGems.mutateAsync(payload);
    setEditing(null);
  };

  const handleConfirmBan = async () => {
    if (!banning) return;
    await toggleBan.mutateAsync({ id: banning.id, isBanned: !banning.isBanned });
    setBanning(null);
  };

  return (
    <div>
      <PageHeader
        title={'\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646'}
        subtitle={`${meta.total} \u0644\u0627\u0639\u0628`}
      />

      <PlayersFilters filters={filters} onChange={setFilters} />

      <PlayersTable
        data={players}
        loading={isLoading}
        onEditGems={setEditing}
        onToggleBan={setBanning}
      />

      <Pagination
        page={meta.page}
        pageSize={meta.limit}
        total={meta.total}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />

      <EditGemsModal
        player={editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveGems}
        loading={updateGems.isPending}
      />

      <ConfirmDialog
        open={!!banning}
        onClose={() => setBanning(null)}
        onConfirm={handleConfirmBan}
        title={banning?.isBanned ? '\u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631' : '\u062D\u0638\u0631 \u0627\u0644\u0644\u0627\u0639\u0628'}
        message={banning?.isBanned
          ? `\u0647\u0644 \u062A\u0631\u064A\u062F \u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631 \u0639\u0646 "${banning?.username}"\u061F`
          : `\u0647\u0644 \u062A\u0631\u064A\u062F \u062D\u0638\u0631 "${banning?.username}"\u061F \u0644\u0646 \u064A\u0633\u062A\u0637\u064A\u0639 \u0627\u0644\u062F\u062E\u0648\u0644.`}
        confirmText={banning?.isBanned ? '\u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631' : '\u062D\u0638\u0631'}
        variant={banning?.isBanned ? 'primary' : 'danger'}
        loading={toggleBan.isPending}
      />
    </div>
  );
}
