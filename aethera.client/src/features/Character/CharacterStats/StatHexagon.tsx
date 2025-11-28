import React from 'react';
import styles from './StatHexagon.module.css';

interface StatProps {
  label: string;
  value: number;
  color: string;
}

const StatHexagon: React.FC<StatProps> = ({ label, value, color }) => {
  const mod = Math.floor((value - 10) / 2);
  const formattedMod = mod >= 0 ? `+${mod}` : mod;

  return (
    <div className={styles.hexWrapper}>
      <svg viewBox="0 0 100 115" className={styles.hexSvg}>
        <polygon
          points="50,5 95,30 95,85 50,110 5,85 5,30"
          className={styles.polygon}
          style={{ stroke: color }}
        />
      </svg>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        <span className={styles.modifier}>{formattedMod}</span>
      </div>
    </div>
  );
};

export default StatHexagon;