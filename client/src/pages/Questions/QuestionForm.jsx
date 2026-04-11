import { useNavigate } from 'react-router-dom';
import { spacing } from '../../lib/theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import ImageUpload from '../../components/ui/ImageUpload';
import McqFields from './forms/McqFields';
import QuickInputFields from './forms/QuickInputFields';
import NumericFields from './forms/NumericFields';
import { useQuestionForm } from './forms/useQuestionForm';
import { useUploadQuestionImage } from '../../hooks/useQuestions';

const TYPE_OPTIONS = [
  { value: 'mcq', label: 'MCQ (\u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0646 \u0645\u062A\u0639\u062F\u062F)' },
  { value: 'quick_input', label: 'Quick Input (\u0625\u062F\u062E\u0627\u0644 \u0646\u0635\u064A)' },
  { value: 'numeric', label: 'Numeric (\u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645\u064A)' },
];

const DIFFICULTY_OPTIONS = [
  { value: '', label: '\u0627\u0641\u062A\u0631\u0627\u0636\u064A (\u062D\u0633\u0628 \u0627\u0644\u0642\u0633\u0645)' },
  { value: 'easy', label: '\u0633\u0647\u0644' },
  { value: 'medium', label: '\u0645\u062A\u0648\u0633\u0637' },
  { value: 'hard', label: '\u0635\u0639\u0628' },
];

export default function QuestionForm({ initialValues, onSubmit, submitting, categoryConfig }) {
  const navigate = useNavigate();
  const { values, errors, setField, changeType, validate, buildPayload } = useQuestionForm(initialValues);
  const uploadImage = useUploadQuestionImage();

  const handleUploadImage = async (file) => {
    const data = await uploadImage.mutateAsync(file);
    setField('imageUrl', data.imageUrl);
  };

  const categoryOptions = [
    { value: '', label: '\u0627\u062E\u062A\u0631 \u0627\u0644\u0642\u0633\u0645' },
    ...Object.entries(categoryConfig || {}).map(([key, cfg]) => ({
      value: key,
      label: `${cfg.icon} ${cfg.label}`,
    })),
  ];

  const allowedTypes = values.category && categoryConfig?.[values.category]?.types;
  const typeOptions = allowedTypes
    ? TYPE_OPTIONS.filter((t) => allowedTypes.includes(t.value))
    : TYPE_OPTIONS;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(buildPayload());
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card style={{ marginBottom: spacing.lg }}>
        <div style={styles.grid2}>
          <Select
            label={'\u0627\u0644\u0642\u0633\u0645'}
            value={values.category}
            onChange={(v) => setField('category', v)}
            options={categoryOptions}
            error={errors.category}
          />
          <Select
            label={'\u0627\u0644\u0646\u0648\u0639'}
            value={values.type}
            onChange={changeType}
            options={typeOptions}
          />
        </div>
        <div style={{ marginTop: spacing.lg }}>
          <Textarea
            label={'\u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644'}
            value={values.text}
            onChange={(e) => setField('text', e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={'\u0627\u0643\u062A\u0628 \u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 \u0647\u0646\u0627...'}
            error={errors.text}
            hint={`${values.text?.length || 0}/500`}
          />
        </div>
        <div style={{ marginTop: spacing.lg }}>
          <ImageUpload
            label={'\u0635\u0648\u0631\u0629 \u0627\u0644\u0633\u0624\u0627\u0644 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)'}
            value={values.imageUrl}
            onUpload={handleUploadImage}
            onClear={() => setField('imageUrl', '')}
            uploading={uploadImage.isPending}
          />
        </div>
      </Card>

      <Card style={{ marginBottom: spacing.lg }}>
        {values.type === 'mcq' && (
          <McqFields options={values.options} onChange={(o) => setField('options', o)} error={errors.options} />
        )}
        {values.type === 'quick_input' && (
          <QuickInputFields
            value={values.correctAnswer}
            onChange={(v) => setField('correctAnswer', v)}
            error={errors.correctAnswer}
          />
        )}
        {values.type === 'numeric' && (
          <NumericFields
            correctAnswer={values.correctAnswer}
            numericTolerance={values.numericTolerance}
            onChange={(patch) => Object.entries(patch).forEach(([k, v]) => setField(k, v))}
            errors={errors}
          />
        )}
      </Card>

      <Card style={{ marginBottom: spacing.lg }}>
        <div style={styles.grid3}>
          <Select
            label={'\u0627\u0644\u0635\u0639\u0648\u0628\u0629'}
            value={values.difficulty}
            onChange={(v) => setField('difficulty', v)}
            options={DIFFICULTY_OPTIONS}
          />
          <Input
            label={'\u0627\u0644\u0646\u0642\u0627\u0637'}
            type="number"
            value={values.points}
            onChange={(e) => setField('points', e.target.value)}
            placeholder={'\u0627\u0641\u062A\u0631\u0627\u0636\u064A'}
          />
          <Input
            label={'\u0627\u0644\u0648\u0642\u062A (\u062B\u0627\u0646\u064A\u0629)'}
            type="number"
            value={values.timeLimitSeconds}
            onChange={(e) => setField('timeLimitSeconds', e.target.value)}
            placeholder={'\u0627\u0641\u062A\u0631\u0627\u0636\u064A'}
          />
        </div>
        <div style={{ marginTop: spacing.lg }}>
          <Input
            label={'\u0627\u0644\u062A\u0644\u0645\u064A\u062D (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)'}
            value={values.hintText}
            onChange={(e) => setField('hintText', e.target.value)}
            placeholder={'\u0645\u062B\u0627\u0644: \u0627\u0644\u062D\u0631\u0641 \u0627\u0644\u0623\u0648\u0644: \u0646'}
          />
        </div>
      </Card>

      <div style={styles.footer}>
        <Button type="submit" variant="primary" iconLeft="check" loading={submitting}>
          {'\u062D\u0641\u0638'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/dashboard/questions')}>
          {'\u0625\u0644\u063A\u0627\u0621'}
        </Button>
      </div>
    </form>
  );
}

const styles = {
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.md },
  footer: { display: 'flex', gap: spacing.sm },
};
