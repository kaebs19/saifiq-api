import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SwordLogo from './SwordLogo';
import Icon from './icons/Icon';
import { colors, radii, spacing, font, transitions } from '../lib/theme';

const NAV_ITEMS = [
  { path: '/dashboard', label: '\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629', icon: 'home', exact: true },
  { path: '/dashboard/questions', label: '\u0627\u0644\u0623\u0633\u0626\u0644\u0629', icon: 'question' },
  { path: '/dashboard/players', label: '\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646', icon: 'users' },
  { path: '/dashboard/matches', label: '\u0627\u0644\u0645\u0628\u0627\u0631\u064A\u0627\u062A', icon: 'trophy' },
  { path: '/dashboard/store', label: '\u0627\u0644\u0645\u062A\u062C\u0631', icon: 'gem' },
  { path: '/dashboard/notifications', label: '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A', icon: 'bell' },
  { path: '/dashboard/settings', label: '\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A', icon: 'settings' },
];

const PAGE_TITLES = {
  '/dashboard': '\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629',
  '/dashboard/questions': '\u0627\u0644\u0623\u0633\u0626\u0644\u0629',
  '/dashboard/players': '\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646',
  '/dashboard/matches': '\u0627\u0644\u0645\u0628\u0627\u0631\u064A\u0627\u062A',
  '/dashboard/store': '\u0627\u0644\u0645\u062A\u062C\u0631',
  '/dashboard/notifications': '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A',
  '/dashboard/settings': '\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A',
  '/dashboard/profile': '\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A',
};

function getPageTitle(pathname) {
  const sorted = Object.keys(PAGE_TITLES).sort((a, b) => b.length - a.length);
  for (const key of sorted) {
    if (pathname === key || pathname.startsWith(key + '/')) return PAGE_TITLES[key];
  }
  return '\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645';
}

function isActive(item, pathname) {
  if (item.exact) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(item.path + '/');
}

export default function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const pageTitle = getPageTitle(location.pathname);
  const initial = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <SwordLogo size={28} />
          <span style={styles.logoText}>SAIFIQ</span>
        </div>
        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item, location.pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : {}),
                }}
              >
                <Icon name={item.icon} size={18} color={active ? colors.gold : colors.textMuted} />
                <span>{item.label}</span>
                {active && <div style={styles.activeBar} />}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div style={styles.mainColumn}>
        <header style={styles.header}>
          <h2 style={styles.pageTitle}>{pageTitle}</h2>
          <div style={styles.headerLeft}>
            <Link to="/dashboard/profile" style={styles.profileLink}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={styles.headerAvatar} />
              ) : (
                <div style={styles.headerAvatar}>
                  <span style={styles.headerAvatarText}>{initial}</span>
                </div>
              )}
              <span style={styles.headerUsername}>{user?.username}</span>
            </Link>
            <button onClick={logout} style={styles.logoutBtn}>
              <Icon name="logout" size={14} color={colors.danger} />
              <span>{'\u062E\u0631\u0648\u062C'}</span>
            </button>
          </div>
        </header>

        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'row-reverse', minHeight: '100vh', background: colors.bg },
  sidebar: {
    width: '260px', minWidth: '260px', background: colors.card,
    borderLeft: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column',
  },
  logoSection: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    padding: '24px 20px', borderBottom: `1px solid ${colors.border}`,
  },
  logoText: {
    color: colors.gold, fontSize: '20px', fontWeight: font.weights.extrabold,
    letterSpacing: '4px', fontFamily: font.family,
  },
  nav: { display: 'flex', flexDirection: 'column', padding: '16px 12px', gap: '4px', flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: spacing.md, padding: '12px 16px',
    borderRadius: radii.lg, textDecoration: 'none', color: colors.textMuted,
    fontSize: font.sizes.md, fontWeight: font.weights.semibold, fontFamily: font.family,
    transition: transitions.base, position: 'relative',
  },
  navItemActive: { background: colors.goldSoft, color: colors.gold },
  activeBar: {
    position: 'absolute', left: 0, top: '20%', bottom: '20%',
    width: '3px', borderRadius: '0 3px 3px 0', background: colors.gold,
  },
  header: {
    height: '64px', background: colors.card, borderBottom: `1px solid ${colors.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${spacing.xl}`,
  },
  pageTitle: {
    color: colors.text, fontSize: font.sizes.xl, fontWeight: font.weights.bold,
    fontFamily: font.family, margin: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: spacing.lg },
  profileLink: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  headerAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', objectFit: 'cover',
  },
  headerAvatarText: {
    color: colors.bg, fontSize: font.sizes.md, fontWeight: font.weights.extrabold, fontFamily: font.family,
  },
  headerUsername: {
    color: colors.text, fontSize: font.sizes.md, fontWeight: font.weights.semibold, fontFamily: font.family,
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'none', border: `1px solid ${colors.border}`, borderRadius: radii.md,
    color: colors.danger, fontSize: font.sizes.sm, fontWeight: font.weights.semibold,
    fontFamily: font.family, padding: '6px 14px', cursor: 'pointer',
  },
  mainColumn: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  content: { flex: 1, padding: spacing.xl, overflowY: 'auto' },
};
