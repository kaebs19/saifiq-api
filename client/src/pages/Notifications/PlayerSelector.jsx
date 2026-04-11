import { useState } from 'react';
import { colors, radii, spacing, font } from '../../lib/theme';
import Input from '../../components/ui/Input';
import { usePlayersList } from '../../hooks/usePlayers';

export default function PlayerSelector({ selectedPlayer, onSelect }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const { data } = usePlayersList({ search, limit: 8, page: 1 });
  const players = data?.data || [];

  if (selectedPlayer) {
    return (
      <div style={styles.field}>
        <label style={styles.label}>{'\u0627\u0644\u0644\u0627\u0639\u0628'}</label>
        <div style={styles.selected}>
          <div>
            <div style={styles.selectedName}>{selectedPlayer.username}</div>
            <div style={styles.selectedEmail}>{selectedPlayer.email}</div>
          </div>
          <button type="button" onClick={() => onSelect(null)} style={styles.changeBtn}>
            {'\u062A\u063A\u064A\u064A\u0631'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <Input
        label={'\u0627\u0644\u0644\u0627\u0639\u0628'}
        placeholder={'\u0627\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0628\u0631\u064A\u062F...'}
        iconLeft="search"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && search && players.length > 0 && (
        <div style={styles.dropdown}>
          {players.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onSelect(p); setSearch(''); setOpen(false); }}
              style={styles.option}
            >
              <div style={styles.optionName}>{p.username}</div>
              <div style={styles.optionEmail}>{p.email}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { position: 'relative' },
  field: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  label: { fontSize: font.sizes.md, color: colors.textMuted, fontWeight: font.weights.semibold, fontFamily: font.family },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing.xs,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    maxHeight: '240px',
    overflowY: 'auto',
    zIndex: 10,
  },
  option: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${colors.border}`,
    padding: spacing.md,
    cursor: 'pointer',
    textAlign: 'right',
    fontFamily: font.family,
    color: colors.text,
  },
  optionName: { fontWeight: font.weights.semibold, fontSize: font.sizes.md },
  optionEmail: { color: colors.textDim, fontSize: font.sizes.xs, marginTop: '2px' },
  selected: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    background: colors.cardAlt,
    border: `1px solid ${colors.gold}`,
    borderRadius: radii.lg,
  },
  selectedName: { color: colors.text, fontWeight: font.weights.semibold, fontFamily: font.family },
  selectedEmail: { color: colors.textDim, fontSize: font.sizes.xs, fontFamily: font.family, marginTop: '2px' },
  changeBtn: {
    background: 'transparent',
    border: 'none',
    color: colors.gold,
    cursor: 'pointer',
    fontFamily: font.family,
    fontSize: font.sizes.sm,
    fontWeight: font.weights.semibold,
  },
};
