const MAX_ART_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_ART_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/bmp',
  'image/tiff',
]);

export type ArtValidationError = 'size' | 'type';

export const validateArtFile = (file: File): ArtValidationError | null => {
  if (file.size > MAX_ART_SIZE_BYTES) {
    return 'size';
  }

  if (!ALLOWED_ART_MIME_TYPES.has(file.type)) {
    return 'type';
  }

  return null;
};
