import { type ReactNode } from 'react';
import { Character } from './Character';
import { Item } from './Item';
import { Dynasty } from './Dynasty';
import { Settlement } from './Settlement';

type KnownTag = 'character' | 'item' | 'dynasty' | 'settlement';

const allowedTags = new Set([
  'b',
  'strong',
  'i',
  'em',
  'u',
  'br',
  'p',
  'ul',
  'ol',
  'li',
  'span',
]);

function getIdAttr(el: Element): string | null {
  return (
    el.getAttribute('id') ||
    el.getAttribute('data-id') ||
    el.getAttribute('dataId')
  );
}

function renderChildren(el: Element, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  el.childNodes.forEach((n, i) => out.push(nodeToReact(n, `${keyPrefix}.${i}`)));
  return out;
}

function nodeToReact(node: Node, key: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const el = node as Element;
  const tag = el.tagName.toLowerCase() as KnownTag | string;

  if (tag === 'character') {
    const id = getIdAttr(el);
    return id ? <Character key={key} id={id}>{renderChildren(el, key)}</Character> : renderChildren(el, key);
  }
  if (tag === 'item') {
    const id = getIdAttr(el);
    return id ? <Item key={key} id={id}>{renderChildren(el, key)}</Item> : renderChildren(el, key);
  }
  if (tag === 'dynasty') {
    const id = getIdAttr(el);
    return id ? <Dynasty key={key} id={id}>{renderChildren(el, key)}</Dynasty> : renderChildren(el, key);
  }
  if (tag === 'settlement') {
    const id = getIdAttr(el);
    return id ? <Settlement key={key} id={id}>{renderChildren(el, key)}</Settlement> : renderChildren(el, key);
  }

  if (!allowedTags.has(tag)) {
    // Strip unknown/unsafe tags but keep their text content.
    return renderChildren(el, key);
  }

  const children = renderChildren(el, key);
  switch (tag) {
    case 'br':
      return <br key={key} />;
    case 'b':
    case 'strong':
      return <strong key={key}>{children}</strong>;
    case 'i':
    case 'em':
      return <em key={key}>{children}</em>;
    case 'u':
      return <u key={key}>{children}</u>;
    case 'p':
      return <p key={key}>{children}</p>;
    case 'ul':
      return <ul key={key}>{children}</ul>;
    case 'ol':
      return <ol key={key}>{children}</ol>;
    case 'li':
      return <li key={key}>{children}</li>;
    case 'span':
    default:
      return <span key={key}>{children}</span>;
  }
}

export function renderTextWithLinks(input: string | null | undefined): ReactNode {
  if (!input) return null;
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return input;

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${input}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return input;

  const out: ReactNode[] = [];
  root.childNodes.forEach((n, i) => out.push(nodeToReact(n, `r.${i}`)));
  return out;
}

