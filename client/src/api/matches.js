import api from './axios';

const BASE = '/admin/matches';

export const matchesApi = {
  list: (params) => api.get(BASE, { params }).then((r) => r.data),
  get: (id) => api.get(`${BASE}/${id}`).then((r) => r.data.data),
};
