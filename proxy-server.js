/**
 * 简单的 RPC 代理服务器
 * 用于安全地转发 Solana 和 Ethereum RPC 请求，避免在前端暴露 API Key
 * 
 * 使用方法：
 * 1. 在 .env.local 中配置 RPC 地址和 Key：
 *    SOLANA_RPC_URL=https://your-solana-rpc-url?api-key=xxx
 *    ETH_RPC_URL=https://your-eth-rpc-url?api-key=yyy
 * 
 * 2. 启动代理服务器：
 *    npm run proxy
 * 
 * 3. 在前端 .env.local 中配置代理路径：
 *    VITE_SOLANA_PROXY_PATH=http://localhost:3001/api/solana
 *    VITE_ETH_PROXY_PATH=http://localhost:3001/api/eth
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import * as dbService from './database/dbService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
const envPath = join(__dirname, '.env.local');
let envVars = {};
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
} catch (err) {
  console.warn('未找到 .env.local 文件，将使用环境变量或默认值');
}

// 从环境变量或 .env.local 读取 RPC 地址
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || envVars.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const ETH_RPC_URL = process.env.ETH_RPC_URL || envVars.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY';

const app = express();
const PORT = process.env.PROXY_PORT || 3113;

// 启用 CORS（允许所有来源，生产环境应限制）
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 处理 OPTIONS 预检请求
app.options('*', (req, res) => {
  res.sendStatus(200);
});

app.use(express.json());

// 添加请求日志中间件（在 JSON 解析之后）
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[请求体]`, JSON.stringify(req.body).substring(0, 300));
  }
  next();
});

// 通用 RPC 转发函数
async function forwardRPCRequest(targetUrl, req, res) {
  try {
    const requestBody = req.body;
    console.log(`[转发] URL: ${targetUrl}`);
    console.log(`[转发] 请求体:`, JSON.stringify(requestBody));

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // 尝试解析响应
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error(`[错误] 非 JSON 响应:`, text.substring(0, 500));
      return res.status(response.status).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `RPC 返回非 JSON 格式: ${response.status} ${response.statusText}`,
        },
        id: requestBody?.id || null,
      });
    }
    
    if (!response.ok) {
      console.error(`[错误] RPC 错误 (${response.status}):`, JSON.stringify(data).substring(0, 500));
      // 如果 RPC 返回错误，直接转发错误响应
      return res.status(response.status).json(data);
    }
    
    // 检查 JSON-RPC 错误
    if (data.error) {
      console.error(`[错误] JSON-RPC 错误:`, JSON.stringify(data.error));
      return res.status(400).json(data);
    }

    console.log(`[成功] RPC 响应正常`);
    res.json(data);
  } catch (error) {
    console.error('[错误] RPC 转发异常:', error.message);
    console.error('[错误] 堆栈:', error.stack);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: `代理服务器错误: ${error.message}`,
      },
      id: req.body?.id || null,
    });
  }
}

// Solana RPC 代理端点
app.post('/api/solana', async (req, res) => {
  console.log(`[Solana] 转发请求到: ${SOLANA_RPC_URL}`);
  console.log(`[Solana] 请求体:`, JSON.stringify(req.body).substring(0, 200));
  await forwardRPCRequest(SOLANA_RPC_URL, req, res);
});

// Solana GET 请求提示（用于调试）
app.get('/api/solana', (req, res) => {
  res.status(405).json({
    error: 'Method Not Allowed',
    message: '此端点仅支持 POST 请求（JSON-RPC 协议）',
    example: {
      method: 'POST',
      url: '/api/solana',
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth',
        params: []
      }
    }
  });
});

// Ethereum RPC 代理端点
app.post('/api/eth', async (req, res) => {
  console.log(`[Ethereum] 转发请求到: ${ETH_RPC_URL}`);
  console.log(`[Ethereum] 请求体:`, JSON.stringify(req.body).substring(0, 200));
  await forwardRPCRequest(ETH_RPC_URL, req, res);
});

// Ethereum GET 请求提示（用于调试）
app.get('/api/eth', (req, res) => {
  res.status(405).json({
    error: 'Method Not Allowed',
    message: '此端点仅支持 POST 请求（JSON-RPC 协议）',
    example: {
      method: 'POST',
      url: '/api/eth',
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: []
      }
    }
  });
});

// ============================================
// 数据库 API 端点
// ============================================

// 保存地址节点
app.post('/api/db/address', async (req, res) => {
  try {
    const addressData = req.body;
    const result = await dbService.upsertAddress(addressData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[数据库API] 保存地址失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 批量保存地址节点
app.post('/api/db/addresses', async (req, res) => {
  try {
    const addressesArray = req.body.addresses || req.body;
    const result = await dbService.upsertAddresses(addressesArray);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[数据库API] 批量保存地址失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取地址详情
app.get('/api/db/address/:chain/:address', async (req, res) => {
  try {
    const { address, chain } = req.params;
    const result = await dbService.getAddress(address, chain.toUpperCase());
    if (result) {
      res.json({ success: true, data: result });
    } else {
      res.status(404).json({ success: false, error: '地址未找到' });
    }
  } catch (error) {
    console.error('[数据库API] 获取地址失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 添加地址标签
app.post('/api/db/address/tag', async (req, res) => {
  try {
    const { address, chain, tagType, tagValue, source, confidence } = req.body;
    const result = await dbService.addAddressTag(
      address,
      chain.toUpperCase(),
      tagType,
      tagValue,
      source,
      confidence
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[数据库API] 添加标签失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 批量添加地址标签
app.post('/api/db/address/tags', async (req, res) => {
  try {
    const tagsArray = req.body.tags || req.body;
    const result = await dbService.addAddressTags(tagsArray);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[数据库API] 批量添加标签失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 保存交易
app.post('/api/db/transaction', async (req, res) => {
  try {
    const txData = req.body;
    const result = await dbService.upsertTransaction(txData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[数据库API] 保存交易失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 批量保存交易
app.post('/api/db/transactions', async (req, res) => {
  try {
    const transactionsArray = req.body.transactions || req.body;
    const result = await dbService.upsertTransactions(transactionsArray);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[数据库API] 批量保存交易失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取地址的交易列表
app.get('/api/db/address/:chain/:address/transactions', async (req, res) => {
  try {
    const { address, chain } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const result = await dbService.getAddressTransactions(
      address,
      chain.toUpperCase(),
      limit,
      offset
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[数据库API] 获取交易列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取地址的关联地址
app.get('/api/db/address/:chain/:address/connections', async (req, res) => {
  try {
    const { address, chain } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const result = await dbService.getConnectedAddresses(
      address,
      chain.toUpperCase(),
      limit
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[数据库API] 获取关联地址失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 构建地址的交易图谱
app.get('/api/db/address/:chain/:address/graph', async (req, res) => {
  try {
    const { address, chain } = req.params;
    const maxDepth = parseInt(req.query.maxDepth) || 3;
    const maxNodes = parseInt(req.query.maxNodes) || 100;
    const result = await dbService.buildAddressGraph(
      address,
      chain.toUpperCase(),
      maxDepth,
      maxNodes
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[数据库API] 构建图谱失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 搜索高风险地址
app.get('/api/db/addresses/high-risk', async (req, res) => {
  try {
    const chain = req.query.chain?.toUpperCase() || 'SOLANA';
    const minRiskScore = parseFloat(req.query.minRiskScore) || 70;
    const limit = parseInt(req.query.limit) || 50;
    const result = await dbService.searchHighRiskAddresses(chain, minRiskScore, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[数据库API] 搜索高风险地址失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 健康检查端点
app.get('/health', async (req, res) => {
  let dbStatus = '未配置';
  try {
    const pool = dbService.getPool();
    if (pool) {
      await pool.query('SELECT NOW()');
      dbStatus = '已连接';
    }
  } catch (error) {
    dbStatus = `连接失败: ${error.message}`;
  }

  res.json({
    status: 'ok',
    solana: SOLANA_RPC_URL ? '已配置' : '未配置',
    ethereum: ETH_RPC_URL ? '已配置' : '未配置',
    database: dbStatus,
  });
});

// Chrome DevTools 自动请求（静默处理）
app.get('/.well-known/*', (req, res) => {
  res.status(204).send();
});

// 处理未匹配的路由（必须放在所有路由定义之后）
app.use((req, res) => {
  console.warn(`[警告] 未匹配的路由: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `路由 ${req.method} ${req.path} 不存在`,
    availableRoutes: [
      'POST /api/solana',
      'POST /api/eth',
      'GET /health',
      'POST /api/db/address',
      'POST /api/db/addresses',
      'GET /api/db/address/:chain/:address',
      'POST /api/db/address/tag',
      'POST /api/db/address/tags',
      'POST /api/db/transaction',
      'POST /api/db/transactions',
      'GET /api/db/address/:chain/:address/transactions',
      'GET /api/db/address/:chain/:address/connections',
      'GET /api/db/address/:chain/:address/graph',
      'GET /api/db/addresses/high-risk',
    ],
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 RPC 代理服务器已启动`);
  console.log(`   端口: ${PORT}`);
  console.log(`   Solana RPC: ${SOLANA_RPC_URL}`);
  console.log(`   Ethereum RPC: ${ETH_RPC_URL}`);
  console.log(`\n   健康检查: http://localhost:${PORT}/health`);
  console.log(`   Solana 代理: http://localhost:${PORT}/api/solana`);
  console.log(`   Ethereum 代理: http://localhost:${PORT}/api/eth\n`);
});

