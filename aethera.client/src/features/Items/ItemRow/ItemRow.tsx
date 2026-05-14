import { useNavigate } from 'react-router-dom';
import styles from './ItemRow.module.css';
import type { Item } from '../../../api/types/types';
import { renderTextWithLinks } from '../../../components/TextLinks';

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
  const navigate = useNavigate();
  const typeKey = item.type ?? 'Item';
  const icon = TYPE_ICONS[typeKey] ?? '📦';
  const canNavigate = Boolean(item.id);

  const goToItemDetails = () => {
    if (item.id) {
      navigate(`/items/${item.id}`);
    }
  };

  return (
    <div
      className={styles.row}
      role={canNavigate ? 'link' : undefined}
      tabIndex={canNavigate ? 0 : undefined}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest('a, button, input, select, textarea')) {
          return;
        }

        goToItemDetails();
      }}
      onKeyDown={(event) => {
        if (!canNavigate) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          goToItemDetails();
        }
      }}
    >
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
      <div className={styles.nameCell}>{renderTextWithLinks(item.name ?? '') ?? '—'}</div>
      <div className={styles.typeCell}>{item.type ?? 'Item'}</div>
      <div className={styles.costCell}>{(item.cost ?? 0).toFixed(1)} gp</div>
    </div>
  );
};
