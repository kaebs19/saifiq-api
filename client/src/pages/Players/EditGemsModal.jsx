import { useEffect, useState } from 'react';
import { spacing, colors, font } from '../../lib/theme';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function EditGemsModal({ player, onClose, onSave, loading }) {
  const [gems, setGems] = useState(0);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (player) {
      setGems(player.gems);
      setReason('');
    }
  }, [player]);

  const handleSave = () => {
    if (!player) return;
    onSave({ id: player.id, data: { gems: Number(gems), reason } });
  };

  return (
    <Modal
      open={!!player}
      onClose={onClose}
      title={'\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062C\u0648\u0627\u0647\u0631'}
      size="sm"
      footer={
        <>
          <Button variant="primary" onClick={handleSave} loading={loading} iconLeft="check">
            {'\u062D\u0641\u0638'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            {'\u0625\u0644\u063A\u0627\u0621'}
          </Button>
        </>
      }
    >
      {player && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <div style={styles.currentBox}>
            <span style={styles.label}>{player.username}</span>
            <span style={styles.current}>{player.gems} {'\u062C\u0648\u0647\u0631\u0629'}</span>
          </div>
          <Input
            label={'\u0627\u0644\u0639\u062F\u062F \u0627\u0644\u062C\u062F\u064A\u062F'}
            type="number"
            value={gems}
            onChange={(e) => setGems(e.target.value)}
            min={0}
          />
          <Input
            label={'\u0627\u0644\u0633\u0628\u0628 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)'}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={'\u0645\u062B\u0627\u0644: \u0645\u0643\u0627\u0641\u0623\u0629 \u0641\u0648\u0632'}
          />
        </div>
      )}
    </Modal>
  );
}

const styles = {
  currentBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    background: colors.cardAlt,
    borderRadius: '10px',
    border: `1px solid ${colors.border}`,
  },
  label: { color: colors.textMuted, fontFamily: font.family, fontWeight: font.weights.semibold },
  current: { color: colors.gold, fontSize: font.sizes.lg, fontWeight: font.weights.bold },
};
