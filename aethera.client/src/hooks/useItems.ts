import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import type { AddItemTranslationRequest, CreateItemRequest, EntityPatchOperation } from '../api/types/types';

export const useItems = () => {
  return useQuery({
    queryKey: ['items'],
    queryFn: itemsApi.getAll,
  });
};

export const useItem = (id: string | undefined) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemRequest) => itemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const usePatchItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, operations }: { id: string; operations: EntityPatchOperation[] }) =>
      itemsApi.patch(id, operations),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', variables.id] });
    },
  });
};

export const useAddItemTranslation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddItemTranslationRequest) => itemsApi.addTranslation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', variables.id] });
    },
  });
};
