import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../../stores/user';
import { ROUTES } from '../../constants/routes';
import styles from './AuthPage.module.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('请填写邮箱和密码'); return; }
    setLoading(true);
    // Mock login
    setTimeout(() => {
      login({
        id: '1', email, username: email.split('@')[0],
        role: 'pro', createdAt: new Date().toISOString(),
      }, 'mock-token-xxx');
      navigate(ROUTES.HOME);
      setLoading(false);
    }, 800);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>CT</span>
          <span className={styles.logoText}>ChainTrace</span>
        </div>
        <div className={styles.title}>登录账户</div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>邮箱</label>
            <input className={styles.input} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>密码</label>
            <input className={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={`${styles.submitBtn} ${loading ? styles.loading : ''}`} disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <div className={styles.footer}>
          还没有账户？<Link to={ROUTES.REGISTER} className={styles.link}>立即注册</Link>
        </div>
      </div>
    </div>
  );
};
