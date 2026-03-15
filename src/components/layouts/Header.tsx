import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/user';
import { useAppStore, type Theme } from '../../stores/app';
import { useI18n } from '../../hooks/useI18n';
import { ROUTES } from '../../constants/routes';
import { SUPPORTED_CHAINS } from '../../constants/config';
import type { Locale } from '../../i18n';
import styles from './Header.module.css';

const MOCK_ALERTS = [
  { id: 1, msg_zh: '监控地址 0x4766... 发生大额转账', msg_en: 'Monitored address 0x4766... large transfer', time: '2m ago', read: false },
  { id: 2, msg_zh: '风险预警: 新增高风险关联地址', msg_en: 'Risk alert: new high-risk linked address', time: '1h ago', read: false },
  { id: 3, msg_zh: '报告生成完成: Bybit 黑客分析', msg_en: 'Report ready: Bybit Hacker Analysis', time: '3h ago', read: true },
];

const THEME_ICONS: Record<Theme, string> = { dark: '◑', light: '○', 'high-contrast': '●' };
const LOCALE_LABELS: Record<Locale, string> = { zh: '中文', en: 'EN' };

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUserStore();
  const { addSearchHistory, locale, setLocale, theme, setTheme } = useAppStore();
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [chain, setChain] = useState('ETH');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const unreadCount = MOCK_ALERTS.filter(a => !a.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    addSearchHistory(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuery('');
  };

  const closeAll = () => { setUserMenuOpen(false); setNotifOpen(false); setSettingsOpen(false); };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.logo} onClick={() => navigate(ROUTES.HOME)}>
          <span className={styles.logoMark}>CT</span>
          <span className={styles.logoText}>ChainTrace</span>
        </button>
      </div>

      <form className={styles.searchBar} onSubmit={handleSearch}>
        <select className={styles.chainSelect} value={chain} onChange={e => setChain(e.target.value)}>
          {SUPPORTED_CHAINS.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
        </select>
        <input
          className={styles.searchInput}
          type="text"
          placeholder={t.common.searchPlaceholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className={styles.searchBtn}>{t.common.search}</button>
      </form>

      <nav className={styles.nav}>
        {[
          [t.nav.address, ROUTES.ADDRESS, '/address'],
          [t.nav.transaction, ROUTES.TRANSACTION, '/transaction'],
          [t.nav.analysis, ROUTES.ANALYSIS, '/analysis'],
          [t.nav.monitor, ROUTES.MONITOR, '/monitor'],
          [t.nav.trace, ROUTES.TRACE, '/trace'],
        ].map(([label, path, prefix]) => (
          <button
            key={path}
            className={`${styles.navItem} ${location.pathname.startsWith(prefix) ? styles.active : ''}`}
            onClick={() => navigate(path)}
          >{label}</button>
        ))}
      </nav>

      <div className={styles.right}>
        {/* Settings: language + theme */}
        <div className={styles.settingsWrap}>
          <button className={styles.iconBtn} onClick={() => { closeAll(); setSettingsOpen(!settingsOpen); }} title={t.settings.language}>
            ⚙
          </button>
          {settingsOpen && (
            <div className={styles.settingsDropdown}>
              <div className={styles.settingsSection}>
                <div className={styles.settingsSectionTitle}>{t.settings.language}</div>
                <div className={styles.settingsRow}>
                  {(['zh', 'en'] as Locale[]).map(l => (
                    <button
                      key={l}
                      className={`${styles.settingsBtn} ${locale === l ? styles.settingsBtnActive : ''}`}
                      onClick={() => setLocale(l)}
                    >{LOCALE_LABELS[l]}</button>
                  ))}
                </div>
              </div>
              <div className={styles.settingsSection}>
                <div className={styles.settingsSectionTitle}>{t.settings.theme}</div>
                <div className={styles.settingsRow}>
                  {(['dark', 'light', 'high-contrast'] as Theme[]).map(th => (
                    <button
                      key={th}
                      className={`${styles.settingsBtn} ${theme === th ? styles.settingsBtnActive : ''}`}
                      onClick={() => setTheme(th)}
                      title={t.settings[th === 'dark' ? 'dark' : th === 'light' ? 'light' : 'highContrast']}
                    >{THEME_ICONS[th]} {th === 'dark' ? t.settings.dark : th === 'light' ? t.settings.light : t.settings.highContrast}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        {user && (
          <div className={styles.notifWrap}>
            <button className={styles.iconBtn} onClick={() => { closeAll(); setNotifOpen(!notifOpen); }}>
              ◉
              {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
            </button>
            {notifOpen && (
              <div className={styles.notifDropdown}>
                <div className={styles.notifHeader}>{t.nav.notifications}</div>
                {MOCK_ALERTS.map(a => (
                  <div key={a.id} className={`${styles.notifItem} ${!a.read ? styles.notifUnread : ''}`}>
                    <span className={styles.notifMsg}>{locale === 'zh' ? a.msg_zh : a.msg_en}</span>
                    <span className={styles.notifTime}>{a.time}</span>
                  </div>
                ))}
                <button className={styles.notifViewAll} onClick={() => { navigate('/notifications'); closeAll(); }}>
                  {t.common.viewAll} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* User area */}
        {user ? (
          <div className={styles.userArea}>
            <button className={styles.memberBtn} onClick={() => navigate(ROUTES.MEMBER)}>
              <span className={styles.memberBadge}>{user.role.toUpperCase()}</span>
            </button>
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => { closeAll(); setUserMenuOpen(!userMenuOpen); }}>
                <span className={styles.avatar}>{user.username[0].toUpperCase()}</span>
                <span className={styles.username}>{user.username}</span>
              </button>
              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <button onClick={() => { navigate(ROUTES.USER); closeAll(); }}>{t.nav.profile}</button>
                  <button onClick={() => { navigate(ROUTES.USER_SETTINGS); closeAll(); }}>{t.nav.settings}</button>
                  <button onClick={() => { navigate(ROUTES.REPORT); closeAll(); }}>{t.nav.myReports}</button>
                  <button onClick={() => { navigate('/api-docs'); closeAll(); }}>{locale === 'zh' ? 'API 文档' : 'API Docs'}</button>
                  <div className={styles.divider} />
                  <button className={styles.logoutBtn} onClick={() => { logout(); navigate(ROUTES.HOME); }}>{t.nav.logout}</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.authBtns}>
            <button className="btn btn-sm" onClick={() => navigate(ROUTES.LOGIN)}>{t.nav.login}</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.REGISTER)}>{t.nav.register}</button>
          </div>
        )}
      </div>
    </header>
  );
};
