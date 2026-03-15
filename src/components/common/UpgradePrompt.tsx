import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import styles from './UpgradePrompt.module.css';

interface Props {
  feature: string;
  requiredPlan?: string;
  compact?: boolean;
}

export const UpgradePrompt: React.FC<Props> = ({ feature, requiredPlan = '基础版', compact }) => {
  const navigate = useNavigate();
  if (compact) {
    return (
      <span className={styles.inline}>
        {feature} 需要 <button className={styles.inlineBtn} onClick={() => navigate(ROUTES.MEMBER)}>{requiredPlan}</button>
      </span>
    );
  }
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>◈</div>
      <div className={styles.title}>{feature}</div>
      <div className={styles.desc}>升级到{requiredPlan}解锁此功能</div>
      <button className={styles.btn} onClick={() => navigate(ROUTES.MEMBER)}>查看会员方案</button>
    </div>
  );
};
