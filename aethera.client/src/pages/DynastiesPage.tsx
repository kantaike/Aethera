import { useMemo, useState } from 'react';
import { DynastyCard } from '../features/Dynasties/DynastyCard/DynastyCard';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import { useDynasties } from '../hooks/useDynasties';
import { useCharacters } from '../hooks/useCharacters';
import type { Dynasty } from '../api/types/types';
import type { DynastyView, DynastyStatus } from '../features/Dynasties/types';
import {
  DEFAULT_INFLUENCE,
  DEFAULT_STATUS,
  DEFAULT_MOTTO,
  DEFAULT_CULTURE,
} from '../features/Dynasties/types';
import styles from './Styles/DynastiesPage.module.css';

const STATUS_OPTIONS: { value: '' | DynastyStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'Ruling', label: 'Ruling' },
  { value: 'Fallen', label: 'Fallen' },
  { value: 'Vassal', label: 'Vassal' },
];

export function DynastiesPage() {
  const { data: dynasties, isLoading: dynastiesLoading } = useDynasties();
  const { data: characters, isLoading: charactersLoading } = useCharacters();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | DynastyStatus>('');
  const [cultureFilter, setCultureFilter] = useState('');

  const enrichedDynasties = useMemo((): DynastyView[] => {
    if (!dynasties) return [];

    const charByDynasty = new Map<string, string[]>();
    (characters ?? []).forEach((c: { id?: string; dynastyId?: string | null }) => {
      if (c.dynastyId && c.id) {
        const list = charByDynasty.get(c.dynastyId) ?? [];
        list.push(c.id);
        charByDynasty.set(c.dynastyId, list);
      }
    });

    return (dynasties as Dynasty[]).map((d, index) => ({
      ...d,
      influence: index === 0 ? 5 : DEFAULT_INFLUENCE,
      motto: index === 0 ? 'Strength in unity' : DEFAULT_MOTTO,
      culture: DEFAULT_CULTURE,
      status: (index === 0 ? 'Ruling' : DEFAULT_STATUS) as DynastyStatus,
      memberIds: charByDynasty.get(d.id ?? '') ?? [],
    }));
  }, [dynasties, characters]);

  const cultureOptions = useMemo(() => {
    const set = new Set<string>();
    enrichedDynasties.forEach((d) => {
      const c = d.culture ?? DEFAULT_CULTURE;
      set.add(c);
    });
    return Array.from(set).sort();
  }, [enrichedDynasties]);

  const filteredDynasties = useMemo(() => {
    return enrichedDynasties.filter((d) => {
      const nameMatch =
        !searchQuery ||
        (d.name ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const statusMatch = !statusFilter || d.status === statusFilter;
      const cultureMatch =
        !cultureFilter || (d.culture ?? DEFAULT_CULTURE) === cultureFilter;
      return nameMatch && statusMatch && cultureMatch;
    });
  }, [enrichedDynasties, searchQuery, statusFilter, cultureFilter]);

  const tier1Dynasties = useMemo(
    () => filteredDynasties.filter((d) => (d.influence ?? 0) >= 4),
    [filteredDynasties]
  );
  const mainDynasties = useMemo(
    () => filteredDynasties.filter((d) => (d.influence ?? 0) < 4),
    [filteredDynasties]
  );

  const isLoading = dynastiesLoading || charactersLoading;

  if (isLoading) {
    return <FantasyLoader fullScreen />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>Hall of Fame</h1>
      <p className={styles.subtitle}>Great Houses of the Realm</p>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Search dynasties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | DynastyStatus)}
          className={styles.select}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={cultureFilter}
          onChange={(e) => setCultureFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">All cultures</option>
          {cultureOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {tier1Dynasties.length > 0 && (
        <section className={styles.tierSection}>
          <h2 className={styles.tierTitle}>
            <span className={styles.crown}>👑</span> Royal Houses
          </h2>
          <div className={styles.tier1Grid}>
            {tier1Dynasties.map((dynasty) => (
              <DynastyCard
                key={dynasty.id}
                {...dynasty}
                variant="tier1"
              />
            ))}
          </div>
        </section>
      )}

      {mainDynasties.length > 0 && (
        <section className={styles.tierSection}>
          <h2 className={styles.tierTitle}>
            <span className={styles.diamond}>◈</span> Noble Houses
          </h2>
          <div className={styles.mainGrid}>
            {mainDynasties.map((dynasty) => (
              <DynastyCard key={dynasty.id} {...dynasty} variant="standard" />
            ))}
          </div>
        </section>
      )}

      {filteredDynasties.length === 0 && (
        <p className={styles.empty}>No dynasties match your filters.</p>
      )}
    </div>
  );
}
