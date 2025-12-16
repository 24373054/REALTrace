import csvRaw from "../../data/case5/黑客多币种.csv?raw";
import { ParseResult, GraphNode, GraphLink } from "./types";

interface Case5Transaction {
  "Transaction Hash": string;
  Status: string;
  Type: string;
  Method: string;
  Block: string;
  Age: string;
  From: string;
  From_NameTag: string;
  From_Note: string;
  To: string;
  To_NameTag: string;
  To_Note: string;
  Amount: string;
  "Value (USD)": string;
  Asset: string;
  "Txn Fee": string;
}

// 币种颜色映射
export const ASSET_COLORS: Record<string, string> = {
  'Ethereum(ETH)': '#627eea',      // 以太坊蓝
  'ETH': '#627eea',
  'stETH(stETH)': '#00a3ff',       // Lido 蓝
  'stETH': '#00a3ff',
  'mETH(mETH)': '#6366f1',         // Mantle 紫
  'mETH': '#6366f1',
  'cmETH(cmETH)': '#8b5cf6',       // cmETH 紫
  'cmETH': '#8b5cf6',
  'Tether USD(USDT)': '#26a17b',   // USDT 绿
  'USDT': '#26a17b',
  'WETH': '#ec4899',               // WETH 粉
  'default': '#ef4444',            // 默认红
};

// 获取币种简称
function getAssetShortName(asset: string): string {
  if (!asset) return 'ETH';
  // 提取括号内的简称，如 "Ethereum(ETH)" -> "ETH"
  const match = asset.match(/\(([^)]+)\)/);
  if (match) return match[1];
  // 如果没有括号，返回原始值
  return asset.split('(')[0].trim();
}

// 获取币种颜色
export function getAssetColor(asset: string): string {
  const shortName = getAssetShortName(asset);
  return ASSET_COLORS[asset] || ASSET_COLORS[shortName] || ASSET_COLORS['default'];
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

function parseCsv(csvText: string): Case5Transaction[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  
  const headers = parseCsvLine(lines[0]);
  const data: Case5Transaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    data.push(obj as unknown as Case5Transaction);
  }
  
  return data;
}

