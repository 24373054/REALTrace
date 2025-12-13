/**
 * 数据库服务模块
 * 支持 PostgreSQL 数据库操作（可选）
 * 
 * 配置方式：
 * 1. 在 .env.local 中配置数据库连接：
 *    DB_HOST=localhost
 *    DB_PORT=5432
 *    DB_NAME=your_database
 *    DB_USER=your_user
 *    DB_PASSWORD=your_password
 * 
 * 2. 或者使用环境变量
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
const envPath = join(__dirname, '..', '.env.local');
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
  // 忽略文件不存在错误
}

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || envVars.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || envVars.DB_PORT || '5432'),
  database: process.env.DB_NAME || envVars.DB_NAME,
  user: process.env.DB_USER || envVars.DB_USER,
  password: process.env.DB_PASSWORD || envVars.DB_PASSWORD,
};

// 创建连接池（仅在配置完整时）
let pool = null;
if (dbConfig.database && dbConfig.user) {
  try {
    pool = new Pool(dbConfig);
    pool.on('error', (err) => {
      console.error('[数据库] 连接池错误:', err);
    });
    console.log('[数据库] 连接池已创建');
  } catch (error) {
    console.warn('[数据库] 连接池创建失败:', error.message);
  }
} else {
  console.warn('[数据库] 数据库未配置，数据库功能将不可用');
}

/**
 * 获取数据库连接池
 */
export function getPool() {
  return pool;
}

/**
 * 检查数据库是否可用
 */
function checkDatabase() {
  if (!pool) {
    throw new Error('数据库未配置或连接失败');
  }
}

/**
 * 保存或更新地址节点
 */
export async function upsertAddress(addressData) {
  checkDatabase();
  
  const {
    address,
    chain = 'SOLANA',
    balance = 0,
    currency = 'SOL',
    riskScore = 0,
    tags = [],
    metadata = {}
  } = addressData;

  const query = `
    INSERT INTO addresses (address, chain, balance, currency, risk_score, tags, metadata, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    ON CONFLICT (address, chain) 
    DO UPDATE SET
      balance = EXCLUDED.balance,
      currency = EXCLUDED.currency,
      risk_score = EXCLUDED.risk_score,
      tags = EXCLUDED.tags,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *;
  `;

  const result = await pool.query(query, [
    address,
    chain.toUpperCase(),
    balance,
    currency,
    riskScore,
    JSON.stringify(tags),
    JSON.stringify(metadata)
  ]);

  return result.rows[0];
}

/**
 * 批量保存或更新地址节点
 */
export async function upsertAddresses(addressesArray) {
  checkDatabase();
  
  const results = [];
  for (const addressData of addressesArray) {
    try {
      const result = await upsertAddress(addressData);
      results.push(result);
    } catch (error) {
      console.error(`[数据库] 保存地址失败 ${addressData.address}:`, error.message);
      results.push({ error: error.message, address: addressData.address });
    }
  }
  
  return results;
}

/**
 * 获取地址详情
 */
export async function getAddress(address, chain = 'SOLANA') {
  checkDatabase();
  
  const query = `
    SELECT * FROM addresses 
    WHERE address = $1 AND chain = $2;
  `;
  
  const result = await pool.query(query, [address, chain.toUpperCase()]);
  return result.rows[0] || null;
}

/**
 * 添加地址标签
 */
export async function addAddressTag(address, chain, tagType, tagValue, source = 'manual', confidence = 0.5) {
  checkDatabase();
  
  const addressRecord = await getAddress(address, chain);
  if (!addressRecord) {
    throw new Error(`地址 ${address} 不存在`);
  }

  const tags = addressRecord.tags || [];
  const newTag = {
    type: tagType,
    value: tagValue,
    source,
    confidence,
    createdAt: new Date().toISOString()
  };
  
  tags.push(newTag);
  
  const query = `
    UPDATE addresses 
    SET tags = $1, updated_at = NOW()
    WHERE address = $2 AND chain = $3
    RETURNING *;
  `;
  
  const result = await pool.query(query, [
    JSON.stringify(tags),
    address,
    chain.toUpperCase()
  ]);
  
  return result.rows[0];
}

/**
 * 批量添加地址标签
 */
export async function addAddressTags(tagsArray) {
  checkDatabase();
  
  const results = [];
  for (const tagData of tagsArray) {
    try {
      const { address, chain, tagType, tagValue, source, confidence } = tagData;
      const result = await addAddressTag(address, chain, tagType, tagValue, source, confidence);
      results.push(result);
    } catch (error) {
      console.error(`[数据库] 添加标签失败:`, error.message);
      results.push({ error: error.message, tagData });
    }
  }
  
  return results;
}

/**
 * 保存或更新交易
 */
