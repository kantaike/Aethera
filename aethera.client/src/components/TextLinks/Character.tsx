import { type ReactNode } from 'react';
import { useCharacterById } from '../../hooks/useCharacters';
import { EntityLink } from './EntityLink';
import { PreviewImage } from './PreviewImage';
import styles from './TextLinks.module.css';
import { translations, useLanguage } from '../../i18n/translations';

type CharacterLinkProps = {
  id: string;
  children?: ReactNode;
};

const CLASS_ICON_MAP: Record<string, string> = {
  Fighter: '🛡️',
  Wizard: '🪄',
  Rogue: '🗡️',
  Cleric: '✨',
  Ranger: '🏹',
  Paladin: '⚔️',
  Bard: '🎵',
  Warlock: '🕯️',
  Sorcerer: '🔮',
  Druid: '🌿',
  Monk: '🥋',
  Barbarian: '🪓',
};

export function Character({ id, children }: CharacterLinkProps) {
  const language = useLanguage();
  const t = translations.features.textLinks[language];
  const { data, isLoading } = useCharacterById(id);
  const label = children ?? data?.name ?? t.fallback.character;
  const className = data?.class ?? null;
  const classIcon = (className && CLASS_ICON_MAP[className]) || '👤';

  const infoParts: string[] = [];
  if (className) {
    infoParts.push(className);
  }
  if (data?.species) {
    infoParts.push(data.species);
  }
  if (typeof data?.level === 'number' && data.level > 0) {
    infoParts.push(`${language === 'uk' ? 'Рів.' : 'Lv.'} ${data.level}`);
  }

  const subtitle = infoParts.length > 0 ? infoParts.join(' • ') : null;

  const preview = (
    <div className={styles.previewRow}>
      <PreviewImage
        src={data?.art?.filePath}
        alt={typeof label === 'string' ? label : data?.name ?? t.fallback.character}
        placeholder={<span className={styles.previewIcon}>{classIcon}</span>}
      />
      <div>
        <div className={styles.previewTitle}>{data?.name ?? '—'}</div>
        {!isLoading && subtitle ? <div className={styles.previewSubtitle}>{subtitle}</div> : null}
      </div>
    </div>
  );

  return (
    <EntityLink to={`/characters/${id}`} preview={preview} ariaLabel={`${t.fallback.character} ${String(label)}`}>
      {label}
    </EntityLink>
  );
}

