import Input from '../../../components/ui/Input';

export default function QuickInputFields({ value, onChange, error }) {
  return (
    <Input
      label={'\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={'\u0645\u062B\u0627\u0644: \u0627\u0644\u0646\u064A\u0644'}
      hint={'\u0646\u0635 \u0641\u0642\u0637\u060C \u0644\u064A\u0633 \u0631\u0642\u0645'}
      error={error}
    />
  );
}
