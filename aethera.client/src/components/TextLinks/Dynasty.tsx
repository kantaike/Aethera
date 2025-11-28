import { type ReactNode } from 'react';
import { useDynasty } from '../../hooks/useDynasties';
import { EntityLink } from './EntityLink';
import styles from './TextLinks.module.css';

type DynastyLinkProps = {
  id: string;
  children?: ReactNode;
};

export function Dynasty({ id, children }: DynastyLinkProps) {
  const { data, isLoading, isError } = useDynasty(id);
  const label = children ?? data?.name ?? 'Dynasty';

  const preview = (
    <div className={styles.previewRow}>
      <img
        className={styles.previewImage}
        src={data?.art?.filePath ?? ''}
        alt={typeof label === 'string' ? label : data?.name ?? 'Dynasty'}
      />
      <div>
        <div className={styles.previewTitle}>{data?.name ?? '—'}</div>
        <div className={styles.previewSubtitle}>
          {isLoading ? 'Loading…' : isError ? 'Not found' : 'Open dynasty'}
        </div>
      </div>
    </div>
  );

  return (
    <EntityLink to={`/dynasties/${id}`} preview={preview} ariaLabel={`Dynasty ${String(label)}`}>
      {label}
    </EntityLink>
  );
}

