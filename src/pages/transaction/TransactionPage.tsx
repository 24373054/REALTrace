import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { CopyButton } from '../../components/common/CopyButton';
import { RiskBadge } from '../../components/common/RiskBadge';
import { StatCard } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useI18n } from '../../hooks/useI18n';
import { shortAddress, formatDate, formatAmount } from '../../utils/format';
import styles from './TransactionPage.module.css';

const MOCK_TX = {
  hash: '0x47666fab8bd0ac7003bce3f5c3585383f09486e2a1b2c3d4e5f6a7b8c9d0e1f2',
  chain: 'ETH',
  blockNumber: 21847293,
  timestamp: '2025-02-21T08:23:11Z',
  from: '0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b',
  to: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2',
  amount: '401346.76',
  amountUSD: '1460000000',
  fee: '0.0234',
  status: 'confirmed',
  riskScore: 94,
  confirmations: 847293,
};

const FLOW_HOPS = [
  { addr: '0xd90e2f...F31b', label: 'Bybit Hot Wallet', amount: '401,346 ETH', risk: 20 },
  { addr: '0x47666F...86E2', label: 'Hacker Address', amount: '401,346 ETH', risk: 94 },
  { addr: '0xA090e6...057e', label: 'Tornado Cash', amount: '100 ETH ×14', risk: 99 },
  { addr: '0x3fC91A...7FAD', label: 'Uniswap Router', amount: '45 ETH', risk: 5 },
  { addr: '0x1f9840...5e18', label: 'OKX Deposit', amount: '80 ETH', risk: 15 },
];

type TxTab = 'detail' | 'flow' | 'timeline';

