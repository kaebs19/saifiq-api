import { useEffect, useState } from 'react';
import { colors, spacing, font } from '../../lib/theme';
import Card from '../../components/ui/Card';
import Textarea from '../../components/ui/Textarea';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useSettings, useUpdateSetting } from '../../hooks/useSettings';

const TEXT_PAGES = [
  { key: 'privacy_policy', label: '\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629', placeholder: '\u0627\u0643\u062A\u0628 \u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629 \u0647\u0646\u0627...' },
  { key: 'terms_of_use', label: '\u0634\u0631\u0648\u0637 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645', placeholder: '\u0627\u0643\u062A\u0628 \u0634\u0631\u0648\u0637 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0647\u0646\u0627...' },
  { key: 'about_app', label: '\u062D\u0648\u0644 \u0627\u0644\u062A\u0637\u0628\u064A\u0642', placeholder: '\u0627\u0643\u062A\u0628 \u0648\u0635\u0641 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0647\u0646\u0627...' },
];

export default function ContentTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [texts, setTexts] = useState({});
  const [contact, setContact] = useState({ email: '', phone: '', website: '', twitter: '', instagram: '' });
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    if (!settings) return;
    const next = {};
    TEXT_PAGES.forEach(({ key }) => {
      next[key] = settings[key]?.content || '';
    });
    setTexts(next);
    if (settings.contact_us) setContact({ ...contact, ...settings.contact_us });
  }, [settings]);

  const saveText = async (key) => {
    setSavingKey(key);
    await updateSetting.mutateAsync({ key, value: { content: texts[key] } });
    setSavingKey(null);
  };

  const saveContact = async () => {
    setSavingKey('contact_us');
    await updateSetting.mutateAsync({ key: 'contact_us', value: contact });
    setSavingKey(null);
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: spacing.xxl }}><Spinner size={28} /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
      {TEXT_PAGES.map(({ key, label, placeholder }) => (
        <Card key={key}>
          <h3 style={styles.title}>{label}</h3>
          <Textarea
            value={texts[key] || ''}
            onChange={(e) => setTexts({ ...texts, [key]: e.target.value })}
            rows={8}
            placeholder={placeholder}
          />
          <div style={styles.footer}>
            <span style={styles.count}>{(texts[key] || '').length} \u062D\u0631\u0641</span>
            <Button
              variant="primary"
              iconLeft="check"
              onClick={() => saveText(key)}
              loading={savingKey === key}
            >
              {'\u062D\u0641\u0638'}
            </Button>
          </div>
        </Card>
      ))}

      <Card>
        <h3 style={styles.title}>{'\u0627\u062A\u0635\u0644 \u0628\u0646\u0627'}</h3>
        <p style={styles.subtitle}>{'\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u062A\u064A \u062A\u0638\u0647\u0631 \u0641\u064A \u0627\u0644\u062A\u0637\u0628\u064A\u0642'}</p>
        <div style={styles.grid}>
          <Input
            label={'\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A'}
            type="email"
            value={contact.email || ''}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            dir="ltr"
          />
          <Input
            label={'\u0627\u0644\u0647\u0627\u062A\u0641'}
            value={contact.phone || ''}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            dir="ltr"
          />
          <Input
            label={'\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A'}
            value={contact.website || ''}
            onChange={(e) => setContact({ ...contact, website: e.target.value })}
            dir="ltr"
          />
          <Input
            label="X (Twitter)"
            value={contact.twitter || ''}
            onChange={(e) => setContact({ ...contact, twitter: e.target.value })}
            placeholder="@username"
            dir="ltr"
          />
          <Input
            label="Instagram"
            value={contact.instagram || ''}
            onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
            placeholder="@username"
            dir="ltr"
          />
        </div>
        <div style={styles.footer}>
          <span />
          <Button
            variant="primary"
            iconLeft="check"
            onClick={saveContact}
            loading={savingKey === 'contact_us'}
          >
            {'\u062D\u0641\u0638'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  title: { color: colors.text, fontSize: font.sizes.lg, fontWeight: font.weights.bold, fontFamily: font.family, margin: `0 0 ${spacing.md}` },
  subtitle: { color: colors.textDim, fontSize: font.sizes.sm, fontFamily: font.family, margin: `0 0 ${spacing.lg}` },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  count: { color: colors.textDim, fontSize: font.sizes.xs, fontFamily: font.family },
};
