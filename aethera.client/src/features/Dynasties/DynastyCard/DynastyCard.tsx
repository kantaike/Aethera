import styles from './DynastyCard.module.css';
import type { DynastyView } from '../types';
import {
  DEFAULT_INFLUENCE,
  DEFAULT_STATUS,
  DEFAULT_MOTTO,
} from '../types';
import { CharacterMiniCard } from '../../Character/CharacterMiniCard/CharacterMiniCard';

interface DynastyCardProps extends DynastyView {
  variant?: 'tier1' | 'standard';
}

export const DynastyCard = ({
  name,
  description,
  art,
  influence = DEFAULT_INFLUENCE,
  motto = DEFAULT_MOTTO,
  status = DEFAULT_STATUS,
  memberIds = [],
  variant = 'standard',
}: DynastyCardProps) => {
  const statusKey = status ?? 'Vassal';
  const representatives = memberIds.slice(0, 3);

  return (
    <article
      className={`${styles.shield} ${styles[statusKey]} ${styles[variant]}`}
      data-status={statusKey}
    >
      <div className={styles.parchment}>
        <div className={styles.header}>
          <span className={styles.statusBadge}>{statusKey}</span>
          <div className={styles.influence}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`${styles.star} ${i < influence ? styles.filled : ''}`}
                aria-hidden
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className={styles.sigil}>
          {art?.filePath ? (
            <img
              src={art.filePath}
              alt={name ?? 'Coat of arms'}
              className={styles.sigilImage}
            />
          ) : (
            <div className={styles.sigilPlaceholder}>⚜</div>
          )}
        </div>

        <h3 className={styles.title}>{name ?? 'Unnamed Dynasty'}</h3>

        {motto && (
          <p className={styles.motto}>"{motto}"</p>
        )}

        {description && variant === 'tier1' && (
          <p className={styles.description}>{description}</p>
        )}

        {representatives.length > 0 && (
          <div className={styles.representatives}>
            <span className={styles.representativesLabel}>Notable members</span>
            <div className={styles.representativesList}>
              {representatives.map((charId) => (
                <CharacterMiniCard key={charId} id={charId} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
