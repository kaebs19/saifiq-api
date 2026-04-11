import { colors, radii, spacing, font } from '../../lib/theme';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

export default function Table({
  columns,
  data = [],
  loading = false,
  empty,
  rowKey = (row) => row.id,
  actions,
  onRowClick,
}) {
  const cols = actions ? [...columns, { key: '__actions', header: '', width: '1%', align: 'left' }] : columns;

  if (loading) {
    return (
      <div style={styles.center}>
        <Spinner size={24} />
      </div>
    );
  }

  if (!data.length) {
    return empty || <EmptyState title={'\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A'} />;
  }

  return (
    <div style={styles.wrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {cols.map((col) => (
              <th
                key={col.key}
                style={{
                  ...styles.th,
                  width: col.width,
                  textAlign: col.align || 'right',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{ ...styles.tr, cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {cols.map((col) => (
                <td
                  key={col.key}
                  style={{ ...styles.td, textAlign: col.align || 'right' }}
                >
                  {col.key === '__actions' ? actions(row) : col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  wrap: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: font.family,
  },
  th: {
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: font.sizes.sm,
    fontWeight: font.weights.semibold,
    color: colors.textDim,
    background: colors.cardAlt,
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: `1px solid ${colors.border}`,
    transition: 'background 0.15s ease',
  },
  td: {
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: font.sizes.md,
    color: colors.text,
    verticalAlign: 'middle',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.xl,
  },
};
