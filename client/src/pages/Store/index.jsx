import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Tabs from '../../components/ui/Tabs';
import ItemsTab from './ItemsTab';
import TransactionsTab from './TransactionsTab';

const TABS = [
  { id: 'items', label: '\u0627\u0644\u0623\u062F\u0648\u0627\u062A' },
  { id: 'transactions', label: '\u0633\u062C\u0644 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A' },
];

export default function StorePage() {
  const [tab, setTab] = useState('items');

  return (
    <div>
      <PageHeader title={'\u0627\u0644\u0645\u062A\u062C\u0631'} />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'items' && <ItemsTab />}
      {tab === 'transactions' && <TransactionsTab />}
    </div>
  );
}
