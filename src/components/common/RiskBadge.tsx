import React from 'react';
import { getRiskLabel } from '../../utils/format';
import styles from './RiskBadge.module.css';

interface Props {
  score: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<Props> = ({ score, showScore = true, size = 'md' }) => {
  const { label, color } = getRiskLabel(score);
  return (
    <span className={`${styles.badge} ${styles[size]}`} style={{ borderColor: color, color }}>
      {showScore && <span className={styles.score}>{score}</span>}
      <span>{label}</span>
    </span>
  );
};
