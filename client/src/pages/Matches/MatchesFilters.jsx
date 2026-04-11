import FilterCard from '../../components/ui/FilterCard';
import Select from '../../components/ui/Select';

const STATUS_OPTIONS = [
  { value: '', label: '\u0643\u0644 \u0627\u0644\u062D\u0627\u0644\u0627\u062A' },
  { value: 'waiting', label: '\u0641\u064A \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631' },
  { value: 'phase1', label: '\u0627\u0644\u0645\u0631\u062D\u0644\u0629 1' },
  { value: 'phase2', label: '\u0627\u0644\u0645\u0631\u062D\u0644\u0629 2' },
  { value: 'phase3', label: '\u0627\u0644\u0645\u0631\u062D\u0644\u0629 3' },
  { value: 'finished', label: '\u0645\u0646\u062A\u0647\u064A\u0629' },
];

const MODE_OPTIONS = [
  { value: '', label: '\u0643\u0644 \u0627\u0644\u0623\u0646\u0645\u0627\u0637' },
  { value: '1v1', label: '1v1' },
  { value: '4player', label: '4 \u0644\u0627\u0639\u0628\u064A\u0646' },
];

export default function MatchesFilters({ filters, onChange }) {
  const set = (field, value) => onChange({ ...filters, [field]: value, page: 1 });
  const reset = () => onChange({ page: 1, limit: filters.limit });

  return (
    <FilterCard onReset={reset} columns="1fr 1fr auto">
      <Select value={filters.status || ''} onChange={(v) => set('status', v)} options={STATUS_OPTIONS} />
      <Select value={filters.mode || ''} onChange={(v) => set('mode', v)} options={MODE_OPTIONS} />
    </FilterCard>
  );
}
