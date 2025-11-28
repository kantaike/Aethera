import { type CharacterPreview } from '../../../api/types/types';
import { Card } from '../../../components/Card/Card';
import styles from './CharacterListitem.module.css';
import { Link } from 'react-router-dom';

export const CharacterListItem = ({ character }: { character: CharacterPreview }) => {
  let widthValue = "0%";
  if (character?.hp && typeof character.hp.current === "number" && typeof character.hp.max === "number" && character.hp.max > 0) {
    widthValue = `${(character.hp.current / character.hp.max) * 100}%`;
  }

  return (
  
  <Link to={`/characters/${character.id}`} className={styles.listItem}>
    <Card variant="blue" className={styles.card}>
      <div className={styles.portraitWrapper}>
        {character.art?.filePath ? (
          <img src={character.art.filePath} alt={character.name ?? 'Портрет'} className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <span className={styles.placeholderIcon}>⚔</span>
            <span className={styles.placeholderText}>No avatar</span>
          </div>
        )}
        <div className={styles.levelBadge}>{character.level}</div>
      </div>
      
      <div className={styles.info}>
        <h3 className={styles.name}>{character.name}</h3>
        <p className={styles.meta}>{character.species ?? '—'} • {character.class ?? '—'}</p>
        
        {/* Лунная полоска здоровья */}
        {character.hp && <div className={styles.hpBarContainer}>
          <div 
            className={styles.hpBarFill} 
            style={{ width: widthValue }}
          ></div>
        </div>
        }
      </div>
    </Card>
  </Link>
)};