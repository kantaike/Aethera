import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { charactersApi } from '../api/characters';
import type { CharacterPreview } from '../api/types/types';

export const useCharacters = () => {
  return useQuery({
    queryKey: ['characters'],
    queryFn: charactersApi.getAll,
  });
};
export const useCharacter = (id: string | undefined) => {
  return useQuery({
    queryKey: ['character', id], 
    queryFn: () => charactersApi.getById(id!),
    enabled: !!id, 
    staleTime: 1000 * 60 * 5, //Data is conidered expired after 5 minutes
  });
};
export const useCharacterById = (id: number | string) => {
  return useQuery({
    queryKey: ['characters', id], 
    queryFn: charactersApi.getAll,
    select: (data) => data.find((char: CharacterPreview) => char.id === id),
    staleTime: 1000 * 60 * 5, 
  });
};
export const useEquipItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ charId, itemId }: { charId: string, itemId: string }) => 
      charactersApi.equip(charId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
};