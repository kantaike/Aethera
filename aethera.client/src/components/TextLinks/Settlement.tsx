import { type ReactNode } from 'react';
import { useSettlement } from '../../hooks/useSettlements';
import { EntityLink } from './EntityLink';
import styles from './TextLinks.module.css';
import { translations, useLanguage } from '../../i18n/translations';

type SettlementLinkProps = {
  id: string;
  children?: ReactNode;
};

export function Settlement({ id, children }: SettlementLinkProps) {
  const language = useLanguage();
  const t = translations.features.textLinks[language];
  const { data, isLoading, isError } = useSettlement(id);
  const label = children ?? data?.title ?? data?.name ?? t.fallback.settlement;

  const preview = (
    <div className={styles.previewRow}>
      <img
        className={styles.previewImage}
        src={data?.art?.filePath ?? ''}
        alt={typeof label === 'string' ? label : data?.title ?? data?.name ?? t.fallback.settlement}
      />
      <div>
        <div className={styles.previewTitle}>{data?.title ?? data?.name ?? '—'}</div>
        <div className={styles.previewSubtitle}>
          {isLoading ? t.loading : isError ? t.notFound : (data?.type ?? t.openSettlement)}
        </div>
      </div>
    </div>
  );

  return (
    <EntityLink to={`/settlements/${id}`} preview={preview} ariaLabel={`${t.fallback.settlement} ${String(label)}`}>
      {label}
    </EntityLink>
  );
}

