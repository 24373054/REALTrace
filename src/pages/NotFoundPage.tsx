import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <div className={styles.title}>页面不存在</div>
      <div className={styles.desc}>请求的路径未找到，可能已被移除或地址有误。</div>
      <div className={styles.actions}>
        <button className="btn btn-primary" onClick={() => navigate('/')}>返回首页</button>
        <button className="btn" onClick={() => navigate(-1)}>返回上页</button>
      </div>
    </div>
  );
};
