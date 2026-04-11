import { useState } from 'react';
import { colors, radii, spacing, font, transitions } from '../../lib/theme';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import PlayerSelector from './PlayerSelector';
import { useSendNotification, useBroadcastNotification } from '../../hooks/useNotifications';

export default function SendNotificationModal({ open, onClose }) {
  const [mode, setMode] = useState('single');
  const [player, setPlayer] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const sendOne = useSendNotification();
  const broadcast = useBroadcastNotification();
  const loading = sendOne.isPending || broadcast.isPending;

  const reset = () => { setPlayer(null); setTitle(''); setBody(''); setMode('single'); };
  const handleClose = () => { reset(); onClose(); };

  const handleSend = async () => {
    if (!title || !body) return;
    if (mode === 'single') {
      if (!player) return;
      await sendOne.mutateAsync({ userId: player.id, title, body });
    } else {
      await broadcast.mutateAsync({ title, body });
    }
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={'\u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631'}
      size="md"
      footer={
        <>
          <Button variant="primary" iconLeft="upload" onClick={handleSend} loading={loading} disabled={!title || !body || (mode === 'single' && !player)}>
            {'\u0625\u0631\u0633\u0627\u0644'}
          </Button>
          <Button variant="secondary" onClick={handleClose}>{'\u0625\u0644\u063A\u0627\u0621'}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        <div style={styles.toggle}>
          <button type="button" onClick={() => setMode('single')} style={{ ...styles.toggleBtn, ...(mode === 'single' ? styles.toggleActive : {}) }}>
            {'\u0644\u0627\u0639\u0628 \u0645\u062D\u062F\u062F'}
          </button>
          <button type="button" onClick={() => setMode('broadcast')} style={{ ...styles.toggleBtn, ...(mode === 'broadcast' ? styles.toggleActive : {}) }}>
            {'\u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646'}
          </button>
        </div>

        {mode === 'single' && <PlayerSelector selectedPlayer={player} onSelect={setPlayer} />}

        <Input
          label={'\u0627\u0644\u0639\u0646\u0648\u0627\u0646'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
        <Textarea
          label={'\u0627\u0644\u0646\u0635'}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={1000}
        />
      </div>
    </Modal>
  );
}

const styles = {
  toggle: {
    display: 'flex',
    gap: spacing.xs,
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: colors.textMuted,
    fontSize: font.sizes.sm,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
    padding: '8px 16px',
    borderRadius: radii.md,
    cursor: 'pointer',
    transition: transitions.base,
  },
  toggleActive: { background: colors.goldSoft, color: colors.gold },
};
