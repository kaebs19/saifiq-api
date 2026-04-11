import api from './axios';

export async function listAvatars() {
  const res = await api.get('/avatars');
  return res.data.data;
}

export async function selectAvatar(avatarId) {
  const res = await api.post(`/avatars/${avatarId}/select`);
  return res.data;
}

// Admin
export async function listAllAvatars() {
  const res = await api.get('/avatars/admin');
  return res.data.data;
}

export async function createAvatar(data) {
  const res = await api.post('/avatars/admin', data);
  return res.data;
}

export async function updateAvatar(id, data) {
  const res = await api.patch(`/avatars/admin/${id}`, data);
  return res.data;
}

export async function toggleAvatar(id) {
  const res = await api.patch(`/avatars/admin/${id}/toggle`);
  return res.data;
}
