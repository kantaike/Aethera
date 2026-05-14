import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './CharacterMiniCard.module.css';
import { useCharacterById} from '../../../hooks/useCharacters';
import { FantasyLoader } from '../../../components/Loader/FantasyLoader';


interface CharacterMiniCardProps {
  id: string;
  propsText?: React.ReactNode;
  variant?: 'default' | 'family';
}

export const CharacterMiniCard = ({ id, propsText, variant = 'default' }: CharacterMiniCardProps) => {

  const {data, isLoading} = useCharacterById(id);
  const [imageBroken, setImageBroken] = useState(false);

  const avatarSrc = data?.art?.filePath?.trim() || '';

  useEffect(() => {
    setImageBroken(false);
  }, [avatarSrc]);

  const displayInitial = useMemo(() => {
    const name = data?.name?.trim();
    if (!name) {
      return '✶';
    }

    return name.charAt(0).toUpperCase();
  }, [data?.name]);

  if (isLoading) {
    return <FantasyLoader></FantasyLoader>;
  }

  const wrapperClass = variant === 'family' ? `${styles.wrapper} ${styles.familyWrapper}` : styles.wrapper;
  const shouldShowImage = Boolean(avatarSrc) && !imageBroken;

  return (
    <Link to={`/characters/${id}`} className={wrapperClass}>
      <div className={styles.avatarContainer}>
        {shouldShowImage ? (
          <img
            src={avatarSrc}
            alt={data?.name || ''}
            className={styles.avatar}
            onError={() => setImageBroken(true)}
          />
        ) : (
          <div className={styles.avatarFallback} aria-hidden="true">
            <span className={styles.avatarInitial}>{displayInitial}</span>
          </div>
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{data?.name}</span>
        {propsText && <span className={styles.propsText}>{propsText}</span>}
      </div>
      <div className={styles.chevron}>›</div>
    </Link>
  );
};