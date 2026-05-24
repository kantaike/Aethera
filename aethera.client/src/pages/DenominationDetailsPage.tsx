import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import { useDenomination, useDenominationRelations, useDenominations } from '../hooks/useDenominations';
import { translations, useLanguage } from '../i18n/translations';
import type { DenominationRelation } from '../api/types/types';
import styles from './Styles/DenominationDetailsPage.module.css';

const clampRelationValue = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(-100, Math.min(100, value));
};

const getRelationTier = (value: number, language: 'uk' | 'en') => {
  if (value <= -75) return language === 'uk' ? 'Закляті вороги' : 'Sworn enemies';
  if (value <= -40) return language === 'uk' ? 'Відкрита ворожнеча' : 'Hostile';
  if (value <= -10) return language === 'uk' ? 'Напружені' : 'Tense';
  if (value < 10) return language === 'uk' ? 'Нейтральні' : 'Neutral';
  if (value < 40) return language === 'uk' ? 'Обережна співпраця' : 'Cautious cooperation';
  if (value < 75) return language === 'uk' ? 'Союзники' : 'Allies';
  return language === 'uk' ? 'Непорушний союз' : 'Unshakable alliance';
};

const getRelationToneClass = (value: number) => {
  if (value <= -40) return styles.relationNegative;
  if (value < 10) return styles.relationNeutral;
  return styles.relationPositive;
};

export function DenominationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const language = useLanguage();
  const t = translations.pages.denominations[language];
  const detailsT = translations.pages.entityDetails[language];
  const { data: denomination, isLoading, isError } = useDenomination(id);
  const { data: allDenominations = [] } = useDenominations();
  const { data: relations = [], isLoading: relationsLoading } = useDenominationRelations(id);

  const denominationNameById = useMemo(() => {
    const mapping = new Map<string, string>();

    allDenominations.forEach((candidate) => {
      if (typeof candidate.id === 'string') {
        mapping.set(candidate.id, candidate.name ?? candidate.id);
      }
    });

    return mapping;
  }, [allDenominations]);

  const formattedRelations = useMemo(() => {
    const currentId = denomination?.id;
    if (!currentId) return [];

    const relationByOtherId = new Map<string, DenominationRelation & { sourceId: string; targetId: string }>();

    relations
      .filter(
        (relation): relation is DenominationRelation & { sourceId: string; targetId: string } =>
          typeof relation.sourceId === 'string' && typeof relation.targetId === 'string'
      )
      .forEach((relation) => {
        const otherId = relation.sourceId === currentId ? relation.targetId : relation.sourceId;
        relationByOtherId.set(otherId, relation);
      });

    return allDenominations
      .filter((candidate): candidate is typeof candidate & { id: string } => typeof candidate.id === 'string' && candidate.id !== currentId)
      .map((candidate) => {
        const relation = relationByOtherId.get(candidate.id);
        const relationValue = clampRelationValue(relation?.value);

        return {
          id: `${currentId}-${candidate.id}`,
          otherName: denominationNameById.get(candidate.id) ?? candidate.id,
          value: relationValue,
          tier: getRelationTier(relationValue, language),
          context: relation?.context,
        };
      })
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [allDenominations, denomination?.id, denominationNameById, language, relations]);

  if (isLoading) {
    return <FantasyLoader fullScreen />;
  }

  if (isError || !denomination) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.errorState}>{detailsT.denominationNotFound}</div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <Link className={styles.backLink} to="/denominations">
            {language === 'uk' ? '← До конфесій' : '← Back to denominations'}
          </Link>
          <h1 className={styles.mainTitle}>{denomination.name ?? t.title}</h1>
          <p className={styles.subtitle}>{denomination.description ?? detailsT.noDescription}</p>
        </div>

        <div className={styles.heroMeta}>
          <span className={styles.badge}>{denomination.religion ?? 'Unknown'}</span>
        </div>
      </header>

      <section className={styles.infoGrid}>
        <article className={styles.infoCard}>
          <h2 className={styles.sectionTitle}>{t.detailsLabel}</h2>
          <dl className={styles.definitionList}>
            <div>
              <dt>{t.religion}</dt>
              <dd>{denomination.religion ?? 'Unknown'}</dd>
            </div>
            <div>
              <dt>{t.leader}</dt>
              <dd>{denomination.leaderId ?? detailsT.noValue}</dd>
            </div>
            <div>
              <dt>{t.tenets}</dt>
              <dd>{denomination.tenets ?? detailsT.noDescription}</dd>
            </div>
            <div>
              <dt>{t.appearance}</dt>
              <dd>{denomination.appearance ?? detailsT.noDescription}</dd>
            </div>
          </dl>
        </article>

        <article className={styles.infoCard}>
          <h2 className={styles.sectionTitle}>{t.relations}</h2>
          {relationsLoading ? (
            <p className={styles.emptyState}>{t.loadingRelations}</p>
          ) : formattedRelations.length === 0 ? (
            <p className={styles.emptyState}>
              {language === 'uk'
                ? 'Для цієї конфесії поки немає зафіксованих відносин.'
                : 'No relations are recorded for this denomination yet.'}
            </p>
          ) : (
            <div className={styles.relationList}>
              {formattedRelations.map((relation) => (
                <article key={relation.id} className={styles.relationRow}>
                  <div className={styles.relationMain}>
                    <h3 className={styles.relationTarget}>{relation.otherName}</h3>
                    <p className={styles.relationMeta}>{relation.tier}</p>
                    {relation.context ? <p className={styles.relationContext}>{relation.context}</p> : null}
                  </div>
                  <span className={`${styles.relationValue} ${getRelationToneClass(relation.value)}`}>
                    {relation.value > 0 ? `+${relation.value}` : relation.value}
                  </span>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default DenominationDetailsPage;