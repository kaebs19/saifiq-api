import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Tabs from '../../components/ui/Tabs';
import SearchTab from './SearchTab';
import AuditLogTab from './AuditLogTab';

const TABS = [
  { id: 'search', label: 'بحث ومنح' },
  { id: 'audit', label: 'سجل العمليات' },
];

export default function CurrencyPage() {
  const [tab, setTab] = useState('search');

  return (
    <div>
      <PageHeader title="إدارة العملات" subtitle="منح ذهب وجواهر للاعبين" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'search' && <SearchTab />}
      {tab === 'audit' && <AuditLogTab />}
    </div>
  );
}
