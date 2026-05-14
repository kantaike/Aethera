import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useAddSettlementTranslation, usePatchSettlement, useSettlement, useUploadSettlementArt } from '../hooks/useSettlements';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import styles from './Styles/EntityDetailsPage.module.css';
import { translations, useLanguage } from '../i18n/translations';
import { renderTextWithLinks } from '../components/TextLinks';
import { useAuthStore } from '../store/authStore';
import { createReplaceOperation } from '../api/patch';
import type { SettlementType } from '../api/types/types';
import { Modal } from '../components/Modal/Modal';
import formStyles from '../components/Modal/EntityForm.module.css';
import { validateArtFile } from '../utils/artValidation';

const SETTLEMENT_TYPES: SettlementType[] = ['City', 'Castle', 'Village'];

type EditableSettlementField = 'title' | 'type' | 'population' | 'description';

type SettlementDraft = {
  title: string;
  type: string;
  population: string;
  description: string;
};

export function SettlementDetailsPage() {
  const language = useLanguage();
  const t = translations.pages.entityDetails[language];
  const currentUser = useAuthStore((state) => state.currentUser);
  const isMaster = currentUser?.role === 'Master';
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useSettlement(id);
  const { mutateAsync: patchSettlement, isPending: isSaving, error: saveError } = usePatchSettlement();
  const { mutate: addSettlementTranslation, isPending: isAddingTranslation, error: addTranslationError } = useAddSettlementTranslation();
  const { mutate: uploadSettlementArt, isPending: isUploadingArt, error: uploadArtError } = useUploadSettlementArt();
  const artInputRef = useRef<HTMLInputElement>(null);
  const [editingField, setEditingField] = useState<EditableSettlementField | null>(null);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [translationFormError, setTranslationFormError] = useState('');
  const [draft, setDraft] = useState<SettlementDraft>({
    title: '',
    type: '',
    population: '',
    description: '',
  });
  const [translationDraft, setTranslationDraft] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (!data) return;
    setDraft({
      title: data.title ?? data.name ?? '',
      type: data.type ?? 'City',
      population: data.population == null ? '' : String(data.population),
      description: data.description ?? '',
    });
  }, [data]);

  const typeLabel = useMemo(() => {
    if (!data) return '';
    const key = (data.type ?? 'City') as keyof typeof t.settlement.typeLabels;
    return t.settlement.typeLabels[key] ?? data.type ?? t.settlementFallbackType;
  }, [data, t.settlement.typeLabels, t.settlementFallbackType]);
  const artSrc = data?.art?.filePath;

  if (isLoading) return <FantasyLoader />;
  if (isError || !data) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorText}>{t.settlementNotFound}</div>
      </div>
    );
  }

  const title = data.title ?? data.name ?? t.settlementFallbackTitle;

  const startEdit = (field: EditableSettlementField) => setEditingField(field);

  const cancelEdit = () => {
    setEditingField(null);
    setDraft({
      title,
      type: data.type ?? 'City',
      population: data.population == null ? '' : String(data.population),
      description: data.description ?? '',
    });
  };

  const saveField = async (field: EditableSettlementField) => {
    if (!id) {
      return;
    }

    const valueByField: Record<EditableSettlementField, unknown> = {
      title: draft.title.trim() || null,
      type: draft.type || null,
      population: draft.population === '' ? null : Number(draft.population),
      description: draft.description.trim() || null,
    };

    const pathByField: Record<EditableSettlementField, string> = {
      title: '/title',
      type: '/type',
      population: '/population',
      description: '/description',
    };

    await patchSettlement({
      id,
      operations: [createReplaceOperation(pathByField[field], valueByField[field])],
    });
    setEditingField(null);
  };

  const closeTranslateModal = () => {
    setIsTranslateOpen(false);
    setTranslationFormError('');
    setTranslationDraft({
      title: '',
      description: '',
    });
  };

  const handleAddTranslation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      return;
    }

    const payload = {
      id,
      title: translationDraft.title.trim() || undefined,
      description: translationDraft.description.trim() || undefined,
    };

    if (!payload.title && !payload.description) {
      setTranslationFormError(t.translationModal.required);
      return;
    }

    setTranslationFormError('');
    addSettlementTranslation(payload, {
      onSuccess: () => {
        closeTranslateModal();
        toast.success(t.translationModal.success);
      },
    });
  };

  const handleArtSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!id) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateArtFile(file);
    if (validationError === 'size') {
      toast.error(t.artTooLarge);
      event.target.value = '';
      return;
    }

    if (validationError === 'type') {
      toast.error(t.artInvalidType);
      event.target.value = '';
      return;
    }

    uploadSettlementArt(
      { id, file },
      {
        onSuccess: () => {
          toast.success(t.artUploadSuccess);
          event.target.value = '';
        },
      }
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.imageWrap}>
          {artSrc ? (
            <img className={styles.image} src={artSrc} alt={title} />
          ) : (
            <div className={`${styles.imagePlaceholder} ${styles.placeholderSettlement}`}>
              <span className={styles.imagePlaceholderIcon}>🏰</span>
              <span className={styles.imagePlaceholderText}>{t.noArt}</span>
            </div>
          )}
          {isMaster ? (
            <>
              <input
                ref={artInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp,image/tiff"
                onChange={handleArtSelected}
                hidden
              />
              <div className={styles.imageOverlay}>
                <button type="button" className={styles.imageOverlayButton} onClick={() => artInputRef.current?.click()} disabled={isUploadingArt}>
                  {isUploadingArt ? t.uploadingArt : t.uploadArt}
                </button>
              </div>
            </>
          ) : null}
        </div>
        <div className={styles.headerTopRow}>
          <div className={styles.headerMeta}>
            <h1 className={styles.title}>{renderTextWithLinks(title)}</h1>
            <div className={styles.subtitle}>{typeLabel}</div>
            <span className={styles.metaBadge}>{t.settlementFallbackType}</span>
          </div>
          {isMaster ? (
            <div className={styles.headerActions}>
              <button type="button" className={styles.editButton} onClick={() => setIsTranslateOpen(true)}>
                {t.addTranslationButton}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <article className={styles.article}>
        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>{t.details}</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>{t.settlement.title}</div>
              <div className={styles.detailValue}>
                {editingField === 'title' ? (
                  <input className={styles.editInput} value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} />
                ) : (
                  renderTextWithLinks(title)
                )}
              </div>
              {isMaster && (
                <div className={styles.editActions}>
                  {editingField === 'title' ? (
                    <>
                      <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isSaving}>{t.cancel}</button>
                      <button type="button" className={styles.saveButton} onClick={() => saveField('title')} disabled={isSaving}>{isSaving ? t.saving : t.save}</button>
                    </>
                  ) : (
                    <button type="button" className={styles.editButton} onClick={() => startEdit('title')}>{t.edit}</button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>{t.settlement.type}</div>
              <div className={styles.detailValue}>
                {editingField === 'type' ? (
                  <select className={styles.editSelect} value={draft.type} onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value }))}>
                    {SETTLEMENT_TYPES.map((type) => (
                      <option key={type} value={type}>{t.settlement.typeLabels[type as keyof typeof t.settlement.typeLabels]}</option>
                    ))}
                  </select>
                ) : (
                  typeLabel
                )}
              </div>
              {isMaster && (
                <div className={styles.editActions}>
                  {editingField === 'type' ? (
                    <>
                      <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isSaving}>{t.cancel}</button>
                      <button type="button" className={styles.saveButton} onClick={() => saveField('type')} disabled={isSaving}>{isSaving ? t.saving : t.save}</button>
                    </>
                  ) : (
                    <button type="button" className={styles.editButton} onClick={() => startEdit('type')}>{t.edit}</button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>{t.settlement.population}</div>
              <div className={styles.detailValue}>
                {editingField === 'population' ? (
                  <input
                    className={styles.editInput}
                    type="number"
                    min="0"
                    step="1"
                    value={draft.population}
                    onChange={(event) => setDraft((prev) => ({ ...prev, population: event.target.value }))}
                  />
                ) : data.population != null ? (
                  data.population
                ) : (
                  <span className={styles.detailValueMuted}>{t.noValue}</span>
                )}
              </div>
              {isMaster && (
                <div className={styles.editActions}>
                  {editingField === 'population' ? (
                    <>
                      <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isSaving}>{t.cancel}</button>
                      <button type="button" className={styles.saveButton} onClick={() => saveField('population')} disabled={isSaving}>{isSaving ? t.saving : t.save}</button>
                    </>
                  ) : (
                    <button type="button" className={styles.editButton} onClick={() => startEdit('population')}>{t.edit}</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>{t.description}</h2>
          <div className={styles.descriptionBlock}>
            {editingField === 'description' ? (
              <textarea className={styles.editTextarea} value={draft.description} onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))} />
            ) : data.description ? (
              renderTextWithLinks(data.description)
            ) : (
              <span className={styles.detailValueMuted}>{t.noDescription}</span>
            )}
            {isMaster && (
              <div className={styles.editActions} style={{ marginTop: 10 }}>
                {editingField === 'description' ? (
                  <>
                    <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isSaving}>{t.cancel}</button>
                    <button type="button" className={styles.saveButton} onClick={() => saveField('description')} disabled={isSaving}>{isSaving ? t.saving : t.save}</button>
                  </>
                ) : (
                  <button type="button" className={styles.editButton} onClick={() => startEdit('description')}>{t.edit}</button>
                )}
              </div>
            )}
          </div>
        </section>

        {saveError ? <p className={styles.saveError}>{t.saveError}</p> : null}
        {uploadArtError ? <p className={styles.saveError}>{t.saveError}</p> : null}
      </article>

      <Modal open={isTranslateOpen} onClose={closeTranslateModal} title={t.translationModal.title} subtitle={t.translationModal.subtitle}>
        <form className={formStyles.form} onSubmit={handleAddTranslation}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="settlement-translation-title">{t.translationModal.settlement.title}</label>
            <input
              id="settlement-translation-title"
              className={formStyles.input}
              value={translationDraft.title}
              onChange={(event) => setTranslationDraft((prev) => ({ ...prev, title: event.target.value }))}
              placeholder={t.translationModal.settlement.titlePlaceholder}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="settlement-translation-description">{t.translationModal.settlement.description}</label>
            <textarea
              id="settlement-translation-description"
              className={formStyles.textarea}
              value={translationDraft.description}
              onChange={(event) => setTranslationDraft((prev) => ({ ...prev, description: event.target.value }))}
              placeholder={t.translationModal.settlement.descriptionPlaceholder}
            />
          </div>
          {translationFormError ? <p className={formStyles.error}>{translationFormError}</p> : null}
          {addTranslationError ? <p className={formStyles.error}>{addTranslationError.message}</p> : null}
          <div className={formStyles.footer}>
            <button type="button" className={formStyles.secondaryButton} onClick={closeTranslateModal} disabled={isAddingTranslation}>
              {t.translationModal.cancel}
            </button>
            <button type="submit" className={formStyles.primaryButton} disabled={isAddingTranslation}>
              {isAddingTranslation ? t.translationModal.submitting : t.translationModal.submit}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

