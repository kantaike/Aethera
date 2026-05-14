import { useMemo, useState } from 'react';
import { DynastyCard } from '../features/Dynasties/DynastyCard/DynastyCard';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import { useCreateDynasty, useDynasties } from '../hooks/useDynasties';
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
import { translations, useLanguage } from '../i18n/translations';
import { useAuthStore } from '../store/authStore';
import { Modal } from '../components/Modal/Modal';
import formStyles from '../components/Modal/EntityForm.module.css';

const STATUS_OPTIONS: { value: '' | DynastyStatus }[] = [
  { value: '' },
  { value: 'Ruling' },
  { value: 'Fallen' },
  { value: 'Vassal' },
];

export function DynastiesPage() {
  const language = useLanguage();
  const t = translations.pages.dynasties[language];
  const { data: dynasties, isLoading: dynastiesLoading } = useDynasties();
  const { data: characters, isLoading: charactersLoading } = useCharacters();
  const { mutate: createDynasty, isPending: isCreating, error: createError } = useCreateDynasty();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isMaster = currentUser?.role === 'Master';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | DynastyStatus>('');
  const [cultureFilter, setCultureFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDynastyName, setNewDynastyName] = useState('');
  const [newDynastyDescription, setNewDynastyDescription] = useState('');
  const [formError, setFormError] = useState('');

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setNewDynastyName('');
    setNewDynastyDescription('');
    setFormError('');
  };

  const handleCreateDynasty = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newDynastyName.trim()) {
      setFormError(t.modal.required);
      return;
    }

    setFormError('');
    createDynasty(
      {
        name: newDynastyName.trim(),
        description: newDynastyDescription.trim() || undefined,
      },
      {
        onSuccess: closeCreateModal,
      }
    );
  };

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
      motto: index === 0 ? t.defaultMotto : DEFAULT_MOTTO,
      culture: DEFAULT_CULTURE,
      status: (index === 0 ? 'Ruling' : DEFAULT_STATUS) as DynastyStatus,
      memberIds: charByDynasty.get(d.id ?? '') ?? [],
    }));
  }, [dynasties, characters, t.defaultMotto]);

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
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.mainTitle}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>
        {isMaster ? (
          <button type="button" className={styles.createButton} onClick={() => setIsCreateOpen(true)}>
            {t.createButton}
          </button>
        ) : null}
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder={t.searchPlaceholder}
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
              {opt.value === '' ? t.allStatuses : t.status[opt.value]}
            </option>
          ))}
        </select>
        <select
          value={cultureFilter}
          onChange={(e) => setCultureFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">{t.allCultures}</option>
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
            <span className={styles.crown}>👑</span> {t.royalHouses}
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
            <span className={styles.diamond}>◈</span> {t.nobleHouses}
          </h2>
          <div className={styles.mainGrid}>
            {mainDynasties.map((dynasty) => (
              <DynastyCard key={dynasty.id} {...dynasty} variant="standard" />
            ))}
          </div>
        </section>
      )}

      {filteredDynasties.length === 0 && (
        <p className={styles.empty}>{t.empty}</p>
      )}

      <Modal open={isCreateOpen} onClose={closeCreateModal} title={t.modal.title} subtitle={t.modal.subtitle}>
        <form className={formStyles.form} onSubmit={handleCreateDynasty}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="dynasty-name">{t.modal.name}</label>
            <input
              id="dynasty-name"
              className={formStyles.input}
              value={newDynastyName}
              onChange={(event) => setNewDynastyName(event.target.value)}
              placeholder={t.modal.namePlaceholder}
              required
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="dynasty-description">{t.modal.description}</label>
            <textarea
              id="dynasty-description"
              className={formStyles.textarea}
              value={newDynastyDescription}
              onChange={(event) => setNewDynastyDescription(event.target.value)}
              placeholder={t.modal.descriptionPlaceholder}
            />
          </div>
          {formError ? <p className={formStyles.error}>{formError}</p> : null}
          {createError ? <p className={formStyles.error}>{createError.message}</p> : null}
          <div className={formStyles.footer}>
            <button type="button" className={formStyles.secondaryButton} onClick={closeCreateModal} disabled={isCreating}>
              {t.modal.cancel}
            </button>
            <button type="submit" className={formStyles.primaryButton} disabled={isCreating}>
              {isCreating ? t.modal.submitting : t.modal.submit}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
