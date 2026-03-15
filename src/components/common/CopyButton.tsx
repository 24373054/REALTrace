import React, { useState } from 'react';
import { copyToClipboard } from '../../utils/format';
import styles from './CopyButton.module.css';

interface Props {
  text: string;
  children?: React.ReactNode;
}

export const CopyButton: React.FC<Props> = ({ text, children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button className={`${styles.btn} ${copied ? styles.copied : ''}`} onClick={handleCopy} title="复制">
      {copied ? '✓' : (children || '⎘')}
    </button>
  );
};
