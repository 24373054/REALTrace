import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/user';
import { useAppStore } from '../../stores/app';
import { UsageBar } from '../../components/common/UsageBar';
import { ROUTES } from '../../constants/routes';
import styles from './UserPage.module.css';

type UserTab = 'profile' | 'settings' | 'favorites' | 'history' | 'usage';

export const UserPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();
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
          <div className={styles.expiry}>有效期至 2026-03-15</div>
        </div>
        <nav className={styles.nav}>
          {([
            ['profile', '个人信息'],
            ['settings', '账户设置'],
            ['usage', '用量统计'],
            ['favorites', '我的收藏'],
            ['history', '搜索历史'],
          ] as [UserTab, string][]).map(([t, label]) => (
            <button key={t} className={`${styles.navItem} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>
              {label}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => navigate(ROUTES.MEMBER)}>升级会员</button>
        </div>
      </div>

      <div className={styles.content}>
        {tab === 'profile' && <ProfileTab user={user} onUpdate={updateUser} />}
        {tab === 'settings' && <SettingsTab />}
        {tab === 'usage' && <UsageTab user={user} />}
        {tab === 'favorites' && <FavoritesTab />}
        {tab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
};

const ProfileTab: React.FC<{ user: any; onUpdate: (u: any) => void }> = ({ user, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [saved, setSaved] = useState(false);
  const save = () => { onUpdate({ username }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className={styles.tabContent}>
      <div className={styles.tabTitle}>个人信息</div>
      <div className={styles.formGrid}>
        <div className={styles.field}><label>用户名</label><input className={styles.input} value={username} onChange={e => setUsername(e.target.value)} /></div>
        <div className={styles.field}><label>邮箱</label><input className={styles.input} value={user.email} disabled /></div>
        <div className={styles.field}><label>会员等级</label><input className={styles.input} value={user.role.toUpperCase()} disabled /></div>
        <div className={styles.field}><label>注册时间</label><input className={styles.input} value={new Date(user.createdAt).toLocaleDateString('zh-CN')} disabled /></div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={save}>{saved ? '✓ 已保存' : '保存修改'}</button>
    </div>
  );
};

const SettingsTab: React.FC = () => (
  <div className={styles.tabContent}>
    <div className={styles.tabTitle}>账户设置</div>
    <div className={styles.settingSection}>
      <div className={styles.settingTitle}>修改密码</div>
      <div className={styles.formGrid}>
        <div className={styles.field}><label>当前密码</label><input className={styles.input} type="password" placeholder="••••••••" /></div>
        <div className={styles.field}><label>新密码</label><input className={styles.input} type="password" placeholder="至少 8 位" /></div>
        <div className={styles.field}><label>确认新密码</label><input className={styles.input} type="password" placeholder="再次输入" /></div>
      </div>
      <button className="btn btn-primary btn-sm">更新密码</button>
    </div>
    <div className={styles.settingSection}>
      <div className={styles.settingTitle}>双重验证 (2FA)</div>
      <div className={styles.settingRow}>
        <span className={styles.settingLabel}>Google Authenticator</span>
        <span className={styles.settingStatus}>未开启</span>
        <button className="btn btn-sm">开启</button>
      </div>
    </div>
  </div>
);

const FavoritesTab: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useAppStore();
  return (
    <div className={styles.tabContent}>
      <div className={styles.tabTitle}>我的收藏</div>
      {favorites.length === 0 ? (
        <div className={styles.emptyHint}>暂无收藏地址。在地址详情页点击"收藏"按钮添加。</div>
      ) : (
        <div className={styles.historyList}>
          {favorites.map((f, i) => (
            <div key={i} className={styles.historyItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="mono" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text)' }}>{f.address}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{f.chain}{f.label ? ` · ${f.label}` : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" onClick={() => navigate(`/address/${f.chain}/${f.address}`)}>查看</button>
                <button className="btn btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => removeFavorite(f.address)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HistoryTab: React.FC = () => {
  const { searchHistory, clearSearchHistory } = useAppStore();
  return (
    <div className={styles.tabContent}>
      <div className={styles.tabTitleRow}>
        <span className={styles.tabTitle}>搜索历史</span>
        {searchHistory.length > 0 && <button className="btn btn-sm" onClick={clearSearchHistory}>清空历史</button>}
      </div>
      {searchHistory.length === 0 ? (
        <div className={styles.emptyHint}>暂无搜索历史</div>
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

const UsageTab: React.FC<{ user: any }> = ({ user }) => {
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
      <div className={styles.tabTitle}>用量统计</div>
      <div className={styles.usageSection}>
        <div className={styles.usageSectionTitle}>今日用量</div>
        <div className={styles.usageBars}>
          <UsageBar label="地址查询" used={todayUsage.queries} total={limits.queries} unit=" 次" />
          <UsageBar label="报告导出" used={todayUsage.exports} total={limits.exports} unit=" 次" />
          <UsageBar label="监控地址" used={todayUsage.monitors} total={limits.monitors} unit=" 个" />
          <UsageBar label="API 调用" used={todayUsage.api} total={limits.api} unit=" 次" />
        </div>
      </div>
      <div className={styles.usageSection}>
        <div className={styles.usageSectionTitle}>本月统计</div>
        <div className={styles.usageStats}>
          {[
            { label: '总查询次数', value: '142', sub: '较上月 +23%' },
            { label: '导出报告', value: '18', sub: '较上月 +5%' },
            { label: '触发预警', value: '7', sub: '较上月 -2' },
            { label: 'API 调用', value: '4,821', sub: '较上月 +12%' },
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
          <span>免费版每日查询仅 10 次。升级获得更多配额。</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.MEMBER)}>查看会员方案</button>
        </div>
      )}
    </div>
  );
};
