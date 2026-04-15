import api from './axios';

export const adminUsersApi = {
  search: (q, limit = 20) =>
    api.get('/admin/users/search', { params: { q, limit } }).then((r) => r.data.data),
  grant: (userId, data) =>
    api.post(`/admin/users/${userId}/grant`, data).then((r) => r.data.data),
  getAuditLog: (params) =>
    api.get('/admin/audit', { params }).then((r) => r.data),
};
