import { useMemo, useState } from 'react';
import type { ArmorType, Item, ItemType } from '../api/types/types';
import { ItemRow } from '../features/Items/ItemRow/ItemRow';
import { useCreateItem, useItems } from '../hooks/useItems';
import { FantasyLoader } from '../components/Loader/FantasyLoader';
import styles from './Styles/ItemsPage.module.css';
import { translations, useLanguage } from '../i18n/translations';
import { useAuthStore } from '../store/authStore';
import { Modal } from '../components/Modal/Modal';
import formStyles from '../components/Modal/EntityForm.module.css';

const TYPE_OPTIONS: Array<'' | ItemType> = ['', 'Item', 'Equipment', 'Armor', 'Weapon'];
const ARMOR_TYPE_OPTIONS: Array<'' | ArmorType> = ['', 'Light', 'Medium', 'Heavy'];

type SortKey = 'name' | 'type' | 'cost';

type ItemFormState = {
  name: string;
  description: string;
  weight: string;
  cost: string;
  type: ItemType;
  damageDice: string;
  damageSides: string;
  damageModifier: string;
  armorModifier: string;
  armorType: '' | ArmorType;
};

const INITIAL_ITEM_FORM: ItemFormState = {
  name: '',
  description: '',
  weight: '',
  cost: '',
  type: 'Item',
  damageDice: '',
  damageSides: '',
  damageModifier: '',
  armorModifier: '',
  armorType: '',
};

