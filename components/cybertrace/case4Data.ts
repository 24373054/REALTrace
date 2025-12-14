import csvRaw from "../../data/case4/黑客多币种.csv?raw";
import { ParseResult, GraphNode, GraphLink } from "./types";

interface Case4Transaction {
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

function parseCsvLine(line: string): string[] {
  return line.split(',').map(field => field.trim());
}

function parseCsv(csvText: string): Case4Transaction[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  
  const headers = parseCsvLine(lines[0]);
  const data: Case4Transaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCsvLine(line);
    const obj: any = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    data.push(obj as Case4Transaction);
  }
  
  return data;
}

export function loadCase4Data(): ParseResult {
  const transactions = parseCsv(csvRaw);
  
  console.log('[Case4] 解析的交易数:', transactions.length);
  console.log('[Case4] 前3条交易:', transactions.slice(0, 3));
  
  // 统计每个地址的连接数和交易量
  const nodeStats = new Map<string, { 
    value: number; 
    connectionCount: number; 
    nameTag: string;
    asFrom: number;
    asTo: number;
  }>();
  
  // 统计所有币种
  const allAssets = new Set<string>();
  
  // Beacon Depositor 地址（以太坊质押合约）
  const beaconDepositorAddresses = new Set<string>();
  
  transactions.forEach(tx => {
    const from = tx.From.toLowerCase();
    const to = tx.To.toLowerCase();
    const amount = parseFloat(tx.Amount) || 0;
    const asset = tx.Asset || 'ETH';
    
    allAssets.add(asset);
    
    // 记录 Beacon Depositor 地址
    if (tx.To_NameTag && tx.To_NameTag.includes('Beacon Depositor')) {
      beaconDepositorAddresses.add(to);
    }
    if (tx.From_NameTag && tx.From_NameTag.includes('Beacon Depositor')) {
      beaconDepositorAddresses.add(from);
    }
    
    // 更新 from 节点
    if (!nodeStats.has(from)) {
      nodeStats.set(from, { 
        value: 0, 
        connectionCount: 0, 
        nameTag: tx.From_NameTag || '',
        asFrom: 0,
        asTo: 0,
      });
    }
    const fromStats = nodeStats.get(from)!;
    fromStats.value += amount;
    fromStats.connectionCount++;
    fromStats.asFrom++;
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
      });
    }
    const toStats = nodeStats.get(to)!;
    toStats.value += amount;
    toStats.connectionCount++;
    toStats.asTo++;
    if (!toStats.nameTag && tx.To_NameTag) {
      toStats.nameTag = tx.To_NameTag;
    }
  });
  
  console.log('[Case4] 发现的币种:', Array.from(allAssets));
  console.log('[Case4] Beacon Depositor 地址数:', beaconDepositorAddresses.size);
  
  // 创建节点
  const nodes: GraphNode[] = [];
  const nodeSet = new Set<string>();
  
  // 找到主要攻击者（发送大量交易的地址）
  const topSenders = Array.from(nodeStats.entries())
    .filter(([_, stats]) => stats.asFrom > 10 && stats.nameTag.includes('Bybit exploit'))
    .sort((a, b) => b[1].asFrom - a[1].asFrom)
    .slice(0, 20)
    .map(([addr, _]) => addr);
  
  console.log('[Case4] 主要攻击者数:', topSenders.length);
  
  nodeStats.forEach((stats, address) => {
    if (nodeSet.has(address)) return;
    nodeSet.add(address);
    
    // 判断节点类型
    let group: "attacker" | "victim" | "neutral" | "mixer" = "neutral";
    let isStaking = false;
    
    // 检查是否是 Beacon Depositor（质押合约）
    if (beaconDepositorAddresses.has(address)) {
      group = "mixer"; // 使用 mixer 类型来标注质押合约（紫色）
      isStaking = true;
    }
    // 检查是否是 Bybit 被攻击地址
    else if (stats.nameTag.includes('Bybit exploit')) {
      if (topSenders.includes(address)) {
        group = "attacker"; // 主要发送者是攻击者
      } else {
        group = "victim"; // 其他 Bybit 地址是受害者
      }
    }
    // 检查是否是其他特殊地址
    else if (stats.nameTag) {
      const nameTag = stats.nameTag.toLowerCase();
      if (nameTag.includes('exploit') || nameTag.includes('hack') || nameTag.includes('phish')) {
        group = "attacker";
      }
    }
    
    nodes.push({
      id: address,
      group,
      value: stats.value,
      connectionCount: stats.connectionCount,
      isMixer: isStaking, // 标记为特殊节点
      mixerName: isStaking ? 'ETH STAKING' : undefined, // 显示为 ETH STAKING
    });
  });
  
  // 创建链接
  const links: GraphLink[] = [];
  const linkMap = new Map<string, GraphLink>();
  
  transactions.forEach(tx => {
    const from = tx.From.toLowerCase();
    const to = tx.To.toLowerCase();
    const amount = parseFloat(tx.Amount) || 0;
    const asset = tx.Asset || 'ETH';
    const key = `${from}-${to}-${asset}`; // 包含币种以区分不同币种的交易
    
    if (linkMap.has(key)) {
      const link = linkMap.get(key)!;
      link.value += amount;
      link.hashes.push(tx["Transaction Hash"]);
    } else {
      linkMap.set(key, {
        source: from,
        target: to,
        value: amount,
        asset: asset,
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
  
  console.log('[Case4] 解析的交易数:', transactions.length);
  console.log('[Case4] 统计的地址数:', nodeStats.size);
  console.log('[Case4] 有连接的节点数:', connectedNodes.length);
  console.log('[Case4] 最终链接数:', links.length);
  console.log('[Case4] 节点分组:', {
    attacker: connectedNodes.filter(n => n.group === 'attacker').length,
    victim: connectedNodes.filter(n => n.group === 'victim').length,
    neutral: connectedNodes.filter(n => n.group === 'neutral').length,
  });
  
  return {
    nodes: connectedNodes,
    links,
    totalVolume,
    highValueTargets,
  };
}
