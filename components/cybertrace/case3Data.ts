import csvRaw from "../../data/case3/跨链-以太坊部分.csv?raw";
import { ParseResult, GraphNode, GraphLink } from "./types";

interface Case3Transaction {
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
  // 简单的 CSV 解析（不处理引号内的逗号，因为这个数据集不需要）
  return line.split(',').map(field => field.trim());
}

function parseCsv(csvText: string): Case3Transaction[] {
  // 处理不同的换行符（\r\n, \n, \r）
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  
  const headers = parseCsvLine(lines[0]);
  const data: Case3Transaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // 跳过空行
    
    const values = parseCsvLine(line);
    const obj: any = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    data.push(obj as Case3Transaction);
  }
  
  return data;
}

export function loadCase3Data(): ParseResult {
  const transactions = parseCsv(csvRaw);
  
  console.log('[Case3] 解析的交易数:', transactions.length);
  console.log('[Case3] 前3条交易:', transactions.slice(0, 3));
  
  // 统计每个地址的连接数和交易量
  const nodeStats = new Map<string, { 
    value: number; 
    connectionCount: number; 
    nameTag: string;
    asFrom: number;
    asTo: number;
  }>();
  
  transactions.forEach(tx => {
    const from = tx.From.toLowerCase();
    const to = tx.To.toLowerCase();
    const amount = parseFloat(tx.Amount) || 0;
    
    // 更新 from 节点
    if (!nodeStats.has(from)) {
      nodeStats.set(from, { 
        value: 0, 
        connectionCount: 0, 
        nameTag: tx.From_NameTag || '',
        asFrom: 0,
        asTo: 0
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
        asTo: 0
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
  
  // 创建节点
  const nodes: GraphNode[] = [];
  const nodeSet = new Set<string>();
  
  console.log('[Case3] 统计的地址数:', nodeStats.size);
  
  // 跨链桥分类（按生态系统分组）
  const bridgeEcosystems = {
    'LayerZero': [
      '0xc31813c38b32c0f826c2dbf3360d5899740c9669', // ProxyOFTWithFee
      '0xcd291a8b325e6adb423a5f72e1bc67de9d19256e', // AlmanakOFTAdapter
    ],
    'Chainlink CCIP': [
      '0x80226fc0ee2b096224eeac085bb9a8cba1146f7d', // Chainlink: CCIP Router
    ],
    'Axelar': [
      '0xb5fb4be02232b1bba4dc8f81dc24c26980de9e3c', // Interchain Token Service
    ],
    'Squid': [
      '0xce16f69375520ab01377ce7b88f5ba8c48f8d666', // Squid Router Proxy
    ],
    'Optimism L2': [
      '0x1a36e24d61bc1ada68c21c2da1ad53eab8e03e55', // Lib_ResolvedDelegateProxy
    ],
    'Proxy': [
      '0xd971cdfac53d9df56bad78e01711272c0570fb9', // TransparentUpgradeableProxy
    ],
  };
  
  // 创建地址到生态系统的映射
  const addressToEcosystem = new Map<string, string>();
  Object.entries(bridgeEcosystems).forEach(([ecosystem, addresses]) => {
    addresses.forEach(addr => {
      addressToEcosystem.set(addr, ecosystem);
    });
  });
  
  // 识别跨链桥地址
  const bridgeAddresses = new Map<string, { name: string; ecosystem: string }>(); // address -> {name, ecosystem}
  nodeStats.forEach((stats, address) => {
    const ecosystem = addressToEcosystem.get(address);
    if (ecosystem) {
      bridgeAddresses.set(address, {
        name: stats.nameTag || 'Bridge',
        ecosystem: ecosystem,
      });
    }
  });
  
  console.log('[Case3] 跨链桥地址数:', bridgeAddresses.size);
  console.log('[Case3] 跨链桥生态分布:', 
    Object.entries(bridgeEcosystems).map(([eco, addrs]) => 
      `${eco}: ${addrs.filter(a => bridgeAddresses.has(a)).length}`
    ).join(', ')
  );
  
  // 找到主要发送者（作为 From 出现最多的地址）
  const topSenders = Array.from(nodeStats.entries())
    .filter(([_, stats]) => stats.asFrom > 0)
    .sort((a, b) => b[1].asFrom - a[1].asFrom)
    .slice(0, 10)
    .map(([addr, _]) => addr);
  
  console.log('[Case3] 主要发送者数:', topSenders.length);
  
  nodeStats.forEach((stats, address) => {
    if (nodeSet.has(address)) return;
    nodeSet.add(address);
    
    // 判断节点类型
    let group: "attacker" | "victim" | "neutral" | "mixer" = "neutral";
    let isBridge = false;
    let bridgeName: string | undefined;
    
    // 检查是否是跨链桥
    if (bridgeAddresses.has(address)) {
      const bridgeInfo = bridgeAddresses.get(address)!;
      group = "mixer"; // 使用 mixer 类型来标注跨链桥（紫色）
      isBridge = true;
      // 显示生态系统名称
      bridgeName = `${bridgeInfo.ecosystem}`;
    }
    // 主要发送者标记为攻击者
    else if (topSenders.includes(address)) {
      group = "attacker";
    }
    // 检查是否是其他特殊合约（根据 NameTag）
    else if (stats.nameTag) {
      const nameTag = stats.nameTag.toLowerCase();
      if (nameTag.includes('token') || nameTag.includes('vault')) {
        group = "victim"; // 代币合约/金库标记为受害者
      }
    }
    // 主要接收者（作为 To 出现很多但不是发送者）
    else if (stats.asTo > 10 && stats.asFrom === 0) {
      group = "victim";
    }
    
    nodes.push({
      id: address,
      group,
      value: stats.value,
      connectionCount: stats.connectionCount,
      isMixer: isBridge, // 标记为跨链桥
      mixerName: isBridge ? bridgeName : undefined, // 显示跨链桥名称
    });
  });
  
  // 创建链接
  const links: GraphLink[] = [];
  const linkMap = new Map<string, GraphLink>();
  
  transactions.forEach(tx => {
    const from = tx.From.toLowerCase();
    const to = tx.To.toLowerCase();
    const amount = parseFloat(tx.Amount) || 0;
    const key = `${from}-${to}`;
    
    if (linkMap.has(key)) {
      const link = linkMap.get(key)!;
      link.value += amount;
      link.hashes.push(tx["Transaction Hash"]);
    } else {
      linkMap.set(key, {
        source: from,
        target: to,
        value: amount,
        asset: tx.Asset || 'ETH',
        hashes: [tx["Transaction Hash"]],
      });
    }
  });
  
  links.push(...linkMap.values());
  
  // 只保留有连接的节点（过滤孤立节点）
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
  
  console.log('[Case3] 解析的交易数:', transactions.length);
  console.log('[Case3] 统计的地址数:', nodeStats.size);
  console.log('[Case3] 有连接的节点数:', connectedNodes.length);
  console.log('[Case3] 最终链接数:', links.length);
  console.log('[Case3] 节点分组:', {
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
