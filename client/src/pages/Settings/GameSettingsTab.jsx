import { useEffect, useState } from 'react';
import { colors, spacing, font } from '../../lib/theme';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useSettings, useUpdateSetting } from '../../hooks/useSettings';

const ITEM_LABELS = {
  eliminate_two: '\u062D\u0630\u0641 \u0625\u062C\u0627\u0628\u062A\u064A\u0646',
  hint: '\u062A\u0644\u0645\u064A\u062D',
  freeze_time: '\u062A\u062C\u0645\u064A\u062F \u0627\u0644\u0648\u0642\u062A',
  shield: '\u062F\u0631\u0639 \u062D\u0645\u0627\u064A\u0629',
  double_damage: '\u0636\u0639\u0641 \u0627\u0644\u0636\u0631\u0631',
  steal: '\u0633\u0631\u0642\u0629',
  skip: '\u062A\u062E\u0637\u0649 \u0627\u0644\u0633\u0624\u0627\u0644',
  reveal: '\u0643\u0634\u0641 \u0627\u0644\u0625\u062C\u0627\u0628\u0629',
};

export default function GameSettingsTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [costs, setCosts] = useState({});

  useEffect(() => {
    if (settings?.gem_costs) setCosts(settings.gem_costs);
  }, [settings]);

  const handleSave = () => {
    const cleaned = {};
    Object.entries(costs).forEach(([k, v]) => { cleaned[k] = Number(v); });
    updateSetting.mutate({ key: 'gem_costs', value: cleaned });
  };

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: spacing.xxl }}><Spinner size={28} /></div>;

  return (
    <Card>
      <h3 style={styles.title}>{'\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0623\u062F\u0648\u0627\u062A (\u062C\u0648\u0627\u0647\u0631)'}</h3>
      <p style={styles.subtitle}>{'\u062A\u0639\u062F\u064A\u0644 \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0644\u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0641\u064A \u0627\u0644\u0645\u062A\u062C\u0631'}</p>

      <div style={styles.grid}>
        {Object.entries(costs).map(([key, value]) => (
          <Input
            key={key}
            label={ITEM_LABELS[key] || key}
            type="number"
            value={value}
            onChange={(e) => setCosts({ ...costs, [key]: e.target.value })}
            min={0}
          />
        ))}
      </div>

      <div style={{ marginTop: spacing.lg }}>
        <Button variant="primary" iconLeft="check" onClick={handleSave} loading={updateSetting.isPending}>
          {'\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A'}
        </Button>
      </div>
    </Card>
  );
}

const styles = {
  title: { color: colors.text, fontSize: font.sizes.lg, fontWeight: font.weights.bold, fontFamily: font.family, margin: 0 },
  subtitle: { color: colors.textDim, fontSize: font.sizes.sm, fontFamily: font.family, margin: `${spacing.xs} 0 ${spacing.lg}` },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: spacing.md },
};
