// src/pages/CharactersPage.tsx
import { useMemo, useState } from 'react';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import { CharacterListItem } from '../features/Character/CharacterListItem/CharacterListItem';
import { useCharacters, useCreateCharacter } from '../hooks/useCharacters';
import type { Alignment, Background, CharacterClass, CharacterLanguage, CreateCharacterRequest, Skill, Species } from '../api/types/types';
import type { CharacterPreview } from '../api/types/types';
import styles from './Styles/CharactersPage.module.css';
import { translations, useLanguage } from '../i18n/translations';
import { useAuthStore } from '../store/authStore';
import { Modal } from '../components/Modal/Modal';
import formStyles from '../components/Modal/EntityForm.module.css';

const SPECIES_OPTIONS: Species[] = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Gnome', 'Tiefling', 'Dragonborn'];
const CLASS_OPTIONS: CharacterClass[] = ['Fighter', 'Wizard', 'Rogue', 'Cleric', 'Ranger', 'Paladin', 'Bard', 'Warlock', 'Sorcerer', 'Druid', 'Monk', 'Barbarian'];
const BACKGROUND_OPTIONS: Background[] = ['Acolyte', 'Charlatan', 'Criminal', 'Entertainer', 'FolkHero', 'GuildArtisan', 'Hermit', 'Noble', 'Outlander', 'Sage', 'Sailor', 'Soldier', 'Urchin'];
const ALIGNMENT_OPTIONS: Alignment[] = ['LawfulGood', 'NeutralGood', 'ChaoticGood', 'LawfulNeutral', 'TrueNeutral', 'ChaoticNeutral', 'LawfulEvil', 'NeutralEvil', 'ChaoticEvil'];
const SKILL_OPTIONS: Skill[] = ['Acrobatics', 'AnimalHandling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'SleightOfHand', 'Stealth', 'Survival'];
const LANGUAGE_OPTIONS: CharacterLanguage[] = ['Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orcish', 'Abyssal', 'Celestial', 'Draconic', 'DeepSpeech', 'Infernal', 'Primordial', 'Sylvan', 'Undercommon'];
const ATTR_KEYS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
const ATTR_POOL_VALUES = [15, 14, 13, 12, 10, 8] as const;
const LEVEL_OPTIONS = Array.from({ length: 20 }, (_, index) => String(index + 1));

type CharacterFormState = {
  name: string;
  species: Species | '';
  class: CharacterClass | '';
  background: Background | '';
  alignment: Alignment | '';
  level: string;
  experiencePoints: string;
  backstory: string;
  personality: string;
  skillProficiencies: Skill[];
  languageProficiencies: CharacterLanguage[];
  STR: string;
  DEX: string;
  CON: string;
  INT: string;
  WIS: string;
  CHA: string;
};

const INITIAL_FORM: CharacterFormState = {
  name: '',
  species: '',
  class: '',
  background: '',
  alignment: '',
  level: '1',
  experiencePoints: '0',
  backstory: '',
  personality: '',
  skillProficiencies: [],
  languageProficiencies: [],
  STR: '',
  DEX: '',
  CON: '',
  INT: '',
  WIS: '',
  CHA: '',
};

export default function CharactersPage() {
  const language = useLanguage();
  const t = translations.pages.characters[language];
  const { data: characters, isLoading, error } = useCharacters();
  const { mutate: createCharacter, isPending: isCreating } = useCreateCharacter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isMaster = currentUser?.role === 'Master';
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<CharacterFormState>(INITIAL_FORM);

  const [nameSearch, setNameSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const closeModal = () => {
    setIsCreateOpen(false);
    setFormError('');
    setForm(INITIAL_FORM);
  };

  const updateForm = <K extends keyof CharacterFormState>(key: K, value: CharacterFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const isAttrValueUsed = (value: string, currentKey: (typeof ATTR_KEYS)[number]) => {
    return ATTR_KEYS.some((key) => key !== currentKey && form[key] === value);
  };

  const handleExperienceChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '');
    updateForm('experiencePoints', sanitized);
  };

  const toggleSkill = (skill: Skill) => {
    setForm((current) => ({
      ...current,
      skillProficiencies: current.skillProficiencies.includes(skill)
        ? current.skillProficiencies.filter((s) => s !== skill)
        : [...current.skillProficiencies, skill],
    }));
  };

  const toggleLanguage = (lang: CharacterLanguage) => {
    setForm((current) => ({
      ...current,
      languageProficiencies: current.languageProficiencies.includes(lang)
        ? current.languageProficiencies.filter((l) => l !== lang)
        : [...current.languageProficiencies, lang],
    }));
  };

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setFormError(t.modal.required);
      return;
    }

    const areAttributesComplete = ATTR_KEYS.every((key) => ATTR_POOL_VALUES.map(String).includes(form[key]));
    if (!areAttributesComplete) {
      setFormError(t.modal.attributesHint);
      return;
    }

    setFormError('');

    const attributes: { [key: string]: number } = {};
    for (const key of ATTR_KEYS) {
      const val = form[key];
      if (val !== '') attributes[key] = Number(val);
    }

    const payload: CreateCharacterRequest = {
      name: form.name.trim(),
      species: form.species || undefined,
      class: form.class || undefined,
      background: form.background || undefined,
      alignment: form.alignment || undefined,
      level: form.level !== '' ? Number(form.level) : undefined,
      experiencePoints: form.experiencePoints !== '' ? Number(form.experiencePoints) : undefined,
      backstory: form.backstory.trim() || undefined,
      personality: form.personality.trim() || undefined,
      skillProficiencies: form.skillProficiencies.length > 0 ? form.skillProficiencies : undefined,
      languageProficiencies: form.languageProficiencies.length > 0 ? form.languageProficiencies : undefined,
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    };

    createCharacter(payload, { onSuccess: closeModal });
  };

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
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.mainTitle}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>
        {isMaster ? (
          <button type="button" className={styles.createButton} onClick={() => setIsCreateOpen(true)}>
            {t.createButton}
          </button>
        ) : null}
      </div>

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

      <Modal open={isCreateOpen} onClose={closeModal} title={t.modal.title} subtitle={t.modal.subtitle}>
        <form className={formStyles.form} onSubmit={handleCreate}>
          <div className={formStyles.grid}>

            {/* Name */}
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label} htmlFor="char-name">{t.modal.name}</label>
              <input
                id="char-name"
                className={formStyles.input}
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder={t.modal.namePlaceholder}
                required
              />
            </div>

            {/* Species */}
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="char-species">{t.modal.species}</label>
              <select
                id="char-species"
                className={formStyles.select}
                value={form.species}
                onChange={(e) => updateForm('species', e.target.value as Species | '')}
              >
                <option value=""></option>
                {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Class */}
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="char-class">{t.modal.class}</label>
              <select
                id="char-class"
                className={formStyles.select}
                value={form.class}
                onChange={(e) => updateForm('class', e.target.value as CharacterClass | '')}
              >
                <option value=""></option>
                {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Background */}
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="char-background">{t.modal.background}</label>
              <select
                id="char-background"
                className={formStyles.select}
                value={form.background}
                onChange={(e) => updateForm('background', e.target.value as Background | '')}
              >
                <option value=""></option>
                {BACKGROUND_OPTIONS.map((background) => (
                  <option key={background} value={background}>{t.modal.backgroundOptions[background]}</option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="char-level">{t.modal.level}</label>
              <select
                id="char-level"
                className={formStyles.select}
                value={form.level}
                onChange={(e) => updateForm('level', e.target.value)}
              >
                {LEVEL_OPTIONS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* XP */}
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="char-xp">{t.modal.experiencePoints}</label>
              <input
                id="char-xp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={formStyles.input}
                value={form.experiencePoints}
                onChange={(e) => handleExperienceChange(e.target.value)}
              />
            </div>

            {/* Alignment */}
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label} htmlFor="char-alignment">{t.modal.alignment}</label>
              <select
                id="char-alignment"
                className={formStyles.select}
                value={form.alignment}
                onChange={(e) => updateForm('alignment', e.target.value as Alignment | '')}
              >
                <option value=""></option>
                {ALIGNMENT_OPTIONS.map((a) => (
                  <option key={a} value={a}>{t.modal.alignmentOptions[a]}</option>
                ))}
              </select>
            </div>

            {/* Attributes */}
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label}>{t.modal.attributes}</label>
              <p className={formStyles.hint}>{t.modal.attributesHint}</p>
              <div className={styles.attrGrid}>
                {ATTR_KEYS.map((key) => (
                  <div key={key} className={styles.attrField}>
                    <span className={styles.attrLabel}>{t.modal.attrLabels[key]}</span>
                    <select
                      className={formStyles.select}
                      value={form[key]}
                      onChange={(e) => updateForm(key, e.target.value)}
                    >
                      <option value="">{t.modal.chooseValue}</option>
                      {ATTR_POOL_VALUES.map((value) => {
                        const stringValue = String(value);
                        const disabled = isAttrValueUsed(stringValue, key);
                        return (
                          <option key={value} value={stringValue} disabled={disabled}>
                            {value}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Proficiencies */}
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label}>{t.modal.skillProficiencies}</label>
              <div className={styles.checkboxGrid}>
                {SKILL_OPTIONS.map((skill) => (
                  <label key={skill} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.skillProficiencies.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                    />
                    {t.modal.skillLabels[skill]}
                  </label>
                ))}
              </div>
            </div>

            {/* Language Proficiencies */}
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label}>{t.modal.languageProficiencies}</label>
              <div className={styles.checkboxGrid}>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <label key={lang} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.languageProficiencies.includes(lang)}
                      onChange={() => toggleLanguage(lang)}
                    />
                    {t.modal.languageLabels[lang]}
                  </label>
                ))}
              </div>
            </div>

            {/* Backstory */}
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label} htmlFor="char-backstory">{t.modal.backstory}</label>
              <textarea
                id="char-backstory"
                className={formStyles.textarea}
                value={form.backstory}
                onChange={(e) => updateForm('backstory', e.target.value)}
                placeholder={t.modal.backstoryPlaceholder}
              />
            </div>

            {/* Personality */}
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label} htmlFor="char-personality">{t.modal.personality}</label>
              <textarea
                id="char-personality"
                className={formStyles.textarea}
                value={form.personality}
                onChange={(e) => updateForm('personality', e.target.value)}
                placeholder={t.modal.personalityPlaceholder}
              />
            </div>

          </div>

          {formError ? <p className={formStyles.error}>{formError}</p> : null}

          <div className={formStyles.footer}>
            <button type="button" className={formStyles.secondaryButton} onClick={closeModal}>
              {t.modal.cancel}
            </button>
            <button type="submit" className={formStyles.primaryButton} disabled={isCreating}>
              {isCreating ? t.modal.submitting : t.modal.submit}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}