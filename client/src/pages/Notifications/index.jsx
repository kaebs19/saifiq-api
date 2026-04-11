import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import NotificationsTable from './NotificationsTable';
import SendNotificationModal from './SendNotificationModal';
import { useNotificationsList } from '../../hooks/useNotifications';

const DEFAULT_FILTERS = { page: 1, limit: 20 };

export default function NotificationsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sending, setSending] = useState(false);

  const { data: listData, isLoading } = useNotificationsList(filters);
  const items = listData?.data || [];
  const meta = listData?.meta || { total: 0, page: 1, limit: 20 };

  return (
    <div>
      <PageHeader
        title={'\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A'}
        subtitle={`${meta.total} \u0625\u0634\u0639\u0627\u0631`}
        actions={
          <Button variant="primary" iconLeft="upload" onClick={() => setSending(true)}>
            {'\u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631'}
          </Button>
        }
      />

      <NotificationsTable data={items} loading={isLoading} />

      <Pagination
        page={meta.page}
        pageSize={meta.limit}
        total={meta.total}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />

      <SendNotificationModal open={sending} onClose={() => setSending(false)} />
    </div>
  );
}
