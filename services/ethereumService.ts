import { GraphData, GraphLink, GraphNode, AddressType } from "../types";

const ETH_RPC = import.meta.env.VITE_ETH_RPC;
const ETH_PROXY_PATH = import.meta.env.VITE_ETH_PROXY_PATH; // 推荐走后端代理
const BLOCKS_TO_SCAN = 20; // 节点展开时扫描区块数
const BLOCKS_TO_SCAN_INITIAL = 100; // 初始搜索时扫描更多区块（增加范围以提高找到交易的概率）

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

// ERC20 Transfer 事件签名（keccak256("Transfer(address,address,uint256)")）
const TRANSFER_EVENT_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

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
  
  // 获取最新区块号并扫描最近区块
  const latestHex = await ethFetch("eth_blockNumber", []);
  const latest = hexToNumber(latestHex);
  const start = Math.max(0, latest - blocksToScan + 1);

  console.log(`[Ethereum] ${isExpand ? '展开节点' : '搜索'} - 扫描区块 ${start} 到 ${latest}，查找地址 ${address} 的交易`);
  
  let foundCount = 0;
  const MAX_TRANSACTIONS = isExpand ? 20 : 50; // 增加最大交易数限制
  
  // 方法1：使用 eth_getLogs 查询 ERC20 Transfer 事件（更高效）
  // 注意：某些 RPC 节点（如 Alchemy）可能对 eth_getLogs 有特殊限制
  // 如果失败，我们将回退到区块扫描方法
  const USE_ETH_GETLOGS = false; // 暂时禁用，因为 Alchemy RPC 返回 400 错误
  
  if (USE_ETH_GETLOGS) {
    try {
      // 地址需要左填充到 32 字节（64 个十六进制字符）
      // 地址是 20 字节（40 个十六进制字符），需要填充 12 字节（24 个十六进制字符）
      const addrWithoutPrefix = addrLc.slice(2); // 移除 0x 前缀
      if (addrWithoutPrefix.length !== 40) {
        throw new Error(`地址格式错误: ${address}`);
      }
      const fromHex = "0x" + "0".repeat(24) + addrWithoutPrefix; // 左填充到 32 字节
      const toHex = "0x" + "0".repeat(24) + addrWithoutPrefix;
      
      console.log(`[Ethereum] 查询 ERC20 Transfer 事件: from=${fromHex.slice(0, 20)}..., to=${toHex.slice(0, 20)}...`);
      
      // 查询该地址作为发送方的 Transfer 事件
      // topics[0] = Transfer 事件签名
      // topics[1] = from 地址（索引）
      const logsFromParams = {
        fromBlock: "0x" + start.toString(16),
        toBlock: "0x" + latest.toString(16),
        topics: [TRANSFER_EVENT_TOPIC, fromHex],
      };
      console.log(`[Ethereum] 查询参数 (from):`, JSON.stringify(logsFromParams, null, 2));
      let logsFrom: any[] = [];
      try {
        logsFrom = await ethFetch("eth_getLogs", [logsFromParams]) as any[];
        console.log(`[Ethereum] 查询 from 地址成功，找到 ${logsFrom.length} 个事件`);
      } catch (e: any) {
        console.warn(`[Ethereum] 查询 from 地址失败:`, e.message);
        throw e; // 重新抛出，让外层 catch 处理
      }
      
      // 查询该地址作为接收方的 Transfer 事件
      let logsTo: any[] = [];
      try {
        const logsToParams1 = {
          fromBlock: "0x" + start.toString(16),
          toBlock: "0x" + latest.toString(16),
          topics: [TRANSFER_EVENT_TOPIC, null, toHex],
        };
        console.log(`[Ethereum] 查询参数 (to):`, JSON.stringify(logsToParams1, null, 2));
        logsTo = await ethFetch("eth_getLogs", [logsToParams1]) as any[];
        console.log(`[Ethereum] 查询 to 地址成功，找到 ${logsTo.length} 个事件`);
      } catch (e1: any) {
        console.warn(`[Ethereum] 查询 to 地址失败:`, e1.message);
        // 如果查询 to 失败，只使用 from 的结果
      }
    
      // 合并并去重（同一个交易可能同时出现在两个查询中）
      const allLogs = [...logsFrom, ...logsTo];
      const uniqueLogs = Array.from(new Map(allLogs.map(log => [log.transactionHash, log])).values());
      
      console.log(`[Ethereum] 通过 eth_getLogs 找到 ${uniqueLogs.length} 个 ERC20 Transfer 事件`);
    
    // 处理 ERC20 Transfer 事件
    for (const log of uniqueLogs.slice(0, MAX_TRANSACTIONS)) {
      if (foundCount >= MAX_TRANSACTIONS) break;
      
      // Transfer(address indexed from, address indexed to, uint256 value)
      // topics[0] = Transfer 事件签名
      // topics[1] = from 地址（索引）
      // topics[2] = to 地址（索引）
      // data = value（金额）
      const from = "0x" + log.topics[1]?.slice(-40).toLowerCase();
      const to = "0x" + log.topics[2]?.slice(-40).toLowerCase();
      
      if (!from || !to || (from !== addrLc && to !== addrLc)) continue;
      
      // 解析 value（data 字段）
      const valueHex = log.data;
      const value = hexToNumber(valueHex);
      if (value === 0) continue;
      
      // 获取代币合约地址
      const tokenContract = log.address.toLowerCase();
      
      // 获取交易时间戳（需要查询区块）
      let tsStr = "N/A";
      try {
        const blockHex = log.blockNumber;
        const block = await ethFetch("eth_getBlockByNumber", [blockHex, false]) as any;
        const ts = hexToNumber(block.timestamp) * 1000;
        tsStr = ts ? new Date(ts).toISOString() : "N/A";
      } catch (e) {
        // 忽略时间戳获取失败
      }
      
      ensureNode(from);
      ensureNode(to);
      
      // 尝试获取代币符号（简化版，只显示合约地址）
      const tokenSymbol = tokenContract.slice(0, 6) + "..." + tokenContract.slice(-4);
      
      links.push({
        source: from,
        target: to,
        value: value / 1e18, // 假设 18 位小数（大多数 ERC20 代币）
        txHash: log.transactionHash,
        timestamp: tsStr,
        token: `ERC20:${tokenSymbol}`,
      });
      foundCount++;
    }
    
      if (foundCount > 0) {
        console.log(`[Ethereum] 通过 ERC20 Transfer 事件找到 ${foundCount} 笔交易`);
      }
    } catch (error: any) {
      console.warn(`[Ethereum] 查询 ERC20 Transfer 事件失败:`, error.message);
      console.warn(`[Ethereum] 错误详情:`, error);
      // 继续使用区块扫描方法
    }
  } else {
    console.log(`[Ethereum] eth_getLogs 功能已禁用，仅使用区块扫描方法`);
  }
  
  // 方法2：扫描区块查找 ETH 原生转账（补充方法1）
  const initialFoundCount = foundCount; // 记录通过 eth_getLogs 找到的交易数
  
  // 优化：如果连续多个区块都没有找到交易，提前退出
  let emptyBlocksCount = 0;
  const MAX_EMPTY_BLOCKS = isExpand ? 10 : 20; // 放宽退出条件，连续更多空区块才退出
  
  // 添加超时保护（单个区块查询超时10秒，因为 Alchemy RPC 可能较慢）
  const BLOCK_TIMEOUT = 10000;
  
  // 如果前10个区块都没有找到交易，直接退出（避免浪费时间）
  const EARLY_EXIT_BLOCKS = 10;
  
  // 每扫描 10 个区块输出一次进度
  const PROGRESS_INTERVAL = 10;
  let lastProgressBlock = start;
  
  for (let bn = start; bn <= latest && foundCount < MAX_TRANSACTIONS; bn++) {
    const hexBn = "0x" + bn.toString(16);
    let blockHasTx = false;
    
    // 每扫描 10 个区块输出一次进度
    if (bn - lastProgressBlock >= PROGRESS_INTERVAL) {
      console.log(`[Ethereum] 扫描进度: 区块 ${bn}/${latest} (已扫描 ${bn - start + 1}/${blocksToScan}，找到 ${foundCount} 笔交易)`);
      lastProgressBlock = bn;
    }
    
    try {
      // 添加单个区块查询超时
      const blockPromise = ethFetch("eth_getBlockByNumber", [hexBn, true]);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`区块 ${bn} 查询超时`)), BLOCK_TIMEOUT)
      );
      
      const block = await Promise.race([blockPromise, timeoutPromise]) as any;
      
      // 检查区块本身是否为空（没有任何交易）
      const isBlockEmpty = !block?.transactions || block.transactions.length === 0;
      
      if (isBlockEmpty) {
        // 只有区块本身为空时才计入空区块计数
        emptyBlocksCount++;
        // 如果连续很多区块都完全为空，可能网络有问题，提前退出
        if (emptyBlocksCount >= MAX_EMPTY_BLOCKS) {
          console.log(`[Ethereum] 连续 ${MAX_EMPTY_BLOCKS} 个区块完全为空，提前退出`);
          break;
        }
        continue;
      }
      
      // 区块有交易，重置空区块计数
      emptyBlocksCount = 0;
      
      const ts = hexToNumber(block.timestamp) * 1000;
      const tsStr = ts ? new Date(ts).toISOString() : "N/A";

      // 遍历区块中的所有交易，查找与目标地址相关的交易
      for (const tx of block.transactions) {
        if (foundCount >= MAX_TRANSACTIONS) break;
        
        const from = tx.from?.toLowerCase();
        const to = tx.to?.toLowerCase();
        if (!from) continue;
        if (from !== addrLc && to !== addrLc) continue; // 只保留与目标地址相关

        // 检查 ETH 原生转账
        const valueEth = weiToEth(tx.value);
        if (valueEth > 0) {
          if (!to) continue; // ETH 转账必须有接收地址
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
        
        // TODO: 未来可以添加 ERC20 转账检测（通过 eth_getLogs 查询 Transfer 事件）
        // 目前先专注于 ETH 原生转账
      }
      
      // 如果在这个区块中找到了目标地址的交易，输出日志
      if (blockHasTx) {
        console.log(`[Ethereum] 区块 ${bn} 中找到 ${foundCount} 笔交易`);
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
  
  console.log(`[Ethereum] 扫描完成: 共扫描 ${Math.min(latest - start + 1, blocksToScan)} 个区块，找到 ${foundCount} 笔相关交易`);
  
  if (foundCount === 0) {
    console.warn(`[Ethereum] 未找到交易。提示：该地址在最近 ${blocksToScan} 个区块中可能没有 ETH 原生转账。可以尝试：`);
    console.warn(`  1. 检查地址是否正确`);
    console.warn(`  2. 该地址可能只有 ERC20 代币转账（当前版本暂不支持）`);
    console.warn(`  3. 该地址的交易可能在更早的区块中（当前扫描范围：最近 ${blocksToScan} 个区块）`);
  }
  
  return { nodes: Array.from(nodesMap.values()), links };
};

