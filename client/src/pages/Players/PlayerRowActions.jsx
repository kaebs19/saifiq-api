import { spacing } from '../../lib/theme';
import Button from '../../components/ui/Button';

export default function PlayerRowActions({ row, onEditGems, onToggleBan }) {
  return (
    <div style={{ display: 'flex', gap: spacing.xs, justifyContent: 'flex-end' }}>
      <Button
        size="sm"
        variant="gold"
        iconLeft="gem"
        onClick={() => onEditGems(row)}
      >
        {'\u0627\u0644\u062C\u0648\u0627\u0647\u0631'}
      </Button>
      <Button
        size="sm"
        variant={row.isBanned ? 'secondary' : 'danger'}
        iconLeft="power"
        onClick={() => onToggleBan(row)}
      >
        {row.isBanned ? '\u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631' : '\u062D\u0638\u0631'}
      </Button>
    </div>
  );
}
