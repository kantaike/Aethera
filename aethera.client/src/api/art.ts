import api from './client';
import type { EntityArtType } from './types/types';

export const artApi = {
  upload: (entityType: EntityArtType, id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(`/Art/${entityType}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => res.data);
  },
};