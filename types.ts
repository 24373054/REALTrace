import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export enum AddressType {
  ROOT = 'ROOT',
  NORMAL = 'NORMAL',
  PHISHING = 'PHISHING',
  CEX = 'CEX', // Centralized Exchange
  MIXER = 'MIXER'
}

export enum ChainType {
  SOLANA = 'SOLANA',
  ETHEREUM = 'ETHEREUM',
}

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: AddressType;
  balance: number;
  currency: string;
  riskScore: number; // 0-100, 100 is high risk
  tags: string[];
  // 来源于哪家威胁情报/黑名单，便于展示
  intelSources?: string[];
  // D3 Simulation properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number; // Amount transferred
  txHash: string;
  timestamp: string;
  token: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface AnalysisReport {
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  keyEntities: string[];
}