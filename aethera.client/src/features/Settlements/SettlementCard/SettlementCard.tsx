import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/Card/Card';
import styles from './SettlementCard.module.css';
import type { Settlement } from '../../../api/types/types';
import { translations, useLanguage } from '../../../i18n/translations';
import { renderTextWithLinks } from '../../../components/TextLinks';

export const SettlementCard = ( settlement : Settlement) => {
  const navigate = useNavigate();
  const language = useLanguage();
  const t = translations.features.settlementCard[language];

  const goToSettlementDetails = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('a, button, input, select, textarea')) {
      return;
    }

    if (settlement.id) {
      navigate(`/settlements/${settlement.id}`);
    }
  };

  return (
    <Card variant="green" className={styles.settlementCard} onClick={goToSettlementDetails}>
      <div className={styles.imageWrapper}>
        <img src={settlement.art?.filePath ?? ''} className={styles.image} />
        <div className={styles.typeBadge}>{settlement.type}</div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{renderTextWithLinks(settlement.title ?? '')}</h3>
          <span className={styles.region}>{settlement.type}</span>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>{t.population}:</span>
            <span className={styles.statValue}>{settlement.population}</span>
          </div>
        </div>

        {/* Decorative separator line */}
        <div className={styles.divider} />
      </div>
    </Card>
  );
};