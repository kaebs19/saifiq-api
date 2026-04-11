import { useState } from 'react';
import { spacing } from '../../lib/theme';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AddAdminModal({ open, onClose, onSave, loading }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleSave = () => {
    onSave(form);
    setForm({ username: '', email: '', password: '' });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={'\u0625\u0636\u0627\u0641\u0629 \u0623\u062F\u0645\u0646 \u062C\u062F\u064A\u062F'}
      size="sm"
      footer={
        <>
          <Button variant="primary" onClick={handleSave} loading={loading} iconLeft="check">{'\u062D\u0641\u0638'}</Button>
          <Button variant="secondary" onClick={onClose}>{'\u0625\u0644\u063A\u0627\u0621'}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        <Input
          label={'\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645'}
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <Input
          label={'\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A'}
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          dir="ltr"
        />
        <Input
          label={'\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631'}
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          dir="ltr"
        />
      </div>
    </Modal>
  );
}
