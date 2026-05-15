// src/pages/CharacterDetailsPage.tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterSheet } from '../features/Character/CharacterSheet/CharacterSheet';
import { CharacterEditPanel } from '../features/Character/CharacterSheet/CharacterEditPanel';
import styles from './Styles/CharacterDetailsPage.module.css';
import { useCharacter, useCharacterModifiers } from '../hooks/useCharacters';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import { translations, useLanguage } from '../i18n/translations';
import { useAuthStore } from '../store/authStore';

export default function CharacterDetailsPage() {
  const language = useLanguage();
  const t = translations.pages.entityDetails[language];
  const currentUser = useAuthStore((state) => state.currentUser);
  const isMaster = currentUser?.role === 'Master';

    // 1. Read ID from URL (e.g. /characters/123)
  const { id } = useParams<{ id: string }>();
  const [isEditMode, setIsEditMode] = useState(false);

    // 2. Fetch character details
const { data: character, isLoading, isError } = useCharacter(id);
  const { data: modifiers } = useCharacterModifiers(id);
  const isOwner = Boolean(currentUser && character && character.userId === currentUser.id);
  const canEditCharacter = isMaster || isOwner;

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
      {canEditCharacter && !isEditMode && (
        <div className={styles.masterActions}>
          <button
            type="button"
            className={styles.editModeButton}
            onClick={() => setIsEditMode(true)}
          >
            {translations.features.characterEditPanel[language].editModeButton}
          </button>
        </div>
      )}
      {isEditMode ? (
        <CharacterEditPanel
          characterId={id!}
          character={character}
          modifiers={modifiers}
          onExit={() => setIsEditMode(false)}
        />
      ) : (
        <CharacterSheet character={character} modifiers={modifiers} />
      )}
    </div>
  );
}