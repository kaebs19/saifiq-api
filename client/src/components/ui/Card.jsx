import { colors, radii, spacing } from '../../lib/theme';

export default function Card({ padding = spacing.xl, children, style }) {
  return (
    <div
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.xl,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
