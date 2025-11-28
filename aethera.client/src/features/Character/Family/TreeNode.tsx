import React from 'react';
import { RelativeCard } from './RelativeCard';
import styles from './TreeNode.module.css';

interface TreeNodeProps {
  person: any;
  fullMap: Map<string | number, any>;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ person, fullMap }) => {
  const partner = person.partnerId ? fullMap.get(person.partnerId) : null;

  return (
    <div className={styles.nodeWrapper}>
      <div className={styles.pairContainer}>
        <RelativeCard id={person.id} role={person.role} />
        
        {partner && (
          <>
            <div className={styles.marriageLine} />
            <RelativeCard id={partner.id} role={partner.role} />
          </>
        )}
      </div>

      {person.children && person.children.length > 0 && (
        <div className={styles.childrenContainer}>
          {person.children.map((child: any) => (
            <TreeNode key={child.id} person={child} fullMap={fullMap} />
          ))}
        </div>
      )}
    </div>
  );
};