import React from 'react';
import styles from './RelativeCard.module.css';
import { CharacterMiniCard } from '../CharacterMiniCard/CharacterMiniCard';

interface RelativeCardProps {
  id: string;
  role: string;
}

export const RelativeCard: React.FC<RelativeCardProps> = ({ id, role }) => {
  // Логика иконок теперь живет только здесь
  const getRoleIcon = (roleName: string | null) => {
    const r = roleName?.toLowerCase() || '';
    if (r.includes('parent') || r.includes('father') || r.includes('mother')) return '▲';
    if (r.includes('child')) return '▼';
    if (r.includes('sibling')) return '◆';
    return '•';
  };

  const formatRole = (r: string) => {
    if (r === 'SELF' || r === 'MAIN') return 'Current';
    return r
      .toLowerCase()
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) || r;
  };

  const isMain = role === 'SELF' || role === 'MAIN';
  const wrapperClass = `${isMain ? styles.mainCharacter : ''}`;

  const formattedRole = (
    <span className={styles.relativeRole}>
      <span className={styles.roleIcon}>{getRoleIcon(role)}</span>
      {formatRole(role)}
    </span>
  );

  return (
    <div className={styles.relativeCardWrapper + ' ' + (wrapperClass || '')}>
      <CharacterMiniCard id={id} propsText={formattedRole} />
    </div>
  );
};