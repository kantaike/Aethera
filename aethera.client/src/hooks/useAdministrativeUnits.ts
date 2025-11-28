import { useQuery } from '@tanstack/react-query';
import { administrativeUnitsApi } from '../api/world';

export const useAdministrativeUnits = () => {
  return useQuery({
    queryKey: ['administrativeUnits'],
    queryFn: administrativeUnitsApi.getAll
  });
};