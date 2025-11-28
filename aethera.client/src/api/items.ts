import api from './client';

export const itemsApi = {
  getAll: () => api.get('/Items').then(res => res.data),
  getById: (id: string) => api.get(`/Items/${id}`).then(res => res.data),
  create: (data: unknown) => api.post('/Items', data).then(res => res.data),
};
