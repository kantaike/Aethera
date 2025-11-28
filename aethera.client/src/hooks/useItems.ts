import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../api/items';

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
