import api from './axios';

const BASE = '/admin/store';

export const storeApi = {
  listItems: () => api.get(`${BASE}/items`).then((r) => r.data.data),
  updateItem: (id, data) => api.patch(`${BASE}/items/${id}`, data).then((r) => r.data.data),
  toggleItem: (id) => api.patch(`${BASE}/items/${id}/toggle`).then((r) => r.data.data),
  listTransactions: (params) => api.get(`${BASE}/transactions`, { params }).then((r) => r.data),
};
