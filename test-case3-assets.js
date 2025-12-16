// 测试 Case 3 资产字段解析
import fs from 'fs';

const csvRaw = fs.readFileSync('data/case3/跨链-以太坊部分.csv', 'utf-8');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      // 检查是否是转义的引号
      if (i + 1 < line.length && line[i + 1] === quoteChar) {
        current += char;
        i++; // 跳过下一个引号
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // 添加最后一个字段
  result.push(current.trim());
  
  return result;
}

function parseCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  
  const headers = parseCsvLine(lines[0]);
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCsvLine(line);
    const obj = {};
    
    headers.forEach((header, index) => {
      let value = values[index] || '';
      // 移除字段值周围可能的引号
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      obj[header] = value;
    });
    
    data.push(obj);
  }
  
  return data;
}

const transactions = parseCsv(csvRaw);

console.log('解析的交易数:', transactions.length);

// 统计所有资产类型
const assetCounts = new Map();
transactions.forEach(tx => {
  const asset = tx.Asset || '未知';
  assetCounts.set(asset, (assetCounts.get(asset) || 0) + 1);
});

console.log('\n资产类型统计:');
const sortedAssets = Array.from(assetCounts.entries()).sort((a, b) => b[1] - a[1]);
sortedAssets.forEach(([asset, count], i) => {
  console.log(`  ${i+1}. "${asset}" - ${count} 次`);
});

// 检查前10条交易的完整Asset字段
console.log('\n前10条交易的Asset字段:');
transactions.slice(0, 10).forEach((tx, i) => {
  console.log(`  ${i+1}. Asset: "${tx.Asset}"`);
});

// 检查是否有引号问题
console.log('\n检查Asset字段中的引号问题:');
const assetsWithQuotes = transactions.filter(tx => {
  const asset = tx.Asset || '';
  return asset.includes('"') || asset.includes("'");
});

console.log(`有引号的Asset字段数: ${assetsWithQuotes.length}`);
if (assetsWithQuotes.length > 0) {
  console.log('示例:');
  assetsWithQuotes.slice(0, 5).forEach((tx, i) => {
    console.log(`  ${i+1}. "${tx.Asset}"`);
  });
}

// 检查Value (USD)字段
console.log('\n检查Value (USD)字段:');
transactions.slice(0, 5).forEach((tx, i) => {
  console.log(`  ${i+1}. Value (USD): "${tx['Value (USD)']}"`);
});
