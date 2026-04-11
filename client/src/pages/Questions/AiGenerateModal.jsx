import { useState } from 'react';
import { colors, radii, spacing, font } from '../../lib/theme';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Icon from '../../components/icons/Icon';
import { useGenerateAiQuestions } from '../../hooks/useQuestions';
import { useCategoryConfig } from '../../hooks/useCategoryConfig';

const TYPE_LABELS = {
  mcq: 'MCQ',
  quick_input: 'Quick Input',
  numeric: 'Numeric',
};

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: '\u0633\u0647\u0644' },
  { value: 'medium', label: '\u0645\u062A\u0648\u0633\u0637' },
  { value: 'hard', label: '\u0635\u0639\u0628' },
];

export default function AiGenerateModal({ open, onClose }) {
  const { data: categoryConfig } = useCategoryConfig();
  const generate = useGenerateAiQuestions();

  const [category, setCategory] = useState('');
  const [type, setType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [result, setResult] = useState(null);

  const reset = () => { setResult(null); };
  const handleClose = () => { reset(); onClose(); };

  const categoryOptions = [
    { value: '', label: '\u0627\u062E\u062A\u0631 \u0627\u0644\u0642\u0633\u0645' },
    ...Object.entries(categoryConfig || {}).map(([key, cfg]) => ({
      value: key,
      label: `${cfg.icon} ${cfg.label}`,
    })),
  ];

  const allowedTypes = category && categoryConfig?.[category]?.types;
  const typeOptions = (allowedTypes || ['mcq', 'quick_input', 'numeric']).map((t) => ({
    value: t,
    label: TYPE_LABELS[t],
  }));

  const handleGenerate = async () => {
    if (!category) return;
    const data = await generate.mutateAsync({ category, type, difficulty, count: Number(count) });
    setResult(data);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={'\u062A\u0648\u0644\u064A\u062F \u0623\u0633\u0626\u0644\u0629 \u0628\u0648\u0627\u0633\u0637\u0629 AI'}
      size="md"
      footer={
        result ? (
          <Button variant="primary" onClick={handleClose}>{'\u0625\u063A\u0644\u0627\u0642'}</Button>
        ) : (
          <>
            <Button
              variant="primary"
              iconLeft="check"
              onClick={handleGenerate}
              loading={generate.isPending}
              disabled={!category}
            >
              {'\u062A\u0648\u0644\u064A\u062F'}
            </Button>
            <Button variant="secondary" onClick={handleClose}>{'\u0625\u0644\u063A\u0627\u0621'}</Button>
          </>
        )
      }
    >
      {!result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <div style={styles.info}>
            <Icon name="info" size={18} color={colors.info} />
            <span>{'\u0633\u064A\u062A\u0645 \u062A\u0648\u0644\u064A\u062F \u0623\u0633\u0626\u0644\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 Claude AI \u0648\u062D\u0641\u0638\u0647\u0627 \u0641\u064A \u0627\u0644\u0642\u0627\u0639\u062F\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B'}</span>
          </div>
          <Select
            label={'\u0627\u0644\u0642\u0633\u0645'}
            value={category}
            onChange={setCategory}
            options={categoryOptions}
          />
          <Select
            label={'\u0627\u0644\u0646\u0648\u0639'}
            value={type}
            onChange={setType}
            options={typeOptions}
          />
          <Select
            label={'\u0627\u0644\u0635\u0639\u0648\u0628\u0629'}
            value={difficulty}
            onChange={setDifficulty}
            options={DIFFICULTY_OPTIONS}
          />
          <Input
            label={'\u0627\u0644\u0639\u062F\u062F (1-10)'}
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            min={1}
            max={10}
          />
        </div>
      ) : (
        <div>
          <div style={styles.successBox}>
            <Icon name="check" size={20} color={colors.success} />
            <span style={{ color: colors.success, fontSize: font.sizes.lg, fontWeight: font.weights.bold }}>
              {`\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 ${result.created} \u0633\u0624\u0627\u0644`}
            </span>
          </div>
          {result.errors?.length > 0 && (
            <div style={{ ...styles.successBox, marginTop: spacing.md, borderColor: colors.danger + '40' }}>
              <Icon name="alert" size={18} color={colors.danger} />
              <span style={{ color: colors.danger, fontWeight: font.weights.bold }}>
                {`${result.errors.length} \u062E\u0637\u0623`}
              </span>
            </div>
          )}
          {result.questions?.length > 0 && (
            <div style={styles.preview}>
              <h4 style={styles.previewTitle}>{'\u0645\u0639\u0627\u064A\u0646\u0629'}</h4>
              <ul style={styles.previewList}>
                {result.questions.slice(0, 5).map((q) => (
                  <li key={q.id} style={styles.previewItem}>{q.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

const styles = {
  info: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    background: colors.infoSoft,
    border: `1px solid ${colors.info}40`,
    borderRadius: radii.lg,
    color: colors.info,
    fontSize: font.sizes.sm,
    fontFamily: font.family,
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
  },
  preview: {
    marginTop: spacing.lg,
    padding: spacing.md,
    background: colors.cardAlt,
    borderRadius: radii.lg,
    border: `1px solid ${colors.border}`,
  },
  previewTitle: {
    color: colors.text,
    fontSize: font.sizes.md,
    fontWeight: font.weights.bold,
    fontFamily: font.family,
    margin: `0 0 ${spacing.sm}`,
  },
  previewList: { margin: 0, padding: 0, listStyle: 'none' },
  previewItem: {
    color: colors.textMuted,
    fontSize: font.sizes.sm,
    fontFamily: font.family,
    padding: `${spacing.xs} 0`,
    borderBottom: `1px solid ${colors.border}`,
  },
};
