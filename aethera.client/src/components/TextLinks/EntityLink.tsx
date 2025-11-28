import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './TextLinks.module.css';

type EntityLinkProps = {
  to: string;
  children: ReactNode;
  preview?: ReactNode;
  ariaLabel?: string;
};

export function EntityLink({ to, children, preview, ariaLabel }: EntityLinkProps) {
  return (
    <span className={styles.linkWrap}>
      <Link to={to} className={styles.link} aria-label={ariaLabel}>
        {children}
      </Link>
      {preview && <span className={styles.tooltip}>{preview}</span>}
    </span>
  );
}

