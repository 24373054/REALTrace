import React, { useState } from 'react';
import { EmptyState } from '../../components/common/EmptyState';
import { useI18n } from '../../hooks/useI18n';
import { shortAddress, formatDate } from '../../utils/format';
import styles from './MonitorPage.module.css';

const MOCK_MONITORS = [
  { id: '1', address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2', chain: 'ETH', label: 'Bybit Hacker', monitorType: 'transaction', status: 'active', alertCount: 12, createdAt: '2025-02-21T08:00:00Z', lastAlert: '2025-03-14T16:44:02Z', threshold: 10 },
  { id: '2', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf', chain: 'BTC', label: 'Genesis Block', monitorType: 'balance', status: 'active', alertCount: 0, createdAt: '2025-01-01T00:00:00Z', threshold: 50 },
  { id: '3', address: 'TXmixerXXXXXXXXXXXXXXXXXXXXXXXXX', chain: 'TRX', label: 'Mixer Address', monitorType: 'risk', status: 'paused', alertCount: 3, createdAt: '2025-03-01T00:00:00Z', threshold: 80 },
];

const MOCK_ALERTS = [
  { id: 'a1', monitorId: '1', address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2', chain: 'ETH', label: 'Bybit Hacker', type: 'large_transfer', severity: 'critical', message: 'Large transfer detected: 100 ETH → Tornado Cash', time: '2025-03-14T16:44:02Z', read: false },
  { id: 'a2', monitorId: '1', address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2', chain: 'ETH', label: 'Bybit Hacker', type: 'risk_change', severity: 'high', message: 'Risk score increased to 94 (+7)', time: '2025-03-14T12:11:30Z', read: false },
  { id: 'a3', monitorId: '3', address: 'TXmixerXXXXXXXXXXXXXXXXXXXXXXXXX', chain: 'TRX', label: 'Mixer Address', type: 'new_tx', severity: 'medium', message: 'New transaction: received 50,000 TRX', time: '2025-03-13T09:22:15Z', read: true },
  { id: 'a4', monitorId: '1', address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2', chain: 'ETH', label: 'Bybit Hacker', type: 'blacklist', severity: 'critical', message: 'Address added to OFAC sanctions list', time: '2025-03-12T18:05:44Z', read: true },
  { id: 'a5', monitorId: '1', address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2', chain: 'ETH', label: 'Bybit Hacker', type: 'large_transfer', severity: 'critical', message: 'Large transfer detected: 200 ETH → Relay address', time: '2025-03-11T07:33:21Z', read: true },
];

type MonitorView = 'list' | 'alerts';

export const MonitorPage: React.FC = () => {
  const [view, setView] = useState<MonitorView>('list');
  const [showAdd, setShowAdd] = useState(false);
  const [newAddr, setNewAddr] = useState('');
  const [newChain, setNewChain] = useState('ETH');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('transaction');
  const [newThreshold, setNewThreshold] = useState('10');
  const { t } = useI18n();
  const unreadCount = MOCK_ALERTS.filter(a => !a.read).length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>{t.monitor.title}</span>
          <div className={styles.viewTabs}>
            <button className={`${styles.viewTab} ${view === 'list' ? styles.viewTabActive : ''}`} onClick={() => setView('list')}>{t.monitor.list}</button>
            <button className={`${styles.viewTab} ${view === 'alerts' ? styles.viewTabActive : ''}`} onClick={() => setView('alerts')}>
              {t.monitor.alerts} {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>}
            </button>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>+ {t.monitor.add}</button>
      </div>

      {showAdd && <AddForm
        newAddr={newAddr} setNewAddr={setNewAddr}
        newChain={newChain} setNewChain={setNewChain}
        newLabel={newLabel} setNewLabel={setNewLabel}
        newType={newType} setNewType={setNewType}
        newThreshold={newThreshold} setNewThreshold={setNewThreshold}
        onClose={() => setShowAdd(false)}
        t={t}
      />}

      <div className={styles.statsRow}>
        {[
          { label: t.monitor.monitoredAddresses, value: MOCK_MONITORS.length },
          { label: t.monitor.activeMonitors, value: MOCK_MONITORS.filter(m => m.status === 'active').length },
          { label: t.monitor.todayAlerts, value: 5, danger: true },
          { label: t.monitor.unreadAlerts, value: unreadCount, danger: unreadCount > 0 },
        ].map((s, i) => (
          <div key={i} className={styles.statItem}>
            <span className={`${styles.statValue} ${s.danger ? styles.statDanger : ''}`}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {view === 'list' ? <MonitorList t={t} /> : <AlertList t={t} />}
    </div>
  );
};

interface AddFormProps {
  newAddr: string; setNewAddr: (v: string) => void;
  newChain: string; setNewChain: (v: string) => void;
  newLabel: string; setNewLabel: (v: string) => void;
  newType: string; setNewType: (v: string) => void;
  newThreshold: string; setNewThreshold: (v: string) => void;
  onClose: () => void;
  t: any;
}

const AddForm: React.FC<AddFormProps> = ({ newAddr, setNewAddr, newChain, setNewChain, newLabel, setNewLabel, newType, setNewType, newThreshold, setNewThreshold, onClose, t }) => {
  const thresholdLabel = newType === 'risk' ? t.monitor.thresholdRisk
    : newType === 'balance' ? t.monitor.thresholdBalance
    : t.monitor.thresholdTx;

  return (
    <div className={styles.addForm}>
      <div className={styles.addFormTitle}>{t.monitor.addFormTitle}</div>
      <div className={styles.addFormGrid}>
        <div className={styles.addField}>
          <label>{t.monitor.chain}</label>
          <select className={styles.select} value={newChain} onChange={e => setNewChain(e.target.value)}>
            {['ETH','BTC','TRX','SOL','BSC'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className={styles.addField} style={{ gridColumn: 'span 2' }}>
          <label>{t.monitor.addressLabel}</label>
          <input className={styles.input} placeholder="0x..." value={newAddr} onChange={e => setNewAddr(e.target.value)} />
        </div>
        <div className={styles.addField}>
          <label>{t.monitor.noteLabel}</label>
          <input className={styles.input} placeholder={t.monitor.optional} value={newLabel} onChange={e => setNewLabel(e.target.value)} />
        </div>
        <div className={styles.addField}>
          <label>{t.monitor.monitorTypeLabel}</label>
          <select className={styles.select} value={newType} onChange={e => setNewType(e.target.value)}>
            <option value="transaction">{t.monitor.monitorType.transaction}</option>
            <option value="balance">{t.monitor.monitorType.balance}</option>
            <option value="risk">{t.monitor.monitorType.risk}</option>
          </select>
        </div>
        <div className={styles.addField}>
          <label>{thresholdLabel}</label>
          <input className={styles.input} type="number" value={newThreshold} onChange={e => setNewThreshold(e.target.value)} />
        </div>
      </div>
      <div className={styles.addFormActions}>
        <button className="btn btn-primary btn-sm">{t.monitor.confirmAdd}</button>
        <button className="btn btn-sm" onClick={onClose}>{t.common.cancel}</button>
      </div>
    </div>
  );
};

const MonitorList: React.FC<{ t: any }> = ({ t }) => (
  MOCK_MONITORS.length === 0 ? (
    <EmptyState title={t.common.noData} description="" />
  ) : (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <span>{t.common.address}</span>
        <span>{t.common.chain}</span>
        <span>{t.common.label}</span>
        <span>{t.common.type}</span>
        <span>{t.monitor.threshold}</span>
        <span>{t.common.status}</span>
        <span>{t.monitor.alertCount}</span>
        <span>{t.monitor.lastAlert}</span>
        <span>{t.common.actions}</span>
      </div>
      {MOCK_MONITORS.map(m => (
        <div key={m.id} className={styles.tableRow}>
          <span className={`${styles.addr} mono`}>{shortAddress(m.address)}</span>
          <span className={styles.chain}>{m.chain}</span>
          <span className={styles.label}>{m.label || '-'}</span>
          <span className={styles.type}>
            {m.monitorType === 'transaction' ? t.monitor.monitorType.transaction
              : m.monitorType === 'balance' ? t.monitor.monitorType.balance
              : t.monitor.monitorType.risk}
          </span>
          <span className={`${styles.threshold} mono`}>{m.threshold}{m.monitorType === 'risk' ? '' : ' ETH'}</span>
          <span className={`${styles.status} ${m.status === 'active' ? styles.active : styles.paused}`}>
            {m.status === 'active' ? t.monitor.monitoringActive : t.monitor.monitoringPaused}
          </span>
          <span className={`${styles.alertCount} ${m.alertCount > 0 ? styles.hasAlert : ''}`}>{m.alertCount}</span>
          <span className={styles.lastAlert}>{m.lastAlert ? formatDate(m.lastAlert) : '-'}</span>
          <div className={styles.actions}>
            <button className="btn btn-sm">{m.status === 'active' ? t.common.pause : t.common.resume}</button>
            <button className="btn btn-sm" style={{ color: 'var(--color-danger)' }}>{t.common.delete}</button>
          </div>
        </div>
      ))}
    </div>
  )
);

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'var(--risk-critical)',
  high: 'var(--risk-high)',
  medium: 'var(--risk-medium)',
  low: 'var(--risk-safe)',
};

const AlertList: React.FC<{ t: any }> = ({ t }) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const alerts = filter === 'unread' ? MOCK_ALERTS.filter(a => !a.read) : MOCK_ALERTS;
  const SEVERITY_LABEL: Record<string, string> = {
    critical: t.monitor.severity.critical,
    high: t.monitor.severity.high,
    medium: t.monitor.severity.medium,
    low: t.monitor.severity.low,
  };

  return (
    <div className={styles.alertSection}>
      <div className={styles.alertToolbar}>
        <div className={styles.filterBtns}>
          <button className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`} onClick={() => setFilter('all')}>{t.monitor.all}</button>
          <button className={`${styles.filterBtn} ${filter === 'unread' ? styles.filterActive : ''}`} onClick={() => setFilter('unread')}>{t.monitor.unread}</button>
        </div>
        <button className="btn btn-sm">{t.monitor.markRead}</button>
      </div>
      {alerts.length === 0 ? (
        <EmptyState title={t.common.noData} description="" />
      ) : (
        <div className={styles.alertList}>
          {alerts.map(a => (
            <div key={a.id} className={`${styles.alertItem} ${!a.read ? styles.alertUnread : ''}`}>
              <div className={styles.alertSeverity} style={{ background: SEVERITY_COLOR[a.severity] }}>
                {SEVERITY_LABEL[a.severity]}
              </div>
              <div className={styles.alertBody}>
                <div className={styles.alertMsg}>{a.message}</div>
                <div className={styles.alertMeta}>
                  <span className={`${styles.alertAddr} mono`}>{shortAddress(a.address)}</span>
                  <span className={styles.alertChain}>{a.chain}</span>
                  {a.label && <span className={styles.alertLabel}>{a.label}</span>}
                  <span className={styles.alertTime}>{formatDate(a.time)}</span>
                </div>
              </div>
              {!a.read && <div className={styles.unreadDot} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
