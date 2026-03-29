import { Link } from 'react-router-dom';
import type { StoryPreview } from '../../../api/types/types';
import styles from './StoryCard.module.css';

interface StoryCardProps {
  story: StoryPreview;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link to={`/stories/${story.id}`} className={styles.card}>
      <div className={styles.imagePlaceholder}>
        <span className={styles.imagePlaceholderIcon}>📜</span>
      </div>
      <div className={styles.body}>
        <h2 className={styles.title}>{story.title ?? '—'}</h2>
        {story.description && (
          <p className={styles.description}>{story.description}</p>
        )}
      </div>
    </Link>
  );
}
