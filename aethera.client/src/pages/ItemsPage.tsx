import { useMemo, useState } from 'react';
import type { Item } from '../api/types/types';
import { ItemRow } from '../features/Items/ItemRow/ItemRow';
import { useItems } from '../hooks/useItems';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import styles from './Styles/ItemsPage.module.css';

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'Item', label: 'Item' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Armor', label: 'Armor' },
  { value: 'Weapon', label: 'Weapon' },
] as const;

type SortKey = 'name' | 'type' | 'cost';

export function ItemsPage() {
  const { data: items, isLoading } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSorted = useMemo(() => {
    if (!items) return [];

    let result = (items as Item[]).filter((item) => {
      const nameMatch =
        !searchQuery ||
        (item.name ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const typeMatch =
        !typeFilter || (item.type ?? 'Item') === typeFilter;
      return nameMatch && typeMatch;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') {
        cmp = (a.name ?? '').localeCompare(b.name ?? '');
      } else if (sortBy === 'type') {
        cmp = (a.type ?? '').localeCompare(b.type ?? '');
      } else {
        cmp = (a.cost ?? 0) - (b.cost ?? 0);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [items, searchQuery, typeFilter, sortBy, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return <FantasyLoader fullScreen />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>Treasury</h1>
      <p className={styles.subtitle}>Items and Equipment of the Realm</p>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={styles.select}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.count}>
          {filteredAndSorted.length} item{filteredAndSorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.listWrapper}>
        <div className={styles.listHeader}>
          <div className={styles.headerIcon} />
          <button
            type="button"
            className={`${styles.headerButton} ${sortBy === 'name' ? styles.sortActive : ''}`}
            onClick={() => handleSort('name')}
          >
            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            type="button"
            className={`${styles.headerButton} ${styles.headerType} ${sortBy === 'type' ? styles.sortActive : ''}`}
            onClick={() => handleSort('type')}
          >
            Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            type="button"
            className={`${styles.headerButton} ${sortBy === 'cost' ? styles.sortActive : ''}`}
            onClick={() => handleSort('cost')}
          >
            Cost {sortBy === 'cost' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        <div className={styles.list}>
          {filteredAndSorted.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      {filteredAndSorted.length === 0 && (
        <p className={styles.empty}>No items match your filters.</p>
      )}
    </div>
  );
}
