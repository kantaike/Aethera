import { type ReactNode } from 'react';
import { useItem } from '../../hooks/useItems';
import { EntityLink } from './EntityLink';
import styles from './TextLinks.module.css';

type ItemLinkProps = {
  id: string;
  children?: ReactNode;
};

export function Item({ id, children }: ItemLinkProps) {
  const { data, isLoading, isError } = useItem(id);
  const label = children ?? data?.name ?? 'Item';

  const preview = (
    <div className={styles.previewRow}>
      <img
        className={styles.previewImage}
        src={data?.art?.filePath ?? ''}
        alt={typeof label === 'string' ? label : data?.name ?? 'Item'}
      />
      <div>
        <div className={styles.previewTitle}>{data?.name ?? '—'}</div>
        <div className={styles.previewSubtitle}>
          {isLoading ? 'Loading…' : isError ? 'Not found' : (data?.type ?? 'Open item')}
        </div>
      </div>
    </div>
  );

  return (
    <EntityLink to={`/items/${id}`} preview={preview} ariaLabel={`Item ${String(label)}`}>
      {label}
    </EntityLink>
  );
}

