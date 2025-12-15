import transactionsCsv from "../../data/case6/transactions.csv?raw";
import heuristicsCsv from "../../data/case6/heuristic_scores.csv?raw";
import { ParseResult, GraphNode, GraphLink } from "./types";

interface Case6Transaction {
  tx_hash: string;
  from_address: string;
  to_address: string;
  timestamp: string;
  block_height: string;
  ring_size: string;
  amount_hidden: string;
  confidence_score: string;
  heuristic_method: string;
  is_suspected: string;
  attributes: string;
  chain: string;
}

interface HeuristicScore {
  tx_hash: string;
  temporal_newest_score: string;
  temporal_age_dist_score: string;
  chain_reaction_score: string;
  cross_chain_score: string;
  external_intel_score: string;
  combined_score: string;
  primary_method: string;
}

// Monero 追踪方法颜色映射
export const HEURISTIC_COLORS: Record<string, string> = {
  'temporal_newest': '#3b82f6',      // 蓝色 - 最新输入启发式
  'temporal_age_dist': '#8b5cf6',    // 紫色 - 年龄分布分析
  'chain_reaction': '#ec4899',       // 粉色 - 链式推断
  'cross_chain': '#f59e0b',          // 橙色 - 跨链追踪
  'external_intel': '#10b981',       // 绿色 - 外部情报
  'default': '#6b7280',              // 灰色 - 默认
};

// 获取启发式方法颜色
export function getHeuristicColor(method: string): string {
  return HEURISTIC_COLORS[method] || HEURISTIC_COLORS['default'];
}

