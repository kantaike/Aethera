import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import DenominationGraph from '../features/Denominations/DenominationGraph';
import { useDenominationRelations, useDenominations } from '../hooks/useDenominations';
import type { Denomination, DenominationRelation } from '../api/types/types';
import { translations, useLanguage } from '../i18n/translations';
import styles from './Styles/DenominationsPage.module.css';

const normalizeText = (value: string | null | undefined, fallback: string) => {
  const next = value?.trim();
  if (!next || next.toLowerCase() === 'string') {
    return fallback;
  }
  return next;
};

const getDenominationSummary = (denomination: Denomination, language: 'uk' | 'en') => {
  const tenets = normalizeText(denomination.tenets, '');
  if (tenets) return tenets;

  const description = normalizeText(denomination.description, '');
  if (description) return description;

  const appearance = normalizeText(denomination.appearance, '');
  if (appearance) return appearance;

  return language === 'uk' ? 'Принципи ще не вказані.' : 'Tenets are not specified yet.';
};

type DenominationGraphNodeView = Denomination & {
  id: string;
  entityId?: string | null;
};

export function DenominationsPage() {
  const language = useLanguage();
  const t = translations.pages.denominations[language];
  const { data: denominations = [], isLoading } = useDenominations();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredDenominations = denominations;

  const graphNodes = useMemo<DenominationGraphNodeView[]>(() => {
    return filteredDenominations.map((denomination, index) => {
      const entityId = typeof denomination.id === 'string' ? denomination.id : null;

      return {
        ...denomination,
        id: entityId ?? `virtual-${index}-${denomination.religion ?? 'Unknown'}`,
        entityId,
        name: normalizeText(denomination.name, 'Unnamed denomination'),
        description: normalizeText(denomination.description, 'No description yet'),
      };
    });
  }, [filteredDenominations]);

  useEffect(() => {
    if (selectedId && filteredDenominations.some((denomination) => denomination.id === selectedId)) {
      return;
    }

    const firstWithEntityId = filteredDenominations.find((denomination) => typeof denomination.id === 'string');
    setSelectedId(firstWithEntityId?.id ?? null);
  }, [filteredDenominations, selectedId]);

  const selectedDenomination = useMemo(
    () => denominations.find((denomination) => denomination.id === selectedId) ?? null,
    [denominations, selectedId]
  );

  const activeGraphId = useMemo(() => {
    if (selectedId) return selectedId;
    const firstWithEntityId = graphNodes.find((node) => typeof node.entityId === 'string');
    return firstWithEntityId?.entityId ?? null;
  }, [graphNodes, selectedId]);

  const { data: selectedRelations = [] } = useDenominationRelations(activeGraphId ?? undefined);

  const overviewLinks = useMemo(() => {
    if (!activeGraphId) return [];

    const relationByOtherId = new Map<string, DenominationRelation & { sourceId: string; targetId: string }>();

    selectedRelations
      .filter(
        (relation): relation is DenominationRelation & { sourceId: string; targetId: string } =>
          typeof relation.sourceId === 'string' && typeof relation.targetId === 'string'
      )
      .forEach((relation) => {
        const otherId = relation.sourceId === activeGraphId ? relation.targetId : relation.sourceId;
        relationByOtherId.set(otherId, relation);
      });

    return graphNodes
      .filter((node) => typeof node.entityId === 'string' && node.entityId !== activeGraphId)
      .map((node) => {
        const relation = relationByOtherId.get(node.entityId!);
        return {
          sourceId: activeGraphId,
          targetId: node.id,
          value: relation?.value ?? 0,
          context: relation?.context ?? null,
        };
      });
  }, [activeGraphId, graphNodes, selectedRelations]);

  if (isLoading) {
    return <FantasyLoader fullScreen />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.mainTitle}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>
      </header>

      <section className={styles.graphLayout}>
        <article className={styles.graphSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.overview}</h2>
            <span className={styles.sectionMeta}>{t.relations}</span>
          </div>
          <DenominationGraph
            nodes={graphNodes}
            links={overviewLinks}
            selectedId={selectedId}
            onNodeClick={(node) => setSelectedId(node.entityId ?? null)}
            height={500}
            showLinks
          />
        </article>

        <article className={styles.detailCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.selected}</h2>
            {selectedDenomination ? (
              <Link className={styles.linkButton} to={`/denominations/${selectedDenomination.id}`}>
                {t.openDetails}
              </Link>
            ) : null}
          </div>

          {selectedDenomination ? (
            <div className={styles.selectedContent}>
              <div className={styles.selectedMeta}>
                <div className={styles.selectedNameRow}>
                  <h3 className={styles.selectedName}>{normalizeText(selectedDenomination.name, 'Unnamed denomination')}</h3>
                  <span className={styles.badge}>{selectedDenomination.religion ?? 'Unknown'}</span>
                </div>
                <p className={styles.description}>{normalizeText(selectedDenomination.description, t.noSelection)}</p>
              </div>

              <dl className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <dt>{t.religion}</dt>
                  <dd>{selectedDenomination.religion ?? 'Unknown'}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>{t.leader}</dt>
                  <dd>{selectedDenomination.leaderId ?? t.noSelection}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>{t.tenets}</dt>
                  <dd>{selectedDenomination.tenets ?? t.noSelection}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>{t.appearance}</dt>
                  <dd>{selectedDenomination.appearance ?? t.noSelection}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className={styles.emptyState}>{t.noSelection}</p>
          )}
        </article>
      </section>

      <section className={styles.listSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.title}</h2>
          <span className={styles.sectionMeta}>{filteredDenominations.length}</span>
        </div>

        {filteredDenominations.length === 0 ? (
          <p className={styles.emptyState}>{t.empty}</p>
        ) : (
          <div className={styles.listGrid}>
            {filteredDenominations.map((denomination, index) => (
              <button
                type="button"
                key={denomination.id ?? `denomination-card-${index}`}
                className={`${styles.listCard} ${selectedId === denomination.id ? styles.listCardActive : ''}`}
                onClick={() => setSelectedId(denomination.id ?? null)}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{normalizeText(denomination.name, 'Unnamed denomination')}</h3>
                  <span className={styles.badge}>{denomination.religion ?? 'Unknown'}</span>
                </div>
                <p className={styles.cardDescription}>{getDenominationSummary(denomination, language)}</p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DenominationsPage;