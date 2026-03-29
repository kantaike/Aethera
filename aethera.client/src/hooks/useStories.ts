import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { artApi } from '../api/art';
import { storiesApi } from '../api/stories';
import type { CreateStoryRequest } from '../api/types/types';

export const useStories = () => {
  return useQuery({
    queryKey: ['stories'],
    queryFn: storiesApi.getAll,
  });
};

export const useStory = (id: string | undefined) => {
  return useQuery({
    queryKey: ['story', id],
    queryFn: () => storiesApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoryRequest) => storiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
};

export const useUploadStoryArt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      artApi.upload('Story', id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['story', variables.id] });
    },
  });
};
