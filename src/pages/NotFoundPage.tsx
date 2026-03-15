import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import styles from './NotFoundPage.module.css';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <div className={styles.title}>{t.errors.notFound}</div>
      <div className={styles.desc}>{t.errors.notFoundDesc}</div>
      <div className={styles.actions}>
        <button className="btn btn-primary" onClick={() => navigate('/')}>{t.errors.goHome}</button>
        <button className="btn" onClick={() => navigate(-1)}>{t.errors.goBack}</button>
      </div>
    </div>
  );
};
