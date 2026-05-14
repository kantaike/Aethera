import { mergeAttributes, Node } from '@tiptap/core';

export type EntityReferenceType = 'character' | 'item' | 'dynasty' | 'settlement';

type EntityReferenceAttrs = {
  entityType: EntityReferenceType;
  id: string;
  label: string;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    entityReference: {
      insertEntityReference: (attrs: EntityReferenceAttrs) => ReturnType;
    };
  }
}

export const EntityReferenceExtension = Node.create({
  name: 'entityReference',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      entityType: {
        default: 'character',
      },
      id: {
        default: '',
      },
      label: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'character[id]',
        getAttrs: (element) => ({
          entityType: 'character',
          id: (element as HTMLElement).getAttribute('id') ?? '',
          label: (element as HTMLElement).textContent ?? '',
        }),
      },
      {
        tag: 'item[id]',
        getAttrs: (element) => ({
          entityType: 'item',
          id: (element as HTMLElement).getAttribute('id') ?? '',
          label: (element as HTMLElement).textContent ?? '',
        }),
      },
      {
        tag: 'dynasty[id]',
        getAttrs: (element) => ({
          entityType: 'dynasty',
          id: (element as HTMLElement).getAttribute('id') ?? '',
          label: (element as HTMLElement).textContent ?? '',
        }),
      },
      {
        tag: 'settlement[id]',
        getAttrs: (element) => ({
          entityType: 'settlement',
          id: (element as HTMLElement).getAttribute('id') ?? '',
          label: (element as HTMLElement).textContent ?? '',
        }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const tagName = node.attrs.entityType as EntityReferenceType;

    return [
      tagName,
      mergeAttributes(HTMLAttributes, {
        id: node.attrs.id,
        'data-entity-reference': 'true',
      }),
      node.attrs.label || node.attrs.id,
    ];
  },

  addCommands() {
    return {
      insertEntityReference:
        (attrs: EntityReferenceAttrs) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs,
            })
            .insertContent(' ')
            .run(),
    };
  },
});
