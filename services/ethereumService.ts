import { GraphData, GraphLink, GraphNode, AddressType } from "../types";

const ETH_RPC = import.meta.env.VITE_ETH_RPC;
const ETH_PROXY_PATH = import.meta.env.VITE_ETH_PROXY_PATH; // 推荐走后端代理
const BLOCKS_TO_SCAN = 5; // 减少扫描区块数以提高速度（节点展开时）
const BLOCKS_TO_SCAN_INITIAL = 10; // 初始搜索时扫描更多区块

const ethFetch = async (method: string, params: any[]) => {
  const endpoint = ETH_PROXY_PATH || ETH_RPC;
  if (!endpoint) throw new Error("未配置 VITE_ETH_RPC 或 VITE_ETH_PROXY_PATH");

  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!resp.ok) throw new Error(`ETH RPC ${resp.status} ${resp.statusText}`);
  const json = await resp.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
};

const hexToNumber = (hex?: string) => (hex ? parseInt(hex, 16) : 0);
const weiToEth = (hex?: string) => hexToNumber(hex) / 1e18;

export const fetchEthereumGraph = async (address: string, isExpand: boolean = false): Promise<GraphData> => {
  const addrLc = address.toLowerCase();
  const nodesMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  const ensureNode = (id: string): GraphNode => {
    const key = id.toLowerCase();
    if (!nodesMap.has(key)) {
      nodesMap.set(key, {
        id,
        label: id.slice(0, 6) + "..." + id.slice(-4),
        type: key === addrLc ? AddressType.ROOT : AddressType.NORMAL,
        balance: 0,
        currency: "ETH",
        riskScore: 0,
        tags: [],
      });
    }
    return nodesMap.get(key)!;
  };

  ensureNode(address);

  // 根据是否是展开操作决定扫描区块数
  const blocksToScan = isExpand ? BLOCKS_TO_SCAN : BLOCKS_TO_SCAN_INITIAL;
  
  // 获取最新区块号并扫描最近区块（ETH 原生转账只能通过区块扫描）
  const latestHex = await ethFetch("eth_blockNumber", []);
  const latest = hexToNumber(latestHex);
  const start = Math.max(0, latest - blocksToScan + 1);

  console.log(`[Ethereum] ${isExpand ? '展开节点' : '搜索'} - 扫描区块 ${start} 到 ${latest}，查找地址 ${address} 的交易`);
  
  let foundCount = 0;
  const MAX_TRANSACTIONS = isExpand ? 10 : 20; // 展开时限制更少
  
  // 优化：如果连续多个区块都没有找到交易，提前退出
  let emptyBlocksCount = 0;
  const MAX_EMPTY_BLOCKS = isExpand ? 2 : 3; // 展开时更快退出（2个空区块就停止）
  
  // 添加超时保护（单个区块查询超时10秒，因为 Alchemy RPC 可能较慢）
  const BLOCK_TIMEOUT = 10000;
  
  // 如果前3个区块都没有找到交易，直接退出（避免浪费时间）
  const EARLY_EXIT_BLOCKS = 3;
  
  for (let bn = start; bn <= latest && foundCount < MAX_TRANSACTIONS; bn++) {
    const hexBn = "0x" + bn.toString(16);
    let blockHasTx = false;
    
    try {
      // 添加单个区块查询超时
      const blockPromise = ethFetch("eth_getBlockByNumber", [hexBn, true]);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`区块 ${bn} 查询超时`)), BLOCK_TIMEOUT)
      );
      
      const block = await Promise.race([blockPromise, timeoutPromise]) as any;
      
      if (!block?.transactions || block.transactions.length === 0) {
        emptyBlocksCount++;
        // 如果前几个区块都没有交易，且还没有找到任何交易，提前退出
        if (bn - start < EARLY_EXIT_BLOCKS && foundCount === 0 && emptyBlocksCount >= EARLY_EXIT_BLOCKS) {
          console.log(`[Ethereum] 前 ${EARLY_EXIT_BLOCKS} 个区块都没有交易，提前退出`);
          break;
        }
        if (emptyBlocksCount >= MAX_EMPTY_BLOCKS) {
          console.log(`[Ethereum] 连续 ${MAX_EMPTY_BLOCKS} 个空区块，提前退出`);
          break;
        }
        continue;
      }
      
      const ts = hexToNumber(block.timestamp) * 1000;
      const tsStr = ts ? new Date(ts).toISOString() : "N/A";

      for (const tx of block.transactions) {
        if (foundCount >= MAX_TRANSACTIONS) break;
        
        const from = tx.from?.toLowerCase();
        const to = tx.to?.toLowerCase();
        if (!from || !to) continue;
        if (from !== addrLc && to !== addrLc) continue; // 只保留与目标地址相关

        const valueEth = weiToEth(tx.value);
        if (valueEth === 0) continue;

        ensureNode(from);
        ensureNode(to);

        links.push({
          source: from,
          target: to,
          value: valueEth,
          txHash: tx.hash,
          timestamp: tsStr,
          token: "ETH",
        });
        foundCount++;
        blockHasTx = true;
      }
      
      if (blockHasTx) {
        emptyBlocksCount = 0; // 重置空区块计数
      } else {
        emptyBlocksCount++;
        if (emptyBlocksCount >= MAX_EMPTY_BLOCKS) {
          console.log(`[Ethereum] 连续 ${MAX_EMPTY_BLOCKS} 个空区块，提前退出`);
          break;
        }
      }
    } catch (error: any) {
      console.warn(`[Ethereum] 获取区块 ${bn} 失败:`, error.message);
      emptyBlocksCount++;
      // 如果前几个区块都超时，可能是 RPC 问题，直接退出
      if (bn - start < 2 && error.message?.includes('超时')) {
        console.error(`[Ethereum] RPC 响应过慢，前2个区块都超时，停止查询`);
        throw new Error('Ethereum RPC 响应超时，请检查网络连接或稍后重试。提示：可以尝试使用 Solana 链，查询更高效。');
      }
      // 如果错误太多或超时，提前退出
      if (emptyBlocksCount >= MAX_EMPTY_BLOCKS) {
        console.log(`[Ethereum] 错误/超时过多，提前退出`);
        break;
      }
    }
  }
  
  console.log(`[Ethereum] 找到 ${foundCount} 笔相关交易`);
  
  return { nodes: Array.from(nodesMap.values()), links };
};

