import { useEffect, useMemo, useRef, useState } from 'react';
import { RelativeCard } from './RelativeCard';
import styles from './FamilyTree.module.css';

export const FamilyTree = ({ relatives, character }: { relatives: any[], character: any }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [treeScale, setTreeScale] = useState(1);

  const normalizeId = (value: unknown) => {
    if (value === null || value === undefined) return undefined;
    const id = String(value).trim();
    return id.length > 0 ? id : undefined;
  };

  const { map, selfId } = useMemo(() => {
    const byId = new Map<string, any>();

    const allPeople = [...(relatives || []), { ...character, role: 'SELF', isMain: true }].map((person) => ({
      ...person,
      id: normalizeId(person.id),
      fatherId: normalizeId(person.fatherId),
      motherId: normalizeId(person.motherId),
    }));

    allPeople.forEach((person) => {
      if (!person.id) return;
      byId.set(person.id, person);
    });

    return {
      map: byId,
      selfId: normalizeId(character?.id),
    };
  }, [relatives, character]);

  const generations = useMemo(() => {
    if (!selfId || !map.has(selfId)) {
      return {
        fatherId: undefined as string | undefined,
        motherId: undefined as string | undefined,
        paternalGrandparents: [] as string[],
        maternalGrandparents: [] as string[],
        paternalGreatGrandparents: [] as string[],
        maternalGreatGrandparents: [] as string[],
        children: [] as string[],
      };
    }

    const uniq = (ids: Array<string | undefined>) => {
      const seen = new Set<string>();
      return ids.filter((id): id is string => Boolean(id && !seen.has(id) && (seen.add(id), true)));
    };

    const getParents = (id: string) => {
      const person = map.get(id);
      if (!person) return [] as string[];

      return uniq([
        person.fatherId && map.has(person.fatherId) ? person.fatherId : undefined,
        person.motherId && map.has(person.motherId) ? person.motherId : undefined,
      ]);
    };

    const selfPerson = map.get(selfId);
    const fatherId = selfPerson?.fatherId && map.has(selfPerson.fatherId) ? selfPerson.fatherId : undefined;
    const motherId = selfPerson?.motherId && map.has(selfPerson.motherId) ? selfPerson.motherId : undefined;

    const paternalGrandparents = fatherId ? getParents(fatherId) : [];
    const maternalGrandparents = motherId ? getParents(motherId) : [];
    const paternalGreatGrandparents = uniq(
      paternalGrandparents.flatMap((grandParentId) => getParents(grandParentId))
    );
    const maternalGreatGrandparents = uniq(
      maternalGrandparents.flatMap((grandParentId) => getParents(grandParentId))
    );

    const usedUpper = new Set<string>([
      selfId,
      ...(fatherId ? [fatherId] : []),
      ...(motherId ? [motherId] : []),
      ...paternalGrandparents,
      ...maternalGrandparents,
      ...paternalGreatGrandparents,
      ...maternalGreatGrandparents,
    ]);
    const children = uniq(
      Array.from(map.values())
        .filter((person) => person.id !== selfId)
        .filter((person) => person.fatherId === selfId || person.motherId === selfId)
        .map((person) => person.id)
    ).filter((id) => !usedUpper.has(id));

    return {
      fatherId,
      motherId,
      paternalGrandparents,
      maternalGrandparents,
      paternalGreatGrandparents,
      maternalGreatGrandparents,
      children,
    };
  }, [map, selfId]);

  const renderRow = (ids: string[], rowClass: string) => {
    if (ids.length === 0) return null;

    return (
      <div className={`${styles.generationRow} ${rowClass}`}>
        {ids.map((id) => {
          const person = map.get(id);
          if (!person) return null;

          return <RelativeCard key={id} id={id} role={person.role ?? ''} />;
        })}
      </div>
    );
  };

  const renderBranchCards = (ids: string[]) => {
    return ids.map((id) => {
      const person = map.get(id);
      if (!person) return null;
      return <RelativeCard key={id} id={id} role={person.role ?? ''} />;
    });
  };

  const hasGreatGrandparents =
    generations.paternalGreatGrandparents.length > 0 || generations.maternalGreatGrandparents.length > 0;
  const hasGrandparents =
    generations.paternalGrandparents.length > 0 || generations.maternalGrandparents.length > 0;

  useEffect(() => {
    const containerEl = containerRef.current;
    const contentEl = contentRef.current;

    if (!containerEl || !contentEl) {
      return;
    }

    const updateScale = () => {
      const availableWidth = Math.max(0, containerEl.clientWidth - 8);
      const naturalWidth = contentEl.scrollWidth;

      if (availableWidth <= 0 || naturalWidth <= 0) {
        setTreeScale(1);
        return;
      }

      const nextScale = Math.min(1, availableWidth / naturalWidth);
      setTreeScale((prevScale) => {
        return Math.abs(prevScale - nextScale) < 0.01 ? prevScale : nextScale;
      });
    };

    updateScale();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateScale);
      return () => {
        window.removeEventListener('resize', updateScale);
      };
    }

    const observer = new ResizeObserver(() => updateScale());
    observer.observe(containerEl);
    observer.observe(contentEl);

    return () => {
      observer.disconnect();
    };
  }, [generations]);

  if (!selfId || !map.has(selfId)) {
    return null;
  }

  const selfPerson = map.get(selfId);

  return (
    <div className={styles.treeContainer} ref={containerRef}>
      <div className={styles.scaleViewport}>
        <div
          ref={contentRef}
          className={styles.scaleContent}
          style={{ '--tree-scale': treeScale } as React.CSSProperties}
        >
          <div className={styles.generationsColumn}>
            {hasGreatGrandparents && (
              <div className={`${styles.generationRow} ${styles.rowGreatGrand} ${styles.branchRow}`}>
                <div className={`${styles.branchColumn} ${styles.branchPaternal}`}>
                  {renderBranchCards(generations.paternalGreatGrandparents)}
                </div>
                <div className={`${styles.branchColumn} ${styles.branchMaternal}`}>
                  {renderBranchCards(generations.maternalGreatGrandparents)}
                </div>
              </div>
            )}

            {hasGrandparents && (
              <div className={`${styles.generationRow} ${styles.rowGrand} ${styles.branchRow}`}>
                <div className={`${styles.branchColumn} ${styles.branchPaternal}`}>
                  {renderBranchCards(generations.paternalGrandparents)}
                </div>
                <div className={`${styles.branchColumn} ${styles.branchMaternal}`}>
                  {renderBranchCards(generations.maternalGrandparents)}
                </div>
              </div>
            )}

            <div className={`${styles.generationRow} ${styles.rowParent} ${styles.branchRow}`}>
              <div className={`${styles.branchColumn} ${styles.branchPaternal}`}>
                {generations.fatherId && (() => {
                  const father = map.get(generations.fatherId);
                  if (!father) return null;
                  return <RelativeCard id={father.id} role={father.role ?? ''} />;
                })()}
              </div>
              <div className={`${styles.branchColumn} ${styles.branchMaternal}`}>
                {generations.motherId && (() => {
                  const mother = map.get(generations.motherId);
                  if (!mother) return null;
                  return <RelativeCard id={mother.id} role={mother.role ?? ''} />;
                })()}
              </div>
            </div>

            <div className={`${styles.generationRow} ${styles.rowSelf}`}>
              <RelativeCard id={selfId} role={selfPerson.role ?? 'SELF'} />
            </div>

            {renderRow(generations.children, styles.rowChild)}
          </div>
        </div>
      </div>
    </div>
  );
};