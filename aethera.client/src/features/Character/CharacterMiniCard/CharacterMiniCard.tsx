import { Link } from 'react-router-dom';
import styles from './CharacterMiniCard.module.css';
import { useCharacterById} from '../../../hooks/useCharacters';
import { FantasyLoader } from '../../../components/Loader/FantasyLoader';


interface CharacterMiniCardProps {
  id: string;
  propsText?: React.ReactNode;
}

export const CharacterMiniCard = ({ id, propsText }: CharacterMiniCardProps) => {

  const {data, isLoading} = useCharacterById(id);

  if (isLoading) {
    return <FantasyLoader></FantasyLoader>;
  }

  return (
    <Link to={`/characters/${id}`} className={styles.wrapper}>
      <div className={styles.avatarContainer}>
        <img src={data?.art?.filePath || ''} alt={data?.name || ''} className={styles.avatar} />
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{data?.name}</span>
        {propsText && <span className={styles.propsText}>{propsText}</span>}
      </div>
      <div className={styles.chevron}>›</div>
    </Link>
  );
};