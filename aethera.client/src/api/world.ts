import api from './client';
import type {
  AddDenominationTranslationRequest,
  AddDynastyTranslationRequest,
  AddSettlementTranslationRequest,
  CreateAdministrativeUnitRequest,
  CreateDenominationRequest,
  CreateDynastyRequest,
  CreateSettlementRequest,
  EntityPatchDocument,
  Denomination,
  DenominationRelation,
  UpsertDenominationRelationRequest,
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

export const denominationsApi = {
  getAll: (): Promise<Denomination[]> => api.get('/Denominations').then(res => res.data),
  getById: (id: string): Promise<Denomination> => api.get(`/Denominations/${id}`).then(res => res.data),
  create: (data: CreateDenominationRequest) => api.post('/Denominations', data).then(res => res.data),
  upsertRelations: (data: UpsertDenominationRelationRequest) => api.put('/Denominations/relations', data).then(res => res.data),
  getRelations: (id: string): Promise<DenominationRelation[]> => api.get(`/Denominations/${id}/relations`).then(res => res.data),
  addTranslation: (data: AddDenominationTranslationRequest) => api.post('/Denominations/AddTranslation', data).then(res => res.data),
};