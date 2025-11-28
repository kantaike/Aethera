import type { components } from '../schema';


export type CharacterPreview = components['schemas']['CharacterPreview']; 
export type CharacterDetail = components['schemas']['CharacterDetailDto']; 
export type Settlement = components['schemas']['SettlementDto'];
export type Dynasty = components['schemas']['DynastyDto'];
export type Item = components['schemas']['ItemDto'];
export type AdministrativeUnit = components['schemas']['AdministrativeUnitDto'];

//Commands
export type CreateCharacterRequest = components['schemas']['CreateCharacterCommand'];