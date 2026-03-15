import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useI18n } from '../../hooks/useI18n';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
  useKeyboardShortcuts();
  const { locale } = useI18n();

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <span>© 2026 ChainTrace · {locale === 'zh' ? '区块链资金追踪平台' : 'Blockchain Intelligence Platform'}</span>
        <span className={styles.footerLinks}>
          <a href="#">{locale === 'zh' ? '帮助文档' : 'Docs'}</a>
          <a href="#">API</a>
          <a href="#">{locale === 'zh' ? '隐私政策' : 'Privacy'}</a>
        </span>
      </footer>
    </div>
  );
};
