import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  useClan, useClanMembers, useClanMessages, useClanReports,
  useUpdateClan, useClearClanChat, useDeleteClanMessage, useResolveReport,
} from '../../hooks/useAdminClans';
import { colors, font, spacing, radii } from '../../lib/theme';

const ROLE_LABELS = { owner: 'زعيم', admin: 'مشرف', member: 'عضو' };
const ROLE_VARIANTS = { owner: 'gold', admin: 'info', member: 'secondary' };
const MSG_TYPE_VARIANTS = { system: 'secondary', game_code: 'gold', announcement: 'warning', text: 'info' };

export default function ClanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: clan, isLoading } = useClan(id);
  const { data: membersData } = useClanMembers(id, { limit: 100 });
  const { data: messages, refetch: refetchMessages } = useClanMessages(id);
  const { data: reports, refetch: refetchReports } = useClanReports(id);

  const updateClan = useUpdateClan(id);
  const clearChat = useClearClanChat(id);
  const deleteMessage = useDeleteClanMessage(id);
  const resolveReport = useResolveReport(id);

  // Modals state
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingMsg, setDeletingMsg] = useState(null);

  if (isLoading) return <Spinner />;
  if (!clan) return <div style={{ color: colors.textMuted }}>العشيرة غير موجودة</div>;

  const members = membersData?.data || [];
  const msgList = messages?.messages || [];
  const reportList = reports || [];
  const pendingReports = reportList.filter((r) => r.status === 'pending');

  const openEdit = () => {
    setEditForm({ name: clan.name || '', description: clan.description || '' });
    setShowEdit(true);
  };

  const handleEdit = async () => {
    await updateClan.mutateAsync(editForm);
    setShowEdit(false);
  };

  const handleClearChat = async () => {
    await clearChat.mutateAsync();
    setShowClearConfirm(false);
    refetchMessages();
  };

  const handleDeleteMsg = async () => {
    await deleteMessage.mutateAsync(deletingMsg.id);
    setDeletingMsg(null);
    refetchMessages();
  };

  const handleResolve = async (reportId, action) => {
    await resolveReport.mutateAsync({ reportId, action });
    refetchReports();
    if (action === 'delete') refetchMessages();
  };

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

      {/* ── Header ── */}
      <div style={styles.headerRow}>
        <PageHeader title={clan.name} subtitle={clan.description || 'بدون وصف'} />
        <Button variant="secondary" iconLeft="edit" onClick={openEdit}>
          تعديل المعلومات
        </Button>
      </div>

      {/* ── Stats ── */}
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

      {/* ── الأعضاء ── */}
      <h3 style={styles.sectionTitle}>الأعضاء ({members.length})</h3>
      <Table columns={memberColumns} data={members} />

      {/* ── المخالفات / البلاغات ── */}
      <div style={styles.sectionHeader}>
        <h3 style={{ ...styles.sectionTitle, margin: 0 }}>
          المخالفات المعلقة
          {pendingReports.length > 0 && (
            <span style={styles.reportBadge}>{pendingReports.length}</span>
          )}
        </h3>
      </div>

      {pendingReports.length === 0 ? (
        <Card>
          <div style={{ color: colors.textMuted, textAlign: 'center', padding: spacing.xl }}>
            ✅ لا توجد مخالفات معلقة
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {pendingReports.map((report) => (
            <Card key={report.id}>
              <div style={styles.reportCard}>
                {/* محتوى الرسالة */}
                <div style={styles.reportMsg}>
                  <div style={styles.reportMsgMeta}>
                    <span style={{ color: colors.text, fontWeight: font.weights.semibold }}>
                      {report.ClanMessage?.User?.username || 'مجهول'}
                    </span>
                    <Badge variant="secondary">{report.ClanMessage?.type || 'text'}</Badge>
                  </div>
                  <div style={{ color: colors.text, fontSize: font.sizes.sm, marginTop: '4px' }}>
                    {report.ClanMessage?.content}
                  </div>
                </div>
                {/* سبب البلاغ */}
                {report.reason && (
                  <div style={styles.reportReason}>
                    ⚠️ السبب: {report.reason}
                    {report.reporter && (
                      <span style={{ color: colors.textDim }}> — بواسطة: {report.reporter.username}</span>
                    )}
                  </div>
                )}
                {/* أزرار */}
                <div style={styles.reportActions}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleResolve(report.id, 'dismiss')}
                    loading={resolveReport.isPending}
                  >
                    تجاهل
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    iconLeft="trash"
                    onClick={() => handleResolve(report.id, 'delete')}
                    loading={resolveReport.isPending}
                  >
                    حذف المحتوى
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── الرسائل ── */}
      <div style={styles.sectionHeader}>
        <h3 style={{ ...styles.sectionTitle, margin: 0 }}>آخر 50 رسالة</h3>
        <Button
          size="sm"
          variant="danger"
          iconLeft="trash"
          onClick={() => setShowClearConfirm(true)}
        >
          مسح كل الرسائل
        </Button>
      </div>

      <Card>
        <div style={styles.chatList}>
          {msgList.length === 0 ? (
            <div style={{ color: colors.textMuted, textAlign: 'center', padding: spacing.xl }}>
              لا توجد رسائل
            </div>
          ) : (
            msgList.map((msg) => (
              <div key={msg.id} style={styles.msgRow}>
                <div style={styles.msgMeta}>
                  <span style={{ color: colors.text, fontWeight: font.weights.semibold }}>
                    {msg.User?.username || 'نظام'}
                  </span>
                  <Badge variant={MSG_TYPE_VARIANTS[msg.type] || 'secondary'}>{msg.type}</Badge>
                  <span style={{ color: colors.textDim, fontSize: font.sizes.xs }}>
                    {new Date(msg.createdAt).toLocaleString('ar-SA')}
                  </span>
                  <div style={{ marginRight: 'auto' }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      iconLeft="trash"
                      onClick={() => setDeletingMsg(msg)}
                    />
                  </div>
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

      {/* ── Modals ── */}

      {/* تعديل */}
      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="تعديل معلومات العشيرة"
        size="sm"
        footer={
          <>
            <Button variant="primary" onClick={handleEdit} loading={updateClan.isPending}>
              حفظ
            </Button>
            <Button variant="ghost" onClick={() => setShowEdit(false)}>إلغاء</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <Input
            label="اسم العشيرة"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="اسم العشيرة"
          />
          <Input
            label="الوصف (اختياري)"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            placeholder="وصف قصير..."
          />
        </div>
      </Modal>

      {/* مسح كل الرسائل */}
      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearChat}
        title="مسح كل الرسائل"
        message={`هل تريد مسح جميع رسائل عشيرة "${clan.name}"؟ لا يمكن التراجع.`}
        confirmText="مسح الكل"
        variant="danger"
        loading={clearChat.isPending}
      />

      {/* حذف رسالة */}
      <ConfirmDialog
        open={!!deletingMsg}
        onClose={() => setDeletingMsg(null)}
        onConfirm={handleDeleteMsg}
        title="حذف رسالة"
        message={`حذف رسالة "${deletingMsg?.content?.substring(0, 60)}..."؟`}
        confirmText="حذف"
        variant="danger"
        loading={deleteMessage.isPending}
      />
    </div>
  );
}

const styles = {
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
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
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: `${spacing.xl} 0 ${spacing.md}`,
  },
  reportBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.danger,
    color: '#fff',
    borderRadius: '999px',
    fontSize: font.sizes.xs,
    fontWeight: font.weights.bold,
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    marginRight: spacing.sm,
    verticalAlign: 'middle',
  },
  reportCard: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  reportMsg: {
    background: colors.cardAlt,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  reportMsgMeta: { display: 'flex', alignItems: 'center', gap: spacing.sm },
  reportReason: {
    fontSize: font.sizes.sm,
    color: colors.warning,
    fontFamily: font.family,
  },
  reportActions: { display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: colors.bg, fontWeight: font.weights.extrabold, fontSize: font.sizes.sm,
    flexShrink: 0,
  },
  chatList: {
    display: 'flex', flexDirection: 'column', gap: spacing.sm,
    maxHeight: '500px', overflowY: 'auto',
  },
  msgRow: {
    padding: spacing.sm, borderBottom: `1px solid ${colors.border}`,
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  msgMeta: { display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  msgContent: { color: colors.text, fontSize: font.sizes.sm },
};
