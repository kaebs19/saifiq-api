import { useNavigate } from 'react-router-dom';
import { spacing } from '../../lib/theme';
import Button from '../../components/ui/Button';

export default function QuestionRowActions({ row, onDelete, onToggle, onDuplicate }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', gap: spacing.xs, justifyContent: 'flex-end' }}>
      <Button
        size="sm"
        variant="ghost"
        iconLeft="edit"
        onClick={() => navigate(`/dashboard/questions/${row.id}/edit`)}
      />
      <Button
        size="sm"
        variant="ghost"
        iconLeft="copy"
        onClick={() => onDuplicate(row)}
      />
      <Button
        size="sm"
        variant="ghost"
        iconLeft="power"
        onClick={() => onToggle(row)}
      />
      <Button
        size="sm"
        variant="ghost"
        iconLeft="trash"
        onClick={() => onDelete(row)}
        style={{ color: '#ef4444' }}
      />
    </div>
  );
}
