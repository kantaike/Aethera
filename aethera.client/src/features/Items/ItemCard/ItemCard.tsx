import { Card } from '../../../components/Card/Card';
import styles from './ItemCard.module.css';
import type { Item } from '../../../api/types/types';

export const ItemCard = (item: Item) => {
  return (
    <Card variant="purple" className={styles.itemCard}>
      <div className={styles.imageWrapper}>
        <img src={item.art?.filePath ?? ''} alt={item.name ?? ''} className={styles.image} />
        <div className={styles.typeBadge}>{item.type ?? 'Item'}</div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{item.name}</h3>
          <span className={styles.type}>{item.type}</span>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Cost:</span>
            <span className={styles.statValue}>{item.cost ?? 0} gp</span>
          </div>
        </div>

        <div className={styles.divider} />
      </div>
    </Card>
  );
};
