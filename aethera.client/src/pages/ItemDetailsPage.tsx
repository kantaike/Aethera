import { useParams } from 'react-router-dom';
import { useItem } from '../hooks/useItems';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import styles from './Styles/EntityDetailsPage.module.css';

export function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useItem(id);

  if (isLoading) return <FantasyLoader />;
  if (isError || !data) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorText}>Item not found.</div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <img className={styles.image} src={data.art?.filePath ?? ''} alt={data.name ?? ''} />
        <div>
          <h1 className={styles.title}>{data.name}</h1>
          <div className={styles.subtitle}>{data.type ?? 'Item'}</div>
        </div>
      </div>
      {data.description && <div className={styles.body}>{data.description}</div>}
    </div>
  );
}

