export default function PlaceholderPage({ title }) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <span style={styles.icon}>🚧</span>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.subtitle}>{'\u0642\u0631\u064A\u0628\u0627\u064B...'}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  card: {
    background: '#0d1117',
    border: '1px solid #1a1f2e',
    borderRadius: '16px',
    padding: '48px 64px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '40px',
    display: 'block',
    marginBottom: '16px',
  },
  title: {
    color: '#c9a84c',
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0,
  },
};
