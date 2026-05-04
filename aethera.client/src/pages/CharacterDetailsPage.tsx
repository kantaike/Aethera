// src/pages/CharacterDetailsPage.tsx
import { useParams } from 'react-router-dom';
import { CharacterSheet } from '../features/Character/CharacterSheet/CharacterSheet';
import styles from './Styles/CharacterDetailsPage.module.css';
import { useCharacter, useCharacterModifiers } from '../hooks/useCharacters';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import { translations, useLanguage } from '../i18n/translations';

export default function CharacterDetailsPage() {
  const language = useLanguage();
  const t = translations.pages.entityDetails[language];
    // 1. Read ID from URL (e.g. /characters/123)
  const { id } = useParams<{ id: string }>();

    // 2. Fetch character details
const { data: character, isLoading, isError } = useCharacter(id);
  const { data: modifiers } = useCharacterModifiers(id);

  if (isLoading) {
        return <FantasyLoader></FantasyLoader>;
  }

  if (isError || !character) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorText}>{t.characterNotFound}</div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <CharacterSheet character={character} modifiers={modifiers} />
    </div>
  );
}