import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, className, style }) => (
  <div
    className={`${styles.skeleton} ${className || ''}`}
    style={{ width, height, ...style }}
  />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
  <div className={`${styles.textBlock} ${className || ''}`}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} height={14} />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`${styles.card} ${className || ''}`}>
    <Skeleton height={20} width="40%" />
    <Skeleton height={36} width="60%" />
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className={styles.table}>
    <div className={styles.tableHeader}>
      {Array.from({ length: cols }, (_, i) => <Skeleton key={i} height={12} width="80%" />)}
    </div>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className={styles.tableRow}>
        {Array.from({ length: cols }, (_, j) => <Skeleton key={j} height={12} width={j === 0 ? '90%' : '70%'} />)}
      </div>
    ))}
  </div>
);
