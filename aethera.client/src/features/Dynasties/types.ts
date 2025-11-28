import type { Dynasty } from '../../api/types/types';

/** Placeholder: will be enum from API */
export type DynastyStatus = 'Ruling' | 'Fallen' | 'Vassal';

/** Extended dynasty view with placeholder fields (to be added to API later) */
export interface DynastyView extends Dynasty {
  /** Placeholder: influence/power 1-5. Default: 3 */
  influence?: number;
  /** Placeholder: house motto. Default: empty */
  motto?: string | null;
  /** Placeholder: culture/species filter. Default: "Human" */
  culture?: string | null;
  /** Placeholder: dynasty status. Default: "Vassal" */
  status?: DynastyStatus;
  /** Character IDs belonging to this dynasty (for representatives) */
  memberIds?: string[];
}
export const DEFAULT_INFLUENCE = 3;
export const DEFAULT_STATUS: DynastyStatus = 'Vassal';
export const DEFAULT_CULTURE = 'Human';
export const DEFAULT_MOTTO = '';

