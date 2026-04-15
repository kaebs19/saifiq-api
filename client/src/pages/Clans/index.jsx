import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Tabs from '../../components/ui/Tabs';
import ClansListTab from './ClansListTab';
import LeaderboardTab from './LeaderboardTab';

const TABS = [
  { id: 'list', label: 'قائمة العشائر' },
  { id: 'leaderboard', label: 'الترتيب' },
];

export default function ClansPage() {
  const [tab, setTab] = useState('list');

  return (
    <div>
      <PageHeader title="العشائر" subtitle="إدارة عشائر اللاعبين" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'list' && <ClansListTab />}
      {tab === 'leaderboard' && <LeaderboardTab />}
    </div>
  );
}
