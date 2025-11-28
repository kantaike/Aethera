import { useQuery } from '@tanstack/react-query';
import { settlementsApi } from '../api/world';

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