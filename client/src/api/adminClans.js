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
  update: (id, data) => api.patch(`/clans/${id}`, data).then((r) => r.data.data),
  clearChat: (id) => api.delete(`/clans/${id}/chat`).then((r) => r.data),
  deleteMessage: (clanId, messageId) =>
    api.delete(`/clans/${clanId}/chat/${messageId}`).then((r) => r.data),
  getReports: (id) => api.get(`/clans/${id}/reports`).then((r) => r.data.data),
  resolveReport: (clanId, reportId, action) =>
    api.post(`/clans/${clanId}/reports/${reportId}/resolve`, { action }).then((r) => r.data),
};
