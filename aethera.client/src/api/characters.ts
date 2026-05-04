import api from './client';
import type { CreateCharacterRequest } from './types/types';

export const charactersApi = {
  getAll: () => api.get('/Characters').then(res => res.data),
  getById: (id: string) => api.get(`/Characters/${id}`).then(res => res.data),
  getModifiers: (id: string) => api.get(`/Characters/${id}/modifiers`).then(res => res.data),
  create: (data: CreateCharacterRequest) => api.post('/Characters', data).then(res => res.data),
  equip: (charId: string, itemId: string) => 
    api.put('/Characters/equip', { charId, itemId }),
  updateDynasty: (id: string, dynastyId: string) => 
    api.put(`/Characters/${id}/dynasty`, { dynastyId }),
};