import api from './client';
import type {
  AddCharacterModifierRequest,
  AddCharacterTranslationRequest,
  CreateCharacterRequest,
  LevelUpRequest,
  SetCharacterParentsRequest,
  UpdateTraitsAndFeaturesRequest,
} from './types/types';

export const charactersApi = {
  getAll: () => api.get('/Characters').then(res => res.data),
  getById: (id: string) => api.get(`/Characters/${id}`).then(res => res.data),
  getModifiers: (id: string) => api.get(`/Characters/${id}/modifiers`).then(res => res.data),
  create: (data: CreateCharacterRequest) => api.post('/Characters', data).then(res => res.data),
  equip: (charId: string, itemId: string) =>
    api.put('/Characters/equip', { characterId: charId, itemId }),
  updateDynasty: (id: string, dynastyId: string) =>
    api.put(`/Characters/${id}/dynasty`, JSON.stringify(dynastyId)),
  updateParents: (id: string, data: SetCharacterParentsRequest) =>
    api.put(`/Characters/${id}/parents`, data),
  updateTraitsAndFeatures: (id: string, data: UpdateTraitsAndFeaturesRequest) =>
    api.put(`/Characters/${id}/traits-and-features`, data),
  updateBackground: (id: string, background: string) =>
    api.put(`/Characters/${id}/background`, JSON.stringify(background)),
  updateHometown: (id: string, hometownId: string) =>
    api.put(`/Characters/${id}/hometown`, JSON.stringify(hometownId)),
  updateAlignment: (id: string, alignment: string) =>
    api.put(`/Characters/${id}/alignment`, JSON.stringify(alignment)),
  levelUp: (id: string, levels: number) =>
    api.post(`/Characters/${id}/levelup`, { characterId: id, levels } as LevelUpRequest),
  addSkill: (id: string, skill: string) =>
    api.post(`/Characters/${id}/skills`, JSON.stringify(skill)),
  addLanguage: (id: string, language: string) =>
    api.post(`/Characters/${id}/languages`, JSON.stringify(language)),
  addModifier: (data: AddCharacterModifierRequest) =>
    api.post('/Characters/modifiers', data),
  addItem: (id: string, itemId: string) =>
    api.post(`/Characters/${id}/items/${itemId}`),
  deleteModifier: (id: string, modifierId: string) =>
    api.delete(`/Characters/${id}/modifiers/${modifierId}`),
  addTranslation: (data: AddCharacterTranslationRequest) =>
    api.post('/Characters/AddTranslation', data),
};