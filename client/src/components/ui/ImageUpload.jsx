import { useRef, useState } from 'react';
import { colors, radii, spacing, font, transitions } from '../../lib/theme';
import { getImageUrl } from '../../lib/urls';
import Icon from '../icons/Icon';
import Spinner from './Spinner';

const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp';

export default function ImageUpload({ label, value, onUpload, onClear, uploading, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) return;
    if (file.size > MAX_SIZE) return;
    onUpload(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  if (value) {
    return (
      <div style={styles.field}>
        {label && <label style={styles.label}>{label}</label>}
        <div style={styles.preview}>
          <img src={getImageUrl(value)} alt="" style={styles.img} />
          <button type="button" onClick={onClear} style={styles.removeBtn}>
            <Icon name="close" size={16} color={colors.danger} />
            <span>{'\u0625\u0632\u0627\u0644\u0629'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.field}>
      {label && <label style={styles.label}>{label}</label>}
      <div
        style={{ ...styles.dropzone, borderColor: error ? colors.danger : (dragOver ? colors.gold : colors.border) }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {uploading ? (
          <Spinner size={24} />
        ) : (
          <>
            <Icon name="upload" size={28} color={colors.textDim} />
            <p style={styles.dzTitle}>{'\u0627\u0636\u063A\u0637 \u0623\u0648 \u0627\u0633\u062D\u0628 \u0635\u0648\u0631\u0629'}</p>
            <p style={styles.dzHint}>{'PNG / JPG / WebP \u2014 \u062D\u062A\u0649 2 \u0645\u064A\u062C\u0627'}</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={(e) => handleFile(e.target.files?.[0])}
          style={{ display: 'none' }}
        />
      </div>
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
}

const styles = {
  field: { display: 'flex', flexDirection: 'column', gap: spacing.sm, width: '100%' },
  label: { fontSize: font.sizes.md, color: colors.textMuted, fontWeight: font.weights.semibold, fontFamily: font.family },
  dropzone: {
    border: `2px dashed`,
    borderRadius: radii.lg,
    padding: '32px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    cursor: 'pointer',
    background: colors.cardAlt,
    transition: transitions.base,
    minHeight: '140px',
  },
  dzTitle: { color: colors.text, fontSize: font.sizes.md, fontWeight: font.weights.semibold, fontFamily: font.family, margin: 0 },
  dzHint: { color: colors.textDim, fontSize: font.sizes.xs, fontFamily: font.family, margin: 0 },
  preview: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  img: {
    maxWidth: '100%',
    maxHeight: '240px',
    borderRadius: radii.lg,
    border: `1px solid ${colors.border}`,
    objectFit: 'contain',
    background: colors.cardAlt,
  },
  removeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    background: colors.dangerSoft,
    border: `1px solid ${colors.danger}40`,
    color: colors.danger,
    borderRadius: radii.md,
    padding: '6px 12px',
    fontSize: font.sizes.sm,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
    cursor: 'pointer',
  },
  error: { fontSize: font.sizes.xs, color: colors.danger, fontFamily: font.family },
};
