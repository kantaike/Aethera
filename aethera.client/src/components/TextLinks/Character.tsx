import { type ReactNode } from 'react';
import { useCharacterById } from '../../hooks/useCharacters';
import { EntityLink } from './EntityLink';
import styles from './TextLinks.module.css';

type CharacterLinkProps = {
  id: string;
  children?: ReactNode;
};

export function Character({ id, children }: CharacterLinkProps) {
  const { data, isLoading } = useCharacterById(id);
  const label = children ?? data?.name ?? 'Character';

  const preview = (
    <div className={styles.previewRow}>
      <img
        className={styles.previewImage}
        src={data?.art?.filePath ?? ''}
        alt={typeof label === 'string' ? label : data?.name ?? 'Character'}
      />
      <div>
        <div className={styles.previewTitle}>{data?.name ?? '—'}</div>
        <div className={styles.previewSubtitle}>
          {isLoading ? 'Loading…' : 'Open character'}
        </div>
      </div>
    </div>
  );

  return (
    <EntityLink to={`/characters/${id}`} preview={preview} ariaLabel={`Character ${String(label)}`}>
      {label}
    </EntityLink>
  );
}

