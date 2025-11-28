// src/pages/CharacterDetailsPage.tsx
import { useParams } from 'react-router-dom';
import { CharacterSheet } from '../features/Character/CharacterSheet/CharacterSheet';
import styles from './Styles/CharacterDetailsPage.module.css';
import { useCharacter } from '../hooks/useCharacters';
import { FantasyLoader } from '../components/Loader/FantasyLoader';

export default function CharacterDetailsPage() {
  // 1. Достаем ID из URL (например, /characters/123)
  const { id } = useParams<{ id: string }>();

  // 2. Делаем запрос к API
const { data: character, isLoading, isError } = useCharacter(id);

  if (isLoading) {
        return <FantasyLoader></FantasyLoader>;
  }

  if (isError || !character) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorText}>Character not found.</div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <CharacterSheet character={character} />
    </div>
  );
}