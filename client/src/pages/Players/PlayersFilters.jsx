import FilterCard from '../../components/ui/FilterCard';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const STATUS_OPTIONS = [
  { value: '', label: '\u0627\u0644\u0643\u0644' },
  { value: 'false', label: '\u0646\u0634\u0637' },
  { value: 'true', label: '\u0645\u062D\u0638\u0648\u0631' },
];

export default function PlayersFilters({ filters, onChange }) {
  const set = (field, value) => onChange({ ...filters, [field]: value, page: 1 });
  const reset = () => onChange({ page: 1, limit: filters.limit });

  return (
    <FilterCard onReset={reset} columns="2fr 1fr 1fr auto">
      <Input
        placeholder={'\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0628\u0631\u064A\u062F...'}
        iconLeft="search"
        value={filters.search || ''}
        onChange={(e) => set('search', e.target.value)}
      />
      <Select
        value={filters.isBanned ?? ''}
        onChange={(v) => set('isBanned', v)}
        options={STATUS_OPTIONS}
      />
      <Input
        placeholder={'\u0627\u0644\u062F\u0648\u0644\u0629 (SA, EG...)'}
        value={filters.country || ''}
        onChange={(e) => set('country', e.target.value)}
      />
    </FilterCard>
  );
}
