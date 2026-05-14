import { useState } from 'react';
import toast from 'react-hot-toast';
import styles from './CharacterEditPanel.module.css';
import {
  useAddCharacterItem,
  useAddCharacterLanguage,
  useAddCharacterModifier,
  useAddCharacterSkill,
  useAddCharacterTranslation,
  useDeleteCharacterModifier,
  useLevelUpCharacter,
  useUpdateCharacterAlignment,
  useUpdateCharacterBackground,
  useUpdateCharacterDynasty,
  useUpdateCharacterHometown,
  useUpdateCharacterParents,
  useUpdateCharacterTraitsAndFeatures,
} from '../../../hooks/useCharacters';
import { useCharacters } from '../../../hooks/useCharacters';
import { useDynasties } from '../../../hooks/useDynasties';
import { useSettlements } from '../../../hooks/useSettlements';
import { useItems } from '../../../hooks/useItems';
import { translations, useLanguage } from '../../../i18n/translations';
import type {
  Alignment,
  Background,
  CharacterDetail,
  CharacterModifiers,
  CharacterLanguage,
  ModifierCategory,
  ModifierType,
  Skill,
  StatType,
} from '../../../api/types/types';

const ALL_SKILLS: Skill[] = [
  'Acrobatics', 'AnimalHandling', 'Arcana', 'Athletics', 'Deception',
  'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
  'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
  'SleightOfHand', 'Stealth', 'Survival',
];

const ALL_LANGUAGES: CharacterLanguage[] = [
  'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin',
  'Halfling', 'Orcish', 'Abyssal', 'Celestial', 'Draconic',
  'DeepSpeech', 'Infernal', 'Primordial', 'Sylvan', 'Undercommon',
];

const ALL_ALIGNMENTS: Alignment[] = [
  'LawfulGood', 'NeutralGood', 'ChaoticGood',
  'LawfulNeutral', 'TrueNeutral', 'ChaoticNeutral',
  'LawfulEvil', 'NeutralEvil', 'ChaoticEvil',
];

const ALL_BACKGROUNDS: Background[] = [
  'Acolyte', 'Charlatan', 'Criminal', 'Entertainer', 'FolkHero',
  'GuildArtisan', 'Hermit', 'Noble', 'Outlander', 'Sage',
  'Sailor', 'Soldier', 'Urchin',
];

const MAIN_STAT_TYPES: StatType[] = [
  'Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma',
  'ArmorClass', 'Initiative', 'Speed', 'HitPoints', 'HitDice',
  'ProficiencyBonus', 'PassivePerception',
];

const MODIFIER_TYPES: ModifierType[] = ['Flat', 'Multiplier', 'Override'];
const MODIFIER_CATEGORIES: ModifierCategory[] = ['Base', 'Permanent', 'Equipment', 'Temporary'];

interface Props {
  characterId: string;
  character: CharacterDetail;
  modifiers?: CharacterModifiers;
  onExit: () => void;
}

