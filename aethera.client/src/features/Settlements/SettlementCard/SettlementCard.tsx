import { Card } from '../../../components/Card/Card';
import styles from './SettlementCard.module.css';
import type { Settlement } from '../../../api/types/types';

export const SettlementCard = ( settlement : Settlement) => {
  return (
    <Card variant="green" className={styles.settlementCard}>
      <div className={styles.imageWrapper}>
        <img src={settlement.art?.filePath ?? ''} className={styles.image} />
        <div className={styles.typeBadge}>{settlement.type}</div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{settlement.title}</h3>
          <span className={styles.region}>{settlement.type}</span>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Population:</span>
            <span className={styles.statValue}>{settlement.population}</span>
          </div>
        </div>

        {/* Декоративная линия в стиле лунного серебра */}
        <div className={styles.divider} />
      </div>
    </Card>
  );
};