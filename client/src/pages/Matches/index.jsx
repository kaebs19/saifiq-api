import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import MatchesFilters from './MatchesFilters';
import MatchesTable from './MatchesTable';
import { useMatchesList } from '../../hooks/useMatches';

const DEFAULT_FILTERS = { page: 1, limit: 20 };

export default function MatchesPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { data: listData, isLoading } = useMatchesList(filters);

  const matches = listData?.data || [];
  const meta = listData?.meta || { total: 0, page: 1, limit: 20 };

  return (
    <div>
      <PageHeader
        title={'\u0627\u0644\u0645\u0628\u0627\u0631\u064A\u0627\u062A'}
        subtitle={`${meta.total} \u0645\u0628\u0627\u0631\u0627\u0629`}
      />

      <MatchesFilters filters={filters} onChange={setFilters} />

      <MatchesTable data={matches} loading={isLoading} />

      <Pagination
        page={meta.page}
        pageSize={meta.limit}
        total={meta.total}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}
