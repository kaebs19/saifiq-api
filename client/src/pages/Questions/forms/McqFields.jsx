import { colors, radii, spacing, font, transitions } from '../../../lib/theme';
import Icon from '../../../components/icons/Icon';

export default function McqFields({ options, onChange, error }) {
  const setText = (i, text) => {
    const next = [...options];
    next[i] = { ...next[i], text };
    onChange(next);
  };

  const setCorrect = (i) => {
    onChange(options.map((o, idx) => ({ ...o, isCorrect: idx === i })));
  };

  return (
    <div style={styles.wrap}>
      <label style={styles.label}>
        {'\u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A'} <span style={styles.hint}>({'\u0627\u062E\u062A\u0631 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629'})</span>
      </label>
      {options.map((opt, i) => (
        <div key={i} style={styles.row}>
          <button
            type="button"
            onClick={() => setCorrect(i)}
            style={{
              ...styles.correctBtn,
              background: opt.isCorrect ? colors.goldSoft : colors.cardAlt,
              borderColor: opt.isCorrect ? colors.gold : colors.border,
            }}
          >
            {opt.isCorrect && <Icon name="check" size={14} color={colors.gold} />}
          </button>
          <input
            type="text"
            value={opt.text}
            onChange={(e) => setText(i, e.target.value)}
            placeholder={`${'\u062E\u064A\u0627\u0631'} ${i + 1}`}
            style={styles.input}
          />
        </div>
      ))}
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  label: {
    fontSize: font.sizes.md, color: colors.textMuted, fontWeight: font.weights.semibold,
    fontFamily: font.family, marginBottom: spacing.xs,
  },
  hint: { color: colors.textDim, fontWeight: font.weights.regular, fontSize: font.sizes.xs },
  row: { display: 'flex', alignItems: 'center', gap: spacing.sm },
  correctBtn: {
    width: '28px', height: '28px', borderRadius: '50%',
    border: '2px solid', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    transition: transitions.base,
  },
  input: {
    flex: 1, background: colors.cardAlt, border: `1px solid ${colors.border}`,
    borderRadius: radii.lg, padding: '10px 16px', fontSize: font.sizes.md,
    color: colors.text, outline: 'none', fontFamily: font.family,
  },
  error: { color: colors.danger, fontSize: font.sizes.xs, fontFamily: font.family },
};