export function loadCase5Data(): ParseResult {
  const transactions = parseCsv(csvRaw);
  
  console.log('[Case5] 解析的交易数:', transactions.length);
  
  // 统计所有币种
  const allAssets = new Set<string>();
  
  // 统计每个地址的连接数和交易量
  const nodeStats = new Map<string, { 
    value: number; 
    connectionCount: number; 
    nameTag: string;
    asFrom: number;
    asTo: number;
    assets: Map<string, number>; // 每种币的交易量
  }>();
  
  // 特殊合约地址
  const specialContracts = new Map<string, string>(); // address -> type
  
  // 大型中转地址（特别标记）
  const MAJOR_HUB_ADDRESS = '0x47666fab8bd0ac7003bce3f5c3585383f09486e2';
  
  transactions.forEach(tx => {
    const from = tx.From.toLowerCase();
    const to = tx.To.toLowerCase();
    const amountStr = tx.Amount?.replace(/[,"$\s]/g, '') || '0';
    const amount = parseFloat(amountStr) || 0;
    const asset = tx.Asset || 'Ethereum(ETH)';
    
    allAssets.add(asset);
    
    // 识别特殊合约
    if (tx.To_NameTag) {
      const tag = tx.To_NameTag.toLowerCase();
      if (tag.includes('lido') || tag.includes('steth')) {
        specialContracts.set(to, 'LIDO_STETH');
      } else if (tag.includes('mantle') || tag.includes('meth') || tag.includes('cmeth')) {
        specialContracts.set(to, 'MANTLE');
      } else if (tag.includes('beacon') || tag.includes('depositor')) {
        specialContracts.set(to, 'ETH_STAKING');
      }
    }
    
    // 更新 from 节点
    if (!nodeStats.has(from)) {
      nodeStats.set(from, { 
        value: 0, 
        connectionCount: 0, 
        nameTag: tx.From_NameTag || '',
        asFrom: 0,
        asTo: 0,
        assets: new Map()
      });
    }
    const fromStats = nodeStats.get(from)!;
    fromStats.value += amount;
    fromStats.connectionCount++;
    fromStats.asFrom++;
    fromStats.assets.set(asset, (fromStats.assets.get(asset) || 0) + amount);
    if (!fromStats.nameTag && tx.From_NameTag) {
      fromStats.nameTag = tx.From_NameTag;
    }
    
    // 更新 to 节点
    if (!nodeStats.has(to)) {
      nodeStats.set(to, { 
        value: 0, 
        connectionCount: 0, 
        nameTag: tx.To_NameTag || '',
        asFrom: 0,
        asTo: 0,
        assets: new Map()
      });
    }
    const toStats = nodeStats.get(to)!;
    toStats.value += amount;
    toStats.connectionCount++;
    toStats.asTo++;
    toStats.assets.set(asset, (toStats.assets.get(asset) || 0) + amount);
    if (!toStats.nameTag && tx.To_NameTag) {
      toStats.nameTag = tx.To_NameTag;
    }
  });
  
  console.log('[Case5] 发现的币种:', Array.from(allAssets));
  console.log('[Case5] 特殊合约数:', specialContracts.size);
  
  // 创建节点
  const nodes: GraphNode[] = [];
  const nodeSet = new Set<string>();
  
  // 找到主要攻击者
  const topSenders = Array.from(nodeStats.entries())
    .filter(([_, stats]) => stats.asFrom > 10 && 
      (stats.nameTag.toLowerCase().includes('exploit') || 
       stats.nameTag.toLowerCase().includes('bybit')))
    .sort((a, b) => b[1].asFrom - a[1].asFrom)
    .slice(0, 30)
    .map(([addr, _]) => addr);
  
  console.log('[Case5] 主要攻击者数:', topSenders.length);
  
  nodeStats.forEach((stats, address) => {
    if (nodeSet.has(address)) return;
    nodeSet.add(address);
    
    let group: "attacker" | "victim" | "neutral" | "mixer" = "neutral";
    let isSpecial = false;
    let specialName: string | undefined;
    
    // 检查是否是大型中转地址（最高优先级）
    if (address === MAJOR_HUB_ADDRESS) {
      group = "mixer";
      isSpecial = true;
      specialName = 'MAJOR HUB';
    }
    // 检查是否是特殊合约（Lido、Mantle、质押等）
    else if (specialContracts.has(address)) {
      const contractType = specialContracts.get(address)!;
      group = "mixer";
      isSpecial = true;
      specialName = contractType;
    }
    // 检查是否是 Bybit 攻击者
    else if (stats.nameTag.toLowerCase().includes('exploit') || 
             stats.nameTag.toLowerCase().includes('bybit exploit')) {
      if (topSenders.includes(address)) {
        group = "attacker";
      } else {
        group = "victim";
      }
    }
    // 检查是否是 Bybit 冷钱包（受害者）
    else if (stats.nameTag.toLowerCase().includes('bybit') && 
             stats.nameTag.toLowerCase().includes('cold')) {
      group = "victim";
    }
    // 检查是否是钓鱼/黑客地址
    else if (stats.nameTag.toLowerCase().includes('phish') || 
             stats.nameTag.toLowerCase().includes('hack')) {
      group = "attacker";
    }
    // Beacon Depositor（质押合约）
    else if (stats.nameTag.toLowerCase().includes('beacon') || 
             stats.nameTag.toLowerCase().includes('depositor')) {
      group = "mixer";
      isSpecial = true;
      specialName = 'ETH STAKING';
    }
    
    nodes.push({
      id: address,
      group,
      value: stats.value,
      connectionCount: stats.connectionCount,
      isMixer: isSpecial,
      mixerName: specialName,
    });
  });
  
  // 创建链接（按币种分组）
  const links: GraphLink[] = [];
  const linkMap = new Map<string, GraphLink>();
  
  transactions.forEach(tx => {
    const from = tx.From.toLowerCase();
    const to = tx.To.toLowerCase();
    const amountStr = tx.Amount?.replace(/[,"$\s]/g, '') || '0';
    const amount = parseFloat(amountStr) || 0;
    const asset = tx.Asset || 'Ethereum(ETH)';
    const key = `${from}-${to}-${asset}`;
    
    if (linkMap.has(key)) {
      const link = linkMap.get(key)!;
      link.value += amount;
      link.hashes.push(tx["Transaction Hash"]);
    } else {
      linkMap.set(key, {
        source: from,
        target: to,
        value: amount,
        asset: getAssetShortName(asset),
        hashes: [tx["Transaction Hash"]],
      });
    }
  });
  
  links.push(...linkMap.values());
  
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
  const totalVolume = links.reduce((sum, link) => sum + link.value, 0);
  const highValueTargets = connectedNodes.filter(n => n.group === "attacker" || n.group === "victim").length;
  
  console.log('[Case5] 有连接的节点数:', connectedNodes.length);
  console.log('[Case5] 最终链接数:', links.length);
  console.log('[Case5] 节点分组:', {
    attacker: connectedNodes.filter(n => n.group === 'attacker').length,
    victim: connectedNodes.filter(n => n.group === 'victim').length,
    mixer: connectedNodes.filter(n => n.group === 'mixer').length,
    neutral: connectedNodes.filter(n => n.group === 'neutral').length,
  });
  
  return {
    nodes: connectedNodes,
    links,
    totalVolume,
    highValueTargets,
  };
}
