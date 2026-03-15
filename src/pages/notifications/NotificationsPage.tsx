import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { timeAgo } from '../../utils/format';
import styles from './NotificationsPage.module.css';

type NotifType = 'system' | 'risk' | 'activity';
type FilterTab = 'all' | 'unread' | NotifType;

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFS: Notification[] = [
  { id: '1', type: 'risk',     title: 'High Risk Alert',          body: '0xd90e2f...4F31b exceeded risk threshold 80. Current score: 95.',  time: '2026-03-15T14:22:00Z', read: false },
  { id: '2', type: 'risk',     title: 'Mixer Interaction Detected', body: 'Address 0xA090...0057e interacted with Tornado Cash (14 txs).',   time: '2026-03-15T11:05:00Z', read: false },
  { id: '3', type: 'system',   title: 'Platform Maintenance',      body: 'Scheduled maintenance on 2026-03-20 02:00–04:00 UTC+8.',           time: '2026-03-14T09:00:00Z', read: false },
  { id: '4', type: 'activity', title: 'Report Ready',              body: 'Your address analysis report for 0x47...3a is ready to download.', time: '2026-03-13T16:44:00Z', read: true },
  { id: '5', type: 'system',   title: 'New Feature: Heatmap',      body: 'Activity heatmap visualization is now available in Analysis.',     time: '2026-03-12T10:00:00Z', read: true },
  { id: '6', type: 'activity', title: 'Monitor Added',             body: 'Address 0x3fC9...7FAD has been added to your monitor list.',       time: '2026-03-11T08:30:00Z', read: true },
  { id: '7', type: 'risk',     title: 'Balance Change Alert',      body: 'Monitored address received 50 ETH. New balance: 1297.83 ETH.',     time: '2026-03-10T22:15:00Z', read: true },
];

const TYPE_COLORS: Record<NotifType, string> = {
  risk: 'var(--risk-critical)',
  system: 'var(--color-accent)',
  activity: 'var(--color-text-muted)',
};

const TYPE_ICONS: Record<NotifType, string> = {
  risk: '⚠',
  system: '◈',
  activity: '◉',
};

export const NotificationsPage: React.FC = () => {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markRead = (id: string) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  const filtered = notifs.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifs.filter(n => !n.read).length;

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all',      label: t.notifications.all },
    { key: 'unread',   label: `${t.notifications.unread}${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { key: 'risk',     label: t.notifications.risk },
    { key: 'system',   label: t.notifications.system },
    { key: 'activity', label: t.notifications.activity },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{t.notifications.title}</div>
        {unreadCount > 0 && (
          <button className="btn btn-sm" onClick={markAllRead}>{t.notifications.markAllRead}</button>
        )}
      </div>

      <div className={styles.filterRow}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            className={`${styles.filterBtn} ${filter === tab.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>◈</div>
            <div>{t.notifications.noNotifications}</div>
            <div className={styles.emptyDesc}>{t.notifications.noNotificationsDesc}</div>
          </div>
        ) : (
          filtered.map(n => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.read ? styles.unread : ''}`}
              onClick={() => markRead(n.id)}
            >
              <div className={styles.itemIcon} style={{ color: TYPE_COLORS[n.type] }}>
                {TYPE_ICONS[n.type]}
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{n.title}</span>
                  <span className={styles.itemType} style={{ color: TYPE_COLORS[n.type] }}>
                    {t.notifications.types[n.type]}
                  </span>
                </div>
                <div className={styles.itemBody}>{n.body}</div>
                <div className={styles.itemTime}>{timeAgo(n.time, locale)}</div>
              </div>
              {!n.read && <div className={styles.unreadDot} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
