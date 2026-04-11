import { useEffect, useState } from 'react';
import { colors, radii, spacing, font } from '../../lib/theme';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Icon from '../../components/icons/Icon';
import { useSettings, useUpdateSetting } from '../../hooks/useSettings';

const TYPE_OPTIONS = [
  { value: 'gems', label: '\u062C\u0648\u0627\u0647\u0631' },
  { value: 'item', label: '\u0623\u062F\u0627\u0629' },
  { value: 'points', label: '\u0646\u0642\u0627\u0637' },
];

const ITEM_OPTIONS = [
  { value: 'shield', label: '\u062F\u0631\u0639' },
  { value: 'hint', label: '\u062A\u0644\u0645\u064A\u062D' },
  { value: 'eliminate_two', label: '\u062D\u0630\u0641 \u0625\u062C\u0627\u0628\u062A\u064A\u0646' },
  { value: 'skip', label: '\u062A\u062E\u0637\u064A' },
  { value: 'freeze_time', label: '\u062A\u062C\u0645\u064A\u062F' },
];

const DEFAULT = {
  enabled: true,
  rewards: [
    { day: 1, type: 'gems', value: 5, label: '5 \u062C\u0648\u0627\u0647\u0631' },
    { day: 2, type: 'gems', value: 10, label: '10 \u062C\u0648\u0627\u0647\u0631' },
    { day: 3, type: 'gems', value: 15, label: '15 \u062C\u0648\u0647\u0631\u0629' },
    { day: 4, type: 'item', value: 'shield', label: '\u062F\u0631\u0639 \u062D\u0645\u0627\u064A\u0629' },
    { day: 5, type: 'gems', value: 25, label: '25 \u062C\u0648\u0647\u0631\u0629' },
    { day: 6, type: 'gems', value: 30, label: '30 \u062C\u0648\u0647\u0631\u0629' },
    { day: 7, type: 'gems', value: 50, label: '50 \u062C\u0648\u0647\u0631\u0629' },
  ],
};

export default function DailyRewardsTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.daily_reward_config) setConfig(settings.daily_reward_config);
    else if (!isLoading && !config) setConfig(DEFAULT);
  }, [settings, isLoading]);

  const setReward = (i, field, value) => {
    const next = [...config.rewards];
    next[i] = { ...next[i], [field]: value, day: i + 1 };
    setConfig({ ...config, rewards: next });
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSetting.mutateAsync({ key: 'daily_reward_config', value: config });
    setSaving(false);
  };

  if (isLoading || !config) return <div style={{ display: 'flex', justifyContent: 'center', padding: spacing.xxl }}><Spinner size={28} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
      <Card>
        <div style={styles.headerRow}>
          <h3 style={styles.title}>{'\u0645\u0643\u0627\u0641\u0622\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u064A\u0648\u0645\u064A'}</h3>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            style={{ ...styles.toggle, background: config.enabled ? colors.success + '20' : colors.cardAlt }}
          >
            <Badge variant={config.enabled ? 'success' : 'neutral'}>
              {config.enabled ? '\u0645\u0641\u0639\u0644' : '\u0645\u0639\u0637\u0644'}
            </Badge>
          </button>
        </div>
        <p style={styles.subtitle}>{'\u0627\u0644\u0644\u0627\u0639\u0628 \u064A\u062D\u0635\u0644 \u0639\u0644\u0649 \u0645\u0643\u0627\u0641\u0623\u0629 \u0643\u0644 \u064A\u0648\u0645 \u064A\u062F\u062E\u0644 \u0641\u064A\u0647. 7 \u0623\u064A\u0627\u0645 \u0645\u062A\u062A\u0627\u0644\u064A\u0629 \u062B\u0645 \u064A\u0639\u0627\u062F.'}</p>
      </Card>

      <div style={styles.daysGrid}>
        {config.rewards.map((r, i) => (
          <Card key={i} style={{ borderColor: i === 6 ? colors.gold : colors.border }}>
            <div style={styles.dayHeader}>
              <Badge variant={i === 6 ? 'gold' : 'neutral'}>{`\u064A\u0648\u0645 ${i + 1}`}</Badge>
              {i === 6 && <Badge variant="gold" size="sm">{'\u0645\u0643\u0627\u0641\u0623\u0629 \u0643\u0628\u0631\u0649'}</Badge>}
            </div>
            <div style={styles.dayFields}>
              <Select
                label={'\u0627\u0644\u0646\u0648\u0639'}
                value={r.type}
                onChange={(v) => setReward(i, 'type', v)}
                options={TYPE_OPTIONS}
              />
              {r.type === 'gems' && (
                <Input label={'\u0627\u0644\u0642\u064A\u0645\u0629'} type="number" value={r.value} onChange={(e) => setReward(i, 'value', Number(e.target.value))} />
              )}
              {r.type === 'points' && (
                <Input label={'\u0627\u0644\u0646\u0642\u0627\u0637'} type="number" value={r.value} onChange={(e) => setReward(i, 'value', Number(e.target.value))} />
              )}
              {r.type === 'item' && (
                <Select label={'\u0627\u0644\u0623\u062F\u0627\u0629'} value={r.value} onChange={(v) => setReward(i, 'value', v)} options={ITEM_OPTIONS} />
              )}
              <Input label={'\u0627\u0644\u0627\u0633\u0645'} value={r.label} onChange={(e) => setReward(i, 'label', e.target.value)} />
            </div>
          </Card>
        ))}
      </div>

      <Button variant="primary" iconLeft="check" onClick={handleSave} loading={saving} fullWidth>
        {'\u062D\u0641\u0638 \u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A'}
      </Button>
    </div>
  );
}

const styles = {
  title: { color: colors.text, fontSize: font.sizes.lg, fontWeight: font.weights.bold, fontFamily: font.family, margin: 0 },
  subtitle: { color: colors.textDim, fontSize: font.sizes.sm, fontFamily: font.family, margin: `${spacing.sm} 0 0` },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  toggle: { border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: '6px 12px', cursor: 'pointer' },
  daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: spacing.md },
  dayHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  dayFields: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
};
