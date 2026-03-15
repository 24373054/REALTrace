import React from 'react';
import styles from './EmptyState.module.css';

interface Props {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({
  title = '暂无数据',
  description,
  action,
}) => (
  <div className={styles.wrap}>
    <div className={styles.icon}>⬡</div>
    <div className={styles.title}>{title}</div>
    {description && <div className={styles.desc}>{description}</div>}
    {action && <div className={styles.action}>{action}</div>}
  </div>
);
