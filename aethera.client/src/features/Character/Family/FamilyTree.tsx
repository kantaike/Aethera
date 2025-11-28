import { useMemo } from 'react';
import { TreeNode } from './TreeNode';
import { buildFamilyTree } from './treeUtils';
import styles from './FamilyTree.module.css';

export const FamilyTree = ({ relatives, character }: { relatives: any[], character: any }) => {
  const { roots, fullMap } = useMemo(() => buildFamilyTree(relatives, character), [relatives, character]);

  return (
    <div className={styles.treeContainer}>
      <div className={styles.branch}>
        {roots.map(root => (
          <TreeNode key={root.id} person={root} fullMap={fullMap} />
        ))}
      </div>
    </div>
  );
};