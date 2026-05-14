import React from 'react';
import { RelativeCard } from './RelativeCard';
import styles from './TreeNode.module.css';

interface TreeNodeProps {
  person: any;
  fullMap: Map<string | number, any>;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ person, fullMap }) => {
  const partner = person.partnerId ? fullMap.get(person.partnerId) : null;

  const role = String(person.role ?? '').toUpperCase();

  const getTierClass = () => {
    if (role === 'SELF' || role === 'MAIN') return styles.tierSelf;
    if (role === 'FATHER' || role === 'MOTHER' || role === 'PARENT') return styles.tierParent;
    if (role.includes('GRANDPARENT')) return styles.tierGrand;
    return styles.tierOther;
  };

  const tierClass = getTierClass();

  return (
    <div className={`${styles.nodeWrapper} ${tierClass}`}>
      <div className={styles.pairContainer}>
        <RelativeCard id={person.id} role={person.role} />
        
        {partner && (
          <>
            <div className={`${styles.marriageLine} ${styles.revealLine}`} />
            <RelativeCard id={partner.id} role={partner.role} />
          </>
        )}
      </div>

      {person.children && person.children.length > 0 && (
        <div className={`${styles.childrenContainer} ${styles.revealLine}`}>
          {person.children.map((child: any) => (
            <TreeNode key={child.id} person={child} fullMap={fullMap} />
          ))}
        </div>
      )}
    </div>
  );
};