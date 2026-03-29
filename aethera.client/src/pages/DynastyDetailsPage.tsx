import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useAddDynastyTranslation, useDynasty, usePatchDynasty, useUploadDynastyArt } from '../hooks/useDynasties';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import styles from './Styles/EntityDetailsPage.module.css';
import { translations, useLanguage } from '../i18n/translations';
import { renderTextWithLinks } from '../components/TextLinks';
import { useAuthStore } from '../store/authStore';
import { createReplaceOperation } from '../api/patch';
import type { DynastyStatus } from '../api/types/types';
import { Modal } from '../components/Modal/Modal';
import formStyles from '../components/Modal/EntityForm.module.css';
import { validateArtFile } from '../utils/artValidation';

const DYNASTY_STATUSES: DynastyStatus[] = ['Ruling', 'Fallen', 'Vassal'];

type EditableDynastyField = 'name' | 'status' | 'motto' | 'establishedYear' | 'power' | 'description';

type DynastyDraft = {
  name: string;
  status: string;
  motto: string;
  establishedYear: string;
  power: string;
  description: string;
};

export function DynastyDetailsPage() {
  const language = useLanguage();
  const t = translations.pages.entityDetails[language];
  const currentUser = useAuthStore((state) => state.currentUser);
  const isMaster = currentUser?.role === 'Master';
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useDynasty(id);
  const { mutateAsync: patchDynasty, isPending: isSaving, error: saveError } = usePatchDynasty();
  const { mutate: addDynastyTranslation, isPending: isAddingTranslation, error: addTranslationError } = useAddDynastyTranslation();
  const { mutate: uploadDynastyArt, isPending: isUploadingArt, error: uploadArtError } = useUploadDynastyArt();
  const artInputRef = useRef<HTMLInputElement>(null);
  const [editingField, setEditingField] = useState<EditableDynastyField | null>(null);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [translationFormError, setTranslationFormError] = useState('');
  const [draft, setDraft] = useState<DynastyDraft>({
    name: '',
    status: '',
    motto: '',
    establishedYear: '',
    power: '',
    description: '',
  });
  const [translationDraft, setTranslationDraft] = useState({
    name: '',
    motto: '',
    description: '',
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    setDraft({
      name: data.name ?? '',
      status: data.status ?? 'Vassal',
      motto: data.motto ?? '',
      establishedYear: data.establishedYear == null ? '' : String(data.establishedYear),
      power: data.power == null ? '' : String(data.power),
      description: data.description ?? '',
    });
  }, [data]);

  const statusLabel = useMemo(() => {
    const key = (data?.status ?? 'Vassal') as keyof typeof t.dynasty.statusLabels;
    return t.dynasty.statusLabels[key] ?? data?.status ?? t.noValue;
  }, [data?.status, t.dynasty.statusLabels, t.noValue]);
  const artSrc = data?.art?.filePath;

  if (isLoading) return <FantasyLoader />;
  if (isError || !data) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorText}>{t.dynastyNotFound}</div>
      </div>
    );
  }

  const startEdit = (field: EditableDynastyField) => setEditingField(field);

  const cancelEdit = () => {
    setEditingField(null);
    setDraft({
      name: data.name ?? '',
      status: data.status ?? 'Vassal',
      motto: data.motto ?? '',
      establishedYear: data.establishedYear == null ? '' : String(data.establishedYear),
      power: data.power == null ? '' : String(data.power),
      description: data.description ?? '',
    });
  };

  const saveField = async (field: EditableDynastyField) => {
    if (!id) {
      return;
    }

    const valueByField: Record<EditableDynastyField, unknown> = {
      name: draft.name.trim() || null,
      status: draft.status || null,
      motto: draft.motto.trim() || null,
      establishedYear: draft.establishedYear === '' ? null : Number(draft.establishedYear),
      power: draft.power === '' ? null : Number(draft.power),
      description: draft.description.trim() || null,
    };

    const pathByField: Record<EditableDynastyField, string> = {
      name: '/name',
      status: '/status',
      motto: '/motto',
      establishedYear: '/establishedYear',
      power: '/power',
      description: '/description',
    };

    await patchDynasty({
      id,
      operations: [createReplaceOperation(pathByField[field], valueByField[field])],
    });
    setEditingField(null);
  };

  const closeTranslateModal = () => {
    setIsTranslateOpen(false);
    setTranslationFormError('');
    setTranslationDraft({
      name: '',
      motto: '',
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
      name: translationDraft.name.trim() || undefined,
      motto: translationDraft.motto.trim() || undefined,
      description: translationDraft.description.trim() || undefined,
    };

    if (!payload.name && !payload.motto && !payload.description) {
      setTranslationFormError(t.translationModal.required);
      return;
    }

    setTranslationFormError('');
    addDynastyTranslation(payload, {
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

    uploadDynastyArt(
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
            <img className={styles.image} src={artSrc} alt={data.name ?? ''} />
          ) : (
            <div className={`${styles.imagePlaceholder} ${styles.placeholderDynasty}`}>
              <span className={styles.imagePlaceholderIcon}>⚜</span>
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
            <h1 className={styles.title}>{renderTextWithLinks(data.name ?? '')}</h1>
            <div className={styles.subtitle}>{statusLabel}</div>
            <span className={styles.metaBadge}>{t.dynastyType}</span>
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
              <div className={styles.detailLabel}>{t.dynasty.name}</div>
              <div className={styles.detailValue}>
                {editingField === 'name' ? (
                  <input className={styles.editInput} value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} />
                ) : (
                  renderTextWithLinks(data.name ?? '') || <span className={styles.detailValueMuted}>{t.noValue}</span>
                )}
              </div>
              {isMaster && (
                <div className={styles.editActions}>
                  {editingField === 'name' ? (
                    <>
                      <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isSaving}>{t.cancel}</button>
                      <button type="button" className={styles.saveButton} onClick={() => saveField('name')} disabled={isSaving}>{isSaving ? t.saving : t.save}</button>
                    </>
                  ) : (
                    <button type="button" className={styles.editButton} onClick={() => startEdit('name')}>{t.edit}</button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>{t.dynasty.status}</div>
              <div className={styles.detailValue}>
                {editingField === 'status' ? (
                  <select className={styles.editSelect} value={draft.status} onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))}>
                    {DYNASTY_STATUSES.map((status) => (
                      <option key={status} value={status}>{t.dynasty.statusLabels[status as keyof typeof t.dynasty.statusLabels]}</option>
                    ))}
                  </select>
                ) : (
                  statusLabel
                )}
              </div>
              {isMaster && (
                <div className={styles.editActions}>
                  {editingField === 'status' ? (
                    <>
                      <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isSaving}>{t.cancel}</button>
                      <button type="button" className={styles.saveButton} onClick={() => saveField('status')} disabled={isSaving}>{isSaving ? t.saving : t.save}</button>
                    </>
                  ) : (
                    <button type="button" className={styles.editButton} onClick={() => startEdit('status')}>{t.edit}</button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>{t.dynasty.motto}</div>
              <div className={styles.detailValue}>
                {editingField === 'motto' ? (
                  <input className={styles.editInput} value={draft.motto} onChange={(event) => setDraft((prev) => ({ ...prev, motto: event.target.value }))} />
                ) : data.motto ? (
                  renderTextWithLinks(data.motto)
                ) : (
                  <span className={styles.detailValueMuted}>{t.noValue}</span>
                )}
              </div>
              {isMaster && (
                <div className={styles.editActions}>
                  {editingField === 'motto' ? (
                    <>
                      <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isSaving}>{t.cancel}</button>
                      <button type="button" className={styles.saveButton} onClick={() => saveField('motto')} disabled={isSaving}>{isSaving ? t.saving : t.save}</button>
                    </>
                  ) : (
                    <button type="button" className={styles.editButton} onClick={() => startEdit('motto')}>{t.edit}</button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>{t.dynasty.establishedYear}</div>
              <div className={styles.detailValue}>
                {editingField === 'establishedYear' ? (
                  <input
                    className={styles.editInput}
                    type="number"
                    step="1"
                    value={draft.establishedYear}
                    onChange={(event) => setDraft((prev) => ({ ...prev, establishedYear: event.target.value }))}
                  />
                ) : data.establishedYear != null ? (
                  data.establishedYear
                ) : (
                  <span className={styles.detailValueMuted}>{t.noValue}</span>
                )}
              </div>
              {isMaster && (
                <div className={styles.editActions}>
                  {editingField === 'establishedYear' ? (
                    <>
                      <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isSaving}>{t.cancel}</button>
                      <button type="button" className={styles.saveButton} onClick={() => saveField('establishedYear')} disabled={isSaving}>{isSaving ? t.saving : t.save}</button>
                    </>
                  ) : (
                    <button type="button" className={styles.editButton} onClick={() => startEdit('establishedYear')}>{t.edit}</button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>{t.dynasty.power}</div>
              <div className={styles.detailValue}>
                {editingField === 'power' ? (
                  <input
                    className={styles.editInput}
                    type="number"
                    step="1"
                    min="0"
                    value={draft.power}
                    onChange={(event) => setDraft((prev) => ({ ...prev, power: event.target.value }))}
                  />
                ) : data.power != null ? (
                  data.power
                ) : (
                  <span className={styles.detailValueMuted}>{t.noValue}</span>
                )}
              </div>
              {isMaster && (
                <div className={styles.editActions}>
                  {editingField === 'power' ? (
                    <>
                      <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isSaving}>{t.cancel}</button>
                      <button type="button" className={styles.saveButton} onClick={() => saveField('power')} disabled={isSaving}>{isSaving ? t.saving : t.save}</button>
                    </>
                  ) : (
                    <button type="button" className={styles.editButton} onClick={() => startEdit('power')}>{t.edit}</button>
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
            <label className={formStyles.label} htmlFor="dynasty-translation-name">{t.translationModal.dynasty.name}</label>
            <input
              id="dynasty-translation-name"
              className={formStyles.input}
              value={translationDraft.name}
              onChange={(event) => setTranslationDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder={t.translationModal.dynasty.namePlaceholder}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="dynasty-translation-motto">{t.translationModal.dynasty.motto}</label>
            <input
              id="dynasty-translation-motto"
              className={formStyles.input}
              value={translationDraft.motto}
              onChange={(event) => setTranslationDraft((prev) => ({ ...prev, motto: event.target.value }))}
              placeholder={t.translationModal.dynasty.mottoPlaceholder}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="dynasty-translation-description">{t.translationModal.dynasty.description}</label>
            <textarea
              id="dynasty-translation-description"
              className={formStyles.textarea}
              value={translationDraft.description}
              onChange={(event) => setTranslationDraft((prev) => ({ ...prev, description: event.target.value }))}
              placeholder={t.translationModal.dynasty.descriptionPlaceholder}
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