export async function upsertTransaction(txData) {
  checkDatabase();
  
  const {
    txHash,
    chain = 'SOLANA',
    fromAddress,
    toAddress,
    amount = 0,
    currency = 'SOL',
    timestamp,
    blockNumber,
    status = 'confirmed',
    metadata = {}
  } = txData;

  const query = `
    INSERT INTO transactions (tx_hash, chain, from_address, to_address, amount, currency, timestamp, block_number, status, metadata, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    ON CONFLICT (tx_hash, chain) 
    DO UPDATE SET
      status = EXCLUDED.status,
      metadata = EXCLUDED.metadata
    RETURNING *;
  `;

  const result = await pool.query(query, [
    txHash,
    chain.toUpperCase(),
    fromAddress,
    toAddress,
    amount,
    currency,
    timestamp ? new Date(timestamp) : new Date(),
    blockNumber,
    status,
    JSON.stringify(metadata)
  ]);

  return result.rows[0];
}

/**
 * 批量保存或更新交易
 */
export async function upsertTransactions(transactionsArray) {
  checkDatabase();
  
  const results = [];
  for (const txData of transactionsArray) {
    try {
      const result = await upsertTransaction(txData);
      results.push(result);
    } catch (error) {
      console.error(`[数据库] 保存交易失败 ${txData.txHash}:`, error.message);
      results.push({ error: error.message, txHash: txData.txHash });
    }
  }
  
  return results;
}

/**
 * 获取地址的交易列表
 */
export async function getAddressTransactions(address, chain = 'SOLANA', limit = 100, offset = 0) {
  checkDatabase();
  
  const query = `
    SELECT * FROM transactions 
    WHERE (from_address = $1 OR to_address = $1) AND chain = $2
    ORDER BY timestamp DESC
    LIMIT $3 OFFSET $4;
  `;
  
  const result = await pool.query(query, [address, chain.toUpperCase(), limit, offset]);
  return result.rows;
}

/**
 * 获取地址的关联地址
 */
export async function getConnectedAddresses(address, chain = 'SOLANA', limit = 50) {
  checkDatabase();
  
  const query = `
    SELECT DISTINCT 
      CASE 
        WHEN from_address = $1 THEN to_address 
        ELSE from_address 
      END AS connected_address,
      COUNT(*) AS tx_count,
      SUM(amount) AS total_amount
    FROM transactions
    WHERE (from_address = $1 OR to_address = $1) AND chain = $2
    GROUP BY connected_address
    ORDER BY tx_count DESC, total_amount DESC
    LIMIT $3;
  `;
  
  const result = await pool.query(query, [address, chain.toUpperCase(), limit]);
  return result.rows;
}

/**
 * 构建地址的交易图谱
 */
export async function buildAddressGraph(address, chain = 'SOLANA', maxDepth = 3, maxNodes = 100) {
  checkDatabase();
  
  // 这是一个简化的实现，实际应该使用递归查询
  const nodes = new Map();
  const links = [];
  const visited = new Set();
  
  async function traverse(currentAddress, depth) {
    if (depth > maxDepth || nodes.size >= maxNodes || visited.has(currentAddress)) {
      return;
    }
    
    visited.add(currentAddress);
    
    // 获取地址信息
    const addressInfo = await getAddress(currentAddress, chain);
    if (addressInfo) {
      nodes.set(currentAddress, {
        id: currentAddress,
        label: currentAddress,
        ...addressInfo
      });
    } else {
      nodes.set(currentAddress, {
        id: currentAddress,
        label: currentAddress,
        chain: chain.toUpperCase()
      });
    }
    
    // 获取关联交易
    const transactions = await getAddressTransactions(currentAddress, chain, 20, 0);
    
    for (const tx of transactions) {
      const connectedAddress = tx.from_address === currentAddress ? tx.to_address : tx.from_address;
      
      if (!visited.has(connectedAddress) && nodes.size < maxNodes) {
        links.push({
          source: currentAddress,
          target: connectedAddress,
          value: tx.amount,
          txHash: tx.tx_hash
        });
        
        if (depth < maxDepth) {
          await traverse(connectedAddress, depth + 1);
        }
      }
    }
  }
  
  await traverse(address, 0);
  
  return {
    nodes: Array.from(nodes.values()),
    links
  };
}

/**
 * 搜索高风险地址
 */
export async function searchHighRiskAddresses(chain = 'SOLANA', minRiskScore = 70, limit = 50) {
  checkDatabase();
  
  const query = `
    SELECT * FROM addresses 
    WHERE chain = $1 AND risk_score >= $2
    ORDER BY risk_score DESC
    LIMIT $3;
  `;
  
  const result = await pool.query(query, [chain.toUpperCase(), minRiskScore, limit]);
  return result.rows;
}

