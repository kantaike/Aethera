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
  const map = new Map<string | number, any>();
  const allPeople = [...relatives, { ...currentCharacter, role: 'SELF', isMain: true }];
  
  allPeople.forEach(p => map.set(p.id, { ...p, children: [], partnerId: null, isPartner: false }));

  // 1. Связываем пары (находим общих детей)
  allPeople.forEach(p => {
    if (p.fatherId && p.motherId && map.has(p.fatherId) && map.has(p.motherId)) {
      const father = map.get(p.fatherId);
      const mother = map.get(p.motherId);
      
      if (!father.partnerId && !mother.isPartner) {
        father.partnerId = mother.id;
        mother.isPartner = true;
      }
    }
  });

  // 2. Строим иерархию (дети идут к "ведущему" родителю или к единственному)
  allPeople.forEach(p => {
    const parentId = p.fatherId || p.motherId;
    if (parentId && map.has(parentId)) {
      let targetParentId = parentId;
      // Если родитель — "ведомый" партнер, крепим ребенка к "ведущему"
      const parentNode = map.get(parentId);
      if (parentNode.isPartner) {
        // Ищем, чей это партнер
        for (const [id, node] of map.entries()) {
          if (node.partnerId === parentId) {
            targetParentId = id;
            break;
          }
        }
      }
      
      const targetNode = map.get(targetParentId);
      if (!targetNode.children.some((c: any) => c.id === p.id)) {
        targetNode.children.push(map.get(p.id));
      }
    }
  });

  // 3. Определяем корни (только те, кто в самом верхнем доступном слое)
  const layerOrder = ['GREAT-GRANDPARENT', 'GRANDPARENT', 'FATHER', 'MOTHER', 'SELF'];
  for (const roleName of layerOrder) {
    const roots = allPeople.filter(p => 
      p.role.toUpperCase() === roleName && 
      !map.get(p.id).isPartner && 
      !map.has(p.fatherId) && !map.has(p.motherId)
    );
    if (roots.length > 0) return { roots: roots.map(r => map.get(r.id)), fullMap: map };
  }
  
  return { roots: [], fullMap: map };
};