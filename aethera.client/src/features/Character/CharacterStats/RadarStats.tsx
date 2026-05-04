import React from 'react';
import styles from './RadarStats.module.css';
import type { Modifier, ModifierBreakdown } from '../../../api/types/types';

interface DndStats {
  str: number | undefined;
  dex: number | undefined;
  con: number | undefined;
  int: number | undefined;
  wis: number | undefined;
  cha: number | undefined;
}

interface Props {
  stats: DndStats;
  breakdown?: Record<string, ModifierBreakdown> | null;
  labels: {
    str: string;
    dex: string;
    con: string;
    int: string;
    wis: string;
    cha: string;
  };
  tooltipText: {
    base: string;
    final: string;
    modifiers: string;
    noModifiers: string;
    unnamedModifier: string;
    categories: {
      Base: string;
      Permanent: string;
      Equipment: string;
      Temporary: string;
    };
  };
}

const RadarStats: React.FC<Props> = ({ stats, breakdown, labels, tooltipText }) => {
  const size = 350;
  const center = size / 2;
  const radius = 110;
  const maxVal = 20;

  const statEntries = [
    { shortLabel: labels.str, apiLabel: 'Strength', val: stats.str ?? 0 },
    { shortLabel: labels.dex, apiLabel: 'Dexterity', val: stats.dex ?? 0 },
    { shortLabel: labels.con, apiLabel: 'Constitution', val: stats.con ?? 0 },
    { shortLabel: labels.int, apiLabel: 'Intelligence', val: stats.int ?? 0 },
    { shortLabel: labels.wis, apiLabel: 'Wisdom', val: stats.wis ?? 0 },
    { shortLabel: labels.cha, apiLabel: 'Charisma', val: stats.cha ?? 0 },
  ];

  const formatNumber = (value: number | null | undefined) => {
    if (value == null) {
      return '—';
    }

    if (Number.isInteger(value)) {
      return String(value);
    }

    return value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  };

  const formatSigned = (value: number | undefined) => {
    const normalized = value ?? 0;
    const formatted = formatNumber(normalized);
    return `${normalized >= 0 ? '+' : ''}${formatted}`;
  };

  const getCategoryLabel = (category: string | null | undefined) => {
    if (!category) {
      return '';
    }

    if (category in tooltipText.categories) {
      return tooltipText.categories[category as keyof typeof tooltipText.categories];
    }

    return category;
  };

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2) / 6 * index - Math.PI / 2;
    const distance = (value / maxVal) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  const polygonPoints = statEntries
    .map((s, i) => {
      const { x, y } = getCoordinates(i, s.val);
      return `${x},${y}`;
    })
    .join(' ');

  const gridLevels = [5, 10, 15, 20];

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <svg className={styles.svg} viewBox={`0 0 ${size} ${size}`}>
          {gridLevels.map((level) => (
            <polygon
              key={level}
              className={styles.gridLine}
              points={statEntries
                .map((_, i) => {
                  const { x, y } = getCoordinates(i, level);
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          ))}

          {statEntries.map((_, i) => {
            const { x, y } = getCoordinates(i, maxVal);
            return (
              <line
                key={i}
                className={styles.axisLine}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
              />
            );
          })}

          <polygon className={styles.statPolygon} points={polygonPoints} />

          {statEntries.map((s, i) => {
            const { x, y } = getCoordinates(i, s.val);
            return <circle key={i} className={styles.statPoint} cx={x} cy={y} r="3" />;
          })}
        </svg>

        {statEntries.map((s, i) => {
          const { x, y } = getCoordinates(i, maxVal + 4);
          const mod = Math.floor((s.val - 10) / 2);
          
          return (
            <div
              key={s.apiLabel}
              className={styles.labelWrapper}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className={styles.labelName}>{s.shortLabel}</span>
              <span className={styles.labelValue}>{s.val}</span>
              <span className={styles.modifier}>{mod >= 0 ? `+${mod}` : mod}</span>

              <div className={styles.statTooltip} role="tooltip">
                <div className={styles.tooltipTitle}>{s.shortLabel}</div>
                <div className={styles.tooltipRow}>
                  <span>{tooltipText.base}</span>
                  <span>{formatNumber(breakdown?.[s.apiLabel]?.baseValue ?? s.val)}</span>
                </div>
                <div className={styles.tooltipRow}>
                  <span>{tooltipText.final}</span>
                  <span>{formatNumber(breakdown?.[s.apiLabel]?.finalValue ?? s.val)}</span>
                </div>

                <div className={styles.tooltipSection}>{tooltipText.modifiers}</div>

                {((breakdown?.[s.apiLabel]?.modifiers ?? []) as Modifier[]).length === 0 && (
                  <div className={styles.tooltipEmpty}>{tooltipText.noModifiers}</div>
                )}

                {((breakdown?.[s.apiLabel]?.modifiers ?? []) as Modifier[]).map((modifier) => {
                  const categoryLabel = getCategoryLabel(modifier.category);
                  return (
                    <div key={modifier.id ?? `${s.apiLabel}-${modifier.label ?? 'modifier'}-${modifier.priority ?? 0}`} className={styles.tooltipModifierRow}>
                      <span className={styles.tooltipModifierName}>
                        {modifier.label ?? tooltipText.unnamedModifier}
                        {categoryLabel ? ` (${categoryLabel})` : ''}
                      </span>
                      <span className={styles.tooltipModifierValue}>{formatSigned(modifier.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadarStats;