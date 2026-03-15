// 用户相关
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: 'free' | 'basic' | 'pro' | 'enterprise';
  memberExpiry?: string;
  createdAt: string;
}

// 地址相关
export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export interface RiskFactor {
  name: string;
  score: number;
  description: string;
}

export interface AddressInfo {
  address: string;
  chain: string;
  label?: string;
  balance: string;
  balanceUSD: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  tags: string[];
  txCount: number;
  totalReceived: string;
  totalSent: string;
  firstSeen: string;
  lastSeen: string;
}

export interface Transaction {
  hash: string;
  chain: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  amount: string;
  amountUSD: string;
  fee: string;
  status: 'confirmed' | 'pending' | 'failed';
  riskScore?: number;
}

// 图谱节点/边
export interface GraphNode {
  id: string;
  label: string;
  address: string;
  riskScore: number;
  riskLevel: RiskLevel;
  balance?: string;
  tags?: string[];
  isCenter?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: string;
  amountUSD?: string;
  txCount: number;
  timestamp?: string;
}

// 监控
export interface Monitor {
  id: string;
  address: string;
  chain: string;
  label?: string;
  monitorType: 'balance' | 'transaction' | 'risk';
  status: 'active' | 'paused';
  alertCount: number;
  createdAt: string;
  lastAlert?: string;
}

// 报告
export interface Report {
  id: string;
  title: string;
  type: 'address' | 'transaction' | 'flow';
  target: string;
  chain: string;
  status: 'generating' | 'ready' | 'failed';
  createdAt: string;
  size?: string;
}

// API 响应
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
