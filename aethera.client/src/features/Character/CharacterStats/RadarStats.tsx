import React from 'react';
import styles from './RadarStats.module.css';

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
}

const RadarStats: React.FC<Props> = ({ stats }) => {
  const size = 350;
  const center = size / 2;
  const radius = 110;
  const maxVal = 20;

  const statEntries = [
    { label: 'STR', val: stats.str ?? 0 },
    { label: 'DEX', val: stats.dex ?? 0 },
    { label: 'CON', val: stats.con ?? 0 },
    { label: 'INT', val: stats.int ?? 0 },
    { label: 'WIS', val: stats.wis ?? 0 },
    { label: 'CHA', val: stats.cha ?? 0 },
  ];

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
              key={s.label}
              className={styles.labelWrapper}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className={styles.labelName}>{s.label}</span>
              <span className={styles.labelValue}>{s.val}</span>
              <span className={styles.modifier}>{mod >= 0 ? `+${mod}` : mod}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadarStats;