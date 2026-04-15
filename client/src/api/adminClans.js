import api from './axios';

export const adminClansApi = {
  search: (params) => api.get('/clans/search', { params }).then((r) => r.data),
  getLeaderboard: (limit = 50) =>
    api.get('/clans/leaderboard', { params: { limit } }).then((r) => r.data.data),
  get: (id) => api.get(`/clans/${id}`).then((r) => r.data.data),
  getMembers: (id, params) => api.get(`/clans/${id}/members`, { params }).then((r) => r.data),
  getMessages: (id, params) => api.get(`/clans/${id}/chat`, { params }).then((r) => r.data.data),
  getMemberLeaderboard: (id) => api.get(`/clans/${id}/leaderboard`).then((r) => r.data.data),
  delete: (id) => api.delete(`/clans/${id}`).then((r) => r.data.data),
};
