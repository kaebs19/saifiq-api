import { useNavigate } from 'react-router-dom';
import { colors, font, radii, spacing } from '../../lib/theme';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import PlayerRowActions from './PlayerRowActions';

const Avatar = ({ url, name }) => {
  const initial = (name?.[0] || '?').toUpperCase();
  if (url) return <img src={url} alt="" style={styles.avatarImg} />;
  return <div style={styles.avatar}>{initial}</div>;
};

export default function PlayersTable({ data, loading, onEditGems, onToggleBan }) {
  const navigate = useNavigate();
  const columns = [
    {
      key: 'username',
      header: '\u0627\u0644\u0644\u0627\u0639\u0628',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Avatar url={row.avatarUrl} name={row.username} />
          <div>
            <div style={{ color: colors.text, fontWeight: font.weights.semibold }}>{row.username}</div>
            <div style={{ color: colors.textDim, fontSize: font.sizes.xs }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'country', header: '\u0627\u0644\u062F\u0648\u0644\u0629', render: (row) => row.country || '-' },
    { key: 'level', header: '\u0627\u0644\u0645\u0633\u062A\u0648\u0649', render: (row) => <Badge variant="info">{row.level}</Badge> },
    {
      key: 'gold',
      header: '\u0627\u0644\u0630\u0647\u0628',
      render: (row) => <span style={{ color: colors.warning, fontWeight: font.weights.bold }}>{row.gold ?? 0}</span>,
    },
    {
      key: 'gems',
      header: '\u0627\u0644\u062C\u0648\u0627\u0647\u0631',
      render: (row) => <span style={{ color: colors.gold, fontWeight: font.weights.bold }}>{row.gems}</span>,
    },
    {
      key: 'record',
      header: '\u0627\u0644\u0633\u062C\u0644',
      render: (row) => (
        <span style={{ fontSize: font.sizes.sm }}>
          <span style={{ color: colors.success }}>{row.wins}</span>
          {' / '}
          <span style={{ color: colors.danger }}>{row.losses}</span>
        </span>
      ),
    },
    {
      key: 'totalPoints',
      header: '\u0627\u0644\u0646\u0642\u0627\u0637',
      render: (row) => <span style={{ color: colors.text }}>{row.totalPoints}</span>,
    },
    {
      key: 'isBanned',
      header: '\u0627\u0644\u062D\u0627\u0644\u0629',
      render: (row) => (
        <Badge variant={row.isBanned ? 'danger' : 'success'}>
          {row.isBanned ? '\u0645\u062D\u0638\u0648\u0631' : '\u0646\u0634\u0637'}
        </Badge>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      onRowClick={(row) => navigate(`/dashboard/players/${row.id}`)}
      actions={(row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <PlayerRowActions row={row} onEditGems={onEditGems} onToggleBan={onToggleBan} />
        </div>
      )}
    />
  );
}

const styles = {
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.bg,
    fontWeight: font.weights.extrabold,
    fontSize: font.sizes.md,
    fontFamily: font.family,
    flexShrink: 0,
  },
  avatarImg: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `1px solid ${colors.border}`,
    flexShrink: 0,
  },
};
