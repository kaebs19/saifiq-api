import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { colors, radii, spacing, font } from '../../lib/theme';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { useDailyChart } from '../../hooks/useStats';

const formatDay = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={styles.tooltip}>
      <div style={styles.tooltipDate}>{formatDay(label)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ ...styles.tooltipRow, color: p.color }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: font.weights.bold }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DailyChart() {
  const { data, isLoading } = useDailyChart(7);

  return (
    <Card>
      <h3 style={styles.title}>{'\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645'}</h3>
      {isLoading ? (
        <div style={styles.center}><Spinner /></div>
      ) : (
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={data || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gMatches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.gold} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={colors.gold} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gGems" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.info} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={colors.info} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDay}
                stroke={colors.textDim}
                style={{ fontSize: '12px', fontFamily: font.family }}
              />
              <YAxis stroke={colors.textDim} style={{ fontSize: '12px' }} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: colors.borderLight }} />
              <Area
                type="monotone"
                dataKey="matches"
                name={'\u0627\u0644\u0645\u0628\u0627\u0631\u064A\u0627\u062A'}
                stroke={colors.gold}
                fill="url(#gMatches)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="gems"
                name={'\u0627\u0644\u062C\u0648\u0627\u0647\u0631'}
                stroke={colors.info}
                fill="url(#gGems)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

const styles = {
  title: {
    color: colors.text,
    fontSize: font.sizes.lg,
    fontWeight: font.weights.bold,
    fontFamily: font.family,
    margin: `0 0 ${spacing.lg}`,
  },
  center: { display: 'flex', justifyContent: 'center', padding: spacing.xl },
  tooltip: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    padding: spacing.sm,
    fontFamily: font.family,
    fontSize: font.sizes.sm,
  },
  tooltipDate: {
    color: colors.textDim,
    fontSize: font.sizes.xs,
    marginBottom: '4px',
  },
  tooltipRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: '2px',
  },
};
