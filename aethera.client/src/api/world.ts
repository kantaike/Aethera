import api from './client';
import type {
  AddDynastyTranslationRequest,
  AddSettlementTranslationRequest,
  CreateAdministrativeUnitRequest,
  CreateDynastyRequest,
  CreateSettlementRequest,
  EntityPatchDocument,
} from './types/types';

export const settlementsApi = {
  getAll: () => api.get('/Settlements').then(res => res.data),
  getById: (id: string) => api.get(`/Settlements/${id}`).then(res => res.data),
  create: (data: CreateSettlementRequest) => api.post('/Settlements', data).then(res => res.data),
  patch: (id: string, data: EntityPatchDocument) => api.patch(`/Settlements/${id}`, data, { headers: { 'Content-Type': 'application/json-patch+json' } }).then(res => res.data),
  addTranslation: (data: AddSettlementTranslationRequest) => api.post('/Settlements/AddTranslation', data).then(res => res.data),
};

export const administrativeUnitsApi = {
  getAll: () => api.get('/AdministrativeUnits').then(res => res.data),
  create: (data: CreateAdministrativeUnitRequest) => api.post('/AdministrativeUnits', data).then(res => res.data),
};

export const dynastiesApi = {
  getAll: () => api.get('/Dynasties').then(res => res.data),
  getById: (id: string) => api.get(`/Dynasties/${id}`).then(res => res.data),
  create: (data: CreateDynastyRequest) => api.post('/Dynasties', data).then(res => res.data),
  patch: (id: string, data: EntityPatchDocument) => api.patch(`/Dynasties/${id}`, data, { headers: { 'Content-Type': 'application/json-patch+json' } }).then(res => res.data),
  addTranslation: (data: AddDynastyTranslationRequest) => api.post('/Dynasties/AddTranslation', data).then(res => res.data),
};