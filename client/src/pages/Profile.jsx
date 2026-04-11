import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useApiMutation } from '../hooks/useApiMutation';
import { updateProfile, uploadAvatar } from '../api/profile';
import { listAvatars, selectAvatar } from '../api/avatars';
import { getImageUrl } from '../lib/urls';
import { colors, radii, spacing, font, transitions } from '../lib/theme';
import Icon from '../components/icons/Icon';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

function EditField({ label, value, onChange, placeholder, dir }) {
  return (
    <div style={styles.editField}>
      <label style={styles.infoLabel}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        style={styles.input}
      />
    </div>
  );
}

function AvatarPicker({ open, onClose, currentAvatarUrl, userGems }) {
  const { data: avatars = [], isLoading } = useQuery({
    queryKey: ['avatars'],
    queryFn: listAvatars,
    enabled: open,
  });

  const mutation = useApiMutation(selectAvatar, {
    invalidateKey: ['auth', 'me'],
    success: 'تم تغيير الصورة الشخصية',
  });

  const [confirming, setConfirming] = useState(null);

  const handleSelect = async (avatar) => {
    // Free or already selected → apply directly
    if (avatar.gemCost === 0 || avatar.imageUrl === currentAvatarUrl) {
      await mutation.mutateAsync(avatar.id);
      onClose();
      return;
    }
    // Paid → confirm
    setConfirming(avatar);
  };

  const handleConfirm = async () => {
    if (!confirming) return;
    await mutation.mutateAsync(confirming.id);
    setConfirming(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="اختر صورتك الشخصية" size="lg">
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spinner size={28} />
        </div>
      ) : confirming ? (
        <div style={styles.confirmBox}>
          <img src={getImageUrl(confirming.imageUrl)} alt="" style={styles.confirmImg} />
          <p style={styles.confirmText}>
            شراء <strong>{confirming.name}</strong> بـ <strong>{confirming.gemCost}</strong> جوهرة؟
          </p>
          {userGems < confirming.gemCost && (
            <p style={styles.insufficientText}>رصيدك غير كافٍ ({userGems} جوهرة)</p>
          )}
          <div style={styles.confirmActions}>
            <button
              onClick={handleConfirm}
              disabled={mutation.isPending || userGems < confirming.gemCost}
              style={{
                ...styles.saveBtn,
                opacity: userGems < confirming.gemCost ? 0.5 : 1,
              }}
            >
              {mutation.isPending ? <Spinner size={16} /> : 'تأكيد الشراء'}
            </button>
            <button onClick={() => setConfirming(null)} style={styles.cancelBtn}>
              رجوع
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.avatarGrid}>
          {avatars.map((avatar) => {
            const isActive = avatar.imageUrl === currentAvatarUrl;
            return (
              <button
                key={avatar.id}
                onClick={() => handleSelect(avatar)}
                disabled={mutation.isPending}
                style={{
                  ...styles.avatarCard,
                  borderColor: isActive ? colors.gold : colors.border,
                  background: isActive ? colors.goldSoft : colors.cardAlt,
                }}
              >
                <img src={getImageUrl(avatar.imageUrl)} alt={avatar.name} style={styles.avatarThumb} />
                <span style={styles.avatarName}>{avatar.name}</span>
                {avatar.gemCost > 0 ? (
                  <span style={styles.gemBadge}>{avatar.gemCost} 💎</span>
                ) : (
                  <span style={styles.freeBadge}>مجاني</span>
                )}
                {isActive && <span style={styles.activeBadge}>الحالي</span>}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const profileMutation = useApiMutation(updateProfile, {
    invalidateKey: ['auth', 'me'],
    success: 'تم تحديث الملف الشخصي',
  });

  const avatarMutation = useApiMutation(uploadAvatar, {
    invalidateKey: ['auth', 'me'],
    success: 'تم رفع الصورة الشخصية',
  });

  const startEdit = () => {
    setUsername(user.username || '');
    setCountry(user.country || '');
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    const updates = {};
    if (username && username !== user.username) updates.username = username;
    if (country !== (user.country || '')) updates.country = country;
    if (Object.keys(updates).length === 0) { setEditing(false); return; }
    await profileMutation.mutateAsync(updates);
    setEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) return;
    if (file.size > 2 * 1024 * 1024) return;
    setAvatarUploading(true);
    try { await avatarMutation.mutateAsync(file); }
    finally { setAvatarUploading(false); e.target.value = ''; }
  };

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) return null;

  const initial = user.username?.[0]?.toUpperCase() || '?';
  const createdAt = new Date(user.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const avatarSrc = user.avatarUrl
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : getImageUrl(user.avatarUrl))
    : null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.goldLine} />

        {/* Avatar Section */}
        <div style={styles.header}>
          <div style={styles.avatarWrapper}>
            {avatarSrc ? (
              <img src={avatarSrc} alt="" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatar}>
                <span style={styles.avatarText}>{initial}</span>
              </div>
            )}
            {/* Upload custom avatar */}
            <label style={styles.avatarOverlay} title="رفع صورة مخصصة">
              {avatarUploading ? (
                <Spinner size={20} />
              ) : (
                <Icon name="upload" size={18} color="#fff" />
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
                disabled={avatarUploading}
              />
            </label>
          </div>

          {!editing && (
            <>
              <h2 style={styles.username}>{user.username}</h2>
              <span style={styles.roleBadge}>
                {user.role === 'admin' ? 'مسؤول' : 'لاعب'}
              </span>
            </>
          )}

          {/* Choose default avatar button */}
          <button onClick={() => setPickerOpen(true)} style={styles.chooseAvatarBtn}>
            اختر من الشخصيات
          </button>
        </div>

        {/* Content */}
        {editing ? (
          <div style={styles.editSection}>
            <EditField label="اسم المستخدم" value={username} onChange={setUsername} placeholder="أدخل اسم المستخدم" />
            <EditField label="الدولة" value={country} onChange={setCountry} placeholder="مثال: SA" dir="ltr" />
            <div style={styles.actions}>
              <button onClick={handleSave} disabled={profileMutation.isPending} style={styles.saveBtn}>
                {profileMutation.isPending ? <Spinner size={16} /> : 'حفظ'}
              </button>
              <button onClick={cancelEdit} disabled={profileMutation.isPending} style={styles.cancelBtn}>
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.infoGrid}>
            <InfoRow label="اسم المستخدم" value={user.username} />
            <InfoRow label="البريد الإلكتروني" value={user.email} />
            <InfoRow label="الدولة" value={user.country || '—'} />
            <InfoRow label="المستوى" value={user.level} />
            <InfoRow label="الجواهر" value={`${user.gems} 💎`} />
            <InfoRow label="تاريخ الإنشاء" value={createdAt} />
            <button onClick={startEdit} style={styles.editBtn}>
              <Icon name="edit" size={16} color={colors.gold} />
              <span>تعديل الملف الشخصي</span>
            </button>
          </div>
        )}
      </div>

      <AvatarPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currentAvatarUrl={user.avatarUrl}
        userGems={user.gems}
      />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '24px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  card: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    position: 'relative',
    overflow: 'hidden',
  },
  goldLine: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`,
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  avatarWrapper: {
    position: 'relative',
    width: '90px',
    height: '90px',
    margin: '0 auto 16px',
  },
  avatar: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
  },
  avatarText: {
    color: colors.bg,
    fontSize: '34px',
    fontWeight: font.weights.extrabold,
    fontFamily: font.family,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: colors.gold,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: `2px solid ${colors.card}`,
    transition: transitions.base,
  },
  username: {
    color: colors.text,
    fontSize: font.sizes.xxl,
    fontWeight: font.weights.bold,
    fontFamily: font.family,
    margin: '0 0 8px',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 16px',
    borderRadius: '20px',
    border: `1px solid ${colors.gold}`,
    color: colors.gold,
    fontSize: font.sizes.sm,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
  },
  chooseAvatarBtn: {
    display: 'inline-block',
    marginTop: '12px',
    padding: '6px 16px',
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    color: colors.textMuted,
    fontSize: font.sizes.sm,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
    cursor: 'pointer',
    transition: transitions.base,
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: `1px solid ${colors.border}`,
  },
  infoLabel: {
    color: colors.textDim,
    fontSize: font.sizes.md,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
  },
  infoValue: {
    color: colors.text,
    fontSize: font.sizes.md,
    fontFamily: font.family,
    direction: 'ltr',
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.xl,
    padding: '12px',
    background: colors.goldSoft,
    border: `1px solid ${colors.goldBorder}`,
    borderRadius: radii.lg,
    color: colors.gold,
    fontSize: font.sizes.md,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
    cursor: 'pointer',
    transition: transitions.base,
  },
  editSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  editField: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  input: {
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    padding: '10px 14px',
    color: colors.text,
    fontSize: font.sizes.md,
    fontFamily: font.family,
    outline: 'none',
    transition: transitions.base,
  },
  actions: {
    display: 'flex',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  saveBtn: {
    flex: 1,
    padding: '10px',
    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`,
    border: 'none',
    borderRadius: radii.md,
    color: colors.bg,
    fontSize: font.sizes.md,
    fontWeight: font.weights.bold,
    fontFamily: font.family,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: transitions.base,
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    color: colors.textMuted,
    fontSize: font.sizes.md,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
    cursor: 'pointer',
    transition: transitions.base,
  },
  // Avatar picker grid
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: spacing.md,
  },
  avatarCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    border: `2px solid`,
    borderRadius: radii.lg,
    cursor: 'pointer',
    transition: transitions.base,
    position: 'relative',
  },
  avatarThumb: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarName: {
    color: colors.text,
    fontSize: font.sizes.xs,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
  },
  gemBadge: {
    fontSize: font.sizes.xs,
    color: colors.gold,
    fontWeight: font.weights.bold,
    fontFamily: font.family,
  },
  freeBadge: {
    fontSize: font.sizes.xs,
    color: colors.success,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
  },
  activeBadge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: colors.gold,
    color: colors.bg,
    fontSize: '10px',
    fontWeight: font.weights.bold,
    fontFamily: font.family,
    padding: '2px 6px',
    borderRadius: radii.sm,
  },
  // Confirm purchase
  confirmBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  confirmImg: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `3px solid ${colors.gold}`,
  },
  confirmText: {
    color: colors.text,
    fontSize: font.sizes.lg,
    fontFamily: font.family,
    textAlign: 'center',
    margin: 0,
  },
  insufficientText: {
    color: colors.danger,
    fontSize: font.sizes.sm,
    fontFamily: font.family,
    margin: 0,
  },
  confirmActions: {
    display: 'flex',
    gap: spacing.md,
    width: '100%',
    maxWidth: '300px',
  },
};
