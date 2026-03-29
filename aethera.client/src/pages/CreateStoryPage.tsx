import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useCreateStory } from '../hooks/useStories';
import { useCharacters } from '../hooks/useCharacters';
import { useDynasties } from '../hooks/useDynasties';
import { useItems } from '../hooks/useItems';
import { useSettlements } from '../hooks/useSettlements';
import type { CharacterPreview, Dynasty, Item, Settlement } from '../api/types/types';
import { useAuthStore } from '../store/authStore';
import { translations, useLanguage } from '../i18n/translations';
import {
  EntityReferenceExtension,
  type EntityReferenceType,
} from '../features/Stories/editor/EntityReferenceExtension';
import styles from './Styles/CreateStoryPage.module.css';

type EntityOption = {
  id: string;
  label: string;
};

export function CreateStoryPage() {
  const language = useLanguage();
  const t = translations.pages.storyCreate[language];
  const navigate = useNavigate();
  const { mutateAsync: createStory, isPending, error } = useCreateStory();
  const { data: characters } = useCharacters();
  const { data: dynasties } = useDynasties();
  const { data: items } = useItems();
  const { data: settlements } = useSettlements();
  const currentUser = useAuthStore((state) => state.currentUser);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [entityType, setEntityType] = useState<EntityReferenceType>('character');
  const [entitySearch, setEntitySearch] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      EntityReferenceExtension,
      Placeholder.configure({
        placeholder: t.contentPlaceholder,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },
    onUpdate: ({ editor: nextEditor }) => {
      setContent(nextEditor.getHTML());
    },
  });

  const culture = useMemo(() => (language === 'uk' ? 'uk-UA' : 'en-US'), [language]);

  const entityOptions = useMemo<EntityOption[]>(() => {
    const query = entitySearch.trim().toLowerCase();

    const matchesQuery = (value: string) =>
      query.length === 0 || value.toLowerCase().includes(query);

    if (entityType === 'character') {
      const entries: EntityOption[] = (characters ?? []).map((character: CharacterPreview) => ({
        id: character.id ?? '',
        label: character.name ?? t.unknown,
      }));

      return entries
        .filter((entry: EntityOption) => entry.id !== '' && matchesQuery(entry.label))
        .slice(0, 8);
    }

    if (entityType === 'dynasty') {
      const entries: EntityOption[] = (dynasties ?? []).map((dynasty: Dynasty) => ({
        id: dynasty.id ?? '',
        label: dynasty.name ?? t.unknown,
      }));

      return entries
        .filter((entry: EntityOption) => entry.id !== '' && matchesQuery(entry.label))
        .slice(0, 8);
    }

    if (entityType === 'item') {
      const entries: EntityOption[] = (items ?? []).map((item: Item) => ({
        id: item.id ?? '',
        label: item.name ?? t.unknown,
      }));

      return entries
        .filter((entry: EntityOption) => entry.id !== '' && matchesQuery(entry.label))
        .slice(0, 8);
    }

    const entries: EntityOption[] = (settlements ?? []).map((settlement: Settlement) => ({
      id: settlement.id ?? '',
      label: settlement.title ?? t.unknown,
    }));

    return entries
      .filter((entry: EntityOption) => entry.id !== '' && matchesQuery(entry.label))
      .slice(0, 8);
  }, [characters, dynasties, entitySearch, entityType, items, settlements, t.unknown]);

  const insertEntityReference = (id: string, label: string) => {
    editor
      ?.chain()
      .focus()
      .insertEntityReference({
        entityType,
        id,
        label,
      })
      .run();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setFormError(t.requiredTitle);
      return;
    }

    if (!currentUser?.id) {
      setFormError(t.requiredAuthor);
      return;
    }

    setFormError('');

    const htmlContent = content.trim();
    const normalizedContent = htmlContent === '' || htmlContent === '<p></p>'
      ? undefined
      : htmlContent;

    try {
      await createStory({
        title: title.trim(),
        description: description.trim() || undefined,
        content: normalizedContent,
        authorId: currentUser.id,
      });

      navigate('/stories');
    } catch {
      // Error is surfaced by React Query mutation state and shown below.
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>
        <Link to="/stories" className={styles.backLink}>{t.backToList}</Link>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t.mainBlock}</h2>

          <label className={styles.label}>
            {t.titleLabel}
            <input
              className={styles.input}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
            />
          </label>

          <label className={styles.label}>
            {t.descriptionLabel}
            <textarea
              className={styles.textarea}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
            />
          </label>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t.artBlock}</h2>
          <div className={styles.artPlaceholder}>
            <span className={styles.artIcon}>🖼️</span>
            <p className={styles.artText}>{t.artPlaceholder}</p>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t.contentBlock}</h2>
          <p className={styles.hint}>{t.contentHint}</p>
          <div className={styles.entityTools}>
            <div className={styles.entityTypeTabs}>
              {(['character', 'dynasty', 'item', 'settlement'] as EntityReferenceType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={styles.entityTypeButton}
                  data-active={entityType === type || undefined}
                  onClick={() => setEntityType(type)}
                >
                  {t.entityTypeLabels[type]}
                </button>
              ))}
            </div>

            <input
              type="text"
              className={styles.entitySearchInput}
              placeholder={t.searchEntityPlaceholder}
              value={entitySearch}
              onChange={(event) => setEntitySearch(event.target.value)}
            />

            <div className={styles.suggestionList}>
              {entityOptions.length === 0 ? (
                <span className={styles.noSuggestions}>{t.noEntityResults}</span>
              ) : (
                entityOptions.map((option: EntityOption) => (
                  <button
                    key={option.id}
                    type="button"
                    className={styles.suggestionButton}
                    onClick={() => insertEntityReference(option.id, option.label)}
                    title={option.id}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
          <div className={styles.editorShell}>
            <div className={styles.toolbar}>
              <button
                className={styles.toolButton}
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                disabled={!editor?.can().chain().focus().toggleBold().run()}
                data-active={editor?.isActive('bold') || undefined}
                aria-label="Bold"
              >
                B
              </button>
              <button
                className={styles.toolButton}
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                disabled={!editor?.can().chain().focus().toggleItalic().run()}
                data-active={editor?.isActive('italic') || undefined}
                aria-label="Italic"
              >
                I
              </button>
              <button
                className={styles.toolButton}
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                data-active={editor?.isActive('heading', { level: 2 }) || undefined}
                aria-label="Heading"
              >
                H2
              </button>
              <button
                className={styles.toolButton}
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                data-active={editor?.isActive('bulletList') || undefined}
                aria-label="Bullet list"
              >
                • List
              </button>
              <button
                className={styles.toolButton}
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                data-active={editor?.isActive('orderedList') || undefined}
                aria-label="Ordered list"
              >
                1. List
              </button>
            </div>
            <EditorContent editor={editor} />
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t.autoMeta}</h2>
          <div className={styles.metaGrid}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>{t.authorId}</span>
              <span className={styles.metaValue}>{currentUser?.id ?? t.unknown}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>{t.culture}</span>
              <span className={styles.metaValue}>{culture}</span>
            </div>
          </div>
        </section>

        {(formError || error) && <p className={styles.error}>{formError || String(error)}</p>}

        <div className={styles.actions}>
          <Link to="/stories" className={styles.cancelButton}>{t.cancel}</Link>
          <button type="submit" className={styles.submitButton} disabled={isPending}>
            {isPending ? t.submitting : t.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
