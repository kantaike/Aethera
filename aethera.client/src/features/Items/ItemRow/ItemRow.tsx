import styles from './ItemRow.module.css';
import type { Item } from '../../../api/types/types';

interface ItemRowProps {
  item: Item;
}

const TYPE_ICONS: Record<string, string> = {
  Item: '📦',
  Weapon: '⚔',
  Armor: '🛡',
  Equipment: '🎒',
};

export const ItemRow = ({ item }: ItemRowProps) => {
  const typeKey = item.type ?? 'Item';
  const icon = TYPE_ICONS[typeKey] ?? '📦';

  return (
    <div className={styles.row}>
      <div className={styles.iconCell}>
        {item.art?.filePath ? (
          <img
            src={item.art.filePath}
            alt=""
            className={styles.icon}
          />
        ) : (
          <span className={styles.iconPlaceholder}>{icon}</span>
        )}
      </div>
      <div className={styles.nameCell}>{item.name ?? '—'}</div>
      <div className={styles.typeCell}>{item.type ?? 'Item'}</div>
      <div className={styles.costCell}>{(item.cost ?? 0).toFixed(1)} gp</div>
    </div>
  );
};
