export function getErrorMessage(err, fallback = '\u062D\u062F\u062B \u062E\u0637\u0623') {
  return err?.response?.data?.errors?.[0] || err?.response?.data?.message || fallback;
}
