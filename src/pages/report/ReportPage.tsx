import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppStore } from '../../stores/app';
import { formatDate } from '../../utils/format';
import styles from './ReportPage.module.css';

const MOCK_REPORTS = [
  { id: '1', title: 'Bybit 黑客地址分析报告', type: 'address', target: '0x47666Fab...', chain: 'ETH', status: 'ready', createdAt: '2025-03-14T16:00:00Z', size: '2.4 MB' },
  { id: '2', title: '资金流向追踪报告 - Lazarus', type: 'flow', target: '1A1zP1eP...', chain: 'BTC', status: 'ready', createdAt: '2025-03-10T09:00:00Z', size: '5.1 MB' },
  { id: '3', title: '交易分析报告 #20250308', type: 'transaction', target: '0xd90e2f...', chain: 'ETH', status: 'generating', createdAt: '2025-03-08T14:00:00Z' },
];

const GenerateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [rtype, setRtype] = useState('address');
  const [target, setTarget] = useState('');
  const [chain, setChain] = useState('ETH');
  const [format, setFormat] = useState('pdf');
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>生成分析报告</span>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalField}>
            <label>报告类型</label>
            <div className={styles.radioGroup}>
              {[['address','地址分析'],['transaction','交易分析'],['flow','资金流向'],['risk','风险评估']].map(([v,l]) => (
                <label key={v} className={`${styles.radioItem} ${rtype === v ? styles.radioActive : ''}`}>
                  <input type="radio" value={v} checked={rtype === v} onChange={() => setRtype(v)} style={{ display: 'none' }} />
                  {l}
                </label>
              ))}
            </div>
          </div>
          <div className={styles.modalField}>
            <label>目标地址 / 交易哈希</label>
            <input className={styles.modalInput} placeholder="0x... 或交易哈希" value={target} onChange={e => setTarget(e.target.value)} />
          </div>
          <div className={styles.modalRow}>
            <div className={styles.modalField}>
              <label>公链</label>
              <select className={styles.modalSelect} value={chain} onChange={e => setChain(e.target.value)}>
                {['ETH','BTC','TRX','SOL','BSC'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.modalField}>
              <label>导出格式</label>
              <select className={styles.modalSelect} value={format} onChange={e => setFormat(e.target.value)}>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className="btn btn-primary btn-sm" disabled={!target}>生成报告</button>
          <button className="btn btn-sm" onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
};

export const ReportPage: React.FC = () => {
  const [tab, setTab] = useState<'reports' | 'history'>('reports');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { searchHistory, clearSearchHistory } = useAppStore();

  return (
    <div className={styles.page}>
      {showModal && <GenerateModal onClose={() => setShowModal(false)} />}
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'reports' ? styles.active : ''}`} onClick={() => setTab('reports')}>我的报告</button>
          <button className={`${styles.tab} ${tab === 'history' ? styles.active : ''}`} onClick={() => setTab('history')}>查询历史</button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ 生成报告</button>
      </div>

      {tab === 'reports' && (
        <div className={styles.content}>
          {MOCK_REPORTS.length === 0 ? (
            <EmptyState title="暂无报告" description="查询地址或交易后可生成分析报告" />
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>报告名称</span><span>类型</span><span>目标</span><span>链</span><span>状态</span><span>生成时间</span><span>大小</span><span>操作</span>
              </div>
              {MOCK_REPORTS.map(r => (
                <div key={r.id} className={styles.tableRow}>
                  <span className={styles.reportTitle}>{r.title}</span>
                  <span className={styles.reportType}>{{ address: '地址', transaction: '交易', flow: '流向' }[r.type]}</span>
                  <span className={`${styles.target} mono`}>{r.target}</span>
                  <span className={styles.chain}>{r.chain}</span>
                  <span className={`${styles.status} ${r.status === 'ready' ? styles.ready : styles.generating}`}>
                    {r.status === 'ready' ? '● 已完成' : '◌ 生成中...'}
                  </span>
                  <span className={styles.date}>{formatDate(r.createdAt)}</span>
                  <span className={styles.size}>{r.size || '-'}</span>
                  <div className={styles.actions}>
                    {r.status === 'ready' && <button className="btn btn-sm">下载 PDF</button>}
                    <button className="btn btn-sm" style={{ color: 'var(--color-danger)' }}>删除</button>
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
            <EmptyState title="暂无查询历史" description="查询记录将在此显示" />
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-3)' }}>
                <button className="btn btn-sm" onClick={clearSearchHistory}>清空历史</button>
              </div>
              <div className={styles.table}>
                <div className={styles.tableHeader} style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                  <span>查询内容</span><span>类型</span><span>操作</span>
                </div>
                {searchHistory.map((h, i) => (
                  <div key={i} className={styles.tableRow} style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                    <span className="mono" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text)' }}>{h}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {h.length === 64 || h.length === 66 ? '交易哈希' : '地址'}
                    </span>
                    <button className="btn btn-sm" onClick={() => navigate(h.length === 64 || h.length === 66 ? `/transaction/${h}` : `/address/ETH/${h}`)}>查看</button>
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
