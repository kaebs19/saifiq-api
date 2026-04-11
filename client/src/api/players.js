import api from './axios';

const BASE = '/admin/players';

export const playersApi = {
  list: (params) => api.get(BASE, { params }).then((r) => r.data),
  get: (id) => api.get(`${BASE}/${id}`).then((r) => r.data.data),
  updateGems: (id, data) => api.patch(`${BASE}/${id}/gems`, data).then((r) => r.data.data),
  setBan: (id, isBanned) => api.patch(`${BASE}/${id}/ban`, { isBanned }).then((r) => r.data.data),
  getMatches: (id, params) => api.get(`${BASE}/${id}/matches`, { params }).then((r) => r.data),
  getTransactions: (id, params) => api.get(`${BASE}/${id}/transactions`, { params }).then((r) => r.data),
};
