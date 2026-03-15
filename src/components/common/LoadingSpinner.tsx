import React from 'react';
import styles from './LoadingSpinner.module.css';

interface Props {
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<Props> = ({ text = '加载中...', fullPage }) => (
  <div className={`${styles.wrap} ${fullPage ? styles.fullPage : ''}`}>
    <div className={styles.spinner} />
    {text && <span className={styles.text}>{text}</span>}
  </div>
);
