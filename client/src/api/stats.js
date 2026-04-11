import api from './axios';

const BASE = '/admin/stats';

export const statsApi = {
  overview: () => api.get(`${BASE}/overview`).then((r) => r.data.data),
  topPlayers: (limit = 10) => api.get(`${BASE}/top-players`, { params: { limit } }).then((r) => r.data.data),
  dailyChart: (days = 7) => api.get(`${BASE}/daily-chart`, { params: { days } }).then((r) => r.data.data),
};
