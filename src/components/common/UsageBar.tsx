import React from 'react';
import styles from './UsageBar.module.css';

interface Props {
  label: string;
  used: number;
  total: number | 'unlimited';
  unit?: string;
}

export const UsageBar: React.FC<Props> = ({ label, used, total, unit = '' }) => {
  const pct = total === 'unlimited' ? 0 : Math.min(100, Math.round((used / total) * 100));
  const danger = pct >= 90;
  const warn = pct >= 70;
  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>
          {used.toLocaleString()}{unit} / {total === 'unlimited' ? '无限制' : `${total.toLocaleString()}${unit}`}
        </span>
      </div>
      <div className={styles.track}>
        {total !== 'unlimited' && (
          <div
            className={`${styles.fill} ${danger ? styles.danger : warn ? styles.warn : ''}`}
            style={{ width: `${pct}%` }}
          />
        )}
        {total === 'unlimited' && <div className={styles.unlimited} />}
      </div>
    </div>
  );
};
