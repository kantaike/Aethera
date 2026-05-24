export interface Relative {
  id: string;
  role: string;
  fatherId?: string;
  motherId?: string;
  children?: Relative[];
  partnerId?: string;
  isPartner?: boolean; // Флаг, чтобы не рендерить его отдельно
  isMain?: boolean;
}

export const buildFamilyTree = (relatives: Relative[], currentCharacter: any) => {
  const map = new Map<string, any>();

  const normalizeId = (value: unknown) => {
    if (value === null || value === undefined) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  };

  const allPeople = [
    ...relatives,
    { ...currentCharacter, role: 'SELF', isMain: true },
  ].map((person) => ({
    ...person,
    id: normalizeId(person.id) ?? '',
    fatherId: normalizeId(person.fatherId),
    motherId: normalizeId(person.motherId),
  }));

  allPeople.forEach((person) => {
    if (!person.id) return;
    map.set(person.id, {
      ...person,
      children: [],
      partnerId: null,
      isPartner: false,
    });
  });

  const pairAnchorByKey = new Map<string, string>();
  const toPairKey = (firstParentId: string, secondParentId: string) => {
    return [firstParentId, secondParentId].sort().join('|');
  };

  // 1. Connect parent pairs once and remember which parent is the visual anchor.
  allPeople.forEach((person) => {
    const fatherId = person.fatherId;
    const motherId = person.motherId;

    if (!fatherId || !motherId || !map.has(fatherId) || !map.has(motherId)) {
      return;
    }

    const pairKey = toPairKey(fatherId, motherId);
    if (pairAnchorByKey.has(pairKey)) {
      return;
    }

    const fatherNode = map.get(fatherId);
    const motherNode = map.get(motherId);

    let anchor = fatherNode;
    let partner = motherNode;

    if (fatherNode.partnerId && fatherNode.partnerId !== motherId) {
      anchor = motherNode;
      partner = fatherNode;
    }

    if (!anchor.partnerId || anchor.partnerId === partner.id) {
      anchor.partnerId = partner.id;
      partner.isPartner = true;
      pairAnchorByKey.set(pairKey, anchor.id);
      return;
    }

    pairAnchorByKey.set(pairKey, anchor.id);
  });

  // 2. Build child hierarchy. If both parents exist, attach to the stored pair anchor.
  allPeople.forEach((person) => {
    if (!person.id || !map.has(person.id)) {
      return;
    }

    const fatherId = person.fatherId;
    const motherId = person.motherId;

    let targetParentId: string | undefined;

    if (fatherId && motherId && map.has(fatherId) && map.has(motherId)) {
      const pairKey = toPairKey(fatherId, motherId);
      targetParentId = pairAnchorByKey.get(pairKey) ?? fatherId;
    } else if (fatherId && map.has(fatherId)) {
      targetParentId = fatherId;
    } else if (motherId && map.has(motherId)) {
      targetParentId = motherId;
    }

    if (!targetParentId) {
      return;
    }

    const targetNode = map.get(targetParentId);
    const childNode = map.get(person.id);
    if (!targetNode || !childNode) {
      return;
    }

    if (!targetNode.children.some((child: any) => child.id === childNode.id)) {
      targetNode.children.push(childNode);
    }
  });

  // 3. Roots are nodes without known parents in the current graph.
  const roots = allPeople
    .filter((person) => {
      if (!person.id || !map.has(person.id)) {
        return false;
      }

      const node = map.get(person.id);
      if (node.isPartner) {
        return false;
      }

      const hasFatherInMap = Boolean(person.fatherId && map.has(person.fatherId));
      const hasMotherInMap = Boolean(person.motherId && map.has(person.motherId));
      return !hasFatherInMap && !hasMotherInMap;
    })
    .map((person) => map.get(person.id));

  if (roots.length > 0) {
    return { roots, fullMap: map };
  }

  const fallbackSelf = normalizeId(currentCharacter?.id);
  if (fallbackSelf && map.has(fallbackSelf)) {
    return { roots: [map.get(fallbackSelf)], fullMap: map };
  }

  return { roots: [], fullMap: map };
};