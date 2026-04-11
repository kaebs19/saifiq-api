import { Link } from 'react-router-dom';
import { colors, radii, font, transitions } from '../../lib/theme';
import Icon from '../icons/Icon';

const VARIANTS = {
  primary: { bg: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`, color: '#080b12', border: 'transparent' },
  secondary: { bg: colors.cardAlt, color: colors.text, border: colors.border },
  ghost: { bg: 'transparent', color: colors.textMuted, border: 'transparent' },
  danger: { bg: colors.dangerSoft, color: colors.danger, border: colors.danger + '40' },
  gold: { bg: colors.goldSoft, color: colors.gold, border: colors.goldBorder },
};

const SIZES = {
  sm: { padding: '6px 12px', fontSize: font.sizes.sm, height: '32px', iconSize: 14 },
  md: { padding: '10px 18px', fontSize: font.sizes.md, height: '40px', iconSize: 16 },
  lg: { padding: '14px 22px', fontSize: font.sizes.lg, height: '48px', iconSize: 18 },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  children,
  to,
  style,
}) {
  const v = VARIANTS[variant];
  const s = SIZES[size];

  const computedStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: s.padding,
    height: s.height,
    fontSize: s.fontSize,
    fontWeight: font.weights.bold,
    fontFamily: font.family,
    background: v.bg,
    color: v.color,
    border: `1px solid ${v.border}`,
    borderRadius: radii.lg,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: transitions.base,
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ...style,
  };

  const content = (
    <>
      {loading ? <Icon name="loader" size={s.iconSize} style={{ animation: 'spin 1s linear infinite' }} /> : iconLeft && <Icon name={iconLeft} size={s.iconSize} />}
      {children && <span>{children}</span>}
      {iconRight && !loading && <Icon name={iconRight} size={s.iconSize} />}
    </>
  );

  if (to) {
    return <Link to={to} style={computedStyle}>{content}</Link>;
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} style={computedStyle}>
      {content}
    </button>
  );
}
