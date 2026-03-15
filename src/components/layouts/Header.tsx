import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/user';
import { useAppStore } from '../../stores/app';
import { ROUTES } from '../../constants/routes';
import { SUPPORTED_CHAINS } from '../../constants/config';
import styles from './Header.module.css';

const MOCK_ALERTS = [
  { id: 1, msg: '监控地址 0x4766... 发生大额转账', time: '2分钟前', read: false },
  { id: 2, msg: '风险预警: 新增高风险关联地址', time: '1小时前', read: false },
  { id: 3, msg: '报告生成完成: Bybit 黑客分析', time: '3小时前', read: true },
];

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUserStore();
  const { addSearchHistory } = useAppStore();
  const [query, setQuery] = useState('');
  const [chain, setChain] = useState('ETH');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = MOCK_ALERTS.filter(a => !a.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    addSearchHistory(q);
    // 判断是地址还是交易哈希
    if (q.length === 64 || q.length === 66) {
      navigate(`${ROUTES.TRANSACTION}/${q}`);
    } else {
      navigate(`${ROUTES.ADDRESS}/${chain}/${q}`);
    }
    setQuery('');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.logo} onClick={() => navigate(ROUTES.HOME)}>
          <span className={styles.logoMark}>CT</span>
          <span className={styles.logoText}>ChainTrace</span>
        </button>
      </div>

      <form className={styles.searchBar} onSubmit={handleSearch}>
        <select
          className={styles.chainSelect}
          value={chain}
          onChange={e => setChain(e.target.value)}
        >
          {SUPPORTED_CHAINS.map(c => (
            <option key={c.key} value={c.key}>{c.key}</option>
          ))}
        </select>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="输入地址 / 交易哈希 / ENS 域名"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className={styles.searchBtn}>查询</button>
      </form>

      <nav className={styles.nav}>
        <button
          className={`${styles.navItem} ${location.pathname.startsWith('/address') ? styles.active : ''}`}
          onClick={() => navigate(ROUTES.ADDRESS)}
        >地址查询</button>
        <button
          className={`${styles.navItem} ${location.pathname.startsWith('/transaction') ? styles.active : ''}`}
          onClick={() => navigate(ROUTES.TRANSACTION)}
        >交易追踪</button>
        <button
          className={`${styles.navItem} ${location.pathname.startsWith('/analysis') ? styles.active : ''}`}
          onClick={() => navigate(ROUTES.ANALYSIS)}
        >可视化</button>
        <button
          className={`${styles.navItem} ${location.pathname.startsWith('/monitor') ? styles.active : ''}`}
          onClick={() => navigate(ROUTES.MONITOR)}
        >监控预警</button>
        <button
          className={`${styles.navItem} ${location.pathname.startsWith('/trace') ? styles.active : ''}`}
          onClick={() => navigate(ROUTES.TRACE)}
        >链路追踪</button>
      </nav>

      <div className={styles.right}>
        {user && (
          <div className={styles.notifWrap}>
            <button className={styles.notifBtn} onClick={() => setNotifOpen(!notifOpen)}>
              ◉
              {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
            </button>
            {notifOpen && (
              <div className={styles.notifDropdown}>
                <div className={styles.notifHeader}>通知</div>
                {MOCK_ALERTS.map(a => (
                  <div key={a.id} className={`${styles.notifItem} ${!a.read ? styles.notifUnread : ''}`}>
                    <span className={styles.notifMsg}>{a.msg}</span>
                    <span className={styles.notifTime}>{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {user ? (
          <div className={styles.userArea}>
            <button
              className={styles.memberBtn}
              onClick={() => navigate(ROUTES.MEMBER)}
            >
              <span className={styles.memberBadge}>{user.role.toUpperCase()}</span>
            </button>
            <div className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className={styles.avatar}>{user.username[0].toUpperCase()}</span>
                <span className={styles.username}>{user.username}</span>
              </button>
              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <button onClick={() => { navigate(ROUTES.USER); setUserMenuOpen(false); }}>个人中心</button>
                  <button onClick={() => { navigate(ROUTES.USER_SETTINGS); setUserMenuOpen(false); }}>账户设置</button>
                  <button onClick={() => { navigate(ROUTES.REPORT); setUserMenuOpen(false); }}>我的报告</button>
                  <div className={styles.divider} />
                  <button className={styles.logoutBtn} onClick={() => { logout(); navigate(ROUTES.HOME); }}>退出登录</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.authBtns}>
            <button className="btn btn-sm" onClick={() => navigate(ROUTES.LOGIN)}>登录</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.REGISTER)}>注册</button>
          </div>
        )}
      </div>
    </header>
  );
};
