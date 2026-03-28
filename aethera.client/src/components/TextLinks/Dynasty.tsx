import { type ReactNode } from 'react';
import { useDynasty } from '../../hooks/useDynasties';
import { EntityLink } from './EntityLink';
import styles from './TextLinks.module.css';
import { translations, useLanguage } from '../../i18n/translations';

type DynastyLinkProps = {
  id: string;
  children?: ReactNode;
};

export function Dynasty({ id, children }: DynastyLinkProps) {
  const language = useLanguage();
  const t = translations.features.textLinks[language];
  const { data, isLoading, isError } = useDynasty(id);
  const label = children ?? data?.name ?? t.fallback.dynasty;

  const preview = (
    <div className={styles.previewRow}>
      <img
        className={styles.previewImage}
        src={data?.art?.filePath ?? ''}
        alt={typeof label === 'string' ? label : data?.name ?? t.fallback.dynasty}
      />
      <div>
        <div className={styles.previewTitle}>{data?.name ?? '—'}</div>
        <div className={styles.previewSubtitle}>
          {isLoading ? t.loading : isError ? t.notFound : t.openDynasty}
        </div>
      </div>
    </div>
  );

  return (
    <EntityLink to={`/dynasties/${id}`} preview={preview} ariaLabel={`${t.fallback.dynasty} ${String(label)}`}>
      {label}
    </EntityLink>
  );
}

