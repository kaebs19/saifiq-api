import { useState } from 'react';
import Button from '../../components/ui/Button';
import { questionsApi } from '../../api/questions';
import { useToast } from '../../hooks/useToast';

export default function TemplateDownloadButton() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDownload = async () => {
    try {
      setLoading(true);
      const blob = await questionsApi.downloadTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'saifiq-questions-template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0642\u0627\u0644\u0628');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" iconLeft="download" onClick={handleDownload} loading={loading}>
      {'\u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0642\u0627\u0644\u0628'}
    </Button>
  );
}
