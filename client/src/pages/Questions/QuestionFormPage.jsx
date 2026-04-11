import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import QuestionForm from './QuestionForm';
import { useQuestion, useCreateQuestion, useUpdateQuestion } from '../../hooks/useQuestions';
import { useCategoryConfig } from '../../hooks/useCategoryConfig';

export default function QuestionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: question, isLoading } = useQuestion(id);
  const { data: categoryConfig } = useCategoryConfig();
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();

  const handleSubmit = async (payload) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    navigate('/dashboard/questions');
  };

  if (isEdit && isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner size={28} /></div>;
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? '\u062A\u0639\u062F\u064A\u0644 \u0633\u0624\u0627\u0644' : '\u0625\u0636\u0627\u0641\u0629 \u0633\u0624\u0627\u0644'}
        backTo="/dashboard/questions"
      />
      <QuestionForm
        initialValues={isEdit ? question : null}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
        categoryConfig={categoryConfig}
      />
    </div>
  );
}
