import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useClan, useClanMembers, useClanMessages } from '../../hooks/useAdminClans';
import { colors, font, spacing } from '../../lib/theme';

const ROLE_LABELS = { owner: 'زعيم', admin: 'مشرف', member: 'عضو' };
const ROLE_VARIANTS = { owner: 'gold', admin: 'info', member: 'secondary' };

export default function ClanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: clan, isLoading } = useClan(id);
  const { data: membersData } = useClanMembers(id, { limit: 100 });
  const { data: messages } = useClanMessages(id);

  if (isLoading) return <Spinner />;
  if (!clan) return <div style={{ color: colors.textMuted }}>العشيرة غير موجودة</div>;

  const members = membersData?.data || [];

  const memberColumns = [
    {
      key: 'username',
      header: 'اللاعب',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          {row.avatarUrl ? (
            <img src={row.avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
          ) : (
            <div style={styles.avatar}>{(row.username?.[0] || '?').toUpperCase()}</div>
          )}
          <span style={{ color: colors.text, fontWeight: font.weights.semibold }}>{row.username}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'الدور',
      render: (row) => <Badge variant={ROLE_VARIANTS[row.role]}>{ROLE_LABELS[row.role]}</Badge>,
    },
    { key: 'level', header: 'المستوى', render: (row) => <Badge variant="info">Lv.{row.level}</Badge> },
    {
      key: 'weeklyPoints',
      header: 'نقاط أسبوعية',
      render: (row) => <span style={{ color: colors.warning }}>{row.weeklyPoints}</span>,
    },
  ];

  return (
    <div>
      <Button variant="ghost" iconLeft="chevronRight" onClick={() => navigate('/dashboard/clans')}>
        عودة للعشائر
      </Button>

      <PageHeader title={clan.name} subtitle={clan.description || 'بدون وصف'} />

      <div style={styles.statsGrid}>
        <Card>
          <div style={styles.statLabel}>المستوى</div>
          <div style={styles.statValue}><Badge variant="info">Lv.{clan.level}</Badge></div>
        </Card>
        <Card>
          <div style={styles.statLabel}>الأعضاء</div>
          <div style={styles.statValue}>{clan.memberCount}/{clan.maxMembers}</div>
        </Card>
        <Card>
          <div style={styles.statLabel}>نقاط أسبوعية</div>
          <div style={{ ...styles.statValue, color: colors.warning }}>{clan.weeklyPoints}</div>
        </Card>
        <Card>
          <div style={styles.statLabel}>نقاط كلية</div>
          <div style={styles.statValue}>{clan.totalPoints}</div>
        </Card>
      </div>

      <h3 style={styles.sectionTitle}>الأعضاء ({members.length})</h3>
      <Table columns={memberColumns} data={members} />

      <h3 style={styles.sectionTitle}>آخر 50 رسالة</h3>
      <Card>
        <div style={styles.chatList}>
          {(messages?.messages || []).length === 0 ? (
            <div style={{ color: colors.textMuted, textAlign: 'center', padding: spacing.xl }}>
              لا توجد رسائل
            </div>
          ) : (
            (messages?.messages || []).map((msg) => (
              <div key={msg.id} style={styles.msgRow}>
                <div style={styles.msgMeta}>
                  <span style={{ color: colors.text, fontWeight: font.weights.semibold }}>
                    {msg.User?.username || 'نظام'}
                  </span>
                  <Badge variant={msg.type === 'system' ? 'secondary' : msg.type === 'game_code' ? 'gold' : msg.type === 'announcement' ? 'warning' : 'info'}>
                    {msg.type}
                  </Badge>
                  <span style={{ color: colors.textDim, fontSize: font.sizes.xs }}>
                    {new Date(msg.createdAt).toLocaleString('ar-SA')}
                  </span>
                </div>
                <div style={styles.msgContent}>{msg.content}</div>
                {msg.roomCode && (
                  <div style={{ color: colors.gold, fontSize: font.sizes.sm, fontFamily: 'monospace' }}>
                    Room: {msg.roomCode}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statLabel: { color: colors.textMuted, fontSize: font.sizes.sm, marginBottom: spacing.xs },
  statValue: { color: colors.text, fontSize: font.sizes.xxl, fontWeight: font.weights.bold },
  sectionTitle: {
    color: colors.text, fontSize: font.sizes.xl, fontWeight: font.weights.bold,
    margin: `${spacing.xl} 0 ${spacing.md}`,
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: colors.bg, fontWeight: font.weights.extrabold, fontSize: font.sizes.sm,
    flexShrink: 0,
  },
  chatList: { display: 'flex', flexDirection: 'column', gap: spacing.sm, maxHeight: '500px', overflowY: 'auto' },
  msgRow: {
    padding: spacing.sm, borderBottom: `1px solid ${colors.border}`,
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  msgMeta: { display: 'flex', alignItems: 'center', gap: spacing.sm },
  msgContent: { color: colors.text, fontSize: font.sizes.sm },
};
