import api from './client';

export const charactersApi = {
  getAll: () => api.get('/Characters').then(res => res.data),
  getById: (id: string) => api.get(`/Characters/${id}`).then(res => res.data),
  create: (data: any) => api.post('/Characters', data).then(res => res.data),
  equip: (charId: string, itemId: string) => 
    api.put('/Characters/equip', { charId, itemId }),
  updateDynasty: (id: string, dynastyId: string) => 
    api.put(`/Characters/${id}/dynasty`, { dynastyId }),
};