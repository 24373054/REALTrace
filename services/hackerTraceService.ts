import { AddressType, GraphData, GraphLink, GraphNode } from "../types";

// 使用 Vite ?raw 将 CSV 当作字符串引入（无需外部库）
// 数据源：黑客攻击链路 hacker_flow_full.csv
import rawCsv from "../data/hacker_flow_full.csv?raw";

export const HACKER_ROOT_ADDRESS = "0xb060679d533fa494f0f0be8311703d69f8a6b380";

/**
 * 解析黑客攻击链路 CSV，转成现有 GraphData 结构
 */
export const loadHackerTraceGraph = (): GraphData => {
  const lines = rawCsv.trim().split(/\r?\n/);
  const nodesMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 9) continue;

    const [from, to, asset, , amountStr, , , txCountStr, txHashesRaw] = cols;
    const amount = parseFloat(amountStr) || 0;
    const txCount = parseInt(txCountStr, 10) || 0;
    const token = asset || "N/A";
    const txHashes = txHashesRaw ? txHashesRaw.split(";") : [];

    // 节点初始化工具
    const ensureNode = (id: string) => {
      if (!nodesMap.has(id)) {
        nodesMap.set(id, {
          id,
          label: id,
          type: id.toLowerCase() === HACKER_ROOT_ADDRESS.toLowerCase() ? AddressType.ROOT : AddressType.NORMAL,
          balance: 0,
          currency: token,
          riskScore: 30,
          tags: [],
        });
      }
      return nodesMap.get(id)!;
    };

    const fromNode = ensureNode(from);
    const toNode = ensureNode(to);

    // 简单累加余额与风险
    fromNode.balance -= amount;
    toNode.balance += amount;
    fromNode.riskScore = Math.min(95, fromNode.riskScore + txCount * 2);
    toNode.riskScore = Math.min(95, toNode.riskScore + amount * 0.01);

    // 风险标签：交易数高或金额大
    if (txCount > 5 || amount > 50000) {
      toNode.tags = Array.from(new Set([...(toNode.tags || []), "High Tx Activity"]));
      toNode.riskScore = Math.min(98, toNode.riskScore + 10);
    }

    links.push({
      source: from,
      target: to,
      value: amount,
      txHash: txHashes[0] || `tx_${i}`,
      timestamp: "unknown",
      token,
    });
  }

  // 后处理：标记高出度与高入度节点
  const outDegree = new Map<string, number>();
  const inDegree = new Map<string, number>();
  links.forEach((l) => {
    outDegree.set(l.source as string, (outDegree.get(l.source as string) || 0) + 1);
    inDegree.set(l.target as string, (inDegree.get(l.target as string) || 0) + 1);
  });

  nodesMap.forEach((node, id) => {
    const out = outDegree.get(id) || 0;
    const inn = inDegree.get(id) || 0;
    if (id.toLowerCase() === HACKER_ROOT_ADDRESS.toLowerCase()) {
      node.tags = ["Hack Start"];
      node.riskScore = 95;
    } else if (out > 10) {
      node.type = AddressType.PHISHING;
      node.tags = Array.from(new Set([...(node.tags || []), "Suspect Outflow"]));
      node.riskScore = Math.min(99, node.riskScore + 15);
    } else if (inn > 15) {
      node.type = AddressType.CEX;
      node.tags = Array.from(new Set([...(node.tags || []), "Aggregation Hub"]));
    }
  });

  return {
    nodes: Array.from(nodesMap.values()),
    links,
  };
};

