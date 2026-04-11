import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { spacing } from '../../lib/theme';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Tabs from '../../components/ui/Tabs';
import ConfirmDialog from '../../components/ConfirmDialog';
import PlayerInfoCard from './PlayerInfoCard';
import PlayerMatchesTab from './PlayerMatchesTab';
import PlayerTransactionsTab from './PlayerTransactionsTab';
import EditGemsModal from './EditGemsModal';
import { usePlayer, useUpdateGems, useToggleBan } from '../../hooks/usePlayers';

const TABS = [
  { id: 'matches', label: '\u0627\u0644\u0645\u0628\u0627\u0631\u064A\u0627\u062A' },
  { id: 'transactions', label: '\u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A' },
];

export default function PlayerDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState('matches');
  const [editing, setEditing] = useState(false);
  const [confirmBan, setConfirmBan] = useState(false);

  const { data: player, isLoading } = usePlayer(id);
  const updateGems = useUpdateGems();
  const toggleBan = useToggleBan();

  if (isLoading || !player) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: spacing.xxl }}><Spinner size={28} /></div>;
  }

  const handleSaveGems = async (payload) => {
    await updateGems.mutateAsync(payload);
    setEditing(false);
  };

  const handleConfirmBan = async () => {
    await toggleBan.mutateAsync({ id: player.id, isBanned: !player.isBanned });
    setConfirmBan(false);
  };

  return (
    <div>
      <PageHeader
        title={player.username}
        subtitle={'\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0644\u0627\u0639\u0628'}
        backTo="/dashboard/players"
        actions={
          <>
            <Button variant="gold" iconLeft="gem" onClick={() => setEditing(true)}>
              {'\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062C\u0648\u0627\u0647\u0631'}
            </Button>
            <Button
              variant={player.isBanned ? 'secondary' : 'danger'}
              iconLeft="power"
              onClick={() => setConfirmBan(true)}
            >
              {player.isBanned ? '\u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631' : '\u062D\u0638\u0631'}
            </Button>
          </>
        }
      />

      <div style={{ marginBottom: spacing.lg }}>
        <PlayerInfoCard player={player} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'matches' && <PlayerMatchesTab playerId={id} />}
      {tab === 'transactions' && <PlayerTransactionsTab playerId={id} />}

      <EditGemsModal
        player={editing ? player : null}
        onClose={() => setEditing(false)}
        onSave={handleSaveGems}
        loading={updateGems.isPending}
      />

      <ConfirmDialog
        open={confirmBan}
        onClose={() => setConfirmBan(false)}
        onConfirm={handleConfirmBan}
        title={player.isBanned ? '\u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631' : '\u062D\u0638\u0631 \u0627\u0644\u0644\u0627\u0639\u0628'}
        message={`\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F\u061F`}
        confirmText={player.isBanned ? '\u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631' : '\u062D\u0638\u0631'}
        variant={player.isBanned ? 'primary' : 'danger'}
        loading={toggleBan.isPending}
      />
    </div>
  );
}

