import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import styles from './HelpPage.module.css';

const SHORTCUTS = [
  { key: 'Ctrl + K',   action_zh: '聚焦搜索框',          action_en: 'Focus search bar' },
  { key: 'Ctrl + 1',   action_zh: '跳转到首页',           action_en: 'Go to Home' },
  { key: 'Ctrl + 2',   action_zh: '跳转到地址查询',       action_en: 'Go to Address' },
  { key: 'Ctrl + 3',   action_zh: '跳转到交易查询',       action_en: 'Go to Transaction' },
  { key: 'Ctrl + 4',   action_zh: '跳转到分析页',         action_en: 'Go to Analysis' },
  { key: 'Ctrl + 5',   action_zh: '跳转到溯源追踪',       action_en: 'Go to Trace' },
  { key: 'Ctrl + 6',   action_zh: '跳转到监控页',         action_en: 'Go to Monitor' },
  { key: 'Ctrl + S',   action_zh: '收藏当前地址',         action_en: 'Favorite current address' },
  { key: 'Ctrl + E',   action_zh: '导出当前报告',         action_en: 'Export current report' },
  { key: 'Ctrl + H',   action_zh: '查看搜索历史',         action_en: 'View search history' },
  { key: '?',          action_zh: '打开帮助页',           action_en: 'Open help page' },
  { key: 'Esc',        action_zh: '关闭弹窗 / 返回',      action_en: 'Close modal / Go back' },
];

const FAQ_ITEMS = [
  {
    category: 'query',
    q_zh: '为什么有些地址查不到信息？',
    q_en: 'Why can\'t I find some addresses?',
    a_zh: '该地址可能没有任何交易记录，或我们的数据源尚未同步到该地址。',
    a_en: 'The address may have no transaction history, or our data source hasn\'t synced it yet.',
  },
  {
    category: 'query',
    q_zh: '风险评分多久更新一次？',
    q_en: 'How often is the risk score updated?',
    a_zh: '每次有新交易时重新计算，系统每天凌晨进行一次全量更新。',
    a_en: 'Recalculated on each new transaction, with a full daily update at midnight.',
  },
  {
    category: 'member',
    q_zh: '会员过期后数据会删除吗？',
    q_en: 'Will my data be deleted after membership expires?',
    a_zh: '不会。收藏、标签、搜索历史等数据永久保留。会员过期后只是无法使用付费功能。',
    a_en: 'No. Favorites, labels, and search history are kept permanently. Only paid features are restricted.',
  },
  {
    category: 'member',
    q_zh: '查询次数什么时候刷新？',
    q_en: 'When do daily query limits reset?',
    a_zh: '每日 00:00 (UTC+8) 刷新，未使用的次数不累积。',
    a_en: 'At 00:00 UTC+8 daily. Unused quota does not carry over.',
  },
  {
    category: 'api',
    q_zh: 'API 调用次数怎么计算？',
    q_en: 'How are API calls counted?',
    a_zh: '每次 API 请求计为 1 次，无论成功或失败。批量请求按实际请求数计算。',
    a_en: 'Each request counts as 1 call, regardless of success or failure. Batch requests count individually.',
  },
  {
    category: 'security',
    q_zh: '平台如何保护我的数据安全？',
    q_en: 'How does the platform protect my data?',
    a_zh: '所有传输使用 HTTPS 加密，支付信息不存储在平台，账户支持 2FA 双重验证。',
    a_en: 'All traffic is HTTPS encrypted. Payment info is never stored. Accounts support 2FA.',
  },
];

export const HelpPage: React.FC = () => {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'query', 'member', 'api', 'security'];
  const CATEGORY_LABELS: Record<string, string> = {
    all: locale === 'zh' ? '全部' : 'All',
    query: t.help.categories.query,
    member: t.help.categories.member,
    api: t.help.categories.api,
    security: t.help.categories.security,
  };

  const filtered = FAQ_ITEMS.filter(item => {
    const q = locale === 'zh' ? item.q_zh : item.q_en;
    const a = locale === 'zh' ? item.a_zh : item.a_en;
    const matchSearch = !search || q.toLowerCase().includes(search.toLowerCase()) || a.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{t.help.title}</div>
      </div>

      <input
        className={styles.searchInput}
        placeholder={t.help.search}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t.help.shortcuts}</div>
        <div className={styles.shortcutGrid}>
          {SHORTCUTS.map(s => (
            <div key={s.key} className={styles.shortcutRow}>
              <kbd className={styles.kbd}>{s.key}</kbd>
              <span className={styles.shortcutAction}>{locale === 'zh' ? s.action_zh : s.action_en}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t.help.faq}</div>
        <div className={styles.categoryRow}>
          {categories.map(c => (
            <button
              key={c}
              className={`${styles.catBtn} ${activeCategory === c ? styles.catActive : ''}`}
              onClick={() => setActiveCategory(c)}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <div className={styles.faqList}>
          {filtered.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <button
                className={styles.faqQuestion}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span>{locale === 'zh' ? item.q_zh : item.q_en}</span>
                <span className={styles.faqToggle}>{openIdx === i ? '−' : '+'}</span>
              </button>
              {openIdx === i && (
                <div className={styles.faqAnswer}>{locale === 'zh' ? item.a_zh : item.a_en}</div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className={styles.noResults}>{locale === 'zh' ? '未找到相关问题' : 'No results found'}</div>
          )}
        </div>
      </div>

      <div className={styles.contactSection}>
        <div className={styles.sectionTitle}>{t.help.contact}</div>
        <a href={`mailto:${t.help.contactEmail}`} className={styles.contactEmail}>
          {t.help.contactEmail}
        </a>
      </div>
    </div>
  );
};
