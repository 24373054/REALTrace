import React, { useState } from 'react';
import { useUserStore } from '../../stores/user';
import { useNavigate } from 'react-router-dom';
import { MEMBER_TIERS } from '../../constants/config';
import { UsageBar } from '../../components/common/UsageBar';
import styles from './MemberPage.module.css';

export const MemberPage: React.FC = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [duration, setDuration] = useState(1);

  const prices: Record<number, number> = { 1: 1, 3: 0.9, 6: 0.85, 12: 0.8 };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>会员中心</div>
        {user && (
          <div className={styles.currentPlan}>
            当前方案: <span className={styles.planName}>{user.role.toUpperCase()}</span>
            <span className={styles.expiry}>· 有效期至 2026-03-15</span>
          </div>
        )}
      </div>

      {/* Current usage summary */}
      {user && (
        <div className={styles.usageSummary}>
          <div className={styles.usageSummaryTitle}>当前用量 · 今日</div>
          <div className={styles.usageBars}>
            <UsageBar label="地址查询" used={7} total={user.role === 'free' ? 10 : user.role === 'basic' ? 100 : 500} unit=" 次" />
            <UsageBar label="报告导出" used={1} total={user.role === 'free' ? 3 : user.role === 'basic' ? 20 : 100} unit=" 次" />
            <UsageBar label="监控地址" used={2} total={user.role === 'free' ? 2 : user.role === 'basic' ? 10 : 50} unit=" 个" />
          </div>
        </div>
      )}

      <div className={styles.durationRow}>
        <span className={styles.durationLabel}>购买时长</span>
        {[1, 3, 6, 12].map(d => (
          <button
            key={d}
            className={`${styles.durationBtn} ${duration === d ? styles.durationActive : ''}`}
            onClick={() => setDuration(d)}
          >
            {d === 12 ? '1年' : `${d}个月`}
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
              {isCurrent && <div className={styles.currentBadge}>当前方案</div>}
              <div className={styles.planName}>{tier.name}</div>
              <div className={styles.planPrice}>
                {tier.price === 0 ? (
                  <span className={styles.priceNum}>免费</span>
                ) : tier.price === -1 ? (
                  <span className={styles.priceNum}>定制</span>
                ) : (
                  <>
                    <span className={styles.priceCurrency}>¥</span>
                    <span className={styles.priceNum}>{monthlyPrice}</span>
                    <span className={styles.pricePeriod}>/月</span>
                  </>
                )}
              </div>
              <div className={styles.planFeatures}>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>每日查询</span>
                  <span className={styles.featureValue}>{tier.queries === -1 ? '无限制' : `${tier.queries} 次`}</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>导出次数</span>
                  <span className={styles.featureValue}>{tier.exports === -1 ? '无限制' : `${tier.exports} 次/天`}</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>监控地址</span>
                  <span className={styles.featureValue}>{tier.monitors === -1 ? '无限制' : `${tier.monitors} 个`}</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>API 访问</span>
                  <span className={styles.featureValue}>{tier.key === 'free' ? '不支持' : tier.key === 'enterprise' ? '高级' : '基础'}</span>
                </div>
              </div>
              <button
                className={`${styles.planBtn} ${isCurrent ? styles.planBtnCurrent : 'btn btn-primary'}`}
                disabled={isCurrent || tier.key === 'free'}
              >
                {isCurrent ? '当前方案' : tier.price === -1 ? '联系销售' : '立即购买'}
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.payMethods}>
        <span className={styles.payLabel}>支持支付方式</span>
        {['支付宝', '微信支付', '银联', 'USDT'].map(p => (
          <span key={p} className={styles.payMethod}>{p}</span>
        ))}
      </div>
    </div>
  );
};
