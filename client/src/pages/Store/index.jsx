import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Tabs from '../../components/ui/Tabs';
import ItemsTab from './ItemsTab';
import TransactionsTab from './TransactionsTab';
import IapTab from './IapTab';

const TABS = [
  { id: 'items', label: 'الأدوات (بالذهب)' },
  { id: 'iap', label: 'باقات الجواهر' },
  { id: 'transactions', label: 'سجل المعاملات' },
];

export default function StorePage() {
  const [tab, setTab] = useState('items');

  return (
    <div>
      <PageHeader title="المتجر" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'items' && <ItemsTab />}
      {tab === 'iap' && <IapTab />}
      {tab === 'transactions' && <TransactionsTab />}
    </div>
  );
}
