import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useAddItemTranslation, useItem, usePatchItem, useUploadItemArt } from '../hooks/useItems';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import styles from './Styles/EntityDetailsPage.module.css';
import { translations, useLanguage } from '../i18n/translations';
import { renderTextWithLinks } from '../components/TextLinks';
import { useAuthStore } from '../store/authStore';
import { createReplaceOperation } from '../api/patch';
import type { ItemType } from '../api/types/types';
import { Modal } from '../components/Modal/Modal';
import formStyles from '../components/Modal/EntityForm.module.css';
import { validateArtFile } from '../utils/artValidation';

const ITEM_TYPES: ItemType[] = ['Item', 'Equipment', 'Armor', 'Weapon'];

type EditableItemField = 'name' | 'type' | 'cost' | 'weight' | 'description';

type ItemDraft = {
  name: string;
  type: string;
  cost: string;
  weight: string;
  description: string;
};

export function ItemDetailsPage() {
  const language = useLanguage();
  const t = translations.pages.entityDetails[language];
  const currentUser = useAuthStore((state) => state.currentUser);
  const isMaster = currentUser?.role === 'Master';
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useItem(id);
  const { mutateAsync: patchItem, isPending: isSaving, error: saveError } = usePatchItem();
  const { mutate: addItemTranslation, isPending: isAddingTranslation, error: addTranslationError } = useAddItemTranslation();
  const { mutate: uploadItemArt, isPending: isUploadingArt, error: uploadArtError } = useUploadItemArt();
  const artInputRef = useRef<HTMLInputElement>(null);
  const [editingField, setEditingField] = useState<EditableItemField | null>(null);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [translationFormError, setTranslationFormError] = useState('');
  const [draft, setDraft] = useState<ItemDraft>({
    name: '',
    type: '',
    cost: '',
    weight: '',
    description: '',
  });
  const [translationDraft, setTranslationDraft] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    setDraft({
      name: data.name ?? '',
      type: data.type ?? '',
      cost: data.cost == null ? '' : String(data.cost),
      weight: data.weight == null ? '' : String(data.weight),
      description: data.description ?? '',
    });
  }, [data]);

  const itemTypeLabel = useMemo(() => {
    const key = (data?.type ?? 'Item') as keyof typeof t.item.typeLabels;
    return t.item.typeLabels[key] ?? data?.type ?? t.itemFallbackType;
  }, [data?.type, t.item.typeLabels, t.itemFallbackType]);
  const artSrc = data?.art?.filePath;

  if (isLoading) return <FantasyLoader />;
  if (isError || !data) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorText}>{t.itemNotFound}</div>
      </div>
    );
  }

  const startEdit = (field: EditableItemField) => setEditingField(field);

  const cancelEdit = () => {
    setEditingField(null);
    setDraft({
      name: data.name ?? '',
      type: data.type ?? '',
      cost: data.cost == null ? '' : String(data.cost),
      weight: data.weight == null ? '' : String(data.weight),
      description: data.description ?? '',
    });
  };

  const saveField = async (field: EditableItemField) => {
    if (!id) {
      return;
    }

    const valueByField: Record<EditableItemField, unknown> = {
      name: draft.name.trim() || null,
      type: draft.type || null,
      cost: draft.cost === '' ? null : Number(draft.cost),
      weight: draft.weight === '' ? null : Number(draft.weight),
      description: draft.description.trim() || null,
    };

    const pathByField: Record<EditableItemField, string> = {
      name: '/name',
      type: '/type',
      cost: '/cost',
      weight: '/weight',
      description: '/description',
    };

    await patchItem({
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
      description: '',
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

    uploadItemArt(
      { id, file },
      {
        onSuccess: () => {
          toast.success(t.artUploadSuccess);
          event.target.value = '';
        },
      }
    );
  };

  const handleAddTranslation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      return;
    }

    const payload = {
      id,
      name: translationDraft.name.trim() || undefined,
      description: translationDraft.description.trim() || undefined,
    };

    if (!payload.name && !payload.description) {
      setTranslationFormError(t.translationModal.required);
      return;
    }

    setTranslationFormError('');
    addItemTranslation(payload, {
      onSuccess: () => {
        closeTranslateModal();
        toast.success(t.translationModal.success);
      },
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.imageWrap}>
          {artSrc ? (
            <img className={styles.image} src={artSrc} alt={data.name ?? ''} />
          ) : (
            <div className={`${styles.imagePlaceholder} ${styles.placeholderItem}`}>
              <span className={styles.imagePlaceholderIcon}>⚔</span>
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
            <div className={styles.subtitle}>{itemTypeLabel}</div>
            <span className={styles.metaBadge}>{t.itemFallbackType}</span>
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
              <div className={styles.detailLabel}>{t.item.name}</div>
              <div className={styles.detailValue}>
                {editingField === 'name' ? (
                  <input
                    className={styles.editInput}
                    value={draft.name}
                    onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                  />
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
              <div className={styles.detailLabel}>{t.item.type}</div>
              <div className={styles.detailValue}>
                {editingField === 'type' ? (
                  <select
                    className={styles.editSelect}
                    value={draft.type}
                    onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value }))}
                  >
                    {ITEM_TYPES.map((type) => (
                      <option key={type} value={type}>{t.item.typeLabels[type as keyof typeof t.item.typeLabels]}</option>
                    ))}
                  </select>
                ) : (
                  itemTypeLabel
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
              <div className={styles.detailLabel}>{t.item.cost}</div>
              <div className={styles.detailValue}>
                {editingField === 'cost' ? (
                  <input
                    className={styles.editInput}
                    type="number"
                    step="0.1"
                    min="0"
                    value={draft.cost}
                    onChange={(event) => setDraft((prev) => ({ ...prev, cost: event.target.value }))}
                  />
                ) : data.cost != null ? (
                  `${Number(data.cost).toFixed(1)} gp`
                ) : (
                  <span className={styles.detailValueMuted}>{t.noValue}</span>
                )}
              </div>
              {isMaster && (
                <div className={styles.editActions}>
                  {editingField === 'cost' ? (
                    <>
                      <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isSaving}>{t.cancel}</button>
                      <button type="button" className={styles.saveButton} onClick={() => saveField('cost')} disabled={isSaving}>{isSaving ? t.saving : t.save}</button>
                    </>
                  ) : (
                    <button type="button" className={styles.editButton} onClick={() => startEdit('cost')}>{t.edit}</button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>{t.item.weight}</div>
              <div className={styles.detailValue}>
                {editingField === 'weight' ? (
                  <input
                    className={styles.editInput}
                    type="number"
                    step="1"
                    min="0"
                    value={draft.weight}
                    onChange={(event) => setDraft((prev) => ({ ...prev, weight: event.target.value }))}
                  />
                ) : data.weight != null ? (
                  data.weight
                ) : (
                  <span className={styles.detailValueMuted}>{t.noValue}</span>
                )}
              </div>
              {isMaster && (
                <div className={styles.editActions}>
                  {editingField === 'weight' ? (
                    <>
                      <button type="button" className={styles.cancelButton} onClick={cancelEdit} disabled={isSaving}>{t.cancel}</button>
                      <button type="button" className={styles.saveButton} onClick={() => saveField('weight')} disabled={isSaving}>{isSaving ? t.saving : t.save}</button>
                    </>
                  ) : (
                    <button type="button" className={styles.editButton} onClick={() => startEdit('weight')}>{t.edit}</button>
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
              <textarea
                className={styles.editTextarea}
                value={draft.description}
                onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              />
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
            <label className={formStyles.label} htmlFor="item-translation-name">{t.translationModal.item.name}</label>
            <input
              id="item-translation-name"
              className={formStyles.input}
              value={translationDraft.name}
              onChange={(event) => setTranslationDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder={t.translationModal.item.namePlaceholder}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="item-translation-description">{t.translationModal.item.description}</label>
            <textarea
              id="item-translation-description"
              className={formStyles.textarea}
              value={translationDraft.description}
              onChange={(event) => setTranslationDraft((prev) => ({ ...prev, description: event.target.value }))}
              placeholder={t.translationModal.item.descriptionPlaceholder}
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

