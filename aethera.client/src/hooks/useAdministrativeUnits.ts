import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { administrativeUnitsApi } from '../api/world';
import type { CreateAdministrativeUnitRequest } from '../api/types/types';

export const useAdministrativeUnits = () => {
  return useQuery({
    queryKey: ['administrativeUnits'],
    queryFn: administrativeUnitsApi.getAll
  });
};

export const useCreateAdministrativeUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdministrativeUnitRequest) => administrativeUnitsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['administrativeUnits'] });
    },
  });
};