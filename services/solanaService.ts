import { GraphData, GraphLink, GraphNode, AddressType } from "../types";

// 简易 Solana RPC 调用封装。生产环境建议走后端代理以隐藏密钥和做速率控制。
const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC;
const SOLANA_PROXY_PATH = import.meta.env.VITE_SOLANA_PROXY_PATH; // e.g. /api/solana
const MAX_SIGNATURES = 50; // 初始搜索时
const MAX_SIGNATURES_EXPAND = 20; // 节点展开时，减少查询数量以提高速度

interface SolanaSignatureInfo {
  signature: string;
  blockTime?: number;
  err: any;
  memo: string | null;
  slot: number;
}

interface ParsedInstruction {
  parsed?: {
    type?: string;
    info?: {
      source?: string;
      destination?: string;
      lamports?: number;
    };
  };
}

const solanaFetch = async (method: string, params: any[]) => {
  const endpoint = SOLANA_PROXY_PATH || SOLANA_RPC;
  if (!endpoint) {
    throw new Error("未配置 VITE_SOLANA_RPC 或 VITE_SOLANA_PROXY_PATH");
  }

  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!resp.ok) {
    throw new Error(`RPC ${resp.status} ${resp.statusText}`);
  }
  const json = await resp.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
};

export const fetchSolanaGraph = async (address: string, isExpand: boolean = false, beforeSignature?: string): Promise<GraphData> => {
  console.log(`[Solana] ${isExpand ? '展开节点' : '搜索'} - 开始查询地址: ${address}${beforeSignature ? ` (before: ${beforeSignature.slice(0, 8)}...)` : ''}`);
  
  // 1) signatures（展开时减少查询数量）
  // 如果提供了 beforeSignature，使用它查询更早的交易
  const limit = isExpand ? MAX_SIGNATURES_EXPAND : MAX_SIGNATURES;
  const params: any = { limit };
  if (beforeSignature) {
    params.before = beforeSignature;
  }
  
  const signatures: SolanaSignatureInfo[] = await solanaFetch("getSignaturesForAddress", [
    address,
    params,
  ]);
  
  console.log(`[Solana] 找到 ${signatures.length} 笔交易签名${beforeSignature ? ' (查询更早的交易)' : ''}`);

  const nodesMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  const ensureNode = (id: string): GraphNode => {
    if (!nodesMap.has(id)) {
      nodesMap.set(id, {
        id,
        label: id.slice(0, 6) + "..." + id.slice(-4),
        // 展开时不应该将查询地址标记为 ROOT，应该保持为 NORMAL
        type: (id === address && !isExpand) ? AddressType.ROOT : AddressType.NORMAL,
        balance: 0,
        currency: "SOL",
        riskScore: 0,
        tags: [],
      });
    }
    return nodesMap.get(id)!;
  };

  ensureNode(address);

  // 2) fetch transactions details (使用 getTransaction 替代 getParsedTransaction，因为 Alchemy 不支持)
  const limited = signatures.slice(0, limit);
  for (const sig of limited) {
    try {
      const tx = await solanaFetch("getTransaction", [
        sig.signature,
        { encoding: "json", maxSupportedTransactionVersion: 0 },
      ]);
      if (!tx || !tx.meta || tx.meta.err) continue;

      const blockTime = tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : "";
      const meta = tx.meta;
      const message = tx.transaction?.message;
      if (!message) continue;

      // 优先从 instructions 中提取转账信息（更准确）
      const instructions = message.instructions || [];
      let foundFromInstructions = false;
      
      instructions.forEach((ix: any) => {
        // 尝试解析 transfer 指令
        if (ix.parsed?.type === 'transfer' && ix.parsed?.info) {
          const info = ix.parsed.info;
          if (info.source && info.destination && info.lamports) {
            const from = info.source;
            const to = info.destination;
            const amountSol = info.lamports / 1e9;

            // 只保留与目标地址相关的转账
            if (from.toLowerCase() !== address.toLowerCase() && to.toLowerCase() !== address.toLowerCase()) {
              return;
            }

            ensureNode(from);
            ensureNode(to);

            // 避免重复添加
            const exists = links.some(l => 
              (typeof l.source === 'string' ? l.source : l.source.id) === from &&
              (typeof l.target === 'string' ? l.target : l.target.id) === to &&
              l.txHash === sig.signature
            );
            if (!exists) {
              links.push({
                source: from,
                target: to,
                value: amountSol,
                txHash: sig.signature,
                timestamp: blockTime || "N/A",
                token: "SOL",
              });
              foundFromInstructions = true;
            }
          }
        }
      });

      // 如果从 instructions 没找到，尝试从余额变化分析
      if (!foundFromInstructions) {
        const accountKeys = message.accountKeys || [];
        const preBalances = meta.preBalances || [];
        const postBalances = meta.postBalances || [];

        // 找出与目标地址相关的账户索引
        const targetIndex = accountKeys.findIndex((acc: any) => {
          const addr = typeof acc === 'string' ? acc : acc.pubkey;
          return addr.toLowerCase() === address.toLowerCase();
        });

        if (targetIndex >= 0) {
          // 分析余额变化，找出转账关系（考虑手续费，不要求完全相等）
          for (let i = 0; i < accountKeys.length; i++) {
            const account = accountKeys[i];
            const accountAddr = typeof account === 'string' ? account : account.pubkey;
            const preBalance = preBalances[i] || 0;
            const postBalance = postBalances[i] || 0;
            const balanceChange = postBalance - preBalance;

            // 只处理与目标地址相关的转账（发送或接收）
            if (accountAddr.toLowerCase() !== address.toLowerCase() && balanceChange === 0) continue;

            // 找出对应的转账对象
            for (let j = 0; j < accountKeys.length; j++) {
              if (i === j) continue;
              const otherAccount = accountKeys[j];
              const otherAddr = typeof otherAccount === 'string' ? otherAccount : otherAccount.pubkey;
              const otherPreBalance = preBalances[j] || 0;
              const otherPostBalance = postBalances[j] || 0;
              const otherBalanceChange = otherPostBalance - otherPreBalance;

              // 如果一方减少，另一方增加，说明有转账（允许手续费差异）
              if (balanceChange < 0 && otherBalanceChange > 0) {
                // 允许手续费差异（最多 0.01 SOL）
                const feeTolerance = 0.01 * 1e9; // 0.01 SOL in lamports
                if (Math.abs(Math.abs(balanceChange) - otherBalanceChange) <= feeTolerance) {
                  const amountSol = Math.abs(balanceChange) / 1e9;
                  if (amountSol > 0.001) { // 忽略小额转账
                    ensureNode(accountAddr);
                    ensureNode(otherAddr);

                    // 避免重复添加
                    const exists = links.some(l => 
                      (typeof l.source === 'string' ? l.source : l.source.id) === accountAddr &&
                      (typeof l.target === 'string' ? l.target : l.target.id) === otherAddr &&
                      l.txHash === sig.signature
                    );
                    if (!exists) {
                      links.push({
                        source: accountAddr,
                        target: otherAddr,
                        value: amountSol,
                        txHash: sig.signature,
                        timestamp: blockTime || "N/A",
                        token: "SOL",
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`获取交易 ${sig.signature} 失败:`, error);
      continue;
    }
  }

  console.log(`[Solana] 解析完成: ${nodesMap.size} 个节点, ${links.length} 条链接`);
  
  return { nodes: Array.from(nodesMap.values()), links };
};

