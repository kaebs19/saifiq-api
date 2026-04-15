import { useQuery } from '@tanstack/react-query';
import { iapAdminApi } from '../../api/iapAdmin';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { colors, font, spacing, radii } from '../../lib/theme';

export default function IapTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['iap', 'packages'],
    queryFn: () => iapAdminApi.getPackages(),
  });

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: spacing.xxl }}><Spinner size={28} /></div>;

  return (
    <div>
      <div style={styles.info}>
        هذه هي الباقات المتاحة عبر App Store In-App Purchase. الأسعار تُحدد من App Store Connect.
      </div>

      <div style={styles.grid}>
        {(data || []).map((pkg) => (
          <Card key={pkg.productId}>
            <div style={styles.headerRow}>
              <div style={styles.gemBadge}>💎</div>
              {pkg.gold > 0 && <Badge variant="warning">+ بونص</Badge>}
            </div>
            <div style={styles.gemsCount}>{pkg.gems} جوهرة</div>
            {pkg.gold > 0 && (
              <div style={styles.bonus}>+ {pkg.gold} ذهب مجاناً 🪙</div>
            )}
            <div style={styles.productId}>{pkg.productId}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

const styles = {
  info: {
    color: colors.textMuted,
    fontSize: font.sizes.sm,
    padding: spacing.md,
    background: colors.cardAlt,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    border: `1px solid ${colors.border}`,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: spacing.md,
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  gemBadge: {
    width: '44px', height: '44px', borderRadius: radii.lg,
    background: colors.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '22px',
  },
  gemsCount: {
    color: colors.gold, fontSize: font.sizes.xxl, fontWeight: font.weights.extrabold,
    marginBottom: spacing.xs,
  },
  bonus: {
    color: colors.warning, fontSize: font.sizes.sm, fontWeight: font.weights.semibold,
    marginBottom: spacing.md,
  },
  productId: {
    color: colors.textDim, fontSize: font.sizes.xs, fontFamily: 'monospace',
    padding: spacing.xs, background: colors.cardAlt, borderRadius: radii.sm,
  },
};
