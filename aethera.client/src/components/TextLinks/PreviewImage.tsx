import { useState } from 'react';
import { type ReactNode } from 'react';
import styles from './TextLinks.module.css';

type PreviewImageProps = {
  src?: string | null;
  alt: string;
  placeholder: ReactNode;
};

export function PreviewImage({ src, alt, placeholder }: PreviewImageProps) {
  const [hasError, setHasError] = useState(false);
  const hasImage = Boolean(src) && !hasError;

  if (!hasImage) {
    return (
      <div className={styles.previewImagePlaceholder} aria-hidden="true">
        {placeholder}
      </div>
    );
  }

  return (
    <img
      className={styles.previewImage}
      src={src ?? ''}
      alt={alt}
      onError={() => setHasError(true)}
    />
  );
}