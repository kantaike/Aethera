import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { denominationsApi } from '../api/world';
import type {
  AddDenominationTranslationRequest,
  CreateDenominationRequest,
  Denomination,
  DenominationRelation,
  UpsertDenominationRelationRequest,
} from '../api/types/types';

export const useDenominations = () => {
  return useQuery<Denomination[]>({
    queryKey: ['denominations'],
    queryFn: denominationsApi.getAll,
  });
};

export const useDenomination = (id: string | undefined) => {
  return useQuery<Denomination>({
    queryKey: ['denomination', id],
    queryFn: () => denominationsApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDenominationRelations = (id: string | undefined) => {
  return useQuery<DenominationRelation[]>({
    queryKey: ['denomination', id, 'relations'],
    queryFn: () => denominationsApi.getRelations(id!),
    enabled: !!id,
  });
};

export const useCreateDenomination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDenominationRequest) => denominationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['denominations'] });
    },
  });
};

export const useUpsertDenominationRelations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertDenominationRelationRequest) => denominationsApi.upsertRelations(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['denominations'] });
    },
  });
};

export type { Denomination, DenominationRelation, AddDenominationTranslationRequest };
