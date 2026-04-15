import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { colors, font, spacing } from '../../lib/theme';

const CURRENCIES = [
  { value: 'gold', label: 'ذهب' },
  { value: 'gems', label: 'جواهر' },
];

export default function GrantModal({ granting, onClose, onSave, loading }) {
  const [currency, setCurrency] = useState('gold');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (granting) {
      setCurrency(granting.currency || 'gold');
      setAmount('');
      setReason('');
    }
  }, [granting]);

  const handleSave = () => {
    const num = Number(amount);
    if (!num || !Number.isInteger(num)) return;
    onSave({ currency, amount: num, reason: reason || undefined });
  };

  const user = granting?.user;
  const currentBalance = user ? (currency === 'gold' ? user.gold : user.gems) : 0;
  const preview = Number(amount) ? currentBalance + Number(amount) : currentBalance;

  return (
    <Modal
      open={!!granting}
      onClose={onClose}
      title="منح / خصم عملة"
      size="sm"
      footer={
        <>
          <Button variant="primary" onClick={handleSave} loading={loading} iconLeft="check" disabled={!amount}>
            تنفيذ
          </Button>
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
        </>
      }
    >
      {user && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <div style={styles.userBox}>
            <span style={styles.label}>{user.username}</span>
            <div style={styles.balances}>
              <span style={{ color: colors.warning }}>🪙 {user.gold}</span>
              <span style={{ color: colors.gold }}>💎 {user.gems}</span>
            </div>
          </div>

          <Select label="العملة" value={currency} onChange={setCurrency} options={CURRENCIES} />

          <Input
            label="الكمية (موجب = إضافة، سالب = خصم)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="مثال: 500 أو -200"
          />

          {amount && (
            <div style={styles.preview}>
              <span style={styles.label}>الرصيد بعد التنفيذ:</span>
              <span style={{ color: preview < 0 ? colors.danger : colors.gold, fontWeight: font.weights.bold }}>
                {preview}
              </span>
            </div>
          )}

          <Textarea
            label="السبب (اختياري)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مثال: مكافأة فوز، دعم فني، تعويض..."
            rows={2}
          />
        </div>
      )}
    </Modal>
  );
}

const styles = {
  userBox: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, background: colors.cardAlt, borderRadius: '10px',
    border: `1px solid ${colors.border}`,
  },
  label: { color: colors.textMuted, fontFamily: font.family, fontWeight: font.weights.semibold },
  balances: { display: 'flex', gap: spacing.md, fontSize: font.sizes.lg, fontWeight: font.weights.bold },
  preview: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, background: colors.cardAlt, borderRadius: '10px',
    border: `1px solid ${colors.border}`,
  },
};
