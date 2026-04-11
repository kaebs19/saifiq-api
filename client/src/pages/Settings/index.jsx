import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Tabs from '../../components/ui/Tabs';
import GameSettingsTab from './GameSettingsTab';
import SpinWheelTab from './SpinWheelTab';
import DailyRewardsTab from './DailyRewardsTab';
import ContentTab from './ContentTab';
import AdminsTab from './AdminsTab';

const TABS = [
  { id: 'game', label: '\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0644\u0639\u0628\u0629' },
  { id: 'spin', label: '\u0627\u0644\u0635\u062D\u0646 \u0627\u0644\u064A\u0648\u0645\u064A' },
  { id: 'daily', label: '\u0645\u0643\u0627\u0641\u0622\u062A \u064A\u0648\u0645\u064A\u0629' },
  { id: 'content', label: '\u0627\u0644\u0645\u062D\u062A\u0648\u0649' },
  { id: 'admins', label: '\u0627\u0644\u0623\u062F\u0645\u0646\u0648\u0646' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('game');

  return (
    <div>
      <PageHeader title={'\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A'} />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'game' && <GameSettingsTab />}
      {tab === 'spin' && <SpinWheelTab />}
      {tab === 'daily' && <DailyRewardsTab />}
      {tab === 'content' && <ContentTab />}
      {tab === 'admins' && <AdminsTab />}
    </div>
  );
}
