import api from './client';
import type { CreateStoryRequest, StoryDetail } from './types/types';

export const storiesApi = {
  getAll: () => api.get('/Stories').then(res => res.data),
  getById: (id: string): Promise<StoryDetail> => api.get(`/Stories/${id}`).then(res => res.data),
  create: (data: CreateStoryRequest) => api.post('/Stories', data).then(res => res.data),
};
