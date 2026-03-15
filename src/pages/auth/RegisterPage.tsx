import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../../stores/user';
import { useI18n } from '../../hooks/useI18n';
import { ROUTES } from '../../constants/routes';
import styles from './AuthPage.module.css';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const { t } = useI18n();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password) {
      setError(t.nav.register + ' - ' + t.common.confirm);
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login({ id: '1', email: form.email, username: form.username, role: 'free', createdAt: new Date().toISOString() }, 'mock-token-xxx');
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
        <div className={styles.title}>{t.nav.register}</div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>{t.user.username}</label>
            <input className={styles.input} placeholder={t.user.username} value={form.username} onChange={set('username')} autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t.user.email}</label>
            <input className={styles.input} type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t.user.newPassword}</label>
            <input className={styles.input} type="password" placeholder="Min 8 chars" value={form.password} onChange={set('password')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t.user.confirmPassword}</label>
            <input className={styles.input} type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={`${styles.submitBtn} ${loading ? styles.loading : ''}`} disabled={loading}>
            {loading ? t.common.loading : t.nav.register}
          </button>
        </form>
        <div className={styles.footer}>
          Already have an account? <Link to={ROUTES.LOGIN} className={styles.link}>{t.nav.login}</Link>
        </div>
      </div>
    </div>
  );
};
