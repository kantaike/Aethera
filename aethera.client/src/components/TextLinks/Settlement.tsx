import { type ReactNode } from 'react';
import { useSettlement } from '../../hooks/useSettlements';
import { EntityLink } from './EntityLink';
import styles from './TextLinks.module.css';

type SettlementLinkProps = {
  id: string;
  children?: ReactNode;
};

export function Settlement({ id, children }: SettlementLinkProps) {
  const { data, isLoading, isError } = useSettlement(id);
  const label = children ?? data?.title ?? data?.name ?? 'Settlement';

  const preview = (
    <div className={styles.previewRow}>
      <img
        className={styles.previewImage}
        src={data?.art?.filePath ?? ''}
        alt={typeof label === 'string' ? label : data?.title ?? data?.name ?? 'Settlement'}
      />
      <div>
        <div className={styles.previewTitle}>{data?.title ?? data?.name ?? '—'}</div>
        <div className={styles.previewSubtitle}>
          {isLoading ? 'Loading…' : isError ? 'Not found' : (data?.type ?? 'Open settlement')}
        </div>
      </div>
    </div>
  );

  return (
    <EntityLink to={`/settlements/${id}`} preview={preview} ariaLabel={`Settlement ${String(label)}`}>
      {label}
    </EntityLink>
  );
}

