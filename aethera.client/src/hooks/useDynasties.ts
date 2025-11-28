import { useQuery } from '@tanstack/react-query';
import { dynastiesApi } from '../api/world';

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