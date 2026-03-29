import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { artApi } from '../api/art';
import { dynastiesApi } from '../api/world';
import type { AddDynastyTranslationRequest, CreateDynastyRequest, EntityPatchOperation } from '../api/types/types';

export const useDynasties = () => {
  return useQuery({
    queryKey: ['dynasties'],
    queryFn: dynastiesApi.getAll
  });
};

export const useDynasty = (id: string | undefined) => {
  return useQuery({
    queryKey: ['dynasty', id],
    queryFn: () => dynastiesApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateDynasty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDynastyRequest) => dynastiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynasties'] });
    },
  });
};

export const usePatchDynasty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, operations }: { id: string; operations: EntityPatchOperation[] }) =>
      dynastiesApi.patch(id, operations),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dynasties'] });
      queryClient.invalidateQueries({ queryKey: ['dynasty', variables.id] });
    },
  });
};

export const useAddDynastyTranslation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddDynastyTranslationRequest) => dynastiesApi.addTranslation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dynasties'] });
      queryClient.invalidateQueries({ queryKey: ['dynasty', variables.id] });
    },
  });
};

export const useUploadDynastyArt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      artApi.upload('Dynasty', id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dynasties'] });
      queryClient.invalidateQueries({ queryKey: ['dynasty', variables.id] });
    },
  });
};