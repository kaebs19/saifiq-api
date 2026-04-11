import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import QuestionRowActions from './QuestionRowActions';
import { colors, font, radii, spacing } from '../../lib/theme';
import { getImageUrl } from '../../lib/urls';

const TYPE_LABELS = {
  mcq: { label: 'MCQ', variant: 'info' },
  quick_input: { label: 'Quick', variant: 'gold' },
  numeric: { label: 'Numeric', variant: 'success' },
};

const DIFFICULTY_LABELS = {
  easy: { label: '\u0633\u0647\u0644', variant: 'success' },
  medium: { label: '\u0645\u062A\u0648\u0633\u0637', variant: 'warning' },
  hard: { label: '\u0635\u0639\u0628', variant: 'danger' },
};

export default function QuestionsTable({ data, loading, categoryConfig, onDelete, onToggle, onDuplicate }) {
  const columns = [
    {
      key: 'text',
      header: '\u0627\u0644\u0633\u0624\u0627\u0644',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          {row.imageUrl && (
            <img
              src={getImageUrl(row.imageUrl)}
              alt=""
              style={{
                width: '40px',
                height: '40px',
                borderRadius: radii.md,
                objectFit: 'cover',
                border: `1px solid ${colors.border}`,
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ color: colors.text, fontSize: font.sizes.md, maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.text}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: '\u0627\u0644\u0642\u0633\u0645',
      render: (row) => {
        const cfg = categoryConfig?.[row.category];
        return <Badge variant="gold">{cfg ? `${cfg.icon} ${cfg.label}` : row.category}</Badge>;
      },
    },
    {
      key: 'type',
      header: '\u0627\u0644\u0646\u0648\u0639',
      render: (row) => {
        const t = TYPE_LABELS[row.type];
        return <Badge variant={t?.variant}>{t?.label || row.type}</Badge>;
      },
    },
    {
      key: 'difficulty',
      header: '\u0627\u0644\u0635\u0639\u0648\u0628\u0629',
      render: (row) => {
        const d = DIFFICULTY_LABELS[row.difficulty];
        return <Badge variant={d?.variant}>{d?.label || row.difficulty}</Badge>;
      },
    },
    {
      key: 'points',
      header: '\u0627\u0644\u0646\u0642\u0627\u0637',
      render: (row) => <span style={{ color: colors.gold, fontWeight: font.weights.bold }}>{row.points}</span>,
    },
    {
      key: 'isActive',
      header: '\u0627\u0644\u062D\u0627\u0644\u0629',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'neutral'}>
          {row.isActive ? '\u0645\u0641\u0639\u0644' : '\u0645\u0639\u0637\u0644'}
        </Badge>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      actions={(row) => (
        <QuestionRowActions row={row} onDelete={onDelete} onToggle={onToggle} onDuplicate={onDuplicate} />
      )}
    />
  );
}
