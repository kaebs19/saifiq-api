import { spacing } from '../../lib/theme';
import Card from './Card';
import Button from './Button';

/**
 * Reusable filter row.
 * Children render the filter inputs (Inputs/Selects).
 * Owns the layout (grid + reset button) so individual pages stay slim.
 */
export default function FilterCard({ children, onReset, columns = 'repeat(auto-fit, minmax(180px, 1fr)) auto' }) {
  return (
    <Card style={{ marginBottom: spacing.lg }}>
      <div style={{ display: 'grid', gridTemplateColumns: columns, gap: spacing.md, alignItems: 'end' }}>
        {children}
        {onReset && (
          <Button variant="secondary" iconLeft="close" onClick={onReset}>
            {'\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646'}
          </Button>
        )}
      </div>
    </Card>
  );
}
