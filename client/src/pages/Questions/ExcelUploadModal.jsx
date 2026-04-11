import { useRef, useState } from 'react';
import { colors, radii, spacing, font, transitions } from '../../lib/theme';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Icon from '../../components/icons/Icon';
import { useUploadQuestionsExcel } from '../../hooks/useQuestions';

export default function ExcelUploadModal({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);
  const mutation = useUploadQuestionsExcel();

  const reset = () => { setFile(null); setResult(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleFile = (f) => {
    if (!f) return;
    if (!/\.(xlsx|xls)$/i.test(f.name)) return;
    if (f.size > 5 * 1024 * 1024) return;
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    const data = await mutation.mutateAsync(file);
    setResult(data);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={'\u0631\u0641\u0639 \u0623\u0633\u0626\u0644\u0629 \u0645\u0646 Excel'}
      size="md"
      footer={
        result ? (
          <Button variant="primary" onClick={handleClose}>{'\u0625\u063A\u0644\u0627\u0642'}</Button>
        ) : (
          <>
            <Button variant="primary" onClick={handleUpload} disabled={!file} loading={mutation.isPending}>
              {'\u0631\u0641\u0639'}
            </Button>
            <Button variant="secondary" onClick={handleClose}>{'\u0625\u0644\u063A\u0627\u0621'}</Button>
          </>
        )
      }
    >
      {!result ? (
        <div
          style={styles.dropzone}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        >
          <Icon name="upload" size={36} color={colors.textDim} />
          <p style={styles.dzTitle}>
            {file ? file.name : '\u0627\u0636\u063A\u0637 \u0644\u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0644\u0641 \u0623\u0648 \u0627\u0633\u062D\u0628\u0647 \u0647\u0646\u0627'}
          </p>
          <p style={styles.dzHint}>{'\u064A\u062F\u0639\u0645 .xlsx \u0648 .xls \u2014 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 5 \u0645\u064A\u062C\u0627'}</p>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div>
          <div style={styles.resultCard}>
            <div style={styles.resultRow}>
              <Icon name="check" size={20} color={colors.success} />
              <span style={{ color: colors.success, fontSize: font.sizes.lg, fontWeight: font.weights.bold }}>
                {`\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 ${result.created} \u0633\u0624\u0627\u0644`}
              </span>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div style={{ ...styles.resultCard, marginTop: spacing.md, borderColor: colors.danger + '40' }}>
              <div style={styles.resultRow}>
                <Icon name="alert" size={18} color={colors.danger} />
                <span style={{ color: colors.danger, fontWeight: font.weights.bold }}>
                  {`${result.errors.length} \u062E\u0637\u0623`}
                </span>
              </div>
              <ul style={styles.errorList}>
                {result.errors.map((e, i) => (
                  <li key={i} style={styles.errorItem}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

const styles = {
  dropzone: {
    border: `2px dashed ${colors.border}`,
    borderRadius: radii.lg,
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    cursor: 'pointer',
    transition: transitions.base,
    background: colors.cardAlt,
  },
  dzTitle: {
    color: colors.text,
    fontSize: font.sizes.md,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
    margin: 0,
  },
  dzHint: {
    color: colors.textDim,
    fontSize: font.sizes.sm,
    fontFamily: font.family,
    margin: 0,
  },
  resultCard: {
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  resultRow: { display: 'flex', alignItems: 'center', gap: spacing.sm },
  errorList: {
    margin: `${spacing.md} 0 0`,
    padding: 0,
    listStyle: 'none',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  errorItem: {
    color: colors.textMuted,
    fontSize: font.sizes.sm,
    fontFamily: font.family,
    padding: `${spacing.xs} 0`,
    borderBottom: `1px solid ${colors.border}`,
  },
};
