import FilterCard from '../../components/ui/FilterCard';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const TYPE_OPTIONS = [
  { value: '', label: '\u0643\u0644 \u0627\u0644\u0623\u0646\u0648\u0627\u0639' },
  { value: 'mcq', label: 'MCQ' },
  { value: 'quick_input', label: 'Quick Input' },
  { value: 'numeric', label: 'Numeric' },
];

const DIFFICULTY_OPTIONS = [
  { value: '', label: '\u0643\u0644 \u0627\u0644\u0645\u0633\u062A\u0648\u064A\u0627\u062A' },
  { value: 'easy', label: '\u0633\u0647\u0644' },
  { value: 'medium', label: '\u0645\u062A\u0648\u0633\u0637' },
  { value: 'hard', label: '\u0635\u0639\u0628' },
];

const STATUS_OPTIONS = [
  { value: '', label: '\u0627\u0644\u0643\u0644' },
  { value: 'true', label: '\u0645\u0641\u0639\u0644' },
  { value: 'false', label: '\u0645\u0639\u0637\u0644' },
];

export default function QuestionsFilters({ filters, onChange, categoryConfig }) {
  const categoryOptions = [
    { value: '', label: '\u0643\u0644 \u0627\u0644\u0623\u0642\u0633\u0627\u0645' },
    ...Object.entries(categoryConfig || {}).map(([key, cfg]) => ({
      value: key,
      label: `${cfg.icon} ${cfg.label}`,
    })),
  ];

  const set = (field, value) => onChange({ ...filters, [field]: value, page: 1 });
  const reset = () => onChange({ page: 1, limit: filters.limit });

  return (
    <FilterCard onReset={reset} columns="2fr 1fr 1fr 1fr 1fr auto">
      <Input
        placeholder={'\u0628\u062D\u062B \u0641\u064A \u0627\u0644\u0623\u0633\u0626\u0644\u0629...'}
        iconLeft="search"
        value={filters.search || ''}
        onChange={(e) => set('search', e.target.value)}
      />
      <Select value={filters.category || ''} onChange={(v) => set('category', v)} options={categoryOptions} />
      <Select value={filters.type || ''} onChange={(v) => set('type', v)} options={TYPE_OPTIONS} />
      <Select value={filters.difficulty || ''} onChange={(v) => set('difficulty', v)} options={DIFFICULTY_OPTIONS} />
      <Select value={filters.isActive ?? ''} onChange={(v) => set('isActive', v)} options={STATUS_OPTIONS} />
    </FilterCard>
  );
}
