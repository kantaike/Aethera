import { type ReactNode } from 'react';
import { useItem } from '../../hooks/useItems';
import { EntityLink } from './EntityLink';
import { PreviewImage } from './PreviewImage';
import styles from './TextLinks.module.css';
import { translations, useLanguage } from '../../i18n/translations';

type ItemLinkProps = {
  id: string;
  children?: ReactNode;
};

export function Item({ id, children }: ItemLinkProps) {
  const language = useLanguage();
  const t = translations.features.textLinks[language];
  const { data, isLoading, isError } = useItem(id);
  const label = children ?? data?.name ?? t.fallback.item;

  const preview = (
    <div className={styles.previewRow}>
      <PreviewImage
        src={data?.art?.filePath}
        alt={typeof label === 'string' ? label : data?.name ?? t.fallback.item}
        placeholder="IT"
      />
      <div>
        <div className={styles.previewTitle}>{data?.name ?? '—'}</div>
        <div className={styles.previewSubtitle}>
          {isLoading ? t.loading : isError ? t.notFound : (data?.type ?? t.openItem)}
        </div>
      </div>
    </div>
  );

  return (
    <EntityLink to={`/items/${id}`} preview={preview} ariaLabel={`${t.fallback.item} ${String(label)}`}>
      {label}
    </EntityLink>
  );
}

