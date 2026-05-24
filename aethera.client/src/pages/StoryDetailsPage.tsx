import { useRef } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useStory, useUploadStoryArt } from '../hooks/useStories';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import { renderTextWithLinks } from '../components/TextLinks';
import { translations, useLanguage } from '../i18n/translations';
import { useAuthStore } from '../store/authStore';
import { validateArtFile } from '../utils/artValidation';
import styles from './Styles/StoryDetailsPage.module.css';
import entityStyles from './Styles/EntityDetailsPage.module.css';

export function StoryDetailsPage() {
  const language = useLanguage();
  const t = translations.pages.storyDetails[language];
  const tEntity = translations.pages.entityDetails[language];
  const currentUser = useAuthStore((state) => state.currentUser);
  const isMaster = currentUser?.role === 'Master';
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useStory(id);
  const { mutate: uploadStoryArt, isPending: isUploadingArt, error: uploadArtError } = useUploadStoryArt();
  const artInputRef = useRef<HTMLInputElement>(null);
  const artSrc = data?.art?.filePath;

  if (isLoading) return <FantasyLoader />;
  if (isError || !data) {
    return (
      <div className={entityStyles.centered}>
        <div className={entityStyles.errorText}>{t.notFound}</div>
      </div>
    );
  }

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
      toast.error(tEntity.artTooLarge);
      event.target.value = '';
      return;
    }

    if (validationError === 'type') {
      toast.error(tEntity.artInvalidType);
      event.target.value = '';
      return;
    }

    uploadStoryArt(
      { id, file },
      {
        onSuccess: () => {
          toast.success(tEntity.artUploadSuccess);
          event.target.value = '';
        },
      }
    );
  };

  return (
    <div className={entityStyles.pageWrapper}>
      <header className={entityStyles.header}>
        <div className={entityStyles.imageWrap}>
          {artSrc ? (
            <img className={entityStyles.image} src={artSrc} alt={data.title ?? ''} />
          ) : (
            <div className={`${entityStyles.imagePlaceholder} ${entityStyles.placeholderStory}`}>
              <span className={entityStyles.imagePlaceholderIcon}>📜</span>
              <span className={entityStyles.imagePlaceholderText}>{tEntity.noArt}</span>
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
              <div className={entityStyles.imageOverlay}>
                <button type="button" className={entityStyles.imageOverlayButton} onClick={() => artInputRef.current?.click()} disabled={isUploadingArt}>
                  {isUploadingArt ? tEntity.uploadingArt : tEntity.uploadArt}
                </button>
              </div>
            </>
          ) : null}
        </div>
        <div className={entityStyles.headerTopRow}>
          <div className={entityStyles.headerMeta}>
            <h1 className={entityStyles.title}>{data.title ?? '—'}</h1>
            {data.description && (
              <p className={entityStyles.subtitle}>{data.description}</p>
            )}
          </div>
        </div>
      </header>

      <div className={entityStyles.article}>
        {data.content ? (
          <section className={`${entityStyles.section} ${styles.contentSection}`}>
            <h2 className={entityStyles.sectionHeader}>{t.content}</h2>
            <div className={styles.contentBody}>
              {renderTextWithLinks(data.content)}
            </div>
          </section>
        ) : (
          <section className={entityStyles.section}>
            <h2 className={entityStyles.sectionHeader}>{t.content}</h2>
            <p className={styles.empty}>{t.noContent}</p>
          </section>
        )}
        {uploadArtError ? <p className={entityStyles.saveError}>{tEntity.saveError}</p> : null}
      </div>
    </div>
  );
}
