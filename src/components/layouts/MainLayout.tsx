import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useI18n } from '../../hooks/useI18n';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
  useKeyboardShortcuts();
  const { locale, t } = useI18n();
  const [demoDismissed, setDemoDismissed] = useState(false);

  return (
    <div className={styles.layout}>
      <Header />
      {!demoDismissed && (
        <div className={styles.demoBanner}>
          <span className={styles.demoBannerIcon}>◈</span>
          <span className={styles.demoBannerText}>{t.demo.banner}</span>
          <button className={styles.demoBannerClose} onClick={() => setDemoDismissed(true)}>
            {t.demo.dismiss}
          </button>
        </div>
      )}
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <span>© 2026 ChainTrace · {locale === 'zh' ? '区块链资金追踪平台' : 'Blockchain Intelligence Platform'}</span>
        <span className={styles.footerLinks}>
          <a href="/help">{locale === 'zh' ? '帮助文档' : 'Help'}</a>
          <a href="#">API</a>
          <a href="#">{locale === 'zh' ? '隐私政策' : 'Privacy'}</a>
          <a href="#">{locale === 'zh' ? '服务条款' : 'Terms'}</a>
        </span>
      </footer>
    </div>
  );
};
