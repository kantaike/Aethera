import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ScrollText, Shield, Sparkles, Star } from 'lucide-react';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import { useCharacters } from '../hooks/useCharacters';
import { useDynasties } from '../hooks/useDynasties';
import { useItems } from '../hooks/useItems';
import { useSettlements } from '../hooks/useSettlements';
import { useStories } from '../hooks/useStories';
import type { CharacterPreview, Dynasty, Item, Settlement, StoryPreview } from '../api/types/types';
import { translations, useLanguage } from '../i18n/translations';
import { useAuthStore } from '../store/authStore';
import styles from './Styles/HomePage.module.css';

type Discovery = {
  id: string;
  title: string;
  description: string;
  to: string;
  kindLabel: string;
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const pickDaily = <T,>(collection: T[] | undefined, seed: string): T | null => {
  if (!collection || collection.length === 0) {
    return null;
  }
  const dayKey = new Date().toISOString().slice(0, 10);
  const index = hashString(`${dayKey}-${seed}`) % collection.length;
  return collection[index] ?? null;
};

export default function HomePage() {
  const language = useLanguage();
  const t = translations.pages.home[language];
  const currentUser = useAuthStore((state) => state.currentUser);

  const { data: charactersRaw, isLoading: isCharactersLoading } = useCharacters();
  const { data: itemsRaw, isLoading: isItemsLoading } = useItems();
  const { data: storiesRaw, isLoading: isStoriesLoading } = useStories();
  const { data: dynastiesRaw, isLoading: isDynastiesLoading } = useDynasties();
  const { data: settlementsRaw, isLoading: isSettlementsLoading } = useSettlements();

  const characters = (charactersRaw ?? []) as CharacterPreview[];
  const items = (itemsRaw ?? []) as Item[];
  const stories = (storiesRaw ?? []) as StoryPreview[];
  const dynasties = (dynastiesRaw ?? []) as Dynasty[];
  const settlements = (settlementsRaw ?? []) as Settlement[];

  const isLoadingAll =
    isCharactersLoading &&
    isItemsLoading &&
    isStoriesLoading &&
    isDynastiesLoading &&
    isSettlementsLoading;

  const heroOfDay = useMemo(() => pickDaily(characters, 'hero-of-day'), [characters]);
  const storyOfDay = useMemo(() => pickDaily(stories, 'story-of-day'), [stories]);

  const discoveries = useMemo<Discovery[]>(() => {
    const itemDiscoveries = items.map((item: Item) => ({
      id: item.id ?? '',
      title: item.name ?? t.fallbacks.unknownItem,
        description: item.type ?? t.fallbacks.noDescription,
      to: `/items/${item.id}`,
      kindLabel: t.discoveryKinds.item,
    }));

      const settlementDiscoveries = settlements.map((settlement: Settlement) => ({
      id: settlement.id ?? '',
      title: settlement.title ?? t.fallbacks.unknownSettlement,
        description:
          settlement.type || settlement.population
            ? `${settlement.type ?? t.fallbacks.unknownSettlementType} • ${settlement.population ?? 0}`
            : t.fallbacks.noDescription,
      to: `/settlements/${settlement.id}`,
      kindLabel: t.discoveryKinds.settlement,
    }));

      const dynastyDiscoveries = dynasties.map((dynasty: Dynasty) => ({
      id: dynasty.id ?? '',
      title: dynasty.name ?? t.fallbacks.unknownDynasty,
      description: dynasty.description ?? t.fallbacks.noDescription,
      to: `/dynasties/${dynasty.id}`,
      kindLabel: t.discoveryKinds.dynasty,
    }));

    return [...itemDiscoveries, ...settlementDiscoveries, ...dynastyDiscoveries].filter(
      (entry) => entry.id && entry.to
    );
  }, [items, settlements, dynasties, t]);

  const randomDiscovery = useMemo(() => pickDaily(discoveries, 'discovery-of-day'), [discoveries]);

  const worldStats = useMemo(
    () => [
      { label: t.stats.characters, value: characters.length },
      { label: t.stats.stories, value: stories.length },
      { label: t.stats.items, value: items.length },
      { label: t.stats.dynasties, value: dynasties.length },
      { label: t.stats.settlements, value: settlements.length },
    ],
    [characters.length, stories.length, items.length, dynasties.length, settlements.length, t]
  );

  if (isLoadingAll) {
    return <FantasyLoader />;
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 className={styles.title}>Aethera</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>

          <div className={styles.ctaRow}>
            <Link to="/stories" className={styles.primaryCta}>
              {t.cta.exploreStories}
            </Link>
            <Link to="/characters" className={styles.secondaryCta}>
              {t.cta.browseHeroes}
            </Link>
          </div>

          {!currentUser && (
            <div className={styles.guestPrompt}>
              <span>{t.guestPrompt}</span>
              <div className={styles.authLinks}>
                <Link to="/login">{t.cta.login}</Link>
                <Link to="/registration">{t.cta.register}</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.grid}>
        <article className={`${styles.widget} ${styles.featured}`}>
          <header className={styles.widgetHeader}>
            <Shield size={18} />
            <h2>{t.widgets.heroOfDay}</h2>
          </header>
          {heroOfDay ? (
            <>
              <h3 className={styles.widgetTitle}>{heroOfDay.name ?? t.fallbacks.unknownHero}</h3>
              <p className={styles.widgetText}>
                {heroOfDay.class ?? t.fallbacks.unknownClass} • {heroOfDay.species ?? t.fallbacks.unknownSpecies}
              </p>
              <Link to={`/characters/${heroOfDay.id}`} className={styles.widgetLink}>
                {t.cta.openProfile}
              </Link>
            </>
          ) : (
            <p className={styles.widgetText}>{t.empty.hero}</p>
          )}
        </article>

        <article className={styles.widget}>
          <header className={styles.widgetHeader}>
            <Sparkles size={18} />
            <h2>{t.widgets.randomDiscovery}</h2>
          </header>
          {randomDiscovery ? (
            <>
              <p className={styles.badge}>{randomDiscovery.kindLabel}</p>
              <h3 className={styles.widgetTitle}>{randomDiscovery.title}</h3>
              <p className={styles.widgetText}>{randomDiscovery.description}</p>
              <Link to={randomDiscovery.to} className={styles.widgetLink}>
                {t.cta.inspectDiscovery}
              </Link>
            </>
          ) : (
            <p className={styles.widgetText}>{t.empty.discovery}</p>
          )}
        </article>

        <article className={styles.widget}>
          <header className={styles.widgetHeader}>
            <ScrollText size={18} />
            <h2>{t.widgets.storyOfDay}</h2>
          </header>
          {storyOfDay ? (
            <>
              <h3 className={styles.widgetTitle}>{storyOfDay.title ?? t.fallbacks.unknownStory}</h3>
              <p className={styles.widgetText}>{storyOfDay.description ?? t.fallbacks.noDescription}</p>
              <Link to={`/stories/${storyOfDay.id}`} className={styles.widgetLink}>
                {t.cta.readStory}
              </Link>
            </>
          ) : (
            <p className={styles.widgetText}>{t.empty.story}</p>
          )}
        </article>

        <article className={styles.widget}>
          <header className={styles.widgetHeader}>
            <Compass size={18} />
            <h2>{t.widgets.aboutAethera}</h2>
          </header>
          <p className={styles.widgetText}>{t.aboutText}</p>
          <Link to="/stories" className={styles.widgetLink}>
            {t.cta.startJourney}
          </Link>
        </article>

        <article className={`${styles.widget} ${styles.fullWidth}`}>
          <header className={styles.widgetHeader}>
            <Star size={18} />
            <h2>{t.widgets.worldPulse}</h2>
          </header>
          <div className={styles.statsRow}>
            {worldStats.map((stat) => (
              <div key={stat.label} className={styles.statChip}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}