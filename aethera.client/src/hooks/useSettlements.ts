import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settlementsApi } from '../api/world';
import type { AddSettlementTranslationRequest, CreateSettlementRequest, EntityPatchOperation } from '../api/types/types';

export const useSettlements = () => {
  return useQuery({
    queryKey: ['settlements'],
    queryFn: settlementsApi.getAll
  });
};

export const useSettlement = (id: string | undefined) => {
  return useQuery({
    queryKey: ['settlement', id],
    queryFn: () => settlementsApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSettlementRequest) => settlementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
    },
  });
};

export const usePatchSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, operations }: { id: string; operations: EntityPatchOperation[] }) =>
      settlementsApi.patch(id, operations),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      queryClient.invalidateQueries({ queryKey: ['settlement', variables.id] });
    },
  });
};

export const useAddSettlementTranslation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddSettlementTranslationRequest) => settlementsApi.addTranslation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      queryClient.invalidateQueries({ queryKey: ['settlement', variables.id] });
    },
  });
};