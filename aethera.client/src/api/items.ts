import api from './client';
import type { AddItemTranslationRequest, CreateItemRequest, EntityPatchDocument } from './types/types';

export const itemsApi = {
  getAll: () => api.get('/Items').then(res => res.data),
  getById: (id: string) => api.get(`/Items/${id}`).then(res => res.data),
  create: (data: CreateItemRequest) => api.post('/Items', data).then(res => res.data),
  patch: (id: string, data: EntityPatchDocument) => api.patch(`/Items/${id}`, data, { headers: { 'Content-Type': 'application/json-patch+json' } }).then(res => res.data),
  addTranslation: (data: AddItemTranslationRequest) => api.post('/Items/AddTranslation', data).then(res => res.data),
};
