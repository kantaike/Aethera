import type { EntityPatchOperation } from './types/types';

export function createReplaceOperation(path: string, value: unknown): EntityPatchOperation {
  return {
    op: 'replace',
    path,
    value,
  };
}
