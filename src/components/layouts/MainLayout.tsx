import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <span>© 2026 ChainTrace · 区块链资金追踪平台</span>
        <span className={styles.footerLinks}>
          <a href="#">帮助文档</a>
          <a href="#">API 文档</a>
          <a href="#">隐私政策</a>
        </span>
      </footer>
    </div>
  );
};
