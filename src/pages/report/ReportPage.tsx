import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppStore } from '../../stores/app';
import { useI18n } from '../../hooks/useI18n';
import { formatDate } from '../../utils/format';
import styles from './ReportPage.module.css';

const MOCK_REPORTS = [
  { id: '1', title: 'Bybit Hacker Address Analysis', type: 'address', target: '0x47666Fab...', chain: 'ETH', status: 'ready', createdAt: '2025-03-14T16:00:00Z', size: '2.4 MB' },
  { id: '2', title: 'Fund Flow Trace - Lazarus', type: 'flow', target: '1A1zP1eP...', chain: 'BTC', status: 'ready', createdAt: '2025-03-10T09:00:00Z', size: '5.1 MB' },
  { id: '3', title: 'Transaction Analysis #20250308', type: 'transaction', target: '0xd90e2f...', chain: 'ETH', status: 'generating', createdAt: '2025-03-08T14:00:00Z' },
];

const GenerateModal: React.FC<{ onClose: () => void; t: any }> = ({ onClose, t }) => {
  const [rtype, setRtype] = useState('address');
  const [target, setTarget] = useState('');
  const [chain, setChain] = useState('ETH');
  const [format, setFormat] = useState('pdf');
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{t.report.generateTitle}</span>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalField}>
            <label>{t.report.reportTypeLabel}</label>
            <div className={styles.radioGroup}>
              {[
                ['address', t.report.reportType.address],
                ['transaction', t.report.reportType.transaction],
                ['flow', t.report.reportType.flow],
                ['risk', t.report.reportType.risk],
              ].map(([v, l]) => (
                <label key={v} className={`${styles.radioItem} ${rtype === v ? styles.radioActive : ''}`}>
                  <input type="radio" value={v} checked={rtype === v} onChange={() => setRtype(v)} style={{ display: 'none' }} />
                  {l}
                </label>
              ))}
            </div>
          </div>
          <div className={styles.modalField}>
            <label>{t.report.targetLabel}</label>
            <input className={styles.modalInput} placeholder={t.report.targetPlaceholder} value={target} onChange={e => setTarget(e.target.value)} />
          </div>
          <div className={styles.modalRow}>
            <div className={styles.modalField}>
              <label>{t.report.chainLabel}</label>
              <select className={styles.modalSelect} value={chain} onChange={e => setChain(e.target.value)}>
                {['ETH','BTC','TRX','SOL','BSC'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.modalField}>
              <label>{t.report.formatLabel}</label>
              <select className={styles.modalSelect} value={format} onChange={e => setFormat(e.target.value)}>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className="btn btn-primary btn-sm" disabled={!target}>{t.report.generate}</button>
          <button className="btn btn-sm" onClick={onClose}>{t.common.cancel}</button>
        </div>
      </div>
    </div>
  );
};

export const ReportPage: React.FC = () => {
  const [tab, setTab] = useState<'reports' | 'history'>('reports');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();
  const { searchHistory, clearSearchHistory } = useAppStore();

  const TYPE_LABELS: Record<string, string> = {
    address: t.report.reportType.address,
    transaction: t.report.reportType.transaction,
    flow: t.report.reportType.flow,
    risk: t.report.reportType.risk,
  };

  return (
    <div className={styles.page}>
      {showModal && <GenerateModal onClose={() => setShowModal(false)} t={t} />}
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'reports' ? styles.active : ''}`} onClick={() => setTab('reports')}>{t.report.myReports}</button>
          <button className={`${styles.tab} ${tab === 'history' ? styles.active : ''}`} onClick={() => setTab('history')}>{t.report.history}</button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ {t.report.generate}</button>
      </div>

      {tab === 'reports' && (
        <div className={styles.content}>
          {MOCK_REPORTS.length === 0 ? (
            <EmptyState title={t.report.noReports} description={t.report.noReportsDesc} />
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>{t.report.reportName}</span>
                <span>{t.report.type}</span>
                <span>{t.report.target}</span>
                <span>{t.common.chain}</span>
                <span>{t.common.status}</span>
                <span>{t.common.time}</span>
                <span>{t.report.size}</span>
                <span>{t.common.actions}</span>
              </div>
              {MOCK_REPORTS.map(r => (
                <div key={r.id} className={styles.tableRow}>
                  <span className={styles.reportTitle}>{r.title}</span>
                  <span className={styles.reportType}>{TYPE_LABELS[r.type] || r.type}</span>
                  <span className={`${styles.target} mono`}>{r.target}</span>
                  <span className={styles.chain}>{r.chain}</span>
                  <span className={`${styles.status} ${r.status === 'ready' ? styles.ready : styles.generating}`}>
                    {r.status === 'ready' ? `● ${t.report.status.ready}` : `◌ ${t.report.status.generating}`}
                  </span>
                  <span className={styles.date}>{formatDate(r.createdAt)}</span>
                  <span className={styles.size}>{r.size || '-'}</span>
                  <div className={styles.actions}>
                    {r.status === 'ready' && <button className="btn btn-sm">{t.report.downloadPdf}</button>}
                    <button className="btn btn-sm" style={{ color: 'var(--color-danger)' }}>{t.common.delete}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className={styles.content}>
          {searchHistory.length === 0 ? (
            <EmptyState title={t.report.noHistory} description={t.report.noHistoryDesc} />
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-3)' }}>
                <button className="btn btn-sm" onClick={clearSearchHistory}>{t.report.clearHistory}</button>
              </div>
              <div className={styles.table}>
                <div className={styles.tableHeader} style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                  <span>{t.common.search}</span>
                  <span>{t.common.type}</span>
                  <span>{t.common.actions}</span>
                </div>
                {searchHistory.map((h, i) => (
                  <div key={i} className={styles.tableRow} style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                    <span className="mono" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text)' }}>{h}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {h.length === 64 || h.length === 66 ? t.report.txHash : t.report.address}
                    </span>
                    <button className="btn btn-sm" onClick={() => navigate(h.length === 64 || h.length === 66 ? `/transaction/${h}` : `/address/ETH/${h}`)}>{t.common.view}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
