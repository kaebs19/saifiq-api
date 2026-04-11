import { colors, radii, font } from '../../lib/theme';

const VARIANTS = {
  gold: { bg: colors.goldSoft, color: colors.gold, border: colors.goldBorder },
  success: { bg: colors.successSoft, color: colors.success, border: colors.success + '40' },
  danger: { bg: colors.dangerSoft, color: colors.danger, border: colors.danger + '40' },
  warning: { bg: colors.warningSoft, color: colors.warning, border: colors.warning + '40' },
  info: { bg: colors.infoSoft, color: colors.info, border: colors.info + '40' },
  neutral: { bg: colors.cardAlt, color: colors.textMuted, border: colors.border },
};

const SIZES = {
  sm: { padding: '2px 8px', fontSize: '11px' },
  md: { padding: '4px 10px', fontSize: '12px' },
};

export default function Badge({ variant = 'neutral', size = 'md', children, style }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  const s = SIZES[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: font.weights.semibold,
        fontFamily: font.family,
        color: v.color,
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: radii.xl,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
