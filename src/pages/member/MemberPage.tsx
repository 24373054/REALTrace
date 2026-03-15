import React, { useState } from 'react';
import { useUserStore } from '../../stores/user';
import { useI18n } from '../../hooks/useI18n';
import { UsageBar } from '../../components/common/UsageBar';
import styles from './MemberPage.module.css';

// Correct pricing from doc 17
const MEMBER_TIERS = [
  { key: 'free',       name_zh: '免费版',  name_en: 'Free',         price: 0,   queries: 10,   exports: 1,   monitors: 1,  api: 0 },
  { key: 'basic',      name_zh: '基础版',  name_en: 'Basic',        price: 29,  queries: 100,  exports: 10,  monitors: 10, api: 1000 },
  { key: 'pro',        name_zh: '专业版',  name_en: 'Professional', price: 99,  queries: 1000, exports: 100, monitors: 50, api: 10000 },
  { key: 'enterprise', name_zh: '企业版',  name_en: 'Enterprise',   price: -1,  queries: -1,   exports: -1,  monitors: -1, api: -1 },
] as const;

// Duration multipliers and actual prices from doc 17
const DURATION_PRICES: Record<number, Record<string, number>> = {
  1:  { basic: 29,  pro: 99 },
  3:  { basic: 79,  pro: 269 },
  6:  { basic: 149, pro: 519 },
  12: { basic: 269, pro: 999 },
};

