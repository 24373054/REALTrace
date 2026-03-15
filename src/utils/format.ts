import type { RiskLevel } from '../types';

export function shortAddress(addr: string, head = 6, tail = 4): string {
  if (!addr || addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

export function formatAmount(amount: string | number, decimals = 6): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return '0';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(decimals).replace(/\.?0+$/, '');
}

export function formatUSD(amount: string | number): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

export function formatDate(ts: string | number): string {
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts);
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(ts: string | number): string {
  const now = Date.now();
  const t = typeof ts === 'number' ? ts * 1000 : new Date(ts).getTime();
  const diff = Math.floor((now - t) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}

export function getRiskLabel(score: number): { level: RiskLevel; label: string; color: string } {
  if (score <= 20) return { level: 'safe', label: '低风险', color: 'var(--risk-safe)' };
  if (score <= 50) return { level: 'low', label: '中低风险', color: 'var(--risk-low)' };
  if (score <= 80) return { level: 'medium', label: '中高风险', color: 'var(--risk-medium)' };
  return { level: 'critical', label: '高风险', color: 'var(--risk-critical)' };
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
