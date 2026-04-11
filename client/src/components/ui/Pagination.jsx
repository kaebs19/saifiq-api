import { colors, spacing, font } from '../../lib/theme';
import Icon from '../icons/Icon';

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div style={styles.wrap}>
      <span style={styles.info}>
        {`\u0639\u0631\u0636 ${from}\u2013${to} \u0645\u0646 ${total}`}
      </span>
      <div style={styles.buttons}>
        <PageBtn disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          <Icon name="chevronRight" size={14} />
        </PageBtn>
        <span style={styles.pageLabel}>{`${page} / ${totalPages}`}</span>
        <PageBtn disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          <Icon name="chevronLeft" size={14} />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.cardAlt,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        color: disabled ? colors.textDim : colors.text,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

const styles = {
  wrap: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg },
  info: { color: colors.textDim, fontSize: font.sizes.sm, fontFamily: font.family },
  buttons: { display: 'flex', alignItems: 'center', gap: spacing.sm },
  pageLabel: { color: colors.text, fontSize: font.sizes.sm, fontFamily: font.family, minWidth: '60px', textAlign: 'center' },
};
