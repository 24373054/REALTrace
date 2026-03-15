import React, { useState } from 'react';
import { EmptyState } from '../../components/common/EmptyState';
import { useI18n } from '../../hooks/useI18n';
import { shortAddress, formatDate } from '../../utils/format';
import styles from './MonitorPage.module.css';

const MOCK_MONITORS = [
  { id: '1', address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2', chain: 'ETH', label: 'Bybit Hacker', monitorType: 'transaction', status: 'active', alertCount: 12, createdAt: '2025-02-21T08:00:00Z', lastAlert: '2025-03-14T16:44:02Z', threshold: 10 },
  { id: '2', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf', chain: 'BTC', label: 'Genesis Block', monitorType: 'balance', status: 'active', alertCount: 0, createdAt: '2025-01-01T00:00:00Z', threshold: 50 },
  { id: '3', address: 'TXmixerXXXXXXXXXXXXXXXXXXXXXXXXX', chain: 'TRX', label: '混币器地址', monitorType: 'risk', status: 'paused', alertCount: 3, createdAt: '2025-03-01T00:00:00Z', threshold: 80 },
];

const MOCK_ALERTS = [
  { id: 'a1', monitorId: '1', address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2', chain: 'ETH', label: 'Bybit Hacker', type: 'large_transfer', severity: 'critical', message: '检测到大额转账: 100 ETH → Tornado Cash', time: '2025-03-14T16:44:02Z', read: false },
  { id: 'a2', monitorId: '1', address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2', chain: 'ETH', label: 'Bybit Hacker', type: 'risk_change', severity: 'high', message: '风险评分上升至 94 (+7)', time: '2025-03-14T12:11:30Z', read: false },
  { id: 'a3', monitorId: '3', address: 'TXmixerXXXXXXXXXXXXXXXXXXXXXXXXX', chain: 'TRX', label: '混币器地址', type: 'new_tx', severity: 'medium', message: '新交易: 收到 50,000 TRX', time: '2025-03-13T09:22:15Z', read: true },
  { id: 'a4', monitorId: '1', address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2', chain: 'ETH', label: 'Bybit Hacker', type: 'blacklist', severity: 'critical', message: '地址被新增至 OFAC 制裁名单', time: '2025-03-12T18:05:44Z', read: true },
  { id: 'a5', monitorId: '1', address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2', chain: 'ETH', label: 'Bybit Hacker', type: 'large_transfer', severity: 'critical', message: '检测到大额转账: 200 ETH → 中间地址', time: '2025-03-11T07:33:21Z', read: true },
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
      />}

      <div className={styles.statsRow}>
        {[
          { label: '监控地址', value: MOCK_MONITORS.length },
          { label: '活跃监控', value: MOCK_MONITORS.filter(m => m.status === 'active').length },
          { label: '今日预警', value: 5, danger: true },
          { label: '未读预警', value: unreadCount, danger: unreadCount > 0 },
        ].map((s, i) => (
          <div key={i} className={styles.statItem}>
            <span className={`${styles.statValue} ${s.danger ? styles.statDanger : ''}`}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {view === 'list' ? <MonitorList /> : <AlertList />}
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
}

const AddForm: React.FC<AddFormProps> = ({ newAddr, setNewAddr, newChain, setNewChain, newLabel, setNewLabel, newType, setNewType, newThreshold, setNewThreshold, onClose }) => (
  <div className={styles.addForm}>
    <div className={styles.addFormTitle}>添加地址监控</div>
    <div className={styles.addFormGrid}>
      <div className={styles.addField}>
        <label>公链</label>
        <select className={styles.select} value={newChain} onChange={e => setNewChain(e.target.value)}>
          {['ETH','BTC','TRX','SOL','BSC'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className={styles.addField} style={{ gridColumn: 'span 2' }}>
        <label>区块链地址</label>
        <input className={styles.input} placeholder="0x..." value={newAddr} onChange={e => setNewAddr(e.target.value)} />
      </div>
      <div className={styles.addField}>
        <label>备注标签</label>
        <input className={styles.input} placeholder="可选" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
      </div>
      <div className={styles.addField}>
        <label>监控类型</label>
        <select className={styles.select} value={newType} onChange={e => setNewType(e.target.value)}>
          <option value="transaction">交易监控</option>
          <option value="balance">余额变动</option>
          <option value="risk">风险评分</option>
        </select>
      </div>
      <div className={styles.addField}>
        <label>{newType === 'risk' ? '风险阈值 (0-100)' : newType === 'balance' ? '余额变动阈值 (ETH)' : '单笔金额阈值 (ETH)'}</label>
        <input className={styles.input} type="number" value={newThreshold} onChange={e => setNewThreshold(e.target.value)} />
      </div>
    </div>
    <div className={styles.addFormActions}>
      <button className="btn btn-primary btn-sm">确认添加</button>
      <button className="btn btn-sm" onClick={onClose}>取消</button>
    </div>
  </div>
);

const MonitorList: React.FC = () => (
  MOCK_MONITORS.length === 0 ? (
    <EmptyState title="暂无监控地址" description="添加地址开始实时监控" />
  ) : (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <span>地址</span><span>链</span><span>标签</span><span>监控类型</span><span>阈值</span><span>状态</span><span>预警次数</span><span>最近预警</span><span>操作</span>
      </div>
      {MOCK_MONITORS.map(m => (
        <div key={m.id} className={styles.tableRow}>
          <span className={`${styles.addr} mono`}>{shortAddress(m.address)}</span>
          <span className={styles.chain}>{m.chain}</span>
          <span className={styles.label}>{m.label || '-'}</span>
          <span className={styles.type}>{{ transaction: '交易', balance: '余额', risk: '风险' }[m.monitorType]}</span>
          <span className={`${styles.threshold} mono`}>{m.threshold}{m.monitorType === 'risk' ? '' : ' ETH'}</span>
          <span className={`${styles.status} ${m.status === 'active' ? styles.active : styles.paused}`}>
            {m.status === 'active' ? '● 监控中' : '○ 已暂停'}
          </span>
          <span className={`${styles.alertCount} ${m.alertCount > 0 ? styles.hasAlert : ''}`}>{m.alertCount}</span>
          <span className={styles.lastAlert}>{m.lastAlert ? formatDate(m.lastAlert) : '-'}</span>
          <div className={styles.actions}>
            <button className="btn btn-sm">{m.status === 'active' ? '暂停' : '启动'}</button>
            <button className="btn btn-sm" style={{ color: 'var(--color-danger)' }}>删除</button>
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

const AlertList: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { t } = useI18n();
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
