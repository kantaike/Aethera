import { useMemo, useState } from 'react';
import type { AdministrativeUnit, AdministrativeUnitType, CharacterPreview, Settlement, SettlementType } from '../api/types/types';
import { SettlementCard } from '../features/Settlements/SettlementCard/SettlementCard';
import { useCreateSettlement, useSettlements } from '../hooks/useSettlements';
import styles from './Styles/SettlementsPage.module.css';
import { useAdministrativeUnits, useCreateAdministrativeUnit } from '../hooks/useAdministrativeUnits';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import { translations, useLanguage } from '../i18n/translations';
import { useCharacters } from '../hooks/useCharacters';
import { useAuthStore } from '../store/authStore';
import { Modal } from '../components/Modal/Modal';
import formStyles from '../components/Modal/EntityForm.module.css';

const SETTLEMENT_TYPES: SettlementType[] = ['City', 'Castle', 'Village'];
const ADMIN_UNIT_TYPES: AdministrativeUnitType[] = ['Country', 'Region', 'Province'];

type SettlementFormState = {
  title: string;
  description: string;
  population: string;
  type: SettlementType;
  provinceId: string;
  rulerId: string;
};

type AdministrativeUnitFormState = {
  title: string;
  type: AdministrativeUnitType;
  description: string;
  parentId: string;
  rulerId: string;
};

const INITIAL_SETTLEMENT_FORM: SettlementFormState = {
  title: '',
  description: '',
  population: '',
  type: 'City',
  provinceId: '',
  rulerId: '',
};

const INITIAL_ADMINISTRATIVE_UNIT_FORM: AdministrativeUnitFormState = {
  title: '',
  type: 'Country',
  description: '',
  parentId: '',
  rulerId: '',
};

