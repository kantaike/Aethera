import { useParams } from 'react-router-dom';
import { useSettlement } from '../hooks/useSettlements';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import styles from './Styles/EntityDetailsPage.module.css';

export function SettlementDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useSettlement(id);

  if (isLoading) return <FantasyLoader />;
  if (isError || !data) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorText}>Settlement not found.</div>
      </div>
    );
  }

  const title = data.title ?? data.name ?? 'Settlement';

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <img className={styles.image} src={data.art?.filePath ?? ''} alt={title} />
        <div>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.subtitle}>{data.type ?? 'Settlement'}</div>
        </div>
      </div>
      {(data.description || data.population) && (
        <div className={styles.body}>
          {data.population && <div><strong>Population:</strong> {data.population}</div>}
          {data.description && <div style={{ marginTop: 10 }}>{data.description}</div>}
        </div>
      )}
    </div>
  );
}

