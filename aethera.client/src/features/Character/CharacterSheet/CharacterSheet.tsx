import { useState } from 'react';
import styles from './CharacterSheet.module.css';
import { FamilyTree } from '../Family/FamilyTree';
import type { CharacterDetail } from '../../../api/types/types';
import RadarStats from '../CharacterStats/RadarStats';
import { renderTextWithLinks } from '../../../components/TextLinks';

const formatAlignment = (align: string | null | undefined) => {
  if (!align) return '—';
  return align.replace(/([A-Z])/g, ' $1').trim();
};

export const CharacterSheet = ({ character }: { character: CharacterDetail }) => {
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
              {character.characterClass ?? '—'} • Level {character.level ?? 0}
            </span>
            {character.size && <span>{character.size}</span>}
            {character.alignment && (
              <span>{formatAlignment(character.alignment)}</span>
            )}
          </div>

          <div className={styles.vitalityBar}>
            <div className={styles.hpLabel}>
              HP {character.hp?.current ?? 0} / {character.hp?.max ?? 0}
              {character.hp?.temp && character.hp.temp > 0 && (
                <span className={styles.tempHp}> +{character.hp.temp} temp</span>
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

        <div className={styles.combatCircleGrid}>
          <div className={styles.combatStat}>
            <span>AC</span>
            <strong>{character.armorClass ?? '—'}</strong>
          </div>
          <div className={styles.combatStat}>
            <span>INIT</span>
            <strong>{character.initiative ?? '—'}</strong>
          </div>
          <div className={styles.combatStat}>
            <span>SPD</span>
            <strong>{character.speed ?? '—'}</strong>
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
            Biography
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'stats' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            D&D Stats
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'biography' && (
            <div className={styles.biographyTab}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Family</h3>
                <FamilyTree character={character} relatives={relatives} />
              </section>

              {(character.backstory || character.personality) && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Backstory & Personality</h3>
                  {character.backstory && (
                    <div className={styles.bioBlock}>
                      <h4 className={styles.bioSubtitle}>Backstory</h4>
                      <div className={styles.backstoryText}>
                        {renderTextWithLinks(character.backstory)}
                      </div>
                    </div>
                  )}
                  {character.personality && (
                    <div className={styles.bioBlock}>
                      <h4 className={styles.bioSubtitle}>Personality</h4>
                      <div className={styles.backstoryText}>
                        {renderTextWithLinks(character.personality)}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {!character.backstory && !character.personality && relatives.length === 0 && (
                <p className={styles.emptyBio}>No biographical information available.</p>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className={styles.statsTab}>
              <div className={styles.statsLayout}>
                <div className={styles.radarSection}>
                  <h3 className={styles.sectionTitle}>Ability Scores</h3>
                  <RadarStats
                    stats={{
                      str: character.strengthScore?.score,
                      dex: character.dexterityScore?.score,
                      con: character.constitutionScore?.score,
                      int: character.intelligenceScore?.score,
                      wis: character.wisdomScore?.score,
                      cha: character.charismaScore?.score,
                    }}
                  />
                </div>

                <div className={styles.otherStats}>
                  <section className={styles.statBlock}>
                    <h4 className={styles.smallTitle}>Combat</h4>
                    <div className={styles.statGrid}>
                      <div className={styles.statRow}>
                        <span>Proficiency Bonus</span>
                        <span>{character.proficiencyBonus ?? '—'}</span>
                      </div>
                      <div className={styles.statRow}>
                        <span>Armor Class</span>
                        <span>{character.armorClass ?? '—'}</span>
                      </div>
                      <div className={styles.statRow}>
                        <span>Initiative</span>
                        <span>{character.initiative ?? '—'}</span>
                      </div>
                      <div className={styles.statRow}>
                        <span>Speed</span>
                        <span>{character.speed ?? '—'} ft</span>
                      </div>
                      <div className={styles.statRow}>
                        <span>Passive Perception</span>
                        <span>{character.passivePerception ?? '—'}</span>
                      </div>
                    </div>
                  </section>

                  <section className={styles.statBlock}>
                    <h4 className={styles.smallTitle}>Hit Points</h4>
                    <div className={styles.statGrid}>
                      <div className={styles.statRow}>
                        <span>Current / Max</span>
                        <span>
                          {character.hp?.current ?? '—'} / {character.hp?.max ?? '—'}
                        </span>
                      </div>
                      {character.hp?.temp != null && character.hp.temp > 0 && (
                        <div className={styles.statRow}>
                          <span>Temp HP</span>
                          <span>{character.hp.temp}</span>
                        </div>
                      )}
                      {character.hitDice?.sides != null && (
                        <div className={styles.statRow}>
                          <span>Hit Dice</span>
                          <span>d{character.hitDice.sides}</span>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className={styles.statBlock}>
                    <h4 className={styles.smallTitle}>Death Saves</h4>
                    <div className={styles.statGrid}>
                      <div className={styles.statRow}>
                        <span>Successes</span>
                        <span>{character.deathSaveSuccesses ?? '—'}</span>
                      </div>
                      <div className={styles.statRow}>
                        <span>Failures</span>
                        <span>{character.deathSaveFailures ?? '—'}</span>
                      </div>
                    </div>
                  </section>

                  {(character.experiencePoints != null || character.heroicInspirationCount != null) && (
                    <section className={styles.statBlock}>
                      <h4 className={styles.smallTitle}>Other</h4>
                      <div className={styles.statGrid}>
                        {character.experiencePoints != null && (
                          <div className={styles.statRow}>
                            <span>Experience Points</span>
                            <span>{character.experiencePoints}</span>
                          </div>
                        )}
                        {character.heroicInspirationCount != null && character.heroicInspirationCount > 0 && (
                          <div className={styles.statRow}>
                            <span>Heroic Inspiration</span>
                            <span>{character.heroicInspirationCount}</span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {(character.skillProficiencies?.length ?? 0) > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Skill Proficiencies</h3>
                  <div className={styles.skillList}>
                    {character.skillProficiencies?.map((skill) => (
                      <div key={String(skill)} className={styles.skillItem}>
                        <span className={styles.skillDot} /> {String(skill)}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(character.languageProficiencies?.length ?? 0) > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Languages</h3>
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
                  <h3 className={styles.sectionTitle}>Feats</h3>
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
