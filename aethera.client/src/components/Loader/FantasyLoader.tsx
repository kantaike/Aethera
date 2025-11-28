import { useState, useEffect } from 'react';
import styles from './FantasyLoader.module.css';
import { LOADING_PHRASES_UA } from './LoadingPhrases';

export const FantasyLoader = ({ fullScreen }: { fullScreen?: boolean }) => {
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * LOADING_PHRASES_UA.length);
    setPhrase(LOADING_PHRASES_UA[randomIndex]);
  }, []);

  return (
    <div className={`${styles.loaderWrapper} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.magicContainer}>
        {/* Искры (частицы) */}
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        
        <svg viewBox="0 0 100 100" className={styles.svg}>
          <circle cx="50" cy="50" r="45" className={styles.outerRing} />
          <circle cx="50" cy="50" r="35" className={styles.innerRing} />
          <path d="M50 25 L65 50 L50 75 L35 50 Z" className={styles.centerRune} />
        </svg>
        <div className={styles.magicGlow} />
      </div>
      
      <div className={styles.textContainer}>
        <p className={styles.randomPhrase}>{phrase}</p>
      </div>
    </div>
  );
};