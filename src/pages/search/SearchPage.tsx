import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RiskBadge } from '../../components/common/RiskBadge';
import { useI18n } from '../../hooks/useI18n';
import { useAppStore } from '../../stores/app';
import { shortAddress } from '../../utils/format';
import styles from './SearchPage.module.css';

type ResultType = 'address' | 'transaction' | 'label';

interface SearchResult {
  type: ResultType;
  chain: string;
  value: string;
  label?: string;
  riskScore?: number;
  balance?: string;
  txCount?: number;
  timestamp?: string;
}

// Mock search results generator
function mockSearch(q: string): SearchResult[] {
  if (!q) return [];
  const results: SearchResult[] = [];
  if (q.length >= 10) {
    results.push(
      { type: 'address', chain: 'ETH', value: q.length >= 42 ? q : `0x${q.padEnd(40, '0')}`, label: 'Suspected Hacker', riskScore: 94, balance: '401,346.00', txCount: 2847 },
      { type: 'address', chain: 'ETH', value: `0x${q.slice(0,8).padEnd(40, 'a')}`, label: 'Exchange Deposit', riskScore: 12, balance: '0.42', txCount: 14 },
      { type: 'address', chain: 'BTC', value: `1${q.slice(0,8).padEnd(33, 'B')}`, riskScore: 35, balance: '2.1', txCount: 7 },
    );
  }
  if (q.length >= 20) {
    results.push(
      { type: 'transaction', chain: 'ETH', value: q.length >= 66 ? q : `0x${q.padEnd(64, 'f')}`, riskScore: 88, timestamp: '2025-02-21T08:23:11Z' },
    );
  }
  return results;
}

const TYPE_ICONS: Record<ResultType, string> = { address: '◈', transaction: '⇄', label: '◉' };
const TYPE_COLORS: Record<ResultType, string> = { address: 'var(--color-text-secondary)', transaction: 'var(--color-info)', label: 'var(--color-warning)' };

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { addSearchHistory } = useAppStore();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filter, setFilter] = useState<'all' | ResultType>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q) {
      setLoading(true);
      setTimeout(() => { setResults(mockSearch(q)); setLoading(false); }, 400);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    addSearchHistory(q);
    setSearchParams({ q });
  };

  const handleResultClick = (r: SearchResult) => {
    if (r.type === 'address') navigate(`/address/${r.chain}/${r.value}`);
    else if (r.type === 'transaction') navigate(`/transaction/${r.value}`);
  };

  const filtered = filter === 'all' ? results : results.filter(r => r.type === filter);

  return (
    <div className={styles.page}>
      <div className={styles.searchBar}>
        <form className={styles.form} onSubmit={handleSearch}>
          <input
            className={styles.input}
            type="text"
            placeholder={t.common.searchPlaceholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary">{t.common.search}</button>
        </form>
      </div>

      {searchParams.get('q') && (
        <div className={styles.content}>
          <div className={styles.resultsMeta}>
            <span className={styles.queryLabel}>
              {t.common.search}: <span className="mono">{searchParams.get('q')}</span>
            </span>
            <span className={styles.countLabel}>{filtered.length} results</span>
          </div>

          <div className={styles.filterRow}>
            {(['all', 'address', 'transaction'] as const).map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? t.monitor.all : f === 'address' ? t.common.address : t.transaction.title}
                <span className={styles.filterCount}>
                  {f === 'all' ? results.length : results.filter(r => r.type === f).length}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.loadingDots}><span /><span /><span /></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>◈</div>
              <div>{t.common.noData}</div>
            </div>
          ) : (
            <div className={styles.resultList}>
              {filtered.map((r, i) => (
                <div key={i} className={styles.resultItem} onClick={() => handleResultClick(r)}>
                  <div className={styles.resultLeft}>
                    <span className={styles.typeIcon} style={{ color: TYPE_COLORS[r.type] }}>
                      {TYPE_ICONS[r.type]}
                    </span>
                    <div className={styles.resultInfo}>
                      <div className={styles.resultValue}>
                        <span className="mono">{shortAddress(r.value, 16, 12)}</span>
                        {r.label && <span className={styles.resultLabel}>{r.label}</span>}
                      </div>
                      <div className={styles.resultMeta}>
                        <span className={styles.chainTag}>{r.chain}</span>
                        <span className={styles.typeTag}>{r.type}</span>
                        {r.balance && <span className={styles.metaItem}>{r.balance} {r.chain}</span>}
                        {r.txCount && <span className={styles.metaItem}>{r.txCount} txs</span>}
                        {r.timestamp && <span className={styles.metaItem}>{new Date(r.timestamp).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className={styles.resultRight}>
                    {r.riskScore !== undefined && <RiskBadge score={r.riskScore} />}
                    <span className={styles.arrow}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