interface CheckoutModalProps {
  tier: typeof MEMBER_TIERS[number];
  duration: number;
  totalPrice: number;
  onClose: () => void;
  t: any;
  locale: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ tier, duration, totalPrice, onClose, t, locale }) => {
  const [payMethod, setPayMethod] = useState<string>('alipay');
  const [paid, setPaid] = useState(false);
  const orderNo = `ORD${Date.now().toString().slice(-10)}`;
  const tierName = locale === 'zh' ? tier.name_zh : tier.name_en;

  const DURATION_LABELS: Record<number, string> = {
    1: t.member.month1, 3: t.member.month3, 6: t.member.month6, 12: t.member.year1,
  };

  const PAY_METHODS = [
    { key: 'alipay',   label: t.member.checkout.alipay },
    { key: 'wechat',   label: t.member.checkout.wechat },
    { key: 'unionpay', label: t.member.checkout.unionpay },
    { key: 'usdt',     label: t.member.checkout.usdt },
    { key: 'btc',      label: t.member.checkout.btc },
  ];

  if (paid) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.successWrap}>
            <div className={styles.successIcon}>✓</div>
            <div className={styles.successTitle}>{t.member.checkout.success}</div>
            <div className={styles.successDesc}>{t.member.checkout.successDesc}</div>
            <div className={styles.orderNo}>{t.member.checkout.orderNo}: <span className="mono">{orderNo}</span></div>
            <button className="btn btn-primary" onClick={onClose}>{t.common.close}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{t.member.checkout.title}</span>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.orderSummary}>
          <div className={styles.orderRow}>
            <span>{t.member.checkout.plan}</span>
            <span className={styles.orderVal}>{tierName}</span>
          </div>
          <div className={styles.orderRow}>
            <span>{t.member.checkout.duration}</span>
            <span className={styles.orderVal}>{DURATION_LABELS[duration]}</span>
          </div>
          <div className={styles.orderDivider} />
          <div className={`${styles.orderRow} ${styles.orderTotal}`}>
            <span>{t.member.checkout.total}</span>
            <span className={styles.orderPrice}>¥{totalPrice}</span>
          </div>
        </div>
        <div className={styles.paySection}>
          <div className={styles.paySectionLabel}>{t.member.checkout.payMethod}</div>
          <div className={styles.payMethodGrid}>
            {PAY_METHODS.map(m => (
              <button
                key={m.key}
                className={`${styles.payMethodBtn} ${payMethod === m.key ? styles.payMethodActive : ''}`}
                onClick={() => setPayMethod(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.secureNote}>{t.member.checkout.secureNote}</div>
        <div className={styles.modalActions}>
          <button className="btn" onClick={onClose}>{t.member.checkout.cancel}</button>
          <button className="btn btn-primary" onClick={() => setPaid(true)}>
            {t.member.checkout.confirmPay} ¥{totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
};

export const MemberPage: React.FC = () => {
  const { user } = useUserStore();
  const { t, locale } = useI18n();
  const [duration, setDuration] = useState(1);
  const [checkoutTier, setCheckoutTier] = useState<typeof MEMBER_TIERS[number] | null>(null);

  const DURATION_LABELS: Record<number, string> = {
    1: t.member.month1, 3: t.member.month3, 6: t.member.month6, 12: t.member.year1,
  };

  const getPrice = (tier: typeof MEMBER_TIERS[number]) => {
    if (tier.price <= 0) return tier.price;
    return DURATION_PRICES[duration]?.[tier.key] ?? tier.price * duration;
  };

  const getMonthlyEquiv = (tier: typeof MEMBER_TIERS[number]) => {
    const total = getPrice(tier);
    if (total <= 0) return 0;
    return Math.round(total / duration);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{t.member.title}</div>
        {user && (
          <div className={styles.currentPlan}>
            {t.member.currentPlan}: <span className={styles.planName}>{user.role.toUpperCase()}</span>
            <span className={styles.expiry}>· {t.member.expiry} 2026-12-31</span>
          </div>
        )}
      </div>

      {user && (
        <div className={styles.usageSummary}>
          <div className={styles.usageSummaryTitle}>{t.member.usage} · {t.member.today}</div>
          <div className={styles.usageBars}>
            <UsageBar label={t.member.queriesPerDay} used={7} total={user.role === 'free' ? 10 : user.role === 'basic' ? 100 : 1000} unit=" " />
            <UsageBar label={t.member.exportsPerDay} used={1} total={user.role === 'free' ? 1 : user.role === 'basic' ? 10 : 100} unit=" " />
            <UsageBar label={t.member.monitorAddresses} used={1} total={user.role === 'free' ? 1 : user.role === 'basic' ? 10 : 50} unit=" " />
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
            {d === 3 && <span className={styles.discount}>-9%</span>}
            {d === 6 && <span className={styles.discount}>-14%</span>}
            {d === 12 && <span className={styles.discount}>-23%</span>}
          </button>
        ))}
      </div>

      <div className={styles.plansGrid}>
        {MEMBER_TIERS.map(tier => {
          const isCurrent = user?.role === tier.key;
          const totalPrice = getPrice(tier);
          const monthlyEquiv = getMonthlyEquiv(tier);
          const tierName = locale === 'zh' ? tier.name_zh : tier.name_en;
          return (
            <div key={tier.key} className={`${styles.planCard} ${isCurrent ? styles.currentCard : ''} ${tier.key === 'pro' ? styles.featuredCard : ''}`}>
              {isCurrent && <div className={styles.currentBadge}>{t.member.currentBadge}</div>}
              {tier.key === 'pro' && !isCurrent && <div className={styles.featuredBadge}>POPULAR</div>}
              <div className={styles.planName}>{tierName}</div>
              <div className={styles.planPrice}>
                {tier.price === 0 ? (
                  <span className={styles.priceNum}>{t.member.free}</span>
                ) : tier.price === -1 ? (
                  <span className={styles.priceNum}>{t.member.custom}</span>
                ) : (
                  <>
                    <span className={styles.priceCurrency}>¥</span>
                    <span className={styles.priceNum}>{totalPrice}</span>
                    {duration > 1 && (
                      <span className={styles.priceMonthly}>≈¥{monthlyEquiv}{t.member.perMonth}</span>
                    )}
                    {duration === 1 && <span className={styles.pricePeriod}>{t.member.perMonth}</span>}
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
                    {tier.api === 0 ? t.member.notSupported : tier.api === -1 ? t.member.unlimited : `${tier.api.toLocaleString()}/mo`}
                  </span>
                </div>
              </div>
              <button
                className={`${styles.planBtn} ${isCurrent ? styles.planBtnCurrent : tier.key === 'pro' ? styles.planBtnFeatured : 'btn btn-primary'}`}
                disabled={isCurrent || tier.key === 'free'}
                onClick={() => !isCurrent && tier.key !== 'free' && setCheckoutTier(tier)}
              >
                {isCurrent ? t.member.currentPlanBtn : tier.price === -1 ? t.member.contact : t.member.upgrade}
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.payMethods}>
        <span className={styles.payLabel}>{t.member.payMethods}</span>
        {['Alipay', 'WeChat Pay', 'UnionPay', 'USDT (TRC20/ERC20)', 'BTC'].map(p => (
          <span key={p} className={styles.payMethod}>{p}</span>
        ))}
      </div>

      {checkoutTier && (
        <CheckoutModal
          tier={checkoutTier}
          duration={duration}
          totalPrice={getPrice(checkoutTier)}
          onClose={() => setCheckoutTier(null)}
          t={t}
          locale={locale}
        />
      )}
    </div>
  );
};
