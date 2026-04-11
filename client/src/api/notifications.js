import api from './axios';

const BASE = '/admin/notifications';

export const notificationsApi = {
  list: (params) => api.get(BASE, { params }).then((r) => r.data),
  send: (payload) => api.post(`${BASE}/send`, payload).then((r) => r.data.data),
  broadcast: (payload) => api.post(`${BASE}/broadcast`, payload).then((r) => r.data.data),
};
