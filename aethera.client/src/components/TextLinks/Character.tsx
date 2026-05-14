import { type ReactNode } from 'react';
import { useCharacterById } from '../../hooks/useCharacters';
import { EntityLink } from './EntityLink';
import styles from './TextLinks.module.css';
import { translations, useLanguage } from '../../i18n/translations';

type CharacterLinkProps = {
  id: string;
  children?: ReactNode;
};

export function Character({ id, children }: CharacterLinkProps) {
  const language = useLanguage();
  const t = translations.features.textLinks[language];
  const { data, isLoading } = useCharacterById(id);
  const label = children ?? data?.name ?? t.fallback.character;

  const preview = (
    <div className={styles.previewRow}>
      <img
        className={styles.previewImage}
        src={data?.art?.filePath ?? ''}
        alt={typeof label === 'string' ? label : data?.name ?? t.fallback.character}
      />
      <div>
        <div className={styles.previewTitle}>{data?.name ?? '—'}</div>
        <div className={styles.previewSubtitle}>
          {isLoading ? t.loading : t.openCharacter}
        </div>
      </div>
    </div>
  );

  return (
    <EntityLink to={`/characters/${id}`} preview={preview} ariaLabel={`${t.fallback.character} ${String(label)}`}>
      {label}
    </EntityLink>
  );
}