export function SettlementsPage() {
  const language = useLanguage();
  const t = translations.pages.settlements[language];
  const { data: settlements, isLoading: sLoading } = useSettlements();
  const { data: units, isLoading: uLoading } = useAdministrativeUnits();
  const { data: characters, isLoading: cLoading } = useCharacters();
  const { mutate: createSettlement, isPending: isCreating, error: createError } = useCreateSettlement();
  const { mutate: createAdministrativeUnit, isPending: isCreatingUnit, error: createUnitError } = useCreateAdministrativeUnit();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isMaster = currentUser?.role === 'Master';
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateUnitOpen, setIsCreateUnitOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [unitFormError, setUnitFormError] = useState('');
  const [settlementForm, setSettlementForm] = useState<SettlementFormState>(INITIAL_SETTLEMENT_FORM);
  const [administrativeUnitForm, setAdministrativeUnitForm] = useState<AdministrativeUnitFormState>(INITIAL_ADMINISTRATIVE_UNIT_FORM);

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setFormError('');
    setSettlementForm(INITIAL_SETTLEMENT_FORM);
  };

  const closeCreateUnitModal = () => {
    setIsCreateUnitOpen(false);
    setUnitFormError('');
    setAdministrativeUnitForm(INITIAL_ADMINISTRATIVE_UNIT_FORM);
  };

  const updateSettlementForm = <Key extends keyof SettlementFormState>(key: Key, value: SettlementFormState[Key]) => {
    setSettlementForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateAdministrativeUnitForm = <Key extends keyof AdministrativeUnitFormState>(
    key: Key,
    value: AdministrativeUnitFormState[Key]
  ) => {
    setAdministrativeUnitForm((current) => {
      return {
        ...current,
        [key]: value,
      };
    });
  };

  const organizedSettlements = useMemo(() => {
    if (!settlements || !units) return { topLevelCountries: [], vassalsByParent: new Map() };

    const unitsMap = new Map<string, AdministrativeUnit>(units.map((u: AdministrativeUnit) => [u.id, u]));

    // Organize countries into top-level and vassals
    const topLevelCountries: AdministrativeUnit[] = [];
    const vassalsByParent = new Map<string, AdministrativeUnit[]>();

    units.forEach((unit: AdministrativeUnit) => {
      if (unit.type === 'Country') {
        if (!unit.parentId) {
          topLevelCountries.push(unit);
        } else {
          if (!vassalsByParent.has(unit.parentId)) {
            vassalsByParent.set(unit.parentId, []);
          }
          vassalsByParent.get(unit.parentId)!.push(unit);
        }
      }
    });

    // Sort for consistency
    topLevelCountries.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
    vassalsByParent.forEach((vassals) => {
      vassals.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
    });

    // Function to organize settlements for a specific country
    const getSettlementsForCountry = (countryId: string | null | undefined): Map<string, Settlement[]> => {
      const map = new Map<string, Settlement[]>();

      settlements.forEach((s: Settlement) => {
        const province = unitsMap.get(s.provinceId ?? '');
        const region = province ? unitsMap.get(province.parentId!) : null;
        const country = region ? unitsMap.get(region.parentId!) : null;

        // Check if this settlement belongs to the specified country
        const belongsToCountry = country?.id === countryId || (!region && province?.id === countryId);

        if (belongsToCountry) {
          const regionName = region?.title || t.localAreas;

          if (!map.has(regionName)) {
            map.set(regionName, []);
          }
          map.get(regionName)!.push(s);
        }
      });

      return map;
    };

    return {
      topLevelCountries,
      vassalsByParent,
      getSettlementsForCountry,
    };
  }, [settlements, t.localAreas, units]);

  const provinceOptions = useMemo(() => {
    return (units ?? [])
      .filter((unit: AdministrativeUnit) => unit.type === 'Province' && unit.id)
      .sort((left: AdministrativeUnit, right: AdministrativeUnit) =>
        (left.title ?? '').localeCompare(right.title ?? '')
      );
  }, [units]);

  const rulerOptions = useMemo(() => {
    return (characters ?? [])
      .filter((character: CharacterPreview) => character.id)
      .sort((left: CharacterPreview, right: CharacterPreview) =>
        (left.name ?? '').localeCompare(right.name ?? '')
      );
  }, [characters]);

  const parentOptions = useMemo(() => {
    const expectedParentType =
      administrativeUnitForm.type === 'Region'
        ? 'Country'
        : administrativeUnitForm.type === 'Province'
          ? 'Region'
          : administrativeUnitForm.type === 'Country'
            ? 'Country'
            : null;

    if (!expectedParentType) {
      return [];
    }

    return (units ?? [])
      .filter((unit: AdministrativeUnit) => unit.type === expectedParentType && unit.id)
      .sort((left: AdministrativeUnit, right: AdministrativeUnit) =>
        (left.title ?? '').localeCompare(right.title ?? '')
      );
  }, [administrativeUnitForm.type, units]);

  const handleCreateSettlement = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!settlementForm.title.trim()) {
      setFormError(t.modal.required);
      return;
    }

    setFormError('');
    createSettlement(
      {
        title: settlementForm.title.trim(),
        description: settlementForm.description.trim() || undefined,
        population: settlementForm.population === '' ? undefined : Number(settlementForm.population),
        type: settlementForm.type,
        provinceId: settlementForm.provinceId || undefined,
        rulerId: settlementForm.rulerId || undefined,
      },
      {
        onSuccess: closeCreateModal,
      }
    );
  };

  const handleCreateAdministrativeUnit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!administrativeUnitForm.title.trim()) {
      setUnitFormError(t.unitModal.required);
      return;
    }

    setUnitFormError('');
    createAdministrativeUnit(
      {
        title: administrativeUnitForm.title.trim(),
        type: administrativeUnitForm.type,
        description: administrativeUnitForm.description.trim() || undefined,
        parentId: administrativeUnitForm.parentId || undefined,
        rulerId: administrativeUnitForm.rulerId || undefined,
      },
      {
        onSuccess: closeCreateUnitModal,
      }
    );
  };

  if (sLoading || uLoading || (isMaster && cLoading)) {
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
          <div className={styles.actions}>
            <button type="button" className={styles.createButton} onClick={() => setIsCreateOpen(true)}>
              {t.createButton}
            </button>
            <button type="button" className={styles.createButton} onClick={() => setIsCreateUnitOpen(true)}>
              {t.createUnitButton}
            </button>
          </div>
        ) : null}
      </div>
      
      {organizedSettlements.topLevelCountries.length === 0 ? (
        <p className={styles.empty}>{t.empty}</p>
      ) : (
        organizedSettlements.topLevelCountries.map((country) => {
          const countrySettlements = organizedSettlements.getSettlementsForCountry?.(country.id) || new Map();
          const vassals = organizedSettlements.vassalsByParent.get(country.id!) || [];

          return (
            <section key={country.id} className={styles.countrySection}>
              <div className={styles.countryHeader}>
                <h2 className={styles.countryName}>{country.title}</h2>
                <div className={styles.goldLine} />
              </div>

              {/* Regions and settlements for main country */}
              {Array.from(countrySettlements).map(([region, settlementsList]: [string, Settlement[]]) => (
                <div key={region} className={styles.regionBlock}>
                  <h3 className={styles.regionName}>
                    <span className={styles.diamond}>◈</span> {region}
                  </h3>
                  <div className={styles.settlementsGrid}>
                    {settlementsList.map((s: Settlement) => (
                      <SettlementCard key={s.id} {...s} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Vassal states section */}
              {vassals.length > 0 && (
                <div className={styles.vassalStatesSection}>
                  <h3 className={styles.vassalStatesTitle}>
                    <span className={styles.vasselIcon}>◆</span> Vassal States
                  </h3>
                  <div className={styles.vassalsList}>
                    {vassals.map((vassal: AdministrativeUnit) => {
                      const vasselSettlements = organizedSettlements.getSettlementsForCountry?.(vassal.id) || new Map();
                      const subVassals = organizedSettlements.vassalsByParent.get(vassal.id!) || [];

                      return (
                        <div key={vassal.id} className={styles.vasselCountry}>
                          <div className={styles.vasselCountryHeader}>
                            <h4 className={styles.vasselCountryName}>{vassal.title}</h4>
                            <span className={styles.vasselBadge}>Vassal</span>
                          </div>

                          {/* Regions for vassal */}
                          {Array.from(vasselSettlements).map(([region, settlementsList]: [string, Settlement[]]) => (
                            <div key={region} className={styles.vasselRegionBlock}>
                              <h5 className={styles.vasselRegionName}>
                                <span className={styles.diamond}>◈</span> {region}
                              </h5>
                              <div className={styles.settlementsGrid}>
                                {settlementsList.map((s: Settlement) => (
                                  <SettlementCard key={s.id} {...s} />
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* Sub-vassals */}
                          {subVassals.length > 0 && (
                            <div className={styles.subVasselsList}>
                              {subVassals.map((subVassal: AdministrativeUnit) => {
                                const subVasselSettlements = organizedSettlements.getSettlementsForCountry?.(subVassal.id) || new Map();

                                return (
                                  <div key={subVassal.id} className={styles.subVasselCountry}>
                                    <div className={styles.subVasselHeader}>
                                      <h5 className={styles.subVasselName}>{subVassal.title}</h5>
                                      <span className={styles.subVasselBadge}>Vassal</span>
                                    </div>

                                    {Array.from(subVasselSettlements).map(([region, settlementsList]: [string, Settlement[]]) => (
                                      <div key={region} className={styles.subVasselRegionBlock}>
                                        <h6 className={styles.subVasselRegionName}>
                                          <span className={styles.diamond}>◈</span> {region}
                                        </h6>
                                        <div className={styles.settlementsGrid}>
                                          {settlementsList.map((s: Settlement) => (
                                            <SettlementCard key={s.id} {...s} />
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          );
        })
      )}

      <Modal open={isCreateOpen} onClose={closeCreateModal} title={t.modal.title} subtitle={t.modal.subtitle}>
        <form className={formStyles.form} onSubmit={handleCreateSettlement}>
          <div className={formStyles.grid}>
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label} htmlFor="settlement-title">{t.modal.titleLabel}</label>
              <input
                id="settlement-title"
                className={formStyles.input}
                value={settlementForm.title}
                onChange={(event) => updateSettlementForm('title', event.target.value)}
                placeholder={t.modal.titlePlaceholder}
                required
              />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settlement-type">{t.modal.type}</label>
              <select
                id="settlement-type"
                className={formStyles.select}
                value={settlementForm.type}
                onChange={(event) => updateSettlementForm('type', event.target.value as SettlementType)}
              >
                {SETTLEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t.typeLabels[type as keyof typeof t.typeLabels]}
                  </option>
                ))}
              </select>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settlement-population">{t.modal.population}</label>
              <input
                id="settlement-population"
                type="number"
                min="0"
                step="1"
                className={formStyles.input}
                value={settlementForm.population}
                onChange={(event) => updateSettlementForm('population', event.target.value)}
              />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settlement-province">{t.modal.province}</label>
              <select
                id="settlement-province"
                className={formStyles.select}
                value={settlementForm.provinceId}
                onChange={(event) => updateSettlementForm('provinceId', event.target.value)}
              >
                <option value="">{t.modal.noProvince}</option>
                {provinceOptions.map((province: AdministrativeUnit) => (
                  <option key={province.id} value={province.id}>
                    {province.title}
                  </option>
                ))}
              </select>
              <p className={formStyles.hint}>{t.modal.provinceHint}</p>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settlement-ruler">{t.modal.ruler}</label>
              <select
                id="settlement-ruler"
                className={formStyles.select}
                value={settlementForm.rulerId}
                onChange={(event) => updateSettlementForm('rulerId', event.target.value)}
              >
                <option value="">{t.modal.noRuler}</option>
                {rulerOptions.map((character: CharacterPreview) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label} htmlFor="settlement-description">{t.modal.description}</label>
              <textarea
                id="settlement-description"
                className={formStyles.textarea}
                value={settlementForm.description}
                onChange={(event) => updateSettlementForm('description', event.target.value)}
                placeholder={t.modal.descriptionPlaceholder}
              />
            </div>
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

      <Modal
        open={isCreateUnitOpen}
        onClose={closeCreateUnitModal}
        title={t.unitModal.title}
        subtitle={t.unitModal.subtitle}
      >
        <form className={formStyles.form} onSubmit={handleCreateAdministrativeUnit}>
          <div className={formStyles.grid}>
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label} htmlFor="administrative-unit-title">{t.unitModal.titleLabel}</label>
              <input
                id="administrative-unit-title"
                className={formStyles.input}
                value={administrativeUnitForm.title}
                onChange={(event) => updateAdministrativeUnitForm('title', event.target.value)}
                placeholder={t.unitModal.titlePlaceholder}
                required
              />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="administrative-unit-type">{t.unitModal.type}</label>
              <select
                id="administrative-unit-type"
                className={formStyles.select}
                value={administrativeUnitForm.type}
                onChange={(event) => updateAdministrativeUnitForm('type', event.target.value as AdministrativeUnitType)}
              >
                {ADMIN_UNIT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t.unitTypeLabels[type as keyof typeof t.unitTypeLabels]}
                  </option>
                ))}
              </select>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="administrative-unit-parent">{t.unitModal.parent}</label>
              <select
                id="administrative-unit-parent"
                className={formStyles.select}
                value={administrativeUnitForm.parentId}
                onChange={(event) => updateAdministrativeUnitForm('parentId', event.target.value)}
                disabled={parentOptions.length === 0}
              >
                <option value="">{t.unitModal.noParent}</option>
                {parentOptions.map((unit: AdministrativeUnit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.title}
                  </option>
                ))}
              </select>
              <p className={formStyles.hint}>{t.unitModal.parentHint}</p>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="administrative-unit-ruler">{t.unitModal.ruler}</label>
              <select
                id="administrative-unit-ruler"
                className={formStyles.select}
                value={administrativeUnitForm.rulerId}
                onChange={(event) => updateAdministrativeUnitForm('rulerId', event.target.value)}
              >
                <option value="">{t.unitModal.noRuler}</option>
                {rulerOptions.map((character: CharacterPreview) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label} htmlFor="administrative-unit-description">{t.unitModal.description}</label>
              <textarea
                id="administrative-unit-description"
                className={formStyles.textarea}
                value={administrativeUnitForm.description}
                onChange={(event) => updateAdministrativeUnitForm('description', event.target.value)}
                placeholder={t.unitModal.descriptionPlaceholder}
              />
            </div>
          </div>
          {unitFormError ? <p className={formStyles.error}>{unitFormError}</p> : null}
          {createUnitError ? <p className={formStyles.error}>{createUnitError.message}</p> : null}
          <div className={formStyles.footer}>
            <button
              type="button"
              className={formStyles.secondaryButton}
              onClick={closeCreateUnitModal}
              disabled={isCreatingUnit}
            >
              {t.unitModal.cancel}
            </button>
            <button type="submit" className={formStyles.primaryButton} disabled={isCreatingUnit}>
              {isCreatingUnit ? t.unitModal.submitting : t.unitModal.submit}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}