/**
 * Email service
 * Currently logs to console only. Swap with real provider (Resend/SendGrid/SMTP)
 * by implementing the send() method.
 */

const send = async ({ to, subject, html, text }) => {
  if (process.env.EMAIL_PROVIDER === 'disabled') return { dev: true };

  // TODO: swap with real provider when available
  console.log('\n📧 ─── EMAIL (dev mode) ──────────────');
  console.log(`  To:      ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Body:    ${text || html?.replace(/<[^>]+>/g, ' ').trim()}`);
  console.log('──────────────────────────────────\n');

  return { dev: true, to };
};

const sendResetCode = async (email, code) => {
  const subject = '\u0631\u0645\u0632 \u0625\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 — SaifIQ';
  const text = `\u0631\u0645\u0632 \u0625\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643: ${code}\n\u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 10 \u062F\u0642\u0627\u0626\u0642.`;
  const html = `
    <div dir="rtl" style="font-family:Arial;padding:20px;background:#0d1117;color:#e0e0e0">
      <h2 style="color:#c9a84c">\u0631\u0645\u0632 \u0625\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</h2>
      <p>\u0627\u0633\u062A\u062E\u062F\u0645 \u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u0644\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631:</p>
      <div style="font-size:32px;font-weight:bold;color:#c9a84c;letter-spacing:8px;text-align:center;padding:20px;background:#161b22;border-radius:10px;margin:20px 0">${code}</div>
      <p style="color:#9ca3af">\u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 10 \u062F\u0642\u0627\u0626\u0642. \u0625\u0630\u0627 \u0644\u0645 \u062A\u0637\u0644\u0628 \u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u0641\u062A\u062C\u0627\u0647\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629.</p>
    </div>
  `;
  return send({ to: email, subject, text, html });
};

module.exports = { send, sendResetCode };
