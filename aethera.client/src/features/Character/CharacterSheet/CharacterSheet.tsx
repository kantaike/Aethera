import { useState } from 'react';
import styles from './CharacterSheet.module.css';
import { FamilyTree } from '../Family/FamilyTree';
import type { CharacterDetail, CharacterModifiers, Modifier } from '../../../api/types/types';
import RadarStats from '../CharacterStats/RadarStats';
import { renderTextWithLinks } from '../../../components/TextLinks';
import { translations, useLanguage } from '../../../i18n/translations';

const SKILL_TO_ABILITY = {
  Acrobatics: 'Dexterity',
  AnimalHandling: 'Wisdom',
  Arcana: 'Intelligence',
  Athletics: 'Strength',
  Deception: 'Charisma',
  History: 'Intelligence',
  Insight: 'Wisdom',
  Intimidation: 'Charisma',
  Investigation: 'Intelligence',
  Medicine: 'Wisdom',
  Nature: 'Intelligence',
  Perception: 'Wisdom',
  Performance: 'Charisma',
  Persuasion: 'Charisma',
  Religion: 'Intelligence',
  SleightOfHand: 'Dexterity',
  Stealth: 'Dexterity',
  Survival: 'Wisdom',
} as const;

type SkillStatType = keyof typeof SKILL_TO_ABILITY;

const SKILL_ORDER = Object.keys(SKILL_TO_ABILITY) as SkillStatType[];

const formatAlignment = (align: string | null | undefined) => {
  if (!align) return '—';
  return align.replace(/([A-Z])/g, ' $1').trim();
};