// 获取置信度等级
function getConfidenceLevel(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

function parseCsv<T>(csvText: string): T[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  
  const headers = parseCsvLine(lines[0]);
  const data: T[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    data.push(obj as unknown as T);
  }
  
  return data;
}

export function loadCase6Data(): ParseResult {
  const transactions = parseCsv<Case6Transaction>(transactionsCsv);
  const heuristics = parseCsv<HeuristicScore>(heuristicsCsv);
  
  console.log('[Case6] 解析的交易数:', transactions.length);
  console.log('[Case6] 启发式评分数:', heuristics.length);
  
  // 创建启发式评分映射
  const heuristicMap = new Map<string, HeuristicScore>();
  heuristics.forEach(h => {
    heuristicMap.set(h.tx_hash, h);
  });
  
  // 统计每个地址的连接数和置信度
  const nodeStats = new Map<string, { 
    connectionCount: number; 
    avgConfidence: number;
    totalConfidence: number;
    txCount: number;
    asFrom: number;
    asTo: number;
    methods: Set<string>;
    isKnownEntity: boolean;
    entityName?: string;
  }>();
  
  // 已知实体地址
  const knownEntities = new Map<string, string>();
  
  transactions.forEach(tx => {
    const from = tx.from_address;
    const to = tx.to_address;
    const confidence = parseFloat(tx.confidence_score) || 0;
    const method = tx.heuristic_method;
    
    // 解析属性以识别已知实体
    try {
      const attrs = JSON.parse(tx.attributes.replace(/'/g, '"'));
      if (attrs.known_entity) {
        knownEntities.set(to, attrs.known_entity);
      }
      if (attrs.confirmed_entity) {
        knownEntities.set(to, attrs.confirmed_entity);
      }
    } catch (e) {
      // 忽略解析错误
    }
    
    // 更新 from 节点
    if (!nodeStats.has(from)) {
      nodeStats.set(from, { 
        connectionCount: 0, 
        avgConfidence: 0,
        totalConfidence: 0,
        txCount: 0,
        asFrom: 0,
        asTo: 0,
        methods: new Set(),
        isKnownEntity: false,
      });
    }
    const fromStats = nodeStats.get(from)!;
    fromStats.connectionCount++;
    fromStats.totalConfidence += confidence;
    fromStats.txCount++;
    fromStats.asFrom++;
    fromStats.methods.add(method);
    if (knownEntities.has(from)) {
      fromStats.isKnownEntity = true;
      fromStats.entityName = knownEntities.get(from);
    }
    
    // 更新 to 节点
    if (!nodeStats.has(to)) {
      nodeStats.set(to, { 
        connectionCount: 0, 
        avgConfidence: 0,
        totalConfidence: 0,
        txCount: 0,
        asFrom: 0,
        asTo: 0,
        methods: new Set(),
        isKnownEntity: false,
      });
    }
    const toStats = nodeStats.get(to)!;
    toStats.connectionCount++;
    toStats.totalConfidence += confidence;
    toStats.txCount++;
    toStats.asTo++;
    toStats.methods.add(method);
    if (knownEntities.has(to)) {
      toStats.isKnownEntity = true;
      toStats.entityName = knownEntities.get(to);
    }
  });
  
  // 计算平均置信度
  nodeStats.forEach((stats) => {
    stats.avgConfidence = stats.txCount > 0 ? stats.totalConfidence / stats.txCount : 0;
  });
  
  console.log('[Case6] 已知实体数:', knownEntities.size);
  console.log('[Case6] 已知实体:', Array.from(knownEntities.entries()));
  
  // 创建节点
  const nodes: GraphNode[] = [];
  const nodeSet = new Set<string>();
  
  // 识别主要可疑地址（高置信度 + 多次交易）
  const suspiciousAddresses = Array.from(nodeStats.entries())
    .filter(([_, stats]) => stats.avgConfidence >= 70 && stats.txCount >= 2)
    .map(([addr, _]) => addr);
  
  console.log('[Case6] 主要可疑地址数:', suspiciousAddresses.length);
  
  nodeStats.forEach((stats, address) => {
    if (nodeSet.has(address)) return;
    nodeSet.add(address);
    
    let group: "attacker" | "victim" | "neutral" | "mixer" = "neutral";
    let isMixer = false;
    let mixerName: string | undefined;
    
    // 检查是否是已知实体
    if (stats.isKnownEntity && stats.entityName) {
      const entityName = stats.entityName.toLowerCase();
      if (entityName.includes('exchange')) {
        group = "victim"; // 交易所作为受害者或终点
        isMixer = true;
        mixerName = stats.entityName;
      } else if (entityName.includes('mixer') || entityName.includes('mixing')) {
        group = "mixer";
        isMixer = true;
        mixerName = stats.entityName;
      } else if (entityName.includes('darknet') || entityName.includes('market')) {
        group = "attacker";
      }
    }
    // 检查是否是高置信度可疑地址
    else if (suspiciousAddresses.includes(address) && stats.avgConfidence >= 80) {
      group = "attacker";
    }
    // 检查是否是混币相关
    else if (stats.methods.has('chain_reaction') || stats.methods.has('cross_chain')) {
      if (stats.avgConfidence >= 70) {
        group = "attacker";
      }
    }
    
    nodes.push({
      id: address,
      group,
      value: stats.avgConfidence, // 使用平均置信度作为节点大小
      connectionCount: stats.connectionCount,
      isMixer,
      mixerName,
    });
  });
  
  // 创建链接
  const links: GraphLink[] = [];
  
  transactions.forEach(tx => {
    const from = tx.from_address;
    const to = tx.to_address;
    const confidence = parseFloat(tx.confidence_score) || 0;
    const method = tx.heuristic_method;
    
    links.push({
      source: from,
      target: to,
      value: confidence, // 使用置信度作为链接权重
      asset: method, // 使用启发式方法作为"资产"类型
      hashes: [tx.tx_hash],
    });
  });
  
  // 只保留有连接的节点
  const connectedNodeIds = new Set<string>();
  links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    connectedNodeIds.add(sourceId);
    connectedNodeIds.add(targetId);
  });
  
  const connectedNodes = nodes.filter(n => connectedNodeIds.has(n.id));
  
  // 计算统计信息
  const avgConfidence = links.reduce((sum, link) => sum + link.value, 0) / links.length;
  const highConfidenceLinks = links.filter(l => l.value >= 70).length;
  
  console.log('[Case6] 有连接的节点数:', connectedNodes.length);
  console.log('[Case6] 最终链接数:', links.length);
  console.log('[Case6] 平均置信度:', avgConfidence.toFixed(2));
  console.log('[Case6] 高置信度链接数:', highConfidenceLinks);
  console.log('[Case6] 节点分组:', {
    attacker: connectedNodes.filter(n => n.group === 'attacker').length,
    victim: connectedNodes.filter(n => n.group === 'victim').length,
    mixer: connectedNodes.filter(n => n.group === 'mixer').length,
    neutral: connectedNodes.filter(n => n.group === 'neutral').length,
  });
  
  return {
    nodes: connectedNodes,
    links,
    totalVolume: avgConfidence,
    highValueTargets: highConfidenceLinks,
  };
}
