import { spacing } from '../../../lib/theme';
import Input from '../../../components/ui/Input';

export default function NumericFields({ correctAnswer, numericTolerance, onChange, errors }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: spacing.md }}>
      <Input
        label={'\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629'}
        type="number"
        value={correctAnswer}
        onChange={(e) => onChange({ correctAnswer: e.target.value })}
        placeholder={'\u0645\u062B\u0627\u0644: 195'}
        error={errors.correctAnswer}
      />
      <Input
        label={'\u0647\u0627\u0645\u0634 \u0627\u0644\u062E\u0637\u0623 (\u00B1)'}
        type="number"
        value={numericTolerance}
        onChange={(e) => onChange({ numericTolerance: e.target.value })}
        placeholder="5"
        error={errors.numericTolerance}
      />
    </div>
  );
}
