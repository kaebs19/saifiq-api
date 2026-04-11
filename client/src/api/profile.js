import api from './axios';

export async function updateProfile(data) {
  const res = await api.patch('/auth/me', data);
  return res.data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await api.post('/auth/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
