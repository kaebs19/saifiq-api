import api from './axios';

export const iapAdminApi = {
  getPackages: () => api.get('/iap/packages').then((r) => r.data.data),
};
