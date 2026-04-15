import { useState } from 'react';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useUserSearch, useGrantCurrency } from '../../hooks/useAdminUsers';
import GrantModal from './GrantModal';
import { colors, font, spacing } from '../../lib/theme';

export default function SearchTab() {
  const [query, setQuery] = useState('');
  const [granting, setGranting] = useState(null); // { user, currency }
  const { data: users, isLoading } = useUserSearch(query);
  const grant = useGrantCurrency();

  const handleGrant = async (payload) => {
    await grant.mutateAsync({ userId: granting.user.id, data: payload });
    setGranting(null);
  };

  const columns = [
    {
      key: 'username',
      header: 'اللاعب',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          {row.avatarUrl ? (
            <img src={row.avatarUrl} alt="" style={styles.avatarImg} />
          ) : (
            <div style={styles.avatar}>{(row.username?.[0] || '?').toUpperCase()}</div>
          )}
          <div>
            <div style={{ color: colors.text, fontWeight: font.weights.semibold }}>{row.username}</div>
            <div style={{ color: colors.textDim, fontSize: font.sizes.xs }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'friendCode',
      header: 'الكود',
      render: (row) => <code style={styles.code}>{row.friendCode || '-'}</code>,
    },
    { key: 'level', header: 'المستوى', render: (row) => <Badge variant="info">{row.level}</Badge> },
    {
      key: 'gold',
      header: 'الذهب',
      render: (row) => <span style={{ color: colors.warning, fontWeight: font.weights.bold }}>{row.gold}</span>,
    },
    {
      key: 'gems',
      header: 'الجواهر',
      render: (row) => <span style={{ color: colors.gold, fontWeight: font.weights.bold }}>{row.gems}</span>,
    },
  ];

  return (
    <div>
      <div style={styles.searchBox}>
        <Input
          placeholder="ابحث بالاسم أو البريد أو كود الصداقة..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          iconLeft="search"
        />
      </div>

      {query.length < 2 ? (
        <EmptyState title="ابدأ بكتابة حرفين على الأقل للبحث" />
      ) : (
        <Table
          columns={columns}
          data={users || []}
          loading={isLoading}
          actions={(row) => (
            <div style={{ display: 'flex', gap: spacing.xs }}>
              <Button size="sm" variant="gold" iconLeft="coin" onClick={() => setGranting({ user: row, currency: 'gold' })}>
                ذهب
              </Button>
              <Button size="sm" variant="secondary" iconLeft="gem" onClick={() => setGranting({ user: row, currency: 'gems' })}>
                جواهر
              </Button>
            </div>
          )}
        />
      )}

      <GrantModal
        granting={granting}
        onClose={() => setGranting(null)}
        onSave={handleGrant}
        loading={grant.isPending}
      />
    </div>
  );
}

const styles = {
  searchBox: { marginBottom: spacing.lg, maxWidth: '520px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: colors.bg, fontWeight: font.weights.extrabold,
    fontSize: font.sizes.md, fontFamily: font.family, flexShrink: 0,
  },
  avatarImg: {
    width: '36px', height: '36px', borderRadius: '50%',
    objectFit: 'cover', border: `1px solid ${colors.border}`, flexShrink: 0,
  },
  code: {
    color: colors.gold, fontFamily: 'monospace', fontSize: font.sizes.sm,
    background: colors.cardAlt, padding: '2px 8px', borderRadius: '4px',
  },
};
