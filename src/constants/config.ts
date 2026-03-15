export const APP_NAME = 'ChainTrace';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const SUPPORTED_CHAINS = [
  { key: 'BTC', name: 'Bitcoin', symbol: 'BTC' },
  { key: 'ETH', name: 'Ethereum', symbol: 'ETH' },
  { key: 'TRX', name: 'Tron', symbol: 'TRX' },
  { key: 'BSC', name: 'BNB Chain', symbol: 'BNB' },
  { key: 'SOL', name: 'Solana', symbol: 'SOL' },
  { key: 'POLYGON', name: 'Polygon', symbol: 'MATIC' },
] as const;

export const RISK_LEVELS = {
  SAFE: { min: 0, max: 20, label: '低风险', color: 'var(--risk-safe)' },
  LOW: { min: 21, max: 50, label: '中低风险', color: 'var(--risk-low)' },
  MEDIUM: { min: 51, max: 80, label: '中高风险', color: 'var(--risk-medium)' },
  HIGH: { min: 81, max: 100, label: '高风险', color: 'var(--risk-critical)' },
} as const;

export const MEMBER_TIERS = [
  { key: 'free', name: '免费版', price: 0, queries: 10, exports: 1, monitors: 1 },
  { key: 'basic', name: '基础版', price: 29, queries: 100, exports: 10, monitors: 10 },
  { key: 'pro', name: '专业版', price: 99, queries: 1000, exports: 100, monitors: 50 },
  { key: 'enterprise', name: '企业版', price: -1, queries: -1, exports: -1, monitors: -1 },
] as const;
