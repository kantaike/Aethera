import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'blue' | 'gold' | 'purple' | 'green'; // Цветовые темы для разных типов
  onClick?: () => void;
  className?: string;
}

export const Card = ({ children, variant = 'blue', onClick, className }: CardProps) => {
  return (
    <div 
      className={`${styles.card} ${styles[variant]} ${className}`} 
      onClick={onClick}
    >
      <div className={styles.innerGlow} />
      {children}
    </div>
  );
};