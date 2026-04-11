import { ICON_PATHS } from './paths';

export default function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 2, style }) {
  const d = ICON_PATHS[name];
  if (!d) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
    >
      <path d={d} />
    </svg>
  );
}
