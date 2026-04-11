import { useAuth } from '../hooks/useAuth';

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <span style={styles.loadingText}>{'\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644...'}</span>
      </div>
    );
  }

  if (!user) return null;

  const initial = user.username?.[0]?.toUpperCase() || '?';
  const createdAt = new Date(user.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.goldLine} />

        <div style={styles.header}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" style={styles.avatarImg} />
          ) : (
            <div style={styles.avatar}>
              <span style={styles.avatarText}>{initial}</span>
            </div>
          )}
          <h2 style={styles.username}>{user.username}</h2>
          <span style={styles.roleBadge}>
            {user.role === 'admin' ? '\u0645\u0633\u0624\u0648\u0644' : '\u0644\u0627\u0639\u0628'}
          </span>
        </div>

        <div style={styles.infoGrid}>
          <InfoRow label={'\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A'} value={user.email} />
          <InfoRow label={'\u0627\u0644\u0645\u0633\u062A\u0648\u0649'} value={user.level} />
          <InfoRow label={'\u0627\u0644\u062C\u0648\u0627\u0647\u0631'} value={`${user.gems} 💎`} />
          <InfoRow label={'\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621'} value={createdAt} />
        </div>
      </div>
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
  loadingText: {
    color: '#6b7280',
    fontSize: '16px',
  },
  card: {
    background: '#0d1117',
    border: '1px solid #1a1f2e',
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
    background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #c9a84c, #a8893a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  avatarImg: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    margin: '0 auto 16px',
    display: 'block',
  },
  avatarText: {
    color: '#080b12',
    fontSize: '32px',
    fontWeight: 800,
    fontFamily: "'Cairo', sans-serif",
  },
  username: {
    color: '#e0e0e0',
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
    margin: '0 0 8px',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 16px',
    borderRadius: '20px',
    border: '1px solid #c9a84c',
    color: '#c9a84c',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: "'Cairo', sans-serif",
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
    borderBottom: '1px solid #1a1f2e',
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: "'Cairo', sans-serif",
  },
  infoValue: {
    color: '#e0e0e0',
    fontSize: '14px',
    fontFamily: "'Cairo', sans-serif",
    direction: 'ltr',
  },
};
