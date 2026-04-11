// API_URL is the versioned API base (e.g. http://localhost:5001/api/v1)
// Static /uploads is served from the server root, so strip /api/v1.
const API_URL = import.meta.env.VITE_API_URL || '';
const SERVER_ROOT = API_URL.replace(/\/api\/v1\/?$/, '');

export function getImageUrl(relativePath) {
  if (!relativePath) return '';
  if (/^https?:\/\//.test(relativePath)) return relativePath;
  return `${SERVER_ROOT}${relativePath}`;
}