export const TransactionPage: React.FC = () => {
  const { hash: paramHash } = useParams<{ hash?: string }>();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [query, setQuery] = useState(paramHash || '');
  const [searched, setSearched] = useState(!!paramHash);
  const [tab, setTab] = useState<TxTab>('detail');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/transaction/${q}`);
    setSearched(true);
  };

  const TAB_LABELS: Record<TxTab, string> = {
    detail: t.transaction.detail,
    flow: t.transaction.flow,
    timeline: t.transaction.timeline,
  };

  return (
    <div className={styles.page}>
      <div className={styles.searchBar}>
        <form className={styles.form} onSubmit={handleSearch}>
          <input
            className={styles.input}
            type="text"
            placeholder={t.transaction.placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus={!paramHash}
          />
          <button type="submit" className="btn btn-primary">{t.common.search}</button>
        </form>
      </div>

      {searched ? (
        <div className={styles.content}>
          <div className={styles.txHeader}>
            <div className={styles.txHashRow}>
              <span className={styles.txHashLabel}>{t.transaction.txHash}</span>
              <span className={`${styles.txHash} mono`}>{MOCK_TX.hash}</span>
              <CopyButton text={MOCK_TX.hash} />
            </div>
            <div className={styles.txMeta}>
              <span className={styles.chainBadge}>{MOCK_TX.chain}</span>
              <span className={styles.statusBadge}>{t.transaction.confirmed}</span>
              <RiskBadge score={MOCK_TX.riskScore} />
            </div>
          </div>

          <div className={styles.statsRow}>
            <StatCard label={t.common.amount} value={`${formatAmount(MOCK_TX.amount)} ETH`} sub={`≈ $1.46B`} danger />
            <StatCard label={t.transaction.block} value={MOCK_TX.blockNumber.toLocaleString()} />
            <StatCard label={t.transaction.confirmations} value={MOCK_TX.confirmations.toLocaleString()} />
            <StatCard label={t.transaction.fee} value={`${MOCK_TX.fee} ETH`} />
          </div>

          <div className={styles.tabs}>
            {(['detail', 'flow', 'timeline'] as TxTab[]).map(t2 => (
              <button key={t2} className={`${styles.tab} ${tab === t2 ? styles.activeTab : ''}`} onClick={() => setTab(t2)}>
                {TAB_LABELS[t2]}
              </button>
            ))}
          </div>

          {tab === 'detail' && <DetailTab navigate={navigate} t={t} locale={locale} />}
          {tab === 'flow' && <FlowTab t={t} />}
          {tab === 'timeline' && <TimelineTab t={t} locale={locale} />}
        </div>
      ) : (
        <EmptyState title={t.transaction.title} description={t.transaction.placeholder} />
      )}
    </div>
  );
};

const DetailTab: React.FC<{ navigate: (p: string) => void; t: any; locale: 'zh' | 'en' }> = ({ navigate, t, locale }) => (
  <div className={styles.detailGrid}>
    <div className={styles.detailCard}>
      <div className={styles.cardTitle}>{t.transaction.txDetail}</div>
      <div className={styles.detailRows}>
        <div className={styles.detailRow}>
          <span>{t.transaction.from}</span>
          <div className={styles.addrCell}>
            <button className={`${styles.addrLink} mono`} onClick={() => navigate(`/address/ETH/${MOCK_TX.from}`)}>
              {shortAddress(MOCK_TX.from, 10, 8)}
            </button>
            <CopyButton text={MOCK_TX.from} />
          </div>
        </div>
        <div className={styles.detailRow}>
          <span>{t.transaction.to}</span>
          <div className={styles.addrCell}>
            <button className={`${styles.addrLink} mono`} onClick={() => navigate(`/address/ETH/${MOCK_TX.to}`)}>
              {shortAddress(MOCK_TX.to, 10, 8)}
            </button>
            <CopyButton text={MOCK_TX.to} />
          </div>
        </div>
        <div className={styles.detailRow}><span>{t.common.time}</span><span className="mono">{formatDate(MOCK_TX.timestamp, locale)}</span></div>
        <div className={styles.detailRow}><span>{t.transaction.block}</span><span className="mono">{MOCK_TX.blockNumber.toLocaleString()}</span></div>
        <div className={styles.detailRow}><span>{t.transaction.fee}</span><span className="mono">{MOCK_TX.fee} ETH</span></div>
        <div className={styles.detailRow}><span>{t.transaction.confirmations}</span><span className="mono">{MOCK_TX.confirmations.toLocaleString()}</span></div>
      </div>
    </div>
    <div className={styles.detailCard}>
      <div className={styles.cardTitle}>{t.transaction.riskAnalysis}</div>
      <div className={styles.riskSummary}>
        <RiskBadge score={MOCK_TX.riskScore} size="lg" />
        <div className={styles.riskFlags}>
          {['Mixer Association', 'OFAC Sanctioned', 'Large Abnormal Transfer'].map(f => (
            <span key={f} className="tag tag-danger">{f}</span>
          ))}
        </div>
        <p className={styles.riskNote}>{t.transaction.riskNote}</p>
        <button className="btn btn-sm" onClick={() => navigate(`/address/ETH/${MOCK_TX.to}`)}>{t.transaction.viewRecipient}</button>
      </div>
    </div>
  </div>
);

const FlowTab: React.FC<{ t: any }> = ({ t }) => {
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
      force: { repulsion: 300, edgeLength: 160, gravity: 0.1 },
      label: { show: true, color: '#8888a0', fontSize: 10, position: 'bottom' },
      lineStyle: { color: '#2a2a3a', width: 2, curveness: 0.1 },
      edgeLabel: { show: true, fontSize: 9, color: '#555568', formatter: (p: any) => p.data.label || '' },
      data: [
        { name: 'Bybit Hot', symbolSize: 30, itemStyle: { color: '#2980b9' } },
        { name: 'Hacker', symbolSize: 40, itemStyle: { color: '#c0392b' }, label: { color: '#e0e0e6', fontWeight: 700 } },
        { name: 'Tornado', symbolSize: 34, itemStyle: { color: '#c0392b' } },
        { name: 'Relay #1', symbolSize: 20, itemStyle: { color: '#555568' } },
        { name: 'Relay #2', symbolSize: 20, itemStyle: { color: '#555568' } },
        { name: 'Uniswap', symbolSize: 26, itemStyle: { color: '#27ae60' } },
        { name: 'OKX', symbolSize: 26, itemStyle: { color: '#27ae60' } },
        { name: 'Binance', symbolSize: 26, itemStyle: { color: '#27ae60' } },
      ],
      links: [
        { source: 'Bybit Hot', target: 'Hacker', label: '401K ETH' },
        { source: 'Hacker', target: 'Tornado', label: '1400 ETH' },
        { source: 'Hacker', target: 'Relay #1', label: '500 ETH' },
        { source: 'Hacker', target: 'Relay #2', label: '300 ETH' },
        { source: 'Tornado', target: 'Relay #1', label: '100 ETH' },
        { source: 'Relay #1', target: 'Uniswap', label: '450 ETH' },
        { source: 'Relay #2', target: 'OKX', label: '200 ETH' },
        { source: 'Relay #1', target: 'Binance', label: '150 ETH' },
      ],
    }],
  };

  return (
    <div className={styles.flowChart}>
      <div className={styles.flowPath}>
        {FLOW_HOPS.map((h, i) => (
          <React.Fragment key={i}>
            <div className={styles.hopCard}>
              <div className={styles.hopAddr}>{h.addr}</div>
              {h.label && <div className={styles.hopLabel}>{h.label}</div>}
              <div className={styles.hopAmount}>{h.amount}</div>
              <div className={styles.hopRisk} style={{ color: h.risk > 80 ? 'var(--risk-critical)' : h.risk > 50 ? 'var(--risk-high)' : 'var(--risk-safe)' }}>
                {t.transaction.risk} {h.risk}
              </div>
            </div>
            {i < FLOW_HOPS.length - 1 && <div className={styles.hopArrow}>→</div>}
          </React.Fragment>
        ))}
      </div>
      <ReactECharts option={flowOption} style={{ height: 320, width: '100%' }} theme="dark" />
    </div>
  );
};

const TimelineTab: React.FC<{ t: any; locale: 'zh' | 'en' }> = ({ t, locale }) => {
  const timeData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date('2025-02-01');
    d.setDate(d.getDate() + i);
    return [d.toISOString().slice(0, 10), Math.floor(Math.random() * 50 + 1)];
  });

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#16161e',
      borderColor: '#2a2a3a',
      textStyle: { color: '#e0e0e6', fontSize: 11 },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: timeData.map(d => d[0]),
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#555568', fontSize: 10, rotate: 30 },
    },
    yAxis: {
      type: 'value',
      name: 'Tx',
      nameTextStyle: { color: '#555568', fontSize: 10 },
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#555568', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1c1c26' } },
    },
    series: [{
      type: 'bar',
      data: timeData.map(d => d[1]),
      itemStyle: { color: '#c0392b', opacity: 0.8 },
      barMaxWidth: 20,
      markLine: {
        data: [{ type: 'average', name: 'Avg' }],
        lineStyle: { color: '#555568' },
        label: { color: '#555568', fontSize: 10 },
      },
    }],
  };

  return (
    <div className={styles.timelineWrap}>
      <div className={styles.cardTitle}>{t.transaction.activityTimeline}</div>
      <ReactECharts option={option} style={{ height: 280, width: '100%' }} theme="dark" />
      <div className={styles.txTable}>
        <div className={styles.txHeader}>
          <span>{t.transaction.txHash}</span>
          <span>{t.common.time}</span>
          <span>{t.transaction.from}</span>
          <span>{t.transaction.to}</span>
          <span>{t.common.amount}</span>
          <span>{t.common.status}</span>
        </div>
        {Array.from({ length: 5 }, (_, i) => ({
          hash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
          from: `0x${Math.random().toString(16).slice(2).padEnd(40, '0')}`,
          to: `0x${Math.random().toString(16).slice(2).padEnd(40, '0')}`,
          amount: (Math.random() * 100).toFixed(4),
          timestamp: new Date(Date.now() - i * 86400000).toISOString(),
        })).map((tx, i) => (
          <div key={i} className={styles.txRow}>
            <span className={`${styles.txHash} mono`}>{shortAddress(tx.hash, 8, 6)}</span>
            <span className={styles.txTime}>{formatDate(tx.timestamp, locale)}</span>
            <span className={`${styles.txAddr} mono`}>{shortAddress(tx.from)}</span>
            <span className={`${styles.txAddr} mono`}>{shortAddress(tx.to)}</span>
            <span className={`${styles.txAmount} mono`}>{tx.amount} ETH</span>
            <span className={styles.txStatus}>{t.transaction.confirmed}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
