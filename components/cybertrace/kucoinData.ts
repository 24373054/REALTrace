import transactionsCsvRaw from "../../data/KUCOIN数据/交易数据.csv?raw";
import addressesCsvRaw from "../../data/KUCOIN数据/地址数据.csv?raw";
import tagsCsvRaw from "../../data/KUCOIN数据/标签数据.csv?raw";
import { ParseResult, GraphNode, GraphLink } from "./types";

interface KucoinTransaction {
  tx_hash: string;
  chain: string;
  from_address: string;
  to_address: string;
  amount: string;
  token_symbol: string;
  risk_score: string;
  is_suspected: string;
  attributes: string;
}

interface KucoinAddress {
  address: string;
  chain: string;
  risk_score: string;
  is_fraud: string;
  balance: string;
  tx_count_in: string;
  tx_count_out: string;
  additional_attributes: string;
}

interface KucoinTag {
  address: string;
  tag_type: string;
  tag_value: string;
  confidence: string;
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
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = parseCsvLine(lines[0]);
  const data: T[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const obj: any = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    data.push(obj as T);
  }
  
  return data;
}

export function loadKucoinData(): ParseResult {
  const transactions = parseCsv<KucoinTransaction>(transactionsCsvRaw);
  const addresses = parseCsv<KucoinAddress>(addressesCsvRaw);
  const tags = parseCsv<KucoinTag>(tagsCsvRaw);
  
  // 创建地址信息映射
  const addressMap = new Map<string, KucoinAddress>();
  addresses.forEach(addr => {
    addressMap.set(addr.address.toLowerCase(), addr);
  });
  
  // 创建标签映射
  const tagMap = new Map<string, KucoinTag[]>();
  tags.forEach(tag => {
    const addr = tag.address.toLowerCase();
    if (!tagMap.has(addr)) {
      tagMap.set(addr, []);
    }
    tagMap.get(addr)!.push(tag);
  });
  
  // 统计每个地址的连接数和交易量
  const nodeStats = new Map<string, { value: number; connectionCount: number }>();
  
  transactions.forEach(tx => {
    const from = tx.from_address.toLowerCase();
    const to = tx.to_address.toLowerCase();
    const amount = parseFloat(tx.amount) || 0;
    
    // 更新 from 节点
    if (!nodeStats.has(from)) {
      nodeStats.set(from, { value: 0, connectionCount: 0 });
    }
    const fromStats = nodeStats.get(from)!;
    fromStats.value += amount;
    fromStats.connectionCount++;
    
    // 更新 to 节点
    if (!nodeStats.has(to)) {
      nodeStats.set(to, { value: 0, connectionCount: 0 });
    }
    const toStats = nodeStats.get(to)!;
    toStats.value += amount;
    toStats.connectionCount++;
  });
  
  // 创建节点
  const nodes: GraphNode[] = [];
  const nodeSet = new Set<string>();
  
  nodeStats.forEach((stats, address) => {
    if (nodeSet.has(address)) return;
    nodeSet.add(address);
    
    const addrInfo = addressMap.get(address);
    const addrTags = tagMap.get(address) || [];
    
    // 判断节点类型
    let group: "attacker" | "victim" | "neutral" | "mixer" = "neutral";
    
    // 检查是否是黑客地址
    const isHacker = addrTags.some(tag => 
      tag.tag_value.includes('HACKER') || tag.tag_type === 'FRAUD'
    );
    
    // 检查是否是受害者（交易所）
    const isVictim = addrTags.some(tag => 
      tag.tag_value.includes('KUCOIN') && !tag.tag_value.includes('HACKER')
    );
    
    // 检查是否是混币器
    const isMixer = addrTags.some(tag => 
      tag.tag_value.includes('MIXER') || tag.tag_value.includes('TORNADO')
    );
    
    // 获取混币器名称
    const mixerTag = addrTags.find(tag => 
      tag.tag_value.includes('MIXER') || tag.tag_value.includes('TORNADO')
    );
    const mixerName = mixerTag ? mixerTag.tag_value.replace('MIXER_', '').replace('_', ' ') : undefined;
    
    if (isMixer) {
      group = "mixer"; // 混币器单独分类
    } else if (isHacker) {
      group = "attacker";
    } else if (isVictim) {
      group = "victim";
    }
    
    nodes.push({
      id: address,
      group,
      value: stats.value,
      connectionCount: stats.connectionCount,
      isMixer,
      mixerName,
    });
  });
  
  // 创建链接
  const links: GraphLink[] = [];
  const linkMap = new Map<string, GraphLink>();
  
  transactions.forEach(tx => {
    const from = tx.from_address.toLowerCase();
    const to = tx.to_address.toLowerCase();
    const amount = parseFloat(tx.amount) || 0;
    const key = `${from}-${to}`;
    
    if (linkMap.has(key)) {
      const link = linkMap.get(key)!;
      link.value += amount;
      link.hashes.push(tx.tx_hash);
    } else {
      linkMap.set(key, {
        source: from,
        target: to,
        value: amount,
        asset: tx.token_symbol || 'ETH',
        hashes: [tx.tx_hash],
      });
    }
  });
  
  links.push(...linkMap.values());
  
  // 计算统计信息
  const totalVolume = links.reduce((sum, link) => sum + link.value, 0);
  const highValueTargets = nodes.filter(n => n.group === "attacker").length;
  
  return {
    nodes,
    links,
    totalVolume,
    highValueTargets,
  };
}
