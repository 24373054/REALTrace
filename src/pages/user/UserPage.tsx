import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/user';
import { useAppStore } from '../../stores/app';
import { useI18n } from '../../hooks/useI18n';
import { UsageBar } from '../../components/common/UsageBar';
import { ROUTES } from '../../constants/routes';
import styles from './UserPage.module.css';

type UserTab = 'profile' | 'settings' | 'favorites' | 'history' | 'usage' | 'orders';

export const UserPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<UserTab>(
    location.pathname.includes('settings') ? 'settings' :
    location.pathname.includes('favorites') ? 'favorites' :
    location.pathname.includes('history') ? 'history' : 'profile'
  );

  if (!user) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{user.username[0].toUpperCase()}</div>
          <div className={styles.username}>{user.username}</div>
          <div className={styles.email}>{user.email}</div>
          <div className={styles.roleBadge}>{user.role.toUpperCase()}</div>
          <div className={styles.expiry}>{t.user.expiresAt} 2026-03-15</div>
        </div>
        <nav className={styles.nav}>
          {([
            ['profile', t.user.profile],
            ['settings', t.user.settings],
            ['usage', t.user.usage],
            ['favorites', t.user.favorites],
            ['history', t.user.history],
            ['orders', t.user.orders],
          ] as [UserTab, string][]).map(([tb, label]) => (
            <button key={tb} className={`${styles.navItem} ${tab === tb ? styles.active : ''}`} onClick={() => setTab(tb)}>
              {label}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => navigate(ROUTES.MEMBER)}>{t.common.upgrade}</button>
        </div>
      </div>

      <div className={styles.content}>
        {tab === 'profile' && <ProfileTab user={user} onUpdate={updateUser} t={t} />}
        {tab === 'settings' && <SettingsTab t={t} />}
        {tab === 'usage' && <UsageTab user={user} t={t} />}
        {tab === 'favorites' && <FavoritesTab t={t} />}
        {tab === 'history' && <HistoryTab t={t} />}
        {tab === 'orders' && <OrdersTab t={t} locale={locale} />}
      </div>
    </div>
  );
};

