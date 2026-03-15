import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../stores/app';
import { useI18n } from '../../hooks/useI18n';
import { SUPPORTED_CHAINS } from '../../constants/config';
import { EmptyState } from '../../components/common/EmptyState';
import { AddressDetail } from './AddressDetail';
import styles from './AddressPage.module.css';

export const AddressPage: React.FC = () => {
  const { chain: paramChain, id: paramAddr } = useParams<{ chain?: string; id?: string }>();
  const navigate = useNavigate();
  const { searchHistory, addSearchHistory } = useAppStore();
  const { t } = useI18n();
  const [query, setQuery] = useState(paramAddr || '');
  const [chain, setChain] = useState(paramChain || 'ETH');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    addSearchHistory(q);
    navigate(`/address/${chain}/${q}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.searchBar}>
        <form className={styles.form} onSubmit={handleSearch}>
          <select className={styles.chainSelect} value={chain} onChange={e => setChain(e.target.value)}>
            {SUPPORTED_CHAINS.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
          </select>
          <input
            className={styles.input}
            type="text"
            placeholder={t.address.placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus={!paramAddr}
          />
          <button type="submit" className="btn btn-primary">{t.common.search}</button>
        </form>
      </div>

      {paramAddr && paramChain ? (
        <AddressDetail chain={paramChain} address={paramAddr} />
      ) : (
        <div className={styles.content}>
          {searchHistory.length > 0 && (
            <div className={styles.historySection}>
              <div className={styles.historyTitle}>{t.address.history}</div>
              <div className={styles.historyList}>
                {searchHistory.slice(0, 10).map((h, i) => (
                  <button key={i} className={styles.historyItem} onClick={() => navigate(`/address/ETH/${h}`)}>
                    <span className="mono">{h}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <EmptyState title={t.address.title} description={t.address.placeholder} />
        </div>
      )}
    </div>
  );
};
