import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStories } from '../hooks/useStories';
import { StoryCard } from '../features/Stories/StoryCard/StoryCard';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import { useAuthStore } from '../store/authStore';
import styles from './Styles/StoriesPage.module.css';
import { translations, useLanguage } from '../i18n/translations';
import type { StoryPreview } from '../api/types/types';

export function StoriesPage() {
  const language = useLanguage();
  const t = translations.pages.stories[language];
  const { data: stories, isLoading } = useStories();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isMaster = currentUser?.role === 'Master';

  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo((): StoryPreview[] => {
    if (!stories) return [];
    const q = searchQuery.toLowerCase();
    return stories.filter((s: StoryPreview) =>
      !q || (s.title ?? '').toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q)
    );
  }, [stories, searchQuery]);

  if (isLoading) return <FantasyLoader />;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.mainTitle}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>
        {isMaster && (
          <Link className={styles.createButton} to="/stories/create">
            {t.createButton}
          </Link>
        )}
      </div>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>{t.empty}</p>
      ) : (
        <div className={styles.list}>
          {filtered.map((story) => (
            <div key={story.id} className={styles.listItem}>
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
