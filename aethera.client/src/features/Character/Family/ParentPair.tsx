import { RelativeCard } from './RelativeCard';
import { TreeNode } from './TreeNode';
import styles from './ParentPair.module.css';

export const ParentPair = ({ person, allPeopleMap }: { person: any, allPeopleMap: Map<any, any> }) => {
  const partner = person.partnerId ? allPeopleMap.get(person.partnerId) : null;

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

      {person.children.length > 0 && (
        <div className={styles.childrenContainer}>
          {person.children.map((child: any) => (
            <TreeNode key={child.id} person={child} fullMap={allPeopleMap} />
          ))}
        </div>
      )}
    </div>
  );
};