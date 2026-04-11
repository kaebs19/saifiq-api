import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SwordLogo from '../components/SwordLogo';

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ERROR_ICON = {
  auth: '\u{1F512}',
  email: '\u{1F4E7}',
  password: '\u{1F511}',
  server: '\u{1F50C}',
  banned: '\u{1F6AB}',
  unknown: '\u26A0\uFE0F',
};

function getErrorInfo(err) {
  if (!err.response) {
    return {
      icon: ERROR_ICON.server,
      message: '\u062A\u0639\u0630\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u0633\u064A\u0631\u0641\u0631',
      hint: '\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u062A\u0635\u0627\u0644\u0643 \u0628\u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0623\u0648 \u0623\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u064A\u0639\u0645\u0644',
      type: 'server',
    };
  }

  const status = err.response.status;
  const msg = err.response.data?.message || '';
  const errors = err.response.data?.errors;

  if (status === 404 && msg.toLowerCase().includes('email')) {
    return {
      icon: ERROR_ICON.email,
      message: '\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0645\u0633\u062C\u0644',
      hint: '\u062A\u0623\u0643\u062F \u0645\u0646 \u0635\u062D\u0629 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A',
      type: 'email',
    };
  }

  if (status === 401 && msg.toLowerCase().includes('password')) {
    return {
      icon: ERROR_ICON.password,
      message: '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629',
      hint: '\u062A\u0623\u0643\u062F \u0645\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0648\u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649',
      type: 'password',
    };
  }

  if (status === 403) {
    if (msg.toLowerCase().includes('ban')) {
      return {
        icon: ERROR_ICON.banned,
        message: '\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u062D\u0638\u0648\u0631',
        hint: '\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A',
        type: 'banned',
      };
    }
    return {
      icon: ERROR_ICON.auth,
      message: '\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062F\u062E\u0648\u0644',
      hint: '\u0647\u0630\u0647 \u0627\u0644\u0644\u0648\u062D\u0629 \u0645\u062E\u0635\u0635\u0629 \u0644\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0646 \u0641\u0642\u0637',
      type: 'auth',
    };
  }

  if (status === 422) {
    const details = errors?.join('\u060C ') || msg;
    return {
      icon: ERROR_ICON.auth,
      message: '\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629',
      hint: details,
      type: 'auth',
    };
  }

  if (status === 429) {
    return {
      icon: ERROR_ICON.auth,
      message: '\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0643\u062B\u064A\u0631\u0629 \u062C\u062F\u0627\u064B',
      hint: '\u0627\u0646\u062A\u0638\u0631 \u0642\u0644\u064A\u0644\u0627\u064B \u062B\u0645 \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649',
      type: 'auth',
    };
  }

  if (status >= 500) {
    return {
      icon: ERROR_ICON.server,
      message: '\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631',
      hint: '\u062D\u062F\u062B\u062A \u0645\u0634\u0643\u0644\u0629 \u062F\u0627\u062E\u0644\u064A\u0629\u060C \u062D\u0627\u0648\u0644 \u0644\u0627\u062D\u0642\u0627\u064B',
      type: 'server',
    };
  }

  return {
    icon: ERROR_ICON.unknown,
    message: msg || '\u062D\u062F\u062B \u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639',
    hint: '\u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649',
    type: 'unknown',
  };
}

const ERROR_COLORS = {
  email: { bg: '#1a1520', border: '#c9a84c40', icon: '#c9a84c' },
  password: { bg: '#1a1520', border: '#c9a84c40', icon: '#c9a84c' },
  auth: { bg: '#1a1520', border: '#ef444440', icon: '#ef4444' },
  server: { bg: '#1a1520', border: '#f9731640', icon: '#f97316' },
  banned: { bg: '#1a1520', border: '#ef444440', icon: '#ef4444' },
  unknown: { bg: '#1a1520', border: '#6b728040', icon: '#6b7280' },
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorInfo(null);
    setLoading(true);

    try {
      const { data } = await api.post('/auth/admin-login', { email, password });
      localStorage.setItem('token', data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setErrorInfo(getErrorInfo(err));
    } finally {
      setLoading(false);
    }
  };

  const errorColors = errorInfo ? ERROR_COLORS[errorInfo.type] : null;

  return (
    <div style={styles.container}>
      {/* Corner decorations */}
      <div style={{ ...styles.corner, top: 0, right: 0, borderTop: '2px solid #c9a84c33', borderRight: '2px solid #c9a84c33' }} />
      <div style={{ ...styles.corner, top: 0, left: 0, borderTop: '2px solid #c9a84c33', borderLeft: '2px solid #c9a84c33' }} />
      <div style={{ ...styles.corner, bottom: 0, right: 0, borderBottom: '2px solid #c9a84c33', borderRight: '2px solid #c9a84c33' }} />
      <div style={{ ...styles.corner, bottom: 0, left: 0, borderBottom: '2px solid #c9a84c33', borderLeft: '2px solid #c9a84c33' }} />

      <div style={styles.card}>
        {/* Gold top line */}
        <div style={styles.goldLine} />

        <div style={styles.logoSection}>
          <SwordLogo />
          <h1 style={styles.title}>SAIFIQ</h1>
          <p style={styles.subtitle}>{'\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645'}</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>{'\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                ...(errorInfo?.type === 'email' ? { borderColor: '#c9a84c' } : {}),
              }}
              placeholder="admin@saifiq.com"
              required
              dir="ltr"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>{'\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631'}</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  ...styles.input,
                  ...styles.passwordInput,
                  ...(errorInfo?.type === 'password' ? { borderColor: '#c9a84c' } : {}),
                }}
                placeholder="••••••••"
                required
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {errorInfo && (
            <div
              style={{
                ...styles.errorBox,
                background: errorColors.bg,
                borderColor: errorColors.border,
              }}
            >
              <div style={styles.errorHeader}>
                <span style={{ fontSize: '20px' }}>{errorInfo.icon}</span>
                <span style={{ ...styles.errorMessage, color: errorColors.icon }}>
                  {errorInfo.message}
                </span>
              </div>
              <p style={styles.errorHint}>{errorInfo.hint}</p>
            </div>
          )}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? '\u062C\u0627\u0631\u064A \u0627\u0644\u062F\u062E\u0648\u0644...' : '\u062F\u062E\u0648\u0644'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#080b12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: '60px',
    height: '60px',
  },
  card: {
    background: '#0d1117',
    border: '1px solid #1a1f2e',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    overflow: 'hidden',
  },
  goldLine: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#c9a84c',
    letterSpacing: '6px',
    margin: '12px 0 4px',
    fontFamily: "'Cairo', sans-serif",
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    letterSpacing: '2px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    color: '#9ca3af',
    fontWeight: 600,
  },
  input: {
    background: '#161b22',
    border: '1px solid #1a1f2e',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '15px',
    color: '#e0e0e0',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: "'Cairo', sans-serif",
    width: '100%',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    paddingLeft: '44px',
  },
  eyeButton: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    borderRadius: '10px',
    border: '1px solid',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  errorMessage: {
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
  },
  errorHint: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
    paddingRight: '30px',
    lineHeight: '1.6',
  },
  button: {
    background: 'linear-gradient(135deg, #c9a84c, #a8893a)',
    color: '#080b12',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Cairo', sans-serif",
    marginTop: '8px',
    transition: 'opacity 0.2s',
  },
};