const ProfileTab: React.FC<{ user: any; onUpdate: (u: any) => void; t: any }> = ({ user, onUpdate, t }) => {
  const [username, setUsername] = useState(user.username);
  const [saved, setSaved] = useState(false);
  const save = () => { onUpdate({ username }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className={styles.tabContent}>
      <div className={styles.tabTitle}>{t.user.profileInfo}</div>
      <div className={styles.formGrid}>
        <div className={styles.field}><label>{t.user.username}</label><input className={styles.input} value={username} onChange={e => setUsername(e.target.value)} /></div>
        <div className={styles.field}><label>{t.user.email}</label><input className={styles.input} value={user.email} disabled /></div>
        <div className={styles.field}><label>{t.user.memberLevel}</label><input className={styles.input} value={user.role.toUpperCase()} disabled /></div>
        <div className={styles.field}><label>{t.user.registeredAt}</label><input className={styles.input} value={new Date(user.createdAt).toLocaleDateString()} disabled /></div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={save}>{saved ? t.user.saved : t.user.saveChanges}</button>
    </div>
  );
};

const SettingsTab: React.FC<{ t: any }> = ({ t }) => (
  <div className={styles.tabContent}>
    <div className={styles.tabTitle}>{t.user.accountSettings}</div>
    <div className={styles.settingSection}>
      <div className={styles.settingTitle}>{t.user.changePassword}</div>
      <div className={styles.formGrid}>
        <div className={styles.field}><label>{t.user.currentPassword}</label><input className={styles.input} type="password" placeholder="••••••••" /></div>
        <div className={styles.field}><label>{t.user.newPassword}</label><input className={styles.input} type="password" placeholder="Min 8 chars" /></div>
        <div className={styles.field}><label>{t.user.confirmPassword}</label><input className={styles.input} type="password" placeholder="Repeat password" /></div>
      </div>
      <button className="btn btn-primary btn-sm">{t.user.updatePassword}</button>
    </div>
    <div className={styles.settingSection}>
      <div className={styles.settingTitle}>{t.user.twoFactor}</div>
      <div className={styles.settingRow}>
        <span className={styles.settingLabel}>Google Authenticator</span>
        <span className={styles.settingStatus}>{t.user.notEnabled}</span>
        <button className="btn btn-sm">{t.user.enable}</button>
      </div>
    </div>
  </div>
);

const FavoritesTab: React.FC<{ t: any }> = ({ t }) => {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useAppStore();
  return (
    <div className={styles.tabContent}>
      <div className={styles.tabTitle}>{t.user.favorites}</div>
      {favorites.length === 0 ? (
        <div className={styles.emptyHint}>{t.user.noFavorites}</div>
      ) : (
        <div className={styles.historyList}>
          {favorites.map((f, i) => (
            <div key={i} className={styles.historyItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="mono" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text)' }}>{f.address}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{f.chain}{f.label ? ` · ${f.label}` : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" onClick={() => navigate(`/address/${f.chain}/${f.address}`)}>{t.common.view}</button>
                <button className="btn btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => removeFavorite(f.address)}>{t.common.delete}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HistoryTab: React.FC<{ t: any }> = ({ t }) => {
  const { searchHistory, clearSearchHistory } = useAppStore();
  return (
    <div className={styles.tabContent}>
      <div className={styles.tabTitleRow}>
        <span className={styles.tabTitle}>{t.user.history}</span>
        {searchHistory.length > 0 && <button className="btn btn-sm" onClick={clearSearchHistory}>{t.user.clearHistory}</button>}
      </div>
      {searchHistory.length === 0 ? (
        <div className={styles.emptyHint}>{t.user.noHistory}</div>
      ) : (
        <div className={styles.historyList}>
          {searchHistory.map((h: string, i: number) => (
            <div key={i} className={styles.historyItem}>
              <span className="mono">{h}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UsageTab: React.FC<{ user: any; t: any }> = ({ user, t }) => {
  const navigate = useNavigate();
  const tierLimits: Record<string, { queries: number | 'unlimited'; exports: number | 'unlimited'; monitors: number | 'unlimited'; api: number | 'unlimited' }> = {
    free:       { queries: 10,          exports: 3,           monitors: 2,           api: 0 },
    basic:      { queries: 100,         exports: 20,          monitors: 10,          api: 1000 },
    pro:        { queries: 500,         exports: 100,         monitors: 50,          api: 10000 },
    enterprise: { queries: 'unlimited', exports: 'unlimited', monitors: 'unlimited', api: 'unlimited' },
  };
  const limits = tierLimits[user.role] || tierLimits.free;
  const todayUsage = { queries: 7, exports: 1, monitors: 2, api: 234 };
  return (
    <div className={styles.tabContent} style={{ maxWidth: 700 }}>
      <div className={styles.tabTitle}>{t.user.usage}</div>
      <div className={styles.usageSection}>
        <div className={styles.usageSectionTitle}>{t.user.todayUsage}</div>
        <div className={styles.usageBars}>
          <UsageBar label={t.user.addressQuery} used={todayUsage.queries} total={limits.queries} unit=" " />
          <UsageBar label={t.user.reportExport} used={todayUsage.exports} total={limits.exports} unit=" " />
          <UsageBar label={t.user.monitorAddresses} used={todayUsage.monitors} total={limits.monitors} unit=" " />
          <UsageBar label="API" used={todayUsage.api} total={limits.api} unit=" " />
        </div>
      </div>
      <div className={styles.usageSection}>
        <div className={styles.usageSectionTitle}>{t.user.monthlyStats}</div>
        <div className={styles.usageStats}>
          {[
            { label: t.user.totalQueries, value: '142', sub: `${t.user.vsLastMonth} +23%` },
            { label: t.user.reportsExported, value: '18', sub: `${t.user.vsLastMonth} +5%` },
            { label: t.user.alertsTriggered, value: '7', sub: `${t.user.vsLastMonth} -2` },
            { label: t.user.apiCalls, value: '4,821', sub: `${t.user.vsLastMonth} +12%` },
          ].map((s, i) => (
            <div key={i} className={styles.usageStat}>
              <span className={styles.usageStatValue}>{s.value}</span>
              <span className={styles.usageStatLabel}>{s.label}</span>
              <span className={styles.usageStatSub}>{s.sub}</span>
            </div>
          ))}
        </div>
      </div>
      {user.role === 'free' && (
        <div className={styles.upgradeHint}>
          <span>{t.user.upgradeHint}</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.MEMBER)}>{t.user.viewPlans}</button>
        </div>
      )}
    </div>
  );
};

const MOCK_ORDERS = [
  { id: 'ORD20260312000001', plan: 'Basic', duration: '1 Month', amount: 29, status: 'completed', payMethod: 'Alipay', time: '2026-03-12T10:05:00Z' },
  { id: 'ORD20260112000042', plan: 'Basic', duration: '1 Month', amount: 29, status: 'completed', payMethod: 'WeChat Pay', time: '2026-01-12T14:22:00Z' },
  { id: 'ORD20251212000018', plan: 'Free', duration: '-', amount: 0, status: 'completed', payMethod: '-', time: '2025-12-12T09:00:00Z' },
];

const OrdersTab: React.FC<{ t: any; locale: string }> = ({ t, locale }) => {
  const STATUS_COLORS: Record<string, string> = {
    completed: 'var(--color-success)',
    pending: 'var(--color-warning)',
    refunded: 'var(--color-text-muted)',
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabTitle}>{t.user.orders}</div>
      <div className={styles.ordersTable}>
        <div className={styles.ordersHeader}>
          <span>{locale === 'zh' ? '订单号' : 'Order No.'}</span>
          <span>{locale === 'zh' ? '方案' : 'Plan'}</span>
          <span>{locale === 'zh' ? '时长' : 'Duration'}</span>
          <span>{locale === 'zh' ? '金额' : 'Amount'}</span>
          <span>{locale === 'zh' ? '支付方式' : 'Payment'}</span>
          <span>{locale === 'zh' ? '状态' : 'Status'}</span>
          <span>{locale === 'zh' ? '时间' : 'Time'}</span>
          <span>{locale === 'zh' ? '操作' : 'Actions'}</span>
        </div>
        {MOCK_ORDERS.map(o => (
          <div key={o.id} className={styles.ordersRow}>
            <span className={`${styles.orderId} mono`}>{o.id}</span>
            <span>{o.plan}</span>
            <span>{o.duration}</span>
            <span className="mono">{o.amount > 0 ? `¥${o.amount}` : '-'}</span>
            <span>{o.payMethod}</span>
            <span style={{ color: STATUS_COLORS[o.status] }}>
              {o.status === 'completed' ? (locale === 'zh' ? '已完成' : 'Completed') : o.status}
            </span>
            <span className={styles.orderTime}>{new Date(o.time).toLocaleDateString()}</span>
            <div className={styles.orderActions}>
              {o.amount > 0 && (
                <button className="btn btn-sm">{locale === 'zh' ? '下载发票' : 'Invoice'}</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
