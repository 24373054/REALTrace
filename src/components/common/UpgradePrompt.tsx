import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useI18n } from '../../hooks/useI18n';
import styles from './UpgradePrompt.module.css';

interface Props {
  feature: string;
  requiredPlan?: string;
  compact?: boolean;
}

export const UpgradePrompt: React.FC<Props> = ({ feature, requiredPlan, compact }) => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const plan = requiredPlan || (locale === 'zh' ? '基础版' : 'Basic');

  if (compact) {
    return (
      <span className={styles.inline}>
        {feature} {locale === 'zh' ? '需要' : 'requires'}{' '}
        <button className={styles.inlineBtn} onClick={() => navigate(ROUTES.MEMBER)}>{plan}</button>
      </span>
    );
  }
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>◈</div>
      <div className={styles.title}>{feature}</div>
      <div className={styles.desc}>
        {locale === 'zh' ? `升级到${plan}解锁此功能` : `Upgrade to ${plan} to unlock this feature`}
      </div>
      <button className={styles.btn} onClick={() => navigate(ROUTES.MEMBER)}>
        {t.common.upgrade}
      </button>
    </div>
  );
};
