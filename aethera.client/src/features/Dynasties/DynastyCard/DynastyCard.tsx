import { useNavigate } from 'react-router-dom';
import type { MouseEvent } from 'react';
import styles from './DynastyCard.module.css';
import type { DynastyView } from '../types';
import {
  DEFAULT_INFLUENCE,
  DEFAULT_STATUS,
  DEFAULT_MOTTO,
} from '../types';
import { CharacterMiniCard } from '../../Character/CharacterMiniCard/CharacterMiniCard';
import { translations, useLanguage } from '../../../i18n/translations';
import { renderTextWithLinks } from '../../../components/TextLinks';

interface DynastyCardProps extends DynastyView {
  variant?: 'tier1' | 'standard';
}

export const DynastyCard = ({
  id,
  name,
  description,
  art,
  influence = DEFAULT_INFLUENCE,
  motto = DEFAULT_MOTTO,
  status = DEFAULT_STATUS,
  memberIds = [],
  variant = 'standard',
}: DynastyCardProps) => {
  const navigate = useNavigate();
  const language = useLanguage();
  const t = translations.features.dynastyCard[language];
  const statusT = translations.pages.dynasties[language].status;
  const statusKey = status ?? 'Vassal';
  const statusLabel = statusT[statusKey as keyof typeof statusT] ?? statusKey;
  const representatives = memberIds.slice(0, 3);
  const canNavigate = Boolean(id);

  const goToDynastyDetails = () => {
    if (id) {
      navigate(`/dynasties/${id}`);
    }
  };

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('a, button, input, select, textarea')) {
      return;
    }

    goToDynastyDetails();
  };

  return (
    <article
      className={`${styles.shield} ${styles[statusKey]} ${styles[variant]}`}
      data-status={statusKey}
      role={canNavigate ? 'link' : undefined}
      tabIndex={canNavigate ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (!canNavigate) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          goToDynastyDetails();
        }
      }}
    >
      <div className={styles.parchment}>
        <div className={styles.header}>
          <span className={styles.statusBadge}>{statusLabel}</span>
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
              alt={name ?? t.coatOfArms}
              className={styles.sigilImage}
            />
          ) : (
            <div className={styles.sigilPlaceholder}>⚜</div>
          )}
        </div>

        <h3 className={styles.title}>{renderTextWithLinks(name ?? t.unnamedDynasty)}</h3>

        {motto && (
          <p className={styles.motto}>"{renderTextWithLinks(motto)}"</p>
        )}

        {description && variant === 'tier1' && (
          <p className={styles.description}>{renderTextWithLinks(description)}</p>
        )}

        {representatives.length > 0 && (
          <div className={styles.representatives}>
            <span className={styles.representativesLabel}>{t.notableMembers}</span>
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
