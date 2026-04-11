import { useState } from 'react';
import { colors, radii, spacing, font } from '../../lib/theme';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Icon from '../../components/icons/Icon';
import ItemFormModal from './ItemFormModal';
import { useItems, useUpdateItem, useToggleItem } from '../../hooks/useStore';

export default function ItemsTab() {
  const [editing, setEditing] = useState(null);
  const { data: items, isLoading } = useItems();
  const updateItem = useUpdateItem();
  const toggleItem = useToggleItem();

  const handleSave = async (payload) => {
    await updateItem.mutateAsync(payload);
    setEditing(null);
  };

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: spacing.xxl }}><Spinner size={28} /></div>;

  return (
    <>
      <div style={styles.grid}>
        {items?.map((item) => (
          <Card key={item.id} style={{ opacity: item.isActive ? 1 : 0.5 }}>
            <div style={styles.header}>
              <div style={styles.iconWrap}>
                <Icon name="gem" size={22} color={colors.gold} />
              </div>
              <Badge variant={item.isActive ? 'success' : 'neutral'}>
                {item.isActive ? '\u0645\u0641\u0639\u0644' : '\u0645\u0639\u0637\u0644'}
              </Badge>
            </div>
            <h3 style={styles.name}>{item.nameAr}</h3>
            <p style={styles.desc}>{item.descriptionAr}</p>
            <div style={styles.priceRow}>
              <span style={styles.priceLabel}>{'\u0627\u0644\u0633\u0639\u0631'}</span>
              <span style={styles.price}>{item.gemCost} 💎</span>
            </div>
            <div style={styles.actions}>
              <Button size="sm" variant="gold" iconLeft="edit" onClick={() => setEditing(item)} fullWidth>
                {'\u062A\u0639\u062F\u064A\u0644'}
              </Button>
              <Button size="sm" variant="secondary" iconLeft="power" onClick={() => toggleItem.mutate(item.id)} />
            </div>
          </Card>
        ))}
      </div>

      <ItemFormModal
        item={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        loading={updateItem.isPending}
      />
    </>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: spacing.md,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  iconWrap: {
    width: '44px', height: '44px', borderRadius: radii.lg,
    background: colors.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  name: { color: colors.text, fontSize: font.sizes.lg, fontWeight: font.weights.bold, fontFamily: font.family, margin: `0 0 ${spacing.xs}` },
  desc: { color: colors.textDim, fontSize: font.sizes.sm, fontFamily: font.family, margin: `0 0 ${spacing.md}`, minHeight: '40px' },
  priceRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.sm, background: colors.cardAlt, borderRadius: radii.md, marginBottom: spacing.md,
  },
  priceLabel: { color: colors.textDim, fontSize: font.sizes.sm, fontFamily: font.family },
  price: { color: colors.gold, fontWeight: font.weights.bold, fontFamily: font.family },
  actions: { display: 'flex', gap: spacing.xs },
};
