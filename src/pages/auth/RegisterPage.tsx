import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../../stores/user';
import { ROUTES } from '../../constants/routes';
import styles from './AuthPage.module.css';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password) { setError('请填写所有必填项'); return; }
    if (form.password !== form.confirm) { setError('两次密码不一致'); return; }
    if (form.password.length < 8) { setError('密码至少 8 位'); return; }
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
        <div className={styles.title}>创建账户</div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>用户名</label>
            <input className={styles.input} placeholder="用户名" value={form.username} onChange={set('username')} autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>邮箱</label>
            <input className={styles.input} type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>密码</label>
            <input className={styles.input} type="password" placeholder="至少 8 位" value={form.password} onChange={set('password')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>确认密码</label>
            <input className={styles.input} type="password" placeholder="再次输入密码" value={form.confirm} onChange={set('confirm')} />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={`${styles.submitBtn} ${loading ? styles.loading : ''}`} disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <div className={styles.footer}>
          已有账户？<Link to={ROUTES.LOGIN} className={styles.link}>立即登录</Link>
        </div>
      </div>
    </div>
  );
};
