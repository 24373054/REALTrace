import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useUserStore } from '../../stores/user';
import { useI18n } from '../../hooks/useI18n';
import { ROUTES } from '../../constants/routes';
import styles from './AuthPage.module.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUserStore();
  const { t, locale } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || ROUTES.HOME;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError(locale === 'zh' ? '请填写邮箱和密码' : 'Please enter email and password'); return; }
    setLoading(true);
    setTimeout(() => {
      login({ id: '1', email, username: email.split('@')[0], role: 'pro', createdAt: new Date().toISOString() }, 'mock-token-xxx');
      navigate(from, { replace: true });
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
        <div className={styles.title}>{locale === 'zh' ? '登录账户' : 'Sign In'}</div>
        <div className={styles.demoHint}>
          {locale === 'zh' ? '演示模式：任意邮箱+密码即可登录' : 'Demo: any email + password to login'}
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>{locale === 'zh' ? '邮箱' : 'Email'}</label>
            <input className={styles.input} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{locale === 'zh' ? '密码' : 'Password'}</label>
            <input className={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={`${styles.submitBtn} ${loading ? styles.loading : ''}`} disabled={loading}>
            {loading ? (locale === 'zh' ? '登录中...' : 'Signing in...') : (locale === 'zh' ? '登录' : 'Sign In')}
          </button>
        </form>
        <div className={styles.footer}>
          {locale === 'zh' ? '还没有账户？' : "Don't have an account? "}
          <Link to={ROUTES.REGISTER} className={styles.link}>{locale === 'zh' ? '立即注册' : 'Register'}</Link>
        </div>
      </div>
    </div>
  );
};
