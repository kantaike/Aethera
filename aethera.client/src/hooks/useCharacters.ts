import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { charactersApi } from '../api/characters';
import type {
  AddCharacterModifierRequest,
  AddCharacterTranslationRequest,
  CharacterPreview,
  CreateCharacterRequest,
  SetCharacterParentsRequest,
  UpdateTraitsAndFeaturesRequest,
} from '../api/types/types';

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
    staleTime: 1000 * 60 * 5, //Data is considered expired after 5 minutes
  });
};

export const useCharacterModifiers = (id: string | undefined) => {
  return useQuery({
    queryKey: ['character', id, 'modifiers'],
    queryFn: () => charactersApi.getModifiers(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
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

export const useCreateCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCharacterRequest) => charactersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
};

export const useUpdateCharacterDynasty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dynastyId }: { id: string; dynastyId: string }) =>
      charactersApi.updateDynasty(id, dynastyId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
};

export const useUpdateCharacterParents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetCharacterParentsRequest }) =>
      charactersApi.updateParents(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
    },
  });
};

export const useUpdateCharacterTraitsAndFeatures = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTraitsAndFeaturesRequest }) =>
      charactersApi.updateTraitsAndFeatures(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
    },
  });
};

export const useUpdateCharacterBackground = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, background }: { id: string; background: string }) =>
      charactersApi.updateBackground(id, background),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
    },
  });
};

export const useUpdateCharacterHometown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hometownId }: { id: string; hometownId: string }) =>
      charactersApi.updateHometown(id, hometownId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
    },
  });
};

export const useUpdateCharacterAlignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, alignment }: { id: string; alignment: string }) =>
      charactersApi.updateAlignment(id, alignment),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
    },
  });
};

export const useLevelUpCharacter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, levels }: { id: string; levels: number }) =>
      charactersApi.levelUp(id, levels),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['character', variables.id, 'modifiers'] });
    },
  });
};

export const useAddCharacterSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, skill }: { id: string; skill: string }) =>
      charactersApi.addSkill(id, skill),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
    },
  });
};

export const useAddCharacterLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, language }: { id: string; language: string }) =>
      charactersApi.addLanguage(id, language),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
    },
  });
};

export const useAddCharacterModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddCharacterModifierRequest) =>
      charactersApi.addModifier(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.characterId] });
      queryClient.invalidateQueries({ queryKey: ['character', variables.characterId, 'modifiers'] });
    },
  });
};

export const useAddCharacterItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string }) =>
      charactersApi.addItem(id, itemId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
    },
  });
};

export const useDeleteCharacterModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, modifierId }: { id: string; modifierId: string }) =>
      charactersApi.deleteModifier(id, modifierId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['character', variables.id, 'modifiers'] });
    },
  });
};

export const useAddCharacterTranslation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddCharacterTranslationRequest) =>
      charactersApi.addTranslation(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
    },
  });
};