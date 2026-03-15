import React, { useState } from 'react';
import { useUserStore } from '../../stores/user';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import { MEMBER_TIERS } from '../../constants/config';
import { UsageBar } from '../../components/common/UsageBar';
import styles from './MemberPage.module.css';

export const MemberPage: React.FC = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [duration, setDuration] = useState(1);

  const prices: Record<number, number> = { 1: 1, 3: 0.9, 6: 0.85, 12: 0.8 };

  const DURATION_LABELS: Record<number, string> = {
    1: t.member.month1,
    3: t.member.month3,
    6: t.member.month6,
    12: t.member.year1,
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{t.member.title}</div>
        {user && (
          <div className={styles.currentPlan}>
            {t.member.currentPlan}: <span className={styles.planName}>{user.role.toUpperCase()}</span>
            <span className={styles.expiry}>· {t.member.expiry} 2026-03-15</span>
          </div>
        )}
      </div>

      {user && (
        <div className={styles.usageSummary}>
          <div className={styles.usageSummaryTitle}>{t.member.usage} · {t.member.today}</div>
          <div className={styles.usageBars}>
            <UsageBar label={t.member.queriesPerDay} used={7} total={user.role === 'free' ? 10 : user.role === 'basic' ? 100 : 500} unit=" " />
            <UsageBar label={t.member.exportsPerDay} used={1} total={user.role === 'free' ? 3 : user.role === 'basic' ? 20 : 100} unit=" " />
            <UsageBar label={t.member.monitorAddresses} used={2} total={user.role === 'free' ? 2 : user.role === 'basic' ? 10 : 50} unit=" " />
          </div>
        </div>
      )}

      <div className={styles.durationRow}>
        <span className={styles.durationLabel}>{t.member.duration}</span>
        {[1, 3, 6, 12].map(d => (
          <button
            key={d}
            className={`${styles.durationBtn} ${duration === d ? styles.durationActive : ''}`}
            onClick={() => setDuration(d)}
          >
            {DURATION_LABELS[d]}
            {d > 1 && <span className={styles.discount}>{Math.round((1 - prices[d]) * 100)}% OFF</span>}
          </button>
        ))}
      </div>

      <div className={styles.plansGrid}>
        {MEMBER_TIERS.map(tier => {
          const isCurrent = user?.role === tier.key;
          const monthlyPrice = tier.price > 0 ? Math.round(tier.price * prices[duration]) : 0;
          return (
            <div key={tier.key} className={`${styles.planCard} ${isCurrent ? styles.currentCard : ''}`}>
              {isCurrent && <div className={styles.currentBadge}>{t.member.currentBadge}</div>}
              <div className={styles.planName}>{tier.name}</div>
              <div className={styles.planPrice}>
                {tier.price === 0 ? (
                  <span className={styles.priceNum}>{t.member.free}</span>
                ) : tier.price === -1 ? (
                  <span className={styles.priceNum}>{t.member.custom}</span>
                ) : (
                  <>
                    <span className={styles.priceCurrency}>¥</span>
                    <span className={styles.priceNum}>{monthlyPrice}</span>
                    <span className={styles.pricePeriod}>{t.member.perMonth}</span>
                  </>
                )}
              </div>
              <div className={styles.planFeatures}>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>{t.member.queriesPerDay}</span>
                  <span className={styles.featureValue}>{tier.queries === -1 ? t.member.unlimited : `${tier.queries}${t.member.times}`}</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>{t.member.exportsPerDay}</span>
                  <span className={styles.featureValue}>{tier.exports === -1 ? t.member.unlimited : `${tier.exports}${t.member.times}`}</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>{t.member.monitorAddresses}</span>
                  <span className={styles.featureValue}>{tier.monitors === -1 ? t.member.unlimited : `${tier.monitors}${t.member.addresses}`}</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>{t.member.apiAccess}</span>
                  <span className={styles.featureValue}>
                    {tier.key === 'free' ? t.member.notSupported : tier.key === 'enterprise' ? t.member.advanced : t.member.basic}
                  </span>
                </div>
              </div>
              <button
                className={`${styles.planBtn} ${isCurrent ? styles.planBtnCurrent : 'btn btn-primary'}`}
                disabled={isCurrent || tier.key === 'free'}
              >
                {isCurrent ? t.member.currentPlanBtn : tier.price === -1 ? t.member.contact : t.member.upgrade}
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.payMethods}>
        <span className={styles.payLabel}>{t.member.payMethods}</span>
        {['Alipay', 'WeChat Pay', 'UnionPay', 'USDT'].map(p => (
          <span key={p} className={styles.payMethod}>{p}</span>
        ))}
      </div>
    </div>
  );
};
