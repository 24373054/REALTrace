import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { RiskBadge } from '../../components/common/RiskBadge';
import { RiskBar } from '../../components/common/RiskBar';
import { CopyButton } from '../../components/common/CopyButton';
import { StatCard } from '../../components/common/StatCard';
import { SkeletonCard, SkeletonTable, Skeleton } from '../../components/common/Skeleton';
import { UpgradePrompt } from '../../components/common/UpgradePrompt';
import { useI18n } from '../../hooks/useI18n';
import { shortAddress, formatAmount, formatDate } from '../../utils/format';
import { useAppStore } from '../../stores/app';
import { useUserStore } from '../../stores/user';
import { ROUTES } from '../../constants/routes';
import styles from './AddressDetail.module.css';

const getMockAddress = (chain: string, address: string) => ({
  address,
  chain,
  label: address.startsWith('0x47') ? 'Bybit Hacker' : undefined,
  balance: '1247.83',
  balanceUSD: '4891234.50',
  riskScore: 87,
  riskLevel: 'critical' as const,
  riskFactors: [
    { name: 'Mixer Interaction', score: 30, description: 'Direct interaction with Tornado Cash detected' },
    { name: 'High-Risk Address Link', score: 25, description: 'Transactions with 3 known blacklisted addresses' },
    { name: 'Abnormal Tx Pattern', score: 20, description: 'Large volume of small dispersal transactions in short time' },
    { name: 'Blacklist Match', score: 12, description: 'OFAC sanctions list match' },
  ],
  tags: ['Mixer', 'Hacker', 'OFAC Sanctioned'],
  txCount: 2847,
  totalReceived: '15847.23',
  totalSent: '14599.40',
  firstSeen: '2024-02-21T08:23:11Z',
  lastSeen: '2025-03-14T16:44:02Z',
  assets: [
    { token: 'ETH', amount: '1247.83', usd: 4891234, pct: 72 },
    { token: 'USDT', amount: '312,000', usd: 312000, pct: 18 },
    { token: 'stETH', amount: '89.4', usd: 350000, pct: 7 },
    { token: 'Other', amount: '-', usd: 51000, pct: 3 },
  ],
  relatedAddresses: [
    { address: '0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b', label: 'Bybit Hot Wallet', risk: 95, txCount: 1 },
    { address: '0xA090e606E30bD747d4E6245a1517EbE430F0057e', label: 'Tornado Cash', risk: 99, txCount: 14 },
    { address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD', label: 'Uniswap Router', risk: 5, txCount: 3 },
  ],
});

interface Props {
  chain: string;
  address: string;
}

type Tab = 'overview' | 'transactions' | 'flow' | 'risk';

export const AddressDetail: React.FC<Props> = ({ chain, address }) => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const { addFavorite, removeFavorite, isFavorite } = useAppStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const data = getMockAddress(chain, address);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [chain, address]);
  const favorited = isFavorite(address);
  const [labelModal, setLabelModal] = useState(false);
  const [userLabel, setUserLabel] = useState(data.label || '');
  const [savedLabel, setSavedLabel] = useState(data.label || '');

  if (loading) return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Skeleton width={60} height={20} />
          <Skeleton width={420} height={18} style={{ marginTop: 8 }} />
          <Skeleton width={120} height={16} style={{ marginTop: 6 }} />
        </div>
        <div className={styles.headerRight}>
          <Skeleton width={80} height={48} />
        </div>
      </div>
      <div className={styles.statsRow}>
        {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
      </div>
      <SkeletonTable rows={6} cols={6} />
    </div>
  );

  const TAB_LABELS: Record<Tab, string> = {
    overview: t.address.detail.overview,
    transactions: t.address.detail.transactions,
    flow: t.address.detail.flow,
    risk: t.address.detail.risk,
  };

  const handleSaveLabel = () => {
    setSavedLabel(userLabel);
    setLabelModal(false);
  };

  return (
    <div className={styles.wrap}>
      {labelModal && (
        <div className={styles.modalOverlay} onClick={() => setLabelModal(false)}>
          <div className={styles.labelModal} onClick={e => e.stopPropagation()}>
            <div className={styles.labelModalTitle}>{locale === 'zh' ? '地址标签管理' : 'Address Label'}</div>
            <div className={styles.labelModalAddr}>{address}</div>
            <div className={styles.labelModalField}>
              <label>{locale === 'zh' ? '自定义标签' : 'Custom Label'}</label>
              <input
                className={styles.labelInput}
                value={userLabel}
                onChange={e => setUserLabel(e.target.value)}
                placeholder={locale === 'zh' ? '如：我的钱包、交易所充值地址...' : 'e.g. My Wallet, Exchange Deposit...'}
                autoFocus
                maxLength={40}
              />
            </div>
            <div className={styles.labelPresets}>
              {['Exchange', 'Mixer', 'Hacker', 'DeFi', 'NFT', 'Bridge'].map(p => (
                <button key={p} className={styles.presetBtn} onClick={() => setUserLabel(p)}>{p}</button>
              ))}
            </div>
            <div className={styles.labelModalActions}>
              <button className="btn btn-sm" onClick={() => setLabelModal(false)}>{t.common.cancel}</button>
              <button className="btn btn-primary btn-sm" onClick={handleSaveLabel}>{t.common.save}</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.chainBadge}>{chain}</div>
          <div className={styles.addressRow}>
            <span className={`${styles.address} mono`}>{address}</span>
            <CopyButton text={address} />
          </div>
          {savedLabel && <div className={styles.label}>{savedLabel}</div>}
          <div className={styles.tags}>
            {data.tags.map(tag => <span key={tag} className="tag tag-danger">{tag}</span>)}
          </div>
        </div>
        <div className={styles.headerRight}>
          <RiskBadge score={data.riskScore} size="lg" />
          <div className={styles.headerActions}>
            <button
              className="btn btn-sm"
              onClick={() => favorited ? removeFavorite(address) : addFavorite(address, chain, savedLabel)}
              style={favorited ? { color: 'var(--color-warning)', borderColor: 'var(--color-warning)' } : {}}
            >
              {favorited ? `★ ${t.address.favorited}` : `☆ ${t.address.favorite}`}
            </button>
            <button className="btn btn-sm" onClick={() => setLabelModal(true)}>
              ◈ {locale === 'zh' ? '标签' : 'Label'}
            </button>
            <button className="btn btn-sm" onClick={() => navigate(ROUTES.MONITOR)}>◉ {t.address.monitor}</button>
            <button className="btn btn-sm">▤ {t.address.exportReport}</button>
          </div>
        </div>
      </div>

      <div className={styles.statsRow}>
        <StatCard label={t.address.balance} value={`${formatAmount(data.balance)} ${chain}`} sub={`≈ ${parseFloat(data.balanceUSD).toLocaleString()}`} />
        <StatCard label={t.address.txCount} value={data.txCount.toLocaleString()} />
        <StatCard label={t.address.received} value={`${formatAmount(data.totalReceived)} ${chain}`} />
        <StatCard label={t.address.sent} value={`${formatAmount(data.totalSent)} ${chain}`} />
        <StatCard label={t.address.firstSeen} value={formatDate(data.firstSeen, locale)} />
        <StatCard label={t.address.lastSeen} value={formatDate(data.lastSeen, locale)} />
      </div>

      <div className={styles.tabs}>
        {(['overview', 'transactions', 'flow', 'risk'] as Tab[]).map(tb => (
          <button
            key={tb}
            className={`${styles.tab} ${tab === tb ? styles.activeTab : ''}`}
            onClick={() => setTab(tb)}
          >
            {TAB_LABELS[tb]}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {tab === 'overview' && <OverviewTab data={data} t={t} locale={locale} />}
        {tab === 'transactions' && <TransactionsTab chain={chain} address={address} t={t} locale={locale} />}
        {tab === 'flow' && <FlowTab chain={chain} address={address} t={t} />}
        {tab === 'risk' && <RiskTab data={data} t={t} />}
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{ data: ReturnType<typeof getMockAddress>; t: any; locale: 'zh' | 'en' }> = ({ data, t, locale }) => {
  const assetOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#16161e',
      borderColor: '#2a2a3a',
      textStyle: { color: '#e0e0e6', fontSize: 11 },
      formatter: '{b}: {c} USD ({d}%)',
    },
    legend: { show: false },
    series: [{
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['50%', '50%'],
      data: data.assets.map(a => ({
        name: a.token,
        value: a.usd,
        itemStyle: {
          color: a.token === 'ETH' ? '#2980b9'
            : a.token === 'USDT' ? '#27ae60'
            : a.token === 'stETH' ? '#8e44ad'
            : '#555568',
        },
      })),
      label: { show: true, color: '#8888a0', fontSize: 10, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: '#2a2a3a' } },
    }],
  };

  return (
    <div className={styles.overviewGrid}>
      <div className={styles.riskCard}>
        <div className={styles.cardTitle}>{t.address.riskScore}</div>
        <RiskBar score={data.riskScore} />
        <div className={styles.riskFactors}>
          {data.riskFactors.map((f, i) => (
            <div key={i} className={styles.factorRow}>
              <span className={styles.factorName}>{f.name}</span>
              <span className={styles.factorDesc}>{f.description}</span>
              <span className={styles.factorScore} style={{ color: 'var(--risk-critical)' }}>+{f.score}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.infoCard}>
        <div className={styles.cardTitle}>{t.address.addressInfo}</div>
        <div className={styles.infoRows}>
          <div className={styles.infoRow}><span>{t.common.chain}</span><span className="mono">{data.chain}</span></div>
          <div className={styles.infoRow}><span>{t.address.addressType}</span><span>EOA</span></div>
          <div className={styles.infoRow}><span>{t.address.firstSeen}</span><span>{formatDate(data.firstSeen, locale)}</span></div>
          <div className={styles.infoRow}><span>{t.address.lastSeen}</span><span>{formatDate(data.lastSeen, locale)}</span></div>
          <div className={styles.infoRow}><span>{t.address.txCount}</span><span className="mono">{data.txCount.toLocaleString()}</span></div>
        </div>
      </div>
      <div className={styles.assetCard}>
        <div className={styles.cardTitle}>{t.address.assetDistribution}</div>
        <div className={styles.assetLayout}>
          <ReactECharts option={assetOption} style={{ height: 160, width: 160 }} theme="dark" />
          <div className={styles.assetList}>
            {data.assets.map(a => (
              <div key={a.token} className={styles.assetRow}>
                <span className={styles.assetToken}>{a.token}</span>
                <span className={styles.assetAmt}>{a.amount}</span>
                <span className={styles.assetPct}>{a.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.relatedCard}>
        <div className={styles.cardTitle}>{t.address.relatedAddresses}</div>
        <div className={styles.relatedList}>
          {data.relatedAddresses.map((r, i) => (
            <div key={i} className={styles.relatedRow}>
              <div className={styles.relatedLeft}>
                <span className={`${styles.relatedAddr} mono`}>{shortAddress(r.address, 8, 6)}</span>
                {r.label && <span className={styles.relatedLabel}>{r.label}</span>}
              </div>
              <div className={styles.relatedRight}>
                <span className={styles.relatedRisk} style={{ color: r.risk > 80 ? 'var(--risk-critical)' : r.risk > 50 ? 'var(--risk-high)' : 'var(--risk-safe)' }}>
                  {r.risk}
                </span>
                <span className={styles.relatedTx}>{r.txCount} tx</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MOCK_TXS = Array.from({ length: 10 }, (_, i) => ({
  hash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
  from: `0x${Math.random().toString(16).slice(2).padEnd(40, '0')}`,
  to: `0x${Math.random().toString(16).slice(2).padEnd(40, '0')}`,
  amount: (Math.random() * 100).toFixed(4),
  timestamp: new Date(Date.now() - i * 86400000).toISOString(),
  status: 'confirmed' as const,
}));

const TransactionsTab: React.FC<{ chain: string; address: string; t: any; locale: 'zh' | 'en' }> = ({ chain, t, locale }) => (
  <div className={styles.txTable}>
    <div className={styles.txHeader}>
      <span>{t.transaction.txHash}</span>
      <span>{t.common.time}</span>
      <span>{t.transaction.from}</span>
      <span>{t.transaction.to}</span>
      <span>{t.common.amount}</span>
      <span>{t.common.status}</span>
    </div>
    {MOCK_TXS.map(tx => (
      <div key={tx.hash} className={styles.txRow}>
        <span className={`${styles.txHash} mono`}>{shortAddress(tx.hash, 8, 6)}</span>
        <span className={styles.txTime}>{formatDate(tx.timestamp, locale)}</span>
        <span className={`${styles.txAddr} mono`}>{shortAddress(tx.from)}</span>
        <span className={`${styles.txAddr} mono`}>{shortAddress(tx.to)}</span>
        <span className={`${styles.txAmount} mono`}>{tx.amount} {chain}</span>
        <span className={styles.txStatus}>{t.address.confirmed}</span>
      </div>
    ))}
  </div>
);

const FlowTab: React.FC<{ chain: string; address: string; t: any }> = ({ chain, address, t }) => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  if (!user || user.role === 'free') {
    return <UpgradePrompt feature={t.address.detail.flow} requiredPlan="Basic" />;
  }

  const flowOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#16161e',
      borderColor: '#2a2a3a',
      textStyle: { color: '#e0e0e6', fontSize: 11 },
    },
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      force: { repulsion: 200, edgeLength: 120 },
      label: { show: true, color: '#8888a0', fontSize: 10, position: 'bottom' },
      lineStyle: { color: '#2a2a3a', width: 1.5, curveness: 0.2 },
      edgeLabel: { show: true, fontSize: 9, color: '#555568', formatter: (p: any) => p.data.label || '' },
      data: [
        { name: shortAddress(address, 6, 4), symbolSize: 36, itemStyle: { color: '#c0392b' }, label: { color: '#e0e0e6', fontWeight: 600 } },
        { name: 'Bybit Hot', symbolSize: 28, itemStyle: { color: '#2980b9' } },
        { name: 'Tornado', symbolSize: 32, itemStyle: { color: '#c0392b' } },
        { name: 'Addr #1', symbolSize: 20, itemStyle: { color: '#555568' } },
        { name: 'Addr #2', symbolSize: 20, itemStyle: { color: '#555568' } },
        { name: 'Addr #3', symbolSize: 20, itemStyle: { color: '#555568' } },
        { name: 'Uniswap', symbolSize: 26, itemStyle: { color: '#27ae60' } },
        { name: 'OKX', symbolSize: 26, itemStyle: { color: '#27ae60' } },
      ],
      links: [
        { source: 'Bybit Hot', target: shortAddress(address, 6, 4), label: '401K ETH' },
        { source: shortAddress(address, 6, 4), target: 'Tornado', label: '100 ETH×14' },
        { source: shortAddress(address, 6, 4), target: 'Addr #1', label: '50 ETH' },
        { source: shortAddress(address, 6, 4), target: 'Addr #2', label: '30 ETH' },
        { source: 'Tornado', target: 'Addr #3', label: '100 ETH' },
        { source: 'Addr #1', target: 'Uniswap', label: '45 ETH' },
        { source: 'Addr #3', target: 'OKX', label: '80 ETH' },
      ],
    }],
  };

  return (
    <div className={styles.flowWrap}>
      <div className={styles.flowActions}>
        <button className="btn btn-sm" onClick={() => navigate('/trace')}>{t.address.openInTrace}</button>
        <span className={styles.flowNote}>{t.address.demoNote}</span>
      </div>
      <ReactECharts option={flowOption} style={{ flex: 1, minHeight: 320 }} theme="dark" />
    </div>
  );
};

const RiskTab: React.FC<{ data: ReturnType<typeof getMockAddress>; t: any }> = ({ data, t }) => {
  const radarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#16161e',
      borderColor: '#2a2a3a',
      textStyle: { color: '#e0e0e6', fontSize: 11 },
    },
    radar: {
      indicator: [
        { name: 'Mixer', max: 100 },
        { name: 'Blacklist', max: 100 },
        { name: 'Tx Pattern', max: 100 },
        { name: 'High-Risk Link', max: 100 },
        { name: 'Behavior', max: 100 },
      ],
      center: ['50%', '50%'],
      radius: '65%',
      axisName: { color: '#8888a0', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' },
      splitLine: { lineStyle: { color: '#2a2a3a' } },
      splitArea: { areaStyle: { color: ['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.02)'] } },
      axisLine: { lineStyle: { color: '#2a2a3a' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: [85, 60, 75, 90, 70],
        name: 'Risk Dimensions',
        areaStyle: { color: 'rgba(192,57,43,0.15)' },
        lineStyle: { color: '#c0392b', width: 1.5 },
        itemStyle: { color: '#c0392b' },
        symbolSize: 4,
      }],
    }],
  };

  return (
    <div className={styles.riskReport}>
      <div className={styles.reportHeader}>
        <div className={styles.reportScore}>
          <span className={styles.reportScoreNum} style={{ color: 'var(--risk-critical)' }}>{data.riskScore}</span>
          <span className={styles.reportScoreLabel}>/ 100</span>
        </div>
        <div>
          <div className={styles.reportTitle}>{t.address.highRisk}</div>
          <div className={styles.reportSub}>{t.address.highRiskDesc}</div>
        </div>
      </div>
      <div className={styles.riskTabGrid}>
        <div className={styles.radarCard}>
          <div className={styles.cardTitle}>Risk Dimensions</div>
          <ReactECharts option={radarOption} style={{ height: 220 }} theme="dark" />
        </div>
        <div className={styles.factorList}>
          <div className={styles.cardTitle}>{t.address.riskFactorDetail}</div>
          {data.riskFactors.map((f, i) => (
            <div key={i} className={styles.factorDetail}>
              <div className={styles.factorDetailHeader}>
                <span className={styles.factorName}>{f.name}</span>
                <span className={styles.factorScore} style={{ color: 'var(--risk-critical)' }}>{t.address.impactScore}: +{f.score}</span>
              </div>
              <div className={styles.factorDesc}>{f.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
