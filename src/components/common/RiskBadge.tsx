import React from 'react';
import { getRiskLabel } from '../../utils/format';
import { useAppStore } from '../../stores/app';
import styles from './RiskBadge.module.css';

interface Props {
  score: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<Props> = ({ score, showScore = true, size = 'md' }) => {
  const locale = useAppStore(s => s.locale);
  const { label, color } = getRiskLabel(score, locale);
  const isCritical = score > 80;
  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{ borderColor: color, color }}
      data-critical={isCritical ? 'true' : undefined}
    >
      <span className={styles.dot} />
      {showScore && <span className={styles.score}>{score}</span>}
      <span>{label}</span>
    </span>
  );
};
