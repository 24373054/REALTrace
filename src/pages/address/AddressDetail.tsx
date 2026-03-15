import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { RiskBadge } from '../../components/common/RiskBadge';
import { RiskBar } from '../../components/common/RiskBar';
import { CopyButton } from '../../components/common/CopyButton';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { UpgradePrompt } from '../../components/common/UpgradePrompt';
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
    { name: '与混币器交互', score: 30, description: '检测到与 Tornado Cash 的直接交互' },
    { name: '高风险地址关联', score: 25, description: '与 3 个已知黑名单地址有交易往来' },
    { name: '交易模式异常', score: 20, description: '短时间内大量小额分散交易' },
    { name: '黑名单匹配', score: 12, description: 'OFAC 制裁名单匹配' },
  ],
  tags: ['混币器', '黑客', 'OFAC制裁'],
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
  const { addFavorite, removeFavorite, isFavorite } = useAppStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading] = useState(false);
  const data = getMockAddress(chain, address);
  const favorited = isFavorite(address);

  if (loading) return <LoadingSpinner text="查询中..." />;

  return (
    <div className={styles.wrap}>
      {/* 地址头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.chainBadge}>{chain}</div>
          <div className={styles.addressRow}>
            <span className={`${styles.address} mono`}>{address}</span>
            <CopyButton text={address} />
          </div>
          {data.label && <div className={styles.label}>{data.label}</div>}
          <div className={styles.tags}>
            {data.tags.map(t => <span key={t} className="tag tag-danger">{t}</span>)}
          </div>
        </div>
        <div className={styles.headerRight}>
          <RiskBadge score={data.riskScore} size="lg" />
          <div className={styles.headerActions}>
            <button
              className="btn btn-sm"
              onClick={() => favorited ? removeFavorite(address) : addFavorite(address, chain, data.label)}
              style={favorited ? { color: 'var(--color-warning)', borderColor: 'var(--color-warning)' } : {}}
            >
              {favorited ? '★ 已收藏' : '☆ 收藏'}
            </button>
            <button className="btn btn-sm" onClick={() => navigate(ROUTES.MONITOR)}>◉ 监控</button>
            <button className="btn btn-sm">▤ 导出报告</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsRow}>
        <StatCard label="当前余额" value={`${formatAmount(data.balance)} ${chain}`} sub={`≈ $${parseFloat(data.balanceUSD).toLocaleString()}`} />
        <StatCard label="总交易数" value={data.txCount.toLocaleString()} />
        <StatCard label="累计收入" value={`${formatAmount(data.totalReceived)} ${chain}`} />
        <StatCard label="累计支出" value={`${formatAmount(data.totalSent)} ${chain}`} />
        <StatCard label="首次活跃" value={formatDate(data.firstSeen)} />
        <StatCard label="最近活跃" value={formatDate(data.lastSeen)} />
      </div>

      {/* 标签页 */}
      <div className={styles.tabs}>
        {(['overview', 'transactions', 'flow', 'risk'] as Tab[]).map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.activeTab : ''}`}
            onClick={() => setTab(t)}
          >
            {{ overview: '概览', transactions: '交易记录', flow: '资金流向', risk: '风险报告' }[t]}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {tab === 'overview' && <OverviewTab data={data} />}
        {tab === 'transactions' && <TransactionsTab chain={chain} address={address} />}
        {tab === 'flow' && <FlowTab chain={chain} address={address} />}
        {tab === 'risk' && <RiskTab data={data} />}
      </div>
    </div>
  );
};

// Sub-tab components
const OverviewTab: React.FC<{ data: ReturnType<typeof getMockAddress> }> = ({ data }) => {
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
        <div className={styles.cardTitle}>风险评分</div>
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
        <div className={styles.cardTitle}>地址信息</div>
        <div className={styles.infoRows}>
          <div className={styles.infoRow}><span>链</span><span className="mono">{data.chain}</span></div>
          <div className={styles.infoRow}><span>地址类型</span><span>EOA</span></div>
          <div className={styles.infoRow}><span>首次活跃</span><span>{formatDate(data.firstSeen)}</span></div>
          <div className={styles.infoRow}><span>最近活跃</span><span>{formatDate(data.lastSeen)}</span></div>
          <div className={styles.infoRow}><span>交易总数</span><span className="mono">{data.txCount.toLocaleString()}</span></div>
        </div>
      </div>
      <div className={styles.assetCard}>
        <div className={styles.cardTitle}>资产分布</div>
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
        <div className={styles.cardTitle}>关联地址</div>
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

const TransactionsTab: React.FC<{ chain: string; address: string }> = ({ chain }) => (
  <div className={styles.txTable}>
    <div className={styles.txHeader}>
      <span>交易哈希</span><span>时间</span><span>发送方</span><span>接收方</span><span>金额</span><span>状态</span>
    </div>
    {MOCK_TXS.map(tx => (
      <div key={tx.hash} className={styles.txRow}>
        <span className={`${styles.txHash} mono`}>{shortAddress(tx.hash, 8, 6)}</span>
        <span className={styles.txTime}>{formatDate(tx.timestamp)}</span>
        <span className={`${styles.txAddr} mono`}>{shortAddress(tx.from)}</span>
        <span className={`${styles.txAddr} mono`}>{shortAddress(tx.to)}</span>
        <span className={`${styles.txAmount} mono`}>{tx.amount} {chain}</span>
        <span className={styles.txStatus}>已确认</span>
      </div>
    ))}
  </div>
);

const FlowTab: React.FC<{ chain: string; address: string }> = ({ chain, address }) => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  if (!user || user.role === 'free') {
    return <UpgradePrompt feature="资金流向图" requiredPlan="基础版" />;
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
      edgeLabel: {
        show: true,
        fontSize: 9,
        color: '#555568',
        formatter: (p: any) => p.data.label || '',
      },
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
        <button className="btn btn-sm" onClick={() => navigate('/trace')}>在链路追踪中打开完整图谱 →</button>
        <span className={styles.flowNote}>演示数据 · 完整数据需连接区块链节点</span>
      </div>
      <ReactECharts option={flowOption} style={{ flex: 1, minHeight: 320 }} theme="dark" />
    </div>
  );
};

const RiskTab: React.FC<{ data: ReturnType<typeof getMockAddress> }> = ({ data }) => (
  <div className={styles.riskReport}>
    <div className={styles.reportHeader}>
      <div className={styles.reportScore}>
        <span className={styles.reportScoreNum} style={{ color: 'var(--risk-critical)' }}>{data.riskScore}</span>
        <span className={styles.reportScoreLabel}>/ 100</span>
      </div>
      <div>
        <div className={styles.reportTitle}>高风险地址</div>
        <div className={styles.reportSub}>该地址存在多项高风险特征，建议谨慎交互</div>
      </div>
    </div>
    <div className={styles.factorList}>
      <div className={styles.cardTitle}>风险因素详情</div>
      {data.riskFactors.map((f, i) => (
        <div key={i} className={styles.factorDetail}>
          <div className={styles.factorDetailHeader}>
            <span className={styles.factorName}>{f.name}</span>
            <span className={styles.factorScore} style={{ color: 'var(--risk-critical)' }}>影响分值: +{f.score}</span>
          </div>
          <div className={styles.factorDesc}>{f.description}</div>
        </div>
      ))}
    </div>
  </div>
);
