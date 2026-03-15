import React from 'react';
import { getRiskLabel } from '../../utils/format';
import styles from './RiskBar.module.css';

interface Props {
  score: number;
  showLabel?: boolean;
}

export const RiskBar: React.FC<Props> = ({ score, showLabel = true }) => {
  const { label, color } = getRiskLabel(score);
  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${score}%`, background: color }} />
      </div>
      {showLabel && (
        <div className={styles.meta}>
          <span className={styles.score} style={{ color }}>{score}/100</span>
          <span className={styles.label} style={{ color }}>{label}</span>
        </div>
      )}
    </div>
  );
};