export function CharacterEditPanel({ characterId, character, modifiers, onExit }: Props) {
  const language = useLanguage();
  const t = translations.features.characterEditPanel[language];

  const { data: allCharacters = [] } = useCharacters();
  const { data: dynasties = [] } = useDynasties();
  const { data: settlements = [] } = useSettlements();
  const { data: items = [] } = useItems();

  // --- Traits & Features ---
  const [traits, setTraits] = useState({
    backstory: character.backstory ?? '',
    personality: character.personality ?? '',
    feats: character.feats ?? '',
    heroicInspirationCount: character.heroicInspirationCount != null ? String(character.heroicInspirationCount) : '',
  });
  const { mutateAsync: updateTraits, isPending: isSavingTraits } = useUpdateCharacterTraitsAndFeatures();

  const handleSaveTraits = async () => {
    await updateTraits({
      id: characterId,
      data: {
        characterId,
        backstory: traits.backstory.trim() || null,
        personality: traits.personality.trim() || null,
        feats: traits.feats.trim() || null,
        heroicInspirationCount: traits.heroicInspirationCount === '' ? null : Number(traits.heroicInspirationCount),
      },
    });
    toast.success(t.save);
  };

  // --- Background ---
  const [selectedBackground, setSelectedBackground] = useState<string>(character.background ?? ALL_BACKGROUNDS[0]);
  const { mutateAsync: updateBackground, isPending: isSavingBackground } = useUpdateCharacterBackground();

  const handleSaveBackground = async () => {
    await updateBackground({ id: characterId, background: selectedBackground });
    toast.success(t.save);
  };

  // --- Alignment ---
  const [selectedAlignment, setSelectedAlignment] = useState<string>(character.alignment ?? ALL_ALIGNMENTS[0]);
  const { mutateAsync: updateAlignment, isPending: isSavingAlignment } = useUpdateCharacterAlignment();

  const handleSaveAlignment = async () => {
    await updateAlignment({ id: characterId, alignment: selectedAlignment });
    toast.success(t.save);
  };

  // --- Dynasty ---
  const [selectedDynasty, setSelectedDynasty] = useState<string>(character.dynastyId ?? '');
  const { mutateAsync: updateDynasty, isPending: isSavingDynasty } = useUpdateCharacterDynasty();

  const handleSaveDynasty = async () => {
    if (!selectedDynasty) return;
    await updateDynasty({ id: characterId, dynastyId: selectedDynasty });
    toast.success(t.save);
  };

  // --- Parents ---
  const [selectedFather, setSelectedFather] = useState<string>(character.fatherId ?? '');
  const [selectedMother, setSelectedMother] = useState<string>(character.motherId ?? '');
  const { mutateAsync: updateParents, isPending: isSavingParents } = useUpdateCharacterParents();

  const handleSaveParents = async () => {
    await updateParents({
      id: characterId,
      data: {
        characterId,
        fatherId: selectedFather || undefined,
        motherId: selectedMother || undefined,
      },
    });
    toast.success(t.save);
  };

  // --- Hometown ---
  const [selectedHometown, setSelectedHometown] = useState<string>(character.hometownId ?? '');
  const { mutateAsync: updateHometown, isPending: isSavingHometown } = useUpdateCharacterHometown();

  const handleSaveHometown = async () => {
    if (!selectedHometown) return;
    await updateHometown({ id: characterId, hometownId: selectedHometown });
    toast.success(t.save);
  };

  // --- Level Up ---
  const [levelsToAdd, setLevelsToAdd] = useState('1');
  const { mutateAsync: levelUp, isPending: isLevelingUp } = useLevelUpCharacter();

  const handleLevelUp = async () => {
    const levels = Number(levelsToAdd);
    if (!levels || levels < 1) return;
    await levelUp({ id: characterId, levels });
    toast.success(t.save);
    setLevelsToAdd('1');
  };

  // --- Skills ---
  const existingSkills = new Set((character.skillProficiencies ?? []).map(String));
  const availableSkills = ALL_SKILLS.filter(s => !existingSkills.has(s));
  const [selectedSkill, setSelectedSkill] = useState<string>(availableSkills[0] ?? '');
  const { mutateAsync: addSkill, isPending: isAddingSkill } = useAddCharacterSkill();

  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    await addSkill({ id: characterId, skill: selectedSkill });
    toast.success(t.add);
    setSelectedSkill(availableSkills.filter(s => s !== selectedSkill)[0] ?? '');
  };

  // --- Languages ---
  const existingLanguages = new Set((character.languageProficiencies ?? []).map(String));
  const availableLanguages = ALL_LANGUAGES.filter(l => !existingLanguages.has(l));
  const [selectedLanguage, setSelectedLanguage] = useState<string>(availableLanguages[0] ?? '');
  const { mutateAsync: addLanguage, isPending: isAddingLanguage } = useAddCharacterLanguage();

  const handleAddLanguage = async () => {
    if (!selectedLanguage) return;
    await addLanguage({ id: characterId, language: selectedLanguage });
    toast.success(t.add);
    setSelectedLanguage(availableLanguages.filter(l => l !== selectedLanguage)[0] ?? '');
  };

  // --- Modifiers ---
  const [modifierDraft, setModifierDraft] = useState({
    label: '',
    statType: MAIN_STAT_TYPES[0] as string,
    type: 'Flat' as string,
    category: 'Permanent' as string,
    value: '0',
    priority: '0',
  });
  const { mutateAsync: addModifier, isPending: isAddingModifier } = useAddCharacterModifier();
  const { mutateAsync: deleteModifier, isPending: isDeletingModifier } = useDeleteCharacterModifier();

  const handleAddModifier = async () => {
    await addModifier({
      characterId,
      label: modifierDraft.label.trim() || undefined,
      statType: modifierDraft.statType as StatType,
      type: modifierDraft.type as ModifierType,
      category: modifierDraft.category as ModifierCategory,
      value: Number(modifierDraft.value),
      priority: Number(modifierDraft.priority),
    });
    toast.success(t.add);
    setModifierDraft({ label: '', statType: MAIN_STAT_TYPES[0], type: 'Flat', category: 'Permanent', value: '0', priority: '0' });
  };

  const handleDeleteModifier = async (modifierId: string) => {
    await deleteModifier({ id: characterId, modifierId });
    toast.success(t.delete);
  };

  // --- Items ---
  const [selectedItem, setSelectedItem] = useState<string>(items[0]?.id ?? '');
  const { mutateAsync: addItem, isPending: isAddingItem } = useAddCharacterItem();

  const handleAddItem = async () => {
    if (!selectedItem) return;
    await addItem({ id: characterId, itemId: selectedItem });
    toast.success(t.add);
  };

  // --- Translation ---
  const [translationDraft, setTranslationDraft] = useState({
    name: '',
    feats: '',
    backstory: '',
    personality: '',
  });
  const { mutateAsync: addTranslation, isPending: isAddingTranslation } = useAddCharacterTranslation();

  const handleAddTranslation = async () => {
    const payload = {
      id: characterId,
      name: translationDraft.name.trim() || undefined,
      feats: translationDraft.feats.trim() || undefined,
      backstory: translationDraft.backstory.trim() || undefined,
      personality: translationDraft.personality.trim() || undefined,
    };
    await addTranslation(payload);
    toast.success(t.add);
    setTranslationDraft({ name: '', feats: '', backstory: '', personality: '' });
  };

  const otherCharacters = allCharacters.filter((c: { id: string }) => c.id !== characterId);
  const personalModifiers = modifiers?.personalModifiers ?? [];

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{t.editModeButton}</h2>
        <button type="button" className={styles.exitButton} onClick={onExit}>
          {t.exitEditMode}
        </button>
      </div>

      {/* Traits & Features */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.traitsSection}</h3>
        <div className={`${styles.row} ${styles.fieldFull}`} style={{ flexDirection: 'column', gap: '12px' }}>
          <div className={styles.field} style={{ width: '100%' }}>
            <label className={styles.label}>{t.backstory}</label>
            <textarea
              className={styles.textarea}
              value={traits.backstory}
              onChange={e => setTraits(prev => ({ ...prev, backstory: e.target.value }))}
            />
          </div>
          <div className={styles.field} style={{ width: '100%' }}>
            <label className={styles.label}>{t.personality}</label>
            <textarea
              className={styles.textarea}
              value={traits.personality}
              onChange={e => setTraits(prev => ({ ...prev, personality: e.target.value }))}
            />
          </div>
          <div className={styles.field} style={{ width: '100%' }}>
            <label className={styles.label}>{t.feats}</label>
            <textarea
              className={styles.textarea}
              value={traits.feats}
              onChange={e => setTraits(prev => ({ ...prev, feats: e.target.value }))}
            />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>{t.heroicInspiration}</label>
              <input
                type="number"
                min={0}
                className={styles.input}
                value={traits.heroicInspirationCount}
                onChange={e => setTraits(prev => ({ ...prev, heroicInspirationCount: e.target.value }))}
              />
            </div>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSaveTraits}
              disabled={isSavingTraits}
            >
              {isSavingTraits ? t.saving : t.save}
            </button>
          </div>
        </div>
      </section>

      {/* Attributes */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.attributesSection}</h3>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t.background}</label>
            <select
              className={styles.select}
              value={selectedBackground}
              onChange={e => setSelectedBackground(e.target.value)}
            >
              {ALL_BACKGROUNDS.map(bg => (
                <option key={bg} value={bg}>
                  {t.backgroundLabels[bg as keyof typeof t.backgroundLabels]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSaveBackground}
            disabled={isSavingBackground}
          >
            {isSavingBackground ? t.saving : t.save}
          </button>
        </div>
        <hr className={styles.divider} />
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t.alignment}</label>
            <select
              className={styles.select}
              value={selectedAlignment}
              onChange={e => setSelectedAlignment(e.target.value)}
            >
              {ALL_ALIGNMENTS.map(al => (
                <option key={al} value={al}>
                  {t.alignmentLabels[al as keyof typeof t.alignmentLabels]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSaveAlignment}
            disabled={isSavingAlignment}
          >
            {isSavingAlignment ? t.saving : t.save}
          </button>
        </div>
      </section>

      {/* Relations */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.relationsSection}</h3>

        {/* Dynasty */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t.dynasty}</label>
            <select
              className={styles.select}
              value={selectedDynasty}
              onChange={e => setSelectedDynasty(e.target.value)}
            >
              <option value="">{t.selectPlaceholder}</option>
              {dynasties.map((d: { id: string; name?: string | null }) => (
                <option key={d.id} value={d.id}>{d.name ?? t.noValue}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSaveDynasty}
            disabled={isSavingDynasty || !selectedDynasty}
          >
            {isSavingDynasty ? t.saving : t.save}
          </button>
        </div>

        <hr className={styles.divider} />

        {/* Parents */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t.father}</label>
            <select
              className={styles.select}
              value={selectedFather}
              onChange={e => setSelectedFather(e.target.value)}
            >
              <option value="">{t.selectPlaceholder}</option>
              {otherCharacters.map((c: { id: string; name?: string | null }) => (
                <option key={c.id} value={c.id}>{c.name ?? t.noValue}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t.mother}</label>
            <select
              className={styles.select}
              value={selectedMother}
              onChange={e => setSelectedMother(e.target.value)}
            >
              <option value="">{t.selectPlaceholder}</option>
              {otherCharacters.map((c: { id: string; name?: string | null }) => (
                <option key={c.id} value={c.id}>{c.name ?? t.noValue}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSaveParents}
            disabled={isSavingParents}
          >
            {isSavingParents ? t.saving : t.save}
          </button>
        </div>

        <hr className={styles.divider} />

        {/* Hometown */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t.hometown}</label>
            <select
              className={styles.select}
              value={selectedHometown}
              onChange={e => setSelectedHometown(e.target.value)}
            >
              <option value="">{t.selectPlaceholder}</option>
              {settlements.map((s: { id: string; title?: string | null }) => (
                <option key={s.id} value={s.id}>{s.title ?? t.noValue}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSaveHometown}
            disabled={isSavingHometown || !selectedHometown}
          >
            {isSavingHometown ? t.saving : t.save}
          </button>
        </div>
      </section>

      {/* Progression */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.progressionSection}</h3>

        {/* Level Up */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t.levelsToAdd}</label>
            <input
              type="number"
              min={1}
              max={20}
              className={styles.input}
              value={levelsToAdd}
              onChange={e => setLevelsToAdd(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={styles.addButton}
            onClick={handleLevelUp}
            disabled={isLevelingUp}
          >
            {isLevelingUp ? t.adding : t.levelUp}
          </button>
        </div>

        <hr className={styles.divider} />

        {/* Add Skill */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t.skill}</label>
            <select
              className={styles.select}
              value={selectedSkill}
              onChange={e => setSelectedSkill(e.target.value)}
              disabled={availableSkills.length === 0}
            >
              {availableSkills.length === 0 ? (
                <option value="">{t.noValue}</option>
              ) : (
                availableSkills.map(sk => (
                  <option key={sk} value={sk}>
                    {t.skillNames[sk as keyof typeof t.skillNames]}
                  </option>
                ))
              )}
            </select>
          </div>
          <button
            type="button"
            className={styles.addButton}
            onClick={handleAddSkill}
            disabled={isAddingSkill || availableSkills.length === 0 || !selectedSkill}
          >
            {isAddingSkill ? t.adding : t.addSkill}
          </button>
        </div>

        <hr className={styles.divider} />

        {/* Add Language */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t.language}</label>
            <select
              className={styles.select}
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              disabled={availableLanguages.length === 0}
            >
              {availableLanguages.length === 0 ? (
                <option value="">{t.noValue}</option>
              ) : (
                availableLanguages.map(lang => (
                  <option key={lang} value={lang}>
                    {t.languageNames[lang as keyof typeof t.languageNames]}
                  </option>
                ))
              )}
            </select>
          </div>
          <button
            type="button"
            className={styles.addButton}
            onClick={handleAddLanguage}
            disabled={isAddingLanguage || availableLanguages.length === 0 || !selectedLanguage}
          >
            {isAddingLanguage ? t.adding : t.addLanguage}
          </button>
        </div>
      </section>

      {/* Modifiers */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.modifiersSection}</h3>

        {/* Existing personal modifiers */}
        <p className={styles.subsectionTitle}>{t.personalModifiers}</p>
        {personalModifiers.length === 0 ? (
          <p className={styles.emptyNote}>{t.noModifiers}</p>
        ) : (
          <div className={styles.modifierList}>
            {personalModifiers.map(mod => (
              <div key={mod.id} className={styles.modifierItem}>
                <div className={styles.modifierInfo}>
                  <span className={styles.modifierName}>{mod.label ?? t.noValue}</span>
                  <span className={styles.modifierMeta}>
                    {mod.statType} · {mod.type} · {mod.category} · {mod.value >= 0 ? '+' : ''}{mod.value}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleDeleteModifier(mod.id)}
                  disabled={isDeletingModifier}
                >
                  {t.delete}
                </button>
              </div>
            ))}
          </div>
        )}

        <hr className={styles.divider} />

        {/* Add new modifier */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t.label}</label>
            <input
              type="text"
              className={styles.input}
              value={modifierDraft.label}
              onChange={e => setModifierDraft(prev => ({ ...prev, label: e.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t.statType}</label>
            <select
              className={styles.select}
              value={modifierDraft.statType}
              onChange={e => setModifierDraft(prev => ({ ...prev, statType: e.target.value }))}
            >
              {MAIN_STAT_TYPES.map(st => (
                <option key={st} value={st}>
                  {t.statTypeLabels[st as keyof typeof t.statTypeLabels] ?? st}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t.modifierType}</label>
            <select
              className={styles.select}
              value={modifierDraft.type}
              onChange={e => setModifierDraft(prev => ({ ...prev, type: e.target.value }))}
            >
              {MODIFIER_TYPES.map(mt => (
                <option key={mt} value={mt}>
                  {t.modifierTypeLabels[mt as keyof typeof t.modifierTypeLabels]}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t.modifierCategory}</label>
            <select
              className={styles.select}
              value={modifierDraft.category}
              onChange={e => setModifierDraft(prev => ({ ...prev, category: e.target.value }))}
            >
              {MODIFIER_CATEGORIES.map(mc => (
                <option key={mc} value={mc}>
                  {t.modifierCategoryLabels[mc as keyof typeof t.modifierCategoryLabels]}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field} style={{ maxWidth: '100px' }}>
            <label className={styles.label}>{t.value}</label>
            <input
              type="number"
              step="any"
              className={styles.input}
              value={modifierDraft.value}
              onChange={e => setModifierDraft(prev => ({ ...prev, value: e.target.value }))}
            />
          </div>
          <div className={styles.field} style={{ maxWidth: '100px' }}>
            <label className={styles.label}>{t.priority}</label>
            <input
              type="number"
              min={0}
              className={styles.input}
              value={modifierDraft.priority}
              onChange={e => setModifierDraft(prev => ({ ...prev, priority: e.target.value }))}
            />
          </div>
          <button
            type="button"
            className={styles.addButton}
            onClick={handleAddModifier}
            disabled={isAddingModifier}
          >
            {isAddingModifier ? t.adding : t.add}
          </button>
        </div>
      </section>

      {/* Items */}
      {items.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{t.itemsSection}</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>{t.item}</label>
              <select
                className={styles.select}
                value={selectedItem}
                onChange={e => setSelectedItem(e.target.value)}
              >
                <option value="">{t.selectPlaceholder}</option>
                {items.map((item: { id: string; name?: string | null }) => (
                  <option key={item.id} value={item.id}>{item.name ?? t.noValue}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddItem}
              disabled={isAddingItem || !selectedItem}
            >
              {isAddingItem ? t.adding : t.addItem}
            </button>
          </div>
        </section>
      )}

      {/* Translation */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.translationSection}</h3>
        <div className={styles.field}>
          <label className={styles.label}>{t.translatedName}</label>
          <input
            type="text"
            className={styles.input}
            value={translationDraft.name}
            onChange={e => setTranslationDraft(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t.translatedFeats}</label>
          <textarea
            className={styles.textarea}
            value={translationDraft.feats}
            onChange={e => setTranslationDraft(prev => ({ ...prev, feats: e.target.value }))}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t.translatedBackstory}</label>
          <textarea
            className={styles.textarea}
            value={translationDraft.backstory}
            onChange={e => setTranslationDraft(prev => ({ ...prev, backstory: e.target.value }))}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t.translatedPersonality}</label>
          <textarea
            className={styles.textarea}
            value={translationDraft.personality}
            onChange={e => setTranslationDraft(prev => ({ ...prev, personality: e.target.value }))}
          />
        </div>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.addButton}
            onClick={handleAddTranslation}
            disabled={isAddingTranslation}
          >
            {isAddingTranslation ? t.adding : t.addTranslation}
          </button>
        </div>
      </section>
    </div>
  );
}
