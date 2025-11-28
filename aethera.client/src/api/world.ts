import api from './client';

export const settlementsApi = {
  getAll: () => api.get('/Settlements').then(res => res.data),
  getById: (id: string) => api.get(`/Settlements/${id}`).then(res => res.data),
  create: (data: any) => api.post('/Settlements', data),
};

export const administrativeUnitsApi = {
  getAll: () => api.get('/AdministrativeUnits').then(res => res.data),
  create: (data: any) => api.post('/AdministrativeUnits', data),
};

export const dynastiesApi = {
  getAll: () => api.get('/Dynasties').then(res => res.data),
  getById: (id: string) => api.get(`/Dynasties/${id}`).then(res => res.data),
};