export function ItemsPage() {
  const language = useLanguage();
  const t = translations.pages.items[language];
  const { data: items, isLoading } = useItems();
  const { mutate: createItem, isPending: isCreating, error: createError } = useCreateItem();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isMaster = currentUser?.role === 'Master';
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [itemForm, setItemForm] = useState<ItemFormState>(INITIAL_ITEM_FORM);

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setFormError('');
    setItemForm(INITIAL_ITEM_FORM);
  };

  const updateItemForm = <Key extends keyof ItemFormState>(key: Key, value: ItemFormState[Key]) => {
    setItemForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleCreateItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!itemForm.name.trim()) {
      setFormError(t.modal.required);
      return;
    }

    setFormError('');
    createItem(
      {
        name: itemForm.name.trim(),
        description: itemForm.description.trim() || undefined,
        weight: itemForm.weight === '' ? undefined : Number(itemForm.weight),
        cost: itemForm.cost === '' ? undefined : Number(itemForm.cost),
        type: itemForm.type,
        damageExpression:
          itemForm.type === 'Weapon' && itemForm.damageDice !== '' && itemForm.damageSides !== ''
            ? {
                diceCount: Number(itemForm.damageDice),
                diceSides: Number(itemForm.damageSides),
                constantModifier: itemForm.damageModifier === '' ? 0 : Number(itemForm.damageModifier),
              }
            : undefined,
        armorModifier:
          itemForm.type === 'Armor' && itemForm.armorModifier !== ''
            ? Number(itemForm.armorModifier)
            : undefined,
        armorType: itemForm.type === 'Armor' && itemForm.armorType ? itemForm.armorType : undefined,
      },
      {
        onSuccess: closeCreateModal,
      }
    );
  };

  const filteredAndSorted = useMemo(() => {
    if (!items) return [];

    let result = (items as Item[]).filter((item) => {
      const nameMatch =
        !searchQuery ||
        (item.name ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const typeMatch =
        !typeFilter || (item.type ?? 'Item') === typeFilter;
      return nameMatch && typeMatch;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') {
        cmp = (a.name ?? '').localeCompare(b.name ?? '');
      } else if (sortBy === 'type') {
        cmp = (a.type ?? '').localeCompare(b.type ?? '');
      } else {
        cmp = (a.cost ?? 0) - (b.cost ?? 0);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [items, searchQuery, typeFilter, sortBy, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={styles.select}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt || 'all'} value={opt}>
              {opt === ''
                ? t.allTypes
                : opt === 'Item'
                  ? t.typeLabels.Item
                  : opt === 'Equipment'
                    ? t.typeLabels.Equipment
                    : opt === 'Armor'
                      ? t.typeLabels.Armor
                      : t.typeLabels.Weapon}
            </option>
          ))}
        </select>
        <span className={styles.count}>
          {filteredAndSorted.length} {filteredAndSorted.length === 1 ? t.countSingle : t.countPlural}
        </span>
      </div>

      <div className={styles.listWrapper}>
        <div className={styles.listHeader}>
          <div className={styles.headerIcon} />
          <button
            type="button"
            className={`${styles.headerButton} ${sortBy === 'name' ? styles.sortActive : ''}`}
            onClick={() => handleSort('name')}
          >
            {t.columns.name} {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            type="button"
            className={`${styles.headerButton} ${styles.headerType} ${sortBy === 'type' ? styles.sortActive : ''}`}
            onClick={() => handleSort('type')}
          >
            {t.columns.type} {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            type="button"
            className={`${styles.headerButton} ${sortBy === 'cost' ? styles.sortActive : ''}`}
            onClick={() => handleSort('cost')}
          >
            {t.columns.cost} {sortBy === 'cost' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        <div className={styles.list}>
          {filteredAndSorted.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      {filteredAndSorted.length === 0 && (
        <p className={styles.empty}>{t.empty}</p>
      )}

      <Modal open={isCreateOpen} onClose={closeCreateModal} title={t.modal.title} subtitle={t.modal.subtitle}>
        <form className={formStyles.form} onSubmit={handleCreateItem}>
          <div className={formStyles.grid}>
            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label} htmlFor="item-name">{t.modal.name}</label>
              <input
                id="item-name"
                className={formStyles.input}
                value={itemForm.name}
                onChange={(event) => updateItemForm('name', event.target.value)}
                placeholder={t.modal.namePlaceholder}
                required
              />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="item-type">{t.modal.type}</label>
              <select
                id="item-type"
                className={formStyles.select}
                value={itemForm.type}
                onChange={(event) => updateItemForm('type', event.target.value as ItemType)}
              >
                {TYPE_OPTIONS.filter(Boolean).map((type) => (
                  <option key={type} value={type}>
                    {t.typeLabels[type as keyof typeof t.typeLabels]}
                  </option>
                ))}
              </select>
              <p className={formStyles.hint}>{t.modal.typeHint}</p>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="item-cost">{t.modal.cost}</label>
              <input
                id="item-cost"
                type="number"
                min="0"
                step="0.1"
                className={formStyles.input}
                value={itemForm.cost}
                onChange={(event) => updateItemForm('cost', event.target.value)}
              />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="item-weight">{t.modal.weight}</label>
              <input
                id="item-weight"
                type="number"
                min="0"
                step="1"
                className={formStyles.input}
                value={itemForm.weight}
                onChange={(event) => updateItemForm('weight', event.target.value)}
              />
            </div>

            {itemForm.type === 'Weapon' ? (
              <>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="item-damage-dice">{t.modal.damageDice}</label>
                  <input
                    id="item-damage-dice"
                    type="number"
                    min="1"
                    step="1"
                    className={formStyles.input}
                    value={itemForm.damageDice}
                    onChange={(event) => updateItemForm('damageDice', event.target.value)}
                  />
                </div>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="item-damage-sides">{t.modal.damageSides}</label>
                  <input
                    id="item-damage-sides"
                    type="number"
                    min="2"
                    step="1"
                    className={formStyles.input}
                    value={itemForm.damageSides}
                    onChange={(event) => updateItemForm('damageSides', event.target.value)}
                  />
                </div>
                <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
                  <label className={formStyles.label} htmlFor="item-damage-modifier">{t.modal.damageModifier}</label>
                  <input
                    id="item-damage-modifier"
                    type="number"
                    step="1"
                    className={formStyles.input}
                    value={itemForm.damageModifier}
                    onChange={(event) => updateItemForm('damageModifier', event.target.value)}
                  />
                </div>
              </>
            ) : null}

            {itemForm.type === 'Armor' ? (
              <>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="item-armor-modifier">{t.modal.armorModifier}</label>
                  <input
                    id="item-armor-modifier"
                    type="number"
                    step="1"
                    className={formStyles.input}
                    value={itemForm.armorModifier}
                    onChange={(event) => updateItemForm('armorModifier', event.target.value)}
                  />
                </div>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="item-armor-type">{t.modal.armorType}</label>
                  <select
                    id="item-armor-type"
                    className={formStyles.select}
                    value={itemForm.armorType}
                    onChange={(event) => updateItemForm('armorType', event.target.value as '' | ArmorType)}
                  >
                    <option value="">{t.modal.none}</option>
                    {ARMOR_TYPE_OPTIONS.filter(Boolean).map((type) => (
                      <option key={type} value={type}>
                        {t.armorTypeLabels[type as keyof typeof t.armorTypeLabels]}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}

            <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
              <label className={formStyles.label} htmlFor="item-description">{t.modal.description}</label>
              <textarea
                id="item-description"
                className={formStyles.textarea}
                value={itemForm.description}
                onChange={(event) => updateItemForm('description', event.target.value)}
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
    </div>
  );
}
