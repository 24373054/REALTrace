import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../../stores/user';
import { useI18n } from '../../hooks/useI18n';
import { ROUTES } from '../../constants/routes';
import styles from './AuthPage.module.css';

type Step = 'form' | 'verify' | 'done';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const { locale } = useI18n();
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const zh = locale === 'zh';
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password) {
      setError(zh ? '请填写所有必填项' : 'Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirm) {
      setError(zh ? '两次密码不一致' : 'Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError(zh ? '密码至少8位' : 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('verify'); startCooldown(); }, 800);
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code.length !== 6) {
      setError(zh ? '请输入6位验证码' : 'Enter the 6-digit code');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // Demo: any 6-digit code works
      login({ id: '1', email: form.email, username: form.username, role: 'free', createdAt: new Date().toISOString() }, 'mock-token-xxx');
      setLoading(false);
      setStep('done');
      setTimeout(() => navigate(ROUTES.HOME), 1800);
    }, 900);
  };

  if (step === 'done') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>CT</span>
            <span className={styles.logoText}>ChainTrace</span>
          </div>
          <div className={styles.successIcon}>✓</div>
          <div className={styles.title}>{zh ? '注册成功' : 'Registration Complete'}</div>
          <div className={styles.successDesc}>{zh ? '正在跳转...' : 'Redirecting...'}</div>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>CT</span>
            <span className={styles.logoText}>ChainTrace</span>
          </div>
          <div className={styles.title}>{zh ? '邮箱验证' : 'Email Verification'}</div>
          <div className={styles.verifyHint}>
            {zh ? `验证码已发送至 ${form.email}` : `Code sent to ${form.email}`}
          </div>
          <div className={styles.demoHint}>{zh ? '演示模式：输入任意6位数字' : 'Demo: enter any 6 digits'}</div>
          <form className={styles.form} onSubmit={handleVerify}>
            <div className={styles.field}>
              <label className={styles.label}>{zh ? '验证码' : 'Verification Code'}</label>
              <input
                className={`${styles.input} ${styles.codeInput}`}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
              />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <button type="submit" className={`${styles.submitBtn} ${loading ? styles.loading : ''}`} disabled={loading}>
              {loading ? (zh ? '验证中...' : 'Verifying...') : (zh ? '验证并注册' : 'Verify & Register')}
            </button>
          </form>
          <div className={styles.resendRow}>
            {resendCooldown > 0 ? (
              <span className={styles.cooldown}>{zh ? `重新发送 (${resendCooldown}s)` : `Resend in ${resendCooldown}s`}</span>
            ) : (
              <button className={styles.resendBtn} onClick={() => { startCooldown(); }}>
                {zh ? '重新发送验证码' : 'Resend Code'}
              </button>
            )}
          </div>
          <div className={styles.footer}>
            <button className={styles.backLink} onClick={() => setStep('form')}>
              ← {zh ? '返回修改' : 'Back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>CT</span>
          <span className={styles.logoText}>ChainTrace</span>
        </div>
        <div className={styles.stepIndicator}>
          <div className={`${styles.stepDot} ${styles.stepActive}`}>1</div>
          <div className={styles.stepLine} />
          <div className={styles.stepDot}>2</div>
        </div>
        <div className={styles.title}>{zh ? '创建账户' : 'Create Account'}</div>
        <form className={styles.form} onSubmit={handleFormSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>{zh ? '用户名' : 'Username'}</label>
            <input className={styles.input} placeholder={zh ? '4-20位字母数字' : '4-20 alphanumeric'} value={form.username} onChange={set('username')} autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{zh ? '邮箱' : 'Email'}</label>
            <input className={styles.input} type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{zh ? '密码' : 'Password'}</label>
            <input className={styles.input} type="password" placeholder={zh ? '至少8位' : 'Min 8 chars'} value={form.password} onChange={set('password')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{zh ? '确认密码' : 'Confirm Password'}</label>
            <input className={styles.input} type="password" placeholder={zh ? '再次输入密码' : 'Repeat password'} value={form.confirm} onChange={set('confirm')} />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={`${styles.submitBtn} ${loading ? styles.loading : ''}`} disabled={loading}>
            {loading ? (zh ? '处理中...' : 'Processing...') : (zh ? '下一步' : 'Next Step')}
          </button>
        </form>
        <div className={styles.footer}>
          {zh ? '已有账户？' : 'Already have an account? '}
          <Link to={ROUTES.LOGIN} className={styles.link}>{zh ? '立即登录' : 'Sign In'}</Link>
        </div>
      </div>
    </div>
  );
};
