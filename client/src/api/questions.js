import api from './axios';

const BASE = '/admin/questions';

export const questionsApi = {
  list: (params) => api.get(BASE, { params }).then((r) => r.data),
  get: (id) => api.get(`${BASE}/${id}`).then((r) => r.data.data),
  create: (payload) => api.post(BASE, payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`${BASE}/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`${BASE}/${id}`).then((r) => r.data),
  toggle: (id) => api.patch(`${BASE}/${id}/toggle`).then((r) => r.data.data),
  duplicate: (id) => api.post(`${BASE}/${id}/duplicate`).then((r) => r.data.data),
  uploadExcel: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`${BASE}/upload-excel`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data);
  },
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post(`${BASE}/upload-image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data);
  },
  downloadTemplate: () =>
    api.get(`${BASE}/template`, { responseType: 'blob' }).then((r) => r.data),
  getCategoryConfig: () => api.get(`${BASE}/category-config`).then((r) => r.data.data),
  getDifficultyConfig: () => api.get(`${BASE}/difficulty-config`).then((r) => r.data.data),
  generateAi: (payload) => api.post(`${BASE}/generate-ai`, payload).then((r) => r.data.data),
};