export const CharacterSheet = ({ character, modifiers }: { character: CharacterDetail; modifiers?: CharacterModifiers }) => {
  const language = useLanguage();
  const t = translations.features.characterSheet[language];
  const [activeTab, setActiveTab] = useState<'biography' | 'stats'>('biography');

  const getAlignmentGlow = (align: string) => {
    if (align?.includes('Good')) return 'rgba(212, 175, 55, 0.3)';
    if (align?.includes('Evil')) return 'rgba(139, 0, 0, 0.4)';
    return 'rgba(88, 166, 255, 0.2)';
  };

  const hpPercent =
    character.hp?.max && character.hp.max > 0
      ? ((character.hp?.current ?? 0) / character.hp.max) * 100
      : 0;
  const tempHpPercent =
    character.hp?.temp && character.hp.temp > 0 && character.hp?.max && character.hp.max > 0
      ? (character.hp.temp / character.hp.max) * 100
      : 0;
  const tempHpLeft = hpPercent; /* temp HP bar starts after main HP */

  const relatives = (character.relatives || []).map((r) => ({
    ...r,
    id: r.id ?? '',
    role: r.role ?? '',
    fatherId: r.fatherId ?? '',
    motherId: r.motherId ?? '',
  }));

  const statBreakdown = modifiers?.statBreakdown ?? {};

  const getFinalValue = (statKey: string, fallback: number | null | undefined) => {
    const finalValue = statBreakdown[statKey]?.finalValue;
    if (typeof finalValue === 'number') {
      return finalValue;
    }

    return fallback;
  };

  const formatValue = (value: number | null | undefined) => {
    if (value == null) {
      return '—';
    }

    if (Number.isInteger(value)) {
      return String(value);
    }

    return value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  };

  const toOptionalNumber = (value: number | null | undefined): number | undefined => {
    return value == null ? undefined : value;
  };

  const formatSignedValue = (value: number) => {
    return `${value >= 0 ? '+' : ''}${formatValue(value)}`;
  };

  const getCategoryLabel = (category: string | null | undefined) => {
    if (!category) {
      return '';
    }

    if (category in t.statTooltip.categories) {
      return t.statTooltip.categories[category as keyof typeof t.statTooltip.categories];
    }

    return category;
  };

  const renderStatValueWithTooltip = (
    statType: string,
    label: string,
    fallbackValue: number | null | undefined,
    suffix = '',
    prefix = '',
    signed = false,
    ignoreBreakdown = false,
  ) => {
    const breakdown = ignoreBreakdown ? undefined : statBreakdown[statType];
    const baseValue = typeof breakdown?.baseValue === 'number' ? breakdown.baseValue : fallbackValue;
    const finalValue = typeof breakdown?.finalValue === 'number' ? breakdown.finalValue : fallbackValue;
    const modifiersList = (breakdown?.modifiers ?? []) as Modifier[];

    const valueText =
      finalValue == null
        ? '—'
        : signed
          ? formatSignedValue(finalValue)
          : `${prefix}${formatValue(finalValue)}${suffix}`;

    const formatTooltipValue = (value: number | null | undefined) => {
      if (value == null) {
        return '—';
      }

      return signed ? formatSignedValue(value) : formatValue(value);
    };

    return (
      <span className={styles.valueTooltipTrigger}>
        {valueText}
        <span className={styles.valueTooltipPanel} role="tooltip">
          <span className={styles.valueTooltipTitle}>{label}</span>

          <span className={styles.valueTooltipLine}>
            <span>{t.statTooltip.base}</span>
            <span>{formatTooltipValue(baseValue)}</span>
          </span>
          <span className={styles.valueTooltipLine}>
            <span>{t.statTooltip.final}</span>
            <span>{formatTooltipValue(finalValue)}</span>
          </span>

          <span className={styles.valueTooltipSection}>{t.statTooltip.modifiers}</span>

          {modifiersList.length === 0 && (
            <span className={styles.valueTooltipEmpty}>{t.statTooltip.noModifiers}</span>
          )}

          {modifiersList.map((modifier) => {
            const categoryLabel = getCategoryLabel(modifier.category);
            return (
              <span key={modifier.id ?? `${statType}-${modifier.label ?? 'modifier'}-${modifier.priority ?? 0}`} className={styles.valueTooltipModifierRow}>
                <span className={styles.valueTooltipModifierName}>
                  {modifier.label ?? t.statTooltip.unnamedModifier}
                  {categoryLabel ? ` (${categoryLabel})` : ''}
                </span>
                <span className={styles.valueTooltipModifierValue}>{formatSignedValue(modifier.value ?? 0)}</span>
              </span>
            );
          })}
        </span>
      </span>
    );
  };

  const getAbilityScore = (ability: string) => {
    switch (ability) {
      case 'Strength':
        return getFinalValue('Strength', character.strengthScore?.score);
      case 'Dexterity':
        return getFinalValue('Dexterity', character.dexterityScore?.score);
      case 'Constitution':
        return getFinalValue('Constitution', character.constitutionScore?.score);
      case 'Intelligence':
        return getFinalValue('Intelligence', character.intelligenceScore?.score);
      case 'Wisdom':
        return getFinalValue('Wisdom', character.wisdomScore?.score);
      case 'Charisma':
        return getFinalValue('Charisma', character.charismaScore?.score);
      default:
        return undefined;
    }
  };

  const getAbilityModifier = (score: number | null | undefined) => {
    if (score == null) {
      return 0;
    }

    return Math.floor((score - 10) / 2);
  };

  const getAbilityShortLabel = (ability: string) => {
    switch (ability) {
      case 'Strength':
        return t.statAbbreviations.str;
      case 'Dexterity':
        return t.statAbbreviations.dex;
      case 'Constitution':
        return t.statAbbreviations.con;
      case 'Intelligence':
        return t.statAbbreviations.int;
      case 'Wisdom':
        return t.statAbbreviations.wis;
      case 'Charisma':
        return t.statAbbreviations.cha;
      default:
        return ability;
    }
  };

  const proficiencyBonusFromDetail = character.proficiencyBonus;
  const proficiencyBonusFromBreakdown = statBreakdown.ProficiencyBonus?.finalValue;
  const proficiencyBonusFromLevel =
    typeof character.level === 'number' && character.level > 0
      ? Math.floor((character.level - 1) / 4) + 2
      : undefined;
  const proficiencyBonus =
    proficiencyBonusFromDetail ??
    (typeof proficiencyBonusFromBreakdown === 'number' ? proficiencyBonusFromBreakdown : undefined) ??
    proficiencyBonusFromLevel ??
    0;
  const proficientSkills = new Set((character.skillProficiencies ?? []).map((skill) => String(skill)));

  const skillRows = SKILL_ORDER.map((skill) => {
    const ability = SKILL_TO_ABILITY[skill];
    const abilityScore = getAbilityScore(ability);
    const baseModifier = getAbilityModifier(abilityScore);
    const isProficient = proficientSkills.has(skill);
    const finalModifier = baseModifier + (isProficient ? proficiencyBonus : 0);

    return {
      skill,
      ability,
      abilityLabel: getAbilityShortLabel(ability),
      isProficient,
      finalModifier,
    };
  });

  return (
    <div
      className={styles.sheetWrapper}
      style={{ '--glow-color': getAlignmentGlow(character.alignment || '') } as React.CSSProperties}
    >
      {/* --- HEADER --- */}
      <header className={styles.header}>
        <div className={styles.portraitContainer}>
          <img
            src={character.art?.filePath || ''}
            className={styles.mainArt}
            alt={character.name ?? ''}
          />
          <div className={styles.alignmentGlow} />
        </div>

        <div className={styles.heroSummary}>
          <h1 className={styles.heroName}>{character.name}</h1>
          <div className={styles.tags}>
            <span>{character.species ?? '—'}</span>
            <span>
              {character.characterClass ?? '—'} • {t.level} {character.level ?? 0}
            </span>
            {character.size && <span>{character.size}</span>}
            {character.alignment && (
              <span>{formatAlignment(character.alignment)}</span>
            )}
          </div>

          <div className={styles.vitalityBar}>
            <div className={styles.hpLabel}>
              {t.hp} {character.hp?.current ?? 0} / {character.hp?.max ?? 0}
              {character.hp?.temp && character.hp.temp > 0 && (
                <span className={styles.tempHp}> +{character.hp.temp} {t.temp}</span>
              )}
            </div>
            <div className={styles.hpTrack}>
              <div
                className={styles.hpFill}
                style={{ width: `${hpPercent}%` }}
              />
              {tempHpPercent > 0 && (
                <div
                  className={styles.hpTemp}
                  style={{
                    left: `${tempHpLeft}%`,
                    width: `${tempHpPercent}%`,
                  }}
                />
              )}
            </div>
          </div>
        </div>

      </header>

      {/* --- TABS --- */}
      <div className={styles.tabsSection}>
        <div className={styles.tabButtons}>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'biography' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('biography')}
          >
            {t.biographyTab}
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'stats' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            {t.statsTab}
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'biography' && (
            <div className={styles.biographyTab}>
              {(character.backstory || character.personality) && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t.backstoryAndPersonality}</h3>
                  {character.backstory && (
                    <div className={styles.bioBlock}>
                      <h4 className={styles.bioSubtitle}>{t.backstory}</h4>
                      <div className={styles.backstoryText}>
                        {renderTextWithLinks(character.backstory)}
                      </div>
                    </div>
                  )}
                  {character.personality && (
                    <div className={styles.bioBlock}>
                      <h4 className={styles.bioSubtitle}>{t.personality}</h4>
                      <div className={styles.backstoryText}>
                        {renderTextWithLinks(character.personality)}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {relatives.length > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t.family}</h3>
                  <FamilyTree character={character} relatives={relatives} />
                </section>
              )}

              {!character.backstory && !character.personality && relatives.length === 0 && (
                <p className={styles.emptyBio}>{t.emptyBio}</p>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className={styles.statsTab}>
              <div className={styles.statsLayout}>
                <div className={styles.radarSection}>
                  <h3 className={styles.sectionTitle}>{t.abilityScores}</h3>
                  <RadarStats
                    stats={{
                      str: toOptionalNumber(getFinalValue('Strength', character.strengthScore?.score)),
                      dex: toOptionalNumber(getFinalValue('Dexterity', character.dexterityScore?.score)),
                      con: toOptionalNumber(getFinalValue('Constitution', character.constitutionScore?.score)),
                      int: toOptionalNumber(getFinalValue('Intelligence', character.intelligenceScore?.score)),
                      wis: toOptionalNumber(getFinalValue('Wisdom', character.wisdomScore?.score)),
                      cha: toOptionalNumber(getFinalValue('Charisma', character.charismaScore?.score)),
                    }}
                    breakdown={statBreakdown}
                    labels={t.statAbbreviations}
                    tooltipText={t.statTooltip}
                  />
                </div>

                <div className={styles.otherStats}>
                  <section className={styles.statBlock}>
                    <h4 className={styles.smallTitle}>{t.combat}</h4>
                    <div className={styles.statGrid}>
                      <div className={styles.statRow}>
                        <span>{t.proficiencyBonus}</span>
                        {renderStatValueWithTooltip('ProficiencyBonus', t.proficiencyBonus, proficiencyBonus, '', '', false, true)}
                      </div>
                      <div className={styles.statRow}>
                        <span>{t.armorClass}</span>
                        {renderStatValueWithTooltip('ArmorClass', t.armorClass, character.armorClass)}
                      </div>
                      <div className={styles.statRow}>
                        <span>{t.initiative}</span>
                        {renderStatValueWithTooltip('Initiative', t.initiative, character.initiative)}
                      </div>
                      <div className={styles.statRow}>
                        <span>{t.speed}</span>
                        {renderStatValueWithTooltip('Speed', t.speed, character.speed, ' ft')}
                      </div>
                      <div className={styles.statRow}>
                        <span>{t.passivePerception}</span>
                        {renderStatValueWithTooltip('PassivePerception', t.passivePerception, character.passivePerception)}
                      </div>
                    </div>
                  </section>

                  <section className={styles.statBlock}>
                    <h4 className={styles.smallTitle}>{t.hitPoints}</h4>
                    <div className={styles.statGrid}>
                      <div className={styles.statRow}>
                        <span>{t.currentMax}</span>
                        <span>
                          {character.hp?.current ?? '—'} / {renderStatValueWithTooltip('HitPoints', t.hitPoints, character.hp?.max)}
                        </span>
                      </div>
                      {character.hp?.temp != null && character.hp.temp > 0 && (
                        <div className={styles.statRow}>
                          <span>{t.tempHp}</span>
                          <span>{character.hp.temp}</span>
                        </div>
                      )}
                      {character.hitDice?.sides != null && (
                        <div className={styles.statRow}>
                          <span>{t.hitDice}</span>
                          {renderStatValueWithTooltip('HitDice', t.hitDice, character.hitDice.sides, '', 'd')}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className={styles.statBlock}>
                    <h4 className={styles.smallTitle}>{t.deathSaves}</h4>
                    <div className={styles.statGrid}>
                      <div className={styles.statRow}>
                        <span>{t.successes}</span>
                        <span>{character.deathSaveSuccesses ?? '—'}</span>
                      </div>
                      <div className={styles.statRow}>
                        <span>{t.failures}</span>
                        <span>{character.deathSaveFailures ?? '—'}</span>
                      </div>
                    </div>
                  </section>

                  {(character.experiencePoints != null || character.heroicInspirationCount != null) && (
                    <section className={styles.statBlock}>
                      <h4 className={styles.smallTitle}>{t.other}</h4>
                      <div className={styles.statGrid}>
                        {character.experiencePoints != null && (
                          <div className={styles.statRow}>
                            <span>{t.experiencePoints}</span>
                            <span>{character.experiencePoints}</span>
                          </div>
                        )}
                        {character.heroicInspirationCount != null && character.heroicInspirationCount > 0 && (
                          <div className={styles.statRow}>
                            <span>{t.heroicInspiration}</span>
                            <span>{character.heroicInspirationCount}</span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t.skillProficiencies}</h3>
                <p className={styles.skillHint}>{t.skillTable.proficiencyHint}</p>
                <div className={styles.skillTable}>
                  <div className={`${styles.skillTableRow} ${styles.skillTableHeader}`}>
                    <span>{t.skillTable.headers.skill}</span>
                    <span>{t.skillTable.headers.ability}</span>
                    <span>{t.skillTable.headers.modifier}</span>
                  </div>

                  {skillRows.map((row) => (
                    <div
                      key={row.skill}
                      className={`${styles.skillTableRow} ${row.isProficient ? styles.skillRowProficient : ''}`}
                    >
                      <span className={styles.skillCellName}>
                        <span className={styles.skillName}>{t.skillTable.skillNames[row.skill]}</span>
                        {row.isProficient && (
                          <span className={styles.skillProficientBadge}>{t.skillTable.proficientTag}</span>
                        )}
                      </span>

                      <span className={styles.skillCellAbility}>{row.abilityLabel}</span>

                      <span className={styles.skillCellModifier}>
                        {renderStatValueWithTooltip(
                          row.skill,
                          t.skillTable.skillNames[row.skill],
                          row.finalModifier,
                          '',
                          '',
                          true,
                          true,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {(character.languageProficiencies?.length ?? 0) > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t.languages}</h3>
                  <div className={styles.skillList}>
                    {character.languageProficiencies?.map((lang) => (
                      <div key={String(lang)} className={styles.skillItem}>
                        <span className={styles.skillDot} /> {String(lang)}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {character.feats && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t.feats}</h3>
                  <div className={styles.backstoryText}>{character.feats}</div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
