import { useEffect, useState } from 'react';
import { spacing } from '../../lib/theme';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

export default function ItemFormModal({ item, onClose, onSave, loading }) {
  const [form, setForm] = useState({ nameAr: '', descriptionAr: '', goldCost: 0 });

  useEffect(() => {
    if (item) {
      setForm({
        nameAr: item.nameAr || '',
        descriptionAr: item.descriptionAr || '',
        goldCost: item.goldCost || 0,
      });
    }
  }, [item]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (!item) return;
    onSave({ id: item.id, data: { ...form, goldCost: Number(form.goldCost) } });
  };

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title={'\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0623\u062F\u0627\u0629'}
      size="md"
      footer={
        <>
          <Button variant="primary" onClick={handleSave} loading={loading} iconLeft="check">
            {'\u062D\u0641\u0638'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            {'\u0625\u0644\u063A\u0627\u0621'}
          </Button>
        </>
      }
    >
      {item && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <Input
            label={'\u0627\u0644\u0627\u0633\u0645 (\u0639\u0631\u0628\u064A)'}
            value={form.nameAr}
            onChange={(e) => set('nameAr', e.target.value)}
          />
          <Textarea
            label={'\u0627\u0644\u0648\u0635\u0641'}
            value={form.descriptionAr}
            onChange={(e) => set('descriptionAr', e.target.value)}
            rows={3}
          />
          <Input
            label={'سعر الذهب'}
            type="number"
            value={form.goldCost}
            onChange={(e) => set('goldCost', e.target.value)}
            min={0}
          />
        </div>
      )}
    </Modal>
  );
}
