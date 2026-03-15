import React from 'react';
import styles from './StatCard.module.css';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  danger?: boolean;
}

export const StatCard: React.FC<Props> = ({ label, value, sub, accent, danger }) => (
  <div className={`${styles.card} ${accent ? styles.accent : ''} ${danger ? styles.danger : ''}`}>
    <div className={styles.label}>{label}</div>
    <div className={styles.value}>{value}</div>
    {sub && <div className={styles.sub}>{sub}</div>}
  </div>
);
