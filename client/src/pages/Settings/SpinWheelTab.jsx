import { useEffect, useState } from 'react';
import { colors, radii, spacing, font, transitions } from '../../lib/theme';
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
  { value: 'points', label: '\u0646\u0642\u0627\u0637' },
  { value: 'item', label: '\u0623\u062F\u0627\u0629 \u0639\u0634\u0648\u0627\u0626\u064A\u0629' },
  { value: 'extra_spin', label: '\u062F\u0648\u0631\u0629 \u0625\u0636\u0627\u0641\u064A\u0629' },
  { value: 'nothing', label: '\u0644\u0627 \u0634\u064A' },
];

const DEFAULT_SLOT = { type: 'gems', value: 5, weight: 10, color: '#3b82f6', label: '5 \u062C\u0648\u0627\u0647\u0631' };

export default function SpinWheelTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.spin_wheel_config) {
      setConfig(settings.spin_wheel_config);
    } else if (!isLoading && !config) {
      // Load default
      setConfig({
        enabled: true,
        cooldownHours: 24,
        extraSpinCost: 10,
        maxExtraSpinsPerDay: 3,
        slots: [
          { type: 'gems', value: 5, weight: 30, color: '#3b82f6', label: '5 \u062C\u0648\u0627\u0647\u0631' },
          { type: 'gems', value: 10, weight: 20, color: '#22c55e', label: '10 \u062C\u0648\u0627\u0647\u0631' },
          { type: 'gems', value: 20, weight: 10, color: '#c9a84c', label: '20 \u062C\u0648\u0647\u0631\u0629' },
          { type: 'gems', value: 50, weight: 3, color: '#ef4444', label: '50 \u062C\u0648\u0647\u0631\u0629' },
          { type: 'item', value: null, weight: 15, color: '#8b5cf6', label: '\u0623\u062F\u0627\u0629 \u0639\u0634\u0648\u0627\u0626\u064A\u0629' },
          { type: 'points', value: 50, weight: 12, color: '#f97316', label: '50 \u0646\u0642\u0637\u0629' },
          { type: 'extra_spin', value: 1, weight: 5, color: '#e0e0e0', label: '\u062F\u0648\u0631\u0629 \u0625\u0636\u0627\u0641\u064A\u0629' },
          { type: 'nothing', value: 0, weight: 5, color: '#6b7280', label: '\u062D\u0638 \u0623\u0641\u0636\u0644' },
        ],
      });
    }
  }, [settings, isLoading]);

  const setField = (field, value) => setConfig((c) => ({ ...c, [field]: value }));

  const setSlot = (index, field, value) => {
    const next = [...config.slots];
    next[index] = { ...next[index], [field]: value };
    setConfig((c) => ({ ...c, slots: next }));
  };

  const addSlot = () => {
    if (config.slots.length >= 12) return;
    setConfig((c) => ({ ...c, slots: [...c.slots, { ...DEFAULT_SLOT }] }));
  };

  const removeSlot = (index) => {
    if (config.slots.length <= 4) return;
    setConfig((c) => ({ ...c, slots: c.slots.filter((_, i) => i !== index) }));
  };

  const totalWeight = config?.slots?.reduce((s, slot) => s + Number(slot.weight || 0), 0) || 0;

  const handleSave = async () => {
    setSaving(true);
    const cleaned = {
      ...config,
      cooldownHours: Number(config.cooldownHours),
      extraSpinCost: Number(config.extraSpinCost),
      maxExtraSpinsPerDay: Number(config.maxExtraSpinsPerDay),
      slots: config.slots.map((s) => ({
        ...s,
        value: s.type === 'nothing' ? 0 : (s.type === 'item' ? null : Number(s.value)),
        weight: Number(s.weight),
      })),
    };
    await updateSetting.mutateAsync({ key: 'spin_wheel_config', value: cleaned });
    setSaving(false);
  };

  if (isLoading || !config) return <div style={{ display: 'flex', justifyContent: 'center', padding: spacing.xxl }}><Spinner size={28} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
      <Card>
        <div style={styles.headerRow}>
          <h3 style={styles.title}>{'\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0639\u0627\u0645\u0629'}</h3>
          <button
            onClick={() => setField('enabled', !config.enabled)}
            style={{ ...styles.toggle, background: config.enabled ? colors.success + '20' : colors.cardAlt }}
          >
            <Badge variant={config.enabled ? 'success' : 'neutral'}>
              {config.enabled ? '\u0645\u0641\u0639\u0644' : '\u0645\u0639\u0637\u0644'}
            </Badge>
          </button>
        </div>
        <div style={styles.grid3}>
          <Input
            label={'\u0627\u0644\u0645\u0647\u0644\u0629 (\u0633\u0627\u0639\u0629)'}
            type="number"
            value={config.cooldownHours}
            onChange={(e) => setField('cooldownHours', e.target.value)}
          />
          <Input
            label={'\u0633\u0639\u0631 \u0627\u0644\u062F\u0648\u0631\u0629 \u0627\u0644\u0625\u0636\u0627\u0641\u064A\u0629'}
            type="number"
            value={config.extraSpinCost}
            onChange={(e) => setField('extraSpinCost', e.target.value)}
          />
          <Input
            label={'\u062D\u062F \u0627\u0644\u062F\u0648\u0631\u0627\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u064A\u0629'}
            type="number"
            value={config.maxExtraSpinsPerDay}
            onChange={(e) => setField('maxExtraSpinsPerDay', e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <div style={styles.headerRow}>
          <h3 style={styles.title}>
            {'\u0627\u0644\u062E\u0627\u0646\u0627\u062A'} ({config.slots.length})
            <span style={{ ...styles.weightBadge, color: totalWeight === 100 ? colors.success : colors.danger }}>
              {' '}\u0627\u0644\u0645\u062C\u0645\u0648\u0639: {totalWeight}%
            </span>
          </h3>
          <Button size="sm" variant="gold" iconLeft="plus" onClick={addSlot} disabled={config.slots.length >= 12}>
            {'\u0625\u0636\u0627\u0641\u0629'}
          </Button>
        </div>

        <div style={styles.slotsGrid}>
          {config.slots.map((slot, i) => (
            <div key={i} style={{ ...styles.slotCard, borderColor: slot.color + '60' }}>
              <div style={styles.slotHeader}>
                <div style={{ ...styles.colorDot, background: slot.color }} />
                <span style={styles.slotNum}>#{i + 1}</span>
                {config.slots.length > 4 && (
                  <button onClick={() => removeSlot(i)} style={styles.removeBtn}>
                    <Icon name="close" size={14} color={colors.danger} />
                  </button>
                )}
              </div>
              <div style={styles.slotFields}>
                <Input label={'\u0627\u0644\u0627\u0633\u0645'} value={slot.label} onChange={(e) => setSlot(i, 'label', e.target.value)} />
                <Select label={'\u0627\u0644\u0646\u0648\u0639'} value={slot.type} onChange={(v) => setSlot(i, 'type', v)} options={TYPE_OPTIONS} />
                {slot.type !== 'nothing' && slot.type !== 'item' && (
                  <Input label={'\u0627\u0644\u0642\u064A\u0645\u0629'} type="number" value={slot.value || ''} onChange={(e) => setSlot(i, 'value', e.target.value)} />
                )}
                <Input label={'\u0627\u0644\u0646\u0633\u0628\u0629 %'} type="number" value={slot.weight} onChange={(e) => setSlot(i, 'weight', e.target.value)} />
                <Input label={'\u0627\u0644\u0644\u0648\u0646'} type="color" value={slot.color} onChange={(e) => setSlot(i, 'color', e.target.value)} style={{ height: '42px', padding: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Button variant="primary" iconLeft="check" onClick={handleSave} loading={saving} fullWidth>
        {'\u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0635\u062D\u0646'}
      </Button>
    </div>
  );
}

const styles = {
  title: { color: colors.text, fontSize: font.sizes.lg, fontWeight: font.weights.bold, fontFamily: font.family, margin: 0 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.md },
  toggle: { border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: '6px 12px', cursor: 'pointer' },
  weightBadge: { fontSize: font.sizes.sm, fontWeight: font.weights.regular, marginRight: spacing.sm },
  slotsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: spacing.md },
  slotCard: {
    background: colors.cardAlt,
    border: '1px solid',
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  slotHeader: { display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  colorDot: { width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0 },
  slotNum: { color: colors.textMuted, fontSize: font.sizes.sm, fontWeight: font.weights.bold, flex: 1 },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px' },
  slotFields: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
};
