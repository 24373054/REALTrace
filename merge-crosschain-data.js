import fs from 'fs';
import path from 'path';

// 读取文件
const newDataPath = 'data/case3/跨链数据-tag.csv';
const originalDataPath = 'data/case3/跨链-以太坊部分.csv';

const newData = fs.readFileSync(newDataPath, 'utf-8');
const originalData = fs.readFileSync(originalDataPath, 'utf-8');

// 解析新数据
const newLines = newData.trim().split('\n');
const newHeader = newLines[0]; // Transaction Hash,Status,DateTime (UTC),From,From_Nametag,To,To_Nametag,Amount,Asset,

// 原文件的header
// Transaction Hash,Status,Type,Method,Block,Age,From,From_NameTag,From_Note,To,To_NameTag,To_Note,Amount,Value (USD),Asset,Txn Fee

// 获取原文件中已有的交易哈希
const originalLines = originalData.trim().split('\n');
const existingHashes = new Set();
for (let i = 1; i < originalLines.length; i++) {
  const hash = originalLines[i].split(',')[0];
  if (hash) existingHashes.add(hash.toLowerCase());
}

console.log(`原文件共有 ${originalLines.length - 1} 条记录`);
console.log(`新文件共有 ${newLines.length - 1} 条记录`);

// 转换新数据格式并过滤重复
const convertedLines = [];
for (let i = 1; i < newLines.length; i++) {
  const line = newLines[i].trim();
  if (!line) continue;
  
  // 解析CSV（处理带逗号的数字如 "170,000"）
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  
  // 新格式: Transaction Hash,Status,DateTime (UTC),From,From_Nametag,To,To_Nametag,Amount,Asset,
  const [txHash, status, dateTime, from, fromTag, to, toTag, amount, asset] = parts;
  
  // 跳过重复的交易
  if (txHash && existingHashes.has(txHash.toLowerCase())) {
    console.log(`跳过重复交易: ${txHash}`);
    continue;
  }
  
  // 转换日期格式: 2025/12/15 -> 2025-12-15T00:00:00.000000Z
  let formattedDate = '';
  if (dateTime) {
    const dateParts = dateTime.split('/');
    if (dateParts.length === 3) {
      formattedDate = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}T00:00:00.000000Z`;
    } else {
      formattedDate = dateTime;
    }
  }
  
  // 转换为原格式: Transaction Hash,Status,Type,Method,Block,Age,From,From_NameTag,From_Note,To,To_NameTag,To_Note,Amount,Value (USD),Asset,Txn Fee
  // Type: 设为 ERC-20
  // Method: 设为 transfer
  // Block: 留空
  // Age: 使用转换后的日期
  // From_Note, To_Note: 留空
  // Value (USD): 留空
  // Txn Fee: 留空
  
  const convertedLine = [
    txHash || '',           // Transaction Hash
    status || '',           // Status
    'ERC-20',              // Type
    'transfer',            // Method
    '',                    // Block
    formattedDate,         // Age
    from || '',            // From
    fromTag || '',         // From_NameTag
    '',                    // From_Note
    to || '',              // To
    toTag || '',           // To_NameTag
    '',                    // To_Note
    amount || '',          // Amount
    '',                    // Value (USD)
    asset || '',           // Asset
    ''                     // Txn Fee
  ].join(',');
  
  convertedLines.push(convertedLine);
}

console.log(`新增 ${convertedLines.length} 条记录`);

// 合并数据
const mergedData = originalData.trim() + '\n' + convertedLines.join('\n');

// 写入合并后的文件
fs.writeFileSync(originalDataPath, mergedData);

console.log('合并完成！');
console.log(`合并后共有 ${originalLines.length - 1 + convertedLines.length} 条记录`);
