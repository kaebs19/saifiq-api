import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import QuestionsFilters from './QuestionsFilters';
import QuestionsTable from './QuestionsTable';
import TemplateDownloadButton from './TemplateDownloadButton';
import ExcelUploadModal from './ExcelUploadModal';
import AiGenerateModal from './AiGenerateModal';
import { useQuestionsList, useDeleteQuestion, useToggleQuestion, useDuplicateQuestion } from '../../hooks/useQuestions';
import { useCategoryConfig } from '../../hooks/useCategoryConfig';

const DEFAULT_FILTERS = { page: 1, limit: 20 };

export default function QuestionsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const { data: listData, isLoading } = useQuestionsList(filters);
  const { data: categoryConfig } = useCategoryConfig();

  const deleteMutation = useDeleteQuestion();
  const toggleMutation = useToggleQuestion();
  const duplicateMutation = useDuplicateQuestion();

  const questions = listData?.data || [];
  const meta = listData?.meta || { total: 0, page: 1, limit: 20 };

  const onConfirmDelete = async () => {
    if (!confirmDelete) return;
    await deleteMutation.mutateAsync(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <div>
      <PageHeader
        title={'\u0627\u0644\u0623\u0633\u0626\u0644\u0629'}
        subtitle={`${meta.total} \u0633\u0624\u0627\u0644`}
        actions={
          <>
            <TemplateDownloadButton />
            <Button variant="secondary" iconLeft="upload" onClick={() => setUploadOpen(true)}>
              {'\u0631\u0641\u0639 Excel'}
            </Button>
            <Button variant="gold" iconLeft="sparkles" onClick={() => setAiOpen(true)}>
              {'\u062A\u0648\u0644\u064A\u062F AI'}
            </Button>
            <Button variant="primary" iconLeft="plus" to="/dashboard/questions/new">
              {'\u0625\u0636\u0627\u0641\u0629 \u0633\u0624\u0627\u0644'}
            </Button>
          </>
        }
      />

      <QuestionsFilters
        filters={filters}
        onChange={setFilters}
        categoryConfig={categoryConfig}
      />

      <QuestionsTable
        data={questions}
        loading={isLoading}
        categoryConfig={categoryConfig}
        onDelete={setConfirmDelete}
        onToggle={(row) => toggleMutation.mutate(row.id)}
        onDuplicate={(row) => duplicateMutation.mutate(row.id)}
      />

      <Pagination
        page={meta.page}
        pageSize={meta.limit}
        total={meta.total}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />

      <ExcelUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <AiGenerateModal open={aiOpen} onClose={() => setAiOpen(false)} />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={onConfirmDelete}
        title={'\u062D\u0630\u0641 \u0627\u0644\u0633\u0624\u0627\u0644'}
        message={`\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644\u061F \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639.`}
        confirmText={'\u062D\u0630\u0641'}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
