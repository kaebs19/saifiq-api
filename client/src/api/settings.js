import api from './axios';

const BASE = '/admin/settings';

export const settingsApi = {
  getAll: () => api.get(BASE).then((r) => r.data.data),
  set: (key, value) => api.put(`${BASE}/${key}`, { value }).then((r) => r.data.data),
  listAdmins: () => api.get(`${BASE}/admins/list`).then((r) => r.data.data),
  createAdmin: (data) => api.post(`${BASE}/admins`, data).then((r) => r.data.data),
  removeAdmin: (id) => api.delete(`${BASE}/admins/${id}`).then((r) => r.data),
};
