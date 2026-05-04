import type { components } from '../schema';


export type CharacterPreview = components['schemas']['CharacterPreview']; 
export type CharacterDetail = components['schemas']['CharacterDetailDto']; 
export type CharacterModifiers = components['schemas']['CharacterModifiersDto'];
export type Modifier = components['schemas']['ModifierDto'];
export type ModifierBreakdown = components['schemas']['ModifierBreakdownDto'];
export type Settlement = components['schemas']['SettlementDto'];
export type Dynasty = components['schemas']['DynastyDto'];
export type Item = components['schemas']['ItemDto'];
export type AdministrativeUnit = components['schemas']['AdministrativeUnitDto'];
export type ItemType = components['schemas']['ItemType'];
export type ArmorType = components['schemas']['ArmorType'];
export type SettlementType = components['schemas']['SettlementType'];
export type AdministrativeUnitType = components['schemas']['AdministrativeUnitType'];
export type DynastyStatus = components['schemas']['DynastyStatus'];
export type StoryPreview = components['schemas']['StoryDto'];
export type Art = components['schemas']['Art'];
export type EntityArtType = components['schemas']['EntityArtType'];

export type Species = components['schemas']['Species'];
export type CharacterClass = components['schemas']['CharacterClass'];
export type Alignment = components['schemas']['Alignment'];
export type Background = components['schemas']['Background'];
export type Skill = components['schemas']['Skill'];
export type CharacterLanguage = components['schemas']['Language'];

export interface StoryDetail {
  id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  authorId: string | null;
  art?: Art | null;
}

//Commands
export type CreateCharacterRequest = components['schemas']['CreateCharacterCommand'];
export type CreateDynastyRequest = components['schemas']['CreateDynastyCommand'];
export type CreateItemRequest = components['schemas']['CreateItemCommand'];
export type CreateSettlementRequest = components['schemas']['CreateSettlementCommand'];
export type AddDynastyTranslationRequest = components['schemas']['AddDynastyTranslationCommand'];
export type AddSettlementTranslationRequest = components['schemas']['AddSettlementTranslationCommand'];
export type AddItemTranslationRequest = components['schemas']['AddItemTranslationCommand'];
export type CreateStoryRequest = components['schemas']['CreateStoryCommand'];

export type EntityPatchOperation = {
	op: string;
	path: string;
	value?: unknown;
};

export type EntityPatchDocument = EntityPatchOperation[];