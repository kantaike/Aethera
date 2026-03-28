// src/pages/CharactersPage.tsx
import { useMemo, useState } from 'react';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import { CharacterListItem } from '../features/Character/CharacterListItem/CharacterListItem';
import { useCharacters } from '../hooks/useCharacters';
import type { CharacterPreview } from '../api/types/types';
import styles from './Styles/CharactersPage.module.css';
import { translations, useLanguage } from '../i18n/translations';

const SPECIES_OPTIONS = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Gnome', 'Tiefling', 'Dragonborn'] as const;
const CLASS_OPTIONS = ['Fighter', 'Wizard', 'Rogue', 'Cleric', 'Ranger', 'Paladin', 'Bard', 'Warlock', 'Sorcerer', 'Druid', 'Monk', 'Barbarian'] as const;

export default function CharactersPage() {
  const language = useLanguage();
  const t = translations.pages.characters[language];
  const { data: characters, isLoading, error } = useCharacters();
  const [nameSearch, setNameSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filteredCharacters = useMemo(() => {
    if (!characters) return [];
    return (characters as CharacterPreview[]).filter((char) => {
      const nameMatch =
        !nameSearch ||
        (char.name ?? '')
          .toLowerCase()
          .includes(nameSearch.toLowerCase());
      const speciesMatch =
        !speciesFilter || (char.species ?? '') === speciesFilter;
      const classMatch =
        !classFilter || (char.class ?? '') === classFilter;
      return nameMatch && speciesMatch && classMatch;
    });
  }, [characters, nameSearch, speciesFilter, classFilter]);

  if (isLoading) return <FantasyLoader fullScreen />;
  if (error) return <p className={styles.error}>{t.error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>{t.title}</h1>
      <p className={styles.subtitle}>{t.subtitle}</p>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder={t.searchPlaceholder}
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">{t.allRaces}</option>
          {SPECIES_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">{t.allClasses}</option>
          {CLASS_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className={styles.characterGrid}>
        {filteredCharacters.map((character) => (
          <CharacterListItem character={character} key={character.id} />
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <p className={styles.empty}>{t.empty}</p>
      )}
    </div>
  );
}