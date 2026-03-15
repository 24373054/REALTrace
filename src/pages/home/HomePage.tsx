import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/app';
import { useI18n } from '../../hooks/useI18n';
import { StatCard } from '../../components/common/StatCard';
import { RiskBar } from '../../components/common/RiskBar';
import { SUPPORTED_CHAINS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import styles from './HomePage.module.css';

const MOCK_STATS = [
  { key: 'queries', value: '2,847,391', sub: '+12,847' },
  { key: 'addresses', value: '891,204', sub: '6 chains' },
  { key: 'flagged', value: '34,891', sub: 'High: 8,234', danger: false },
  { key: 'alerts', value: '1,247', sub: '+18%', danger: true },
];

const QUICK_CASES = [
  { label: 'Bybit 黑客追踪', chain: 'ETH', address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2', risk: 98, amount: '$1.46B', tags: ['OFAC制裁', '混币器'] },
  { label: 'Lazarus Group', chain: 'BTC', address: '1Lazarusg...', risk: 99, amount: '$620M', tags: ['朝鲜APT', '跨链'] },
  { label: 'Tornado Cash 关联', chain: 'ETH', address: '0xd90e2f...', risk: 87, amount: '$45M', tags: ['混币器'] },
  { label: 'Pig Butchering', chain: 'TRX', address: 'TXmixer...', risk: 92, amount: '$12M', tags: ['诈骗', '洗钱'] },
];

// Live ticker items
const TICKER_ITEMS = [
  '⚠ 检测到高风险交易: 0x47666F... → Tornado Cash  100 ETH',
  '● 新增监控预警: BTC 地址 1A1zP1... 余额变动 +50 BTC',
  '⚠ OFAC 制裁名单更新: 新增 3 个 ETH 地址',
  '● 链路追踪完成: Bybit 黑客资金流向已更新',
  '⚠ 高风险地址活跃: 0xd90e2f... 发起 14 笔交易',
];

const LiveTicker: React.FC = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TICKER_ITEMS.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={styles.ticker}>
      <span className={styles.tickerLabel}>LIVE</span>
      <span className={styles.tickerText}>{TICKER_ITEMS[idx]}</span>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addSearchHistory } = useAppStore();
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');
  const [chain, setChain] = useState('ETH');
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    addSearchHistory(q);
    if (q.length === 64 || q.length === 66) {
      navigate(`${ROUTES.TRANSACTION}/${q}`);
    } else {
      navigate(`/address/${chain}/${q}`);
    }
  };

  return (
    <div className={styles.page}>
      {/* Live ticker */}
      <LiveTicker />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLabel}>{t.home.label}</div>
          <h1 className={styles.heroTitle}>{t.home.title}</h1>
          <p className={styles.heroSub}>{t.home.subtitle}</p>
          <form className={styles.heroSearch} onSubmit={handleSearch}>
            <select className={styles.heroChain} value={chain} onChange={e => setChain(e.target.value)}>
              {SUPPORTED_CHAINS.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
            </select>
            <input
              className={styles.heroInput}
              type="text"
              placeholder={t.common.searchPlaceholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              ref={inputRef}
              autoFocus
            />
            <button type="submit" className={styles.heroBtn}>{t.common.search}</button>
          </form>
          <div className={styles.heroHints}>
            <span>{t.home.shortcut}: <kbd>Ctrl+K</kbd></span>
          </div>
        </div>
      </section>

      {/* 数据统计 */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {MOCK_STATS.map((s, i) => (
            <StatCard key={i} label={t.home.stats[s.key as keyof typeof t.home.stats]} value={s.value} sub={s.sub} danger={!!s.danger} />
          ))}
        </div>
      </section>

      {/* 快捷入口 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>{t.home.quickActions}</span>
        </div>
        <div className={styles.quickGrid}>
          {[
            { icon: '⬡', title: t.nav.address, desc: locale === 'zh' ? '查询地址风险评分、余额、交易历史' : 'Query address risk score, balance, tx history', path: ROUTES.ADDRESS },
            { icon: '⇄', title: t.nav.transaction, desc: locale === 'zh' ? '追踪交易资金流向，支持多跳路径分析' : 'Trace fund flow, multi-hop path analysis', path: ROUTES.TRANSACTION },
            { icon: '◈', title: t.nav.analysis, desc: locale === 'zh' ? '交易图谱、资金流向桑基图、趋势图' : 'Graph, Sankey flow chart, trend analysis', path: ROUTES.ANALYSIS },
            { icon: '⬡', title: t.nav.trace, desc: locale === 'zh' ? 'D3 力导向图 + 6 大案例 CyberTrace 可视化' : 'D3 force graph + 6 CyberTrace cases', path: ROUTES.TRACE },
            { icon: '◉', title: t.nav.monitor, desc: locale === 'zh' ? '实时监控地址动态，触发条件自动预警' : 'Real-time address monitoring & alerts', path: ROUTES.MONITOR },
            { icon: '▤', title: t.nav.report, desc: locale === 'zh' ? '生成专业分析报告，支持 PDF 导出' : 'Generate professional reports, PDF export', path: ROUTES.REPORT },
            { icon: '◎', title: t.nav.member, desc: locale === 'zh' ? '查看权益、升级会员、管理订阅' : 'View benefits, upgrade, manage subscription', path: ROUTES.MEMBER },
          ].map((item) => (
            <button key={item.path} className={styles.quickCard} onClick={() => navigate(item.path)}>
              <span className={styles.quickIcon}>{item.icon}</span>
              <span className={styles.quickTitle}>{item.title}</span>
              <span className={styles.quickDesc}>{item.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Hot cases */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>{t.home.hotCases}</span>
          <button className={styles.sectionMore} onClick={() => navigate(ROUTES.REPORT)}>{t.common.viewAll} →</button>
        </div>
        <div className={styles.caseTable}>
          <div className={styles.caseHeader}>
            <span>{locale === 'zh' ? '案例名称' : 'Case'}</span>
            <span>{t.common.chain}</span>
            <span>{t.common.address}</span>
            <span>{t.common.amount}</span>
            <span>{t.risk.score}</span>
            <span>{t.common.label}</span>
            <span>{t.common.actions}</span>
          </div>
          {QUICK_CASES.map((c, i) => (
            <div key={i} className={styles.caseRow}>
              <span className={styles.caseLabel}>{c.label}</span>
              <span className={styles.caseChain}>{c.chain}</span>
              <span className={`${styles.caseAddr} mono`}>{c.address}</span>
              <span className={`${styles.caseAmount} mono`}>{c.amount}</span>
              <div className={styles.caseRiskWrap}>
                <RiskBar score={c.risk} showLabel={false} />
                <span className={styles.caseRiskNum} style={{ color: c.risk >= 90 ? 'var(--risk-critical)' : 'var(--risk-high)' }}>{c.risk}</span>
              </div>
              <div className={styles.caseTags}>
                {c.tags.map(tag => <span key={tag} className="tag tag-danger">{tag}</span>)}
              </div>
              <button className="btn btn-sm" onClick={() => navigate(`/address/${c.chain}/${c.address}`)}>{t.common.view}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
