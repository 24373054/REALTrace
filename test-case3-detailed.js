// 详细检查 Case 3 数据解析问题
import fs from 'fs';

const csvRaw = fs.readFileSync('data/case3/跨链-以太坊部分.csv', 'utf-8');

// 使用改进的解析函数（与case3Data.ts相同）
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

const lines = csvRaw.trim().split(/\r?\n/);
console.log('总行数:', lines.length);

const headers = parseCsvLine(lines[0]);
console.log('列数:', headers.length);
console.log('列名:', headers);

// 检查前20行
console.log('\n=== 检查前20行 ===');
for (let i = 1; i <= Math.min(20, lines.length - 1); i++) {
  const line = lines[i].trim();
  const values = parseCsvLine(line);
  
  console.log(`\n行 ${i}:`);
  console.log('  原始行:', line.substring(0, 100) + (line.length > 100 ? '...' : ''));
  console.log('  解析列数:', values.length);
  
  if (values.length !== headers.length) {
    console.log('  ⚠️ 列数不匹配! 期望:', headers.length, '实际:', values.length);
    
    // 显示所有字段
    values.forEach((value, idx) => {
      const header = idx < headers.length ? headers[idx] : `额外列${idx - headers.length + 1}`;
      console.log(`  ${header}: "${value}"`);
    });
  } else {
    // 只显示Asset和Value (USD)字段
    const assetIndex = headers.indexOf('Asset');
    const valueIndex = headers.indexOf('Value (USD)');
    
    if (assetIndex !== -1) {
      console.log(`  Asset: "${values[assetIndex]}"`);
    }
    if (valueIndex !== -1) {
      console.log(`  Value (USD): "${values[valueIndex]}"`);
    }
  }
}

// 检查所有行中列数不匹配的情况
console.log('\n=== 检查所有行中的列数不匹配 ===');
let mismatchCount = 0;
const mismatchLines = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const values = parseCsvLine(line);
  if (values.length !== headers.length) {
    mismatchCount++;
    mismatchLines.push({ line: i + 1, values: values.length, expected: headers.length });
    
    if (mismatchLines.length <= 5) {
      console.log(`行 ${i + 1}: 期望 ${headers.length} 列, 实际 ${values.length} 列`);
      
      // 检查Asset字段位置
      const assetIndex = headers.indexOf('Asset');
      if (assetIndex < values.length) {
        console.log(`  Asset字段: "${values[assetIndex]}"`);
      } else {
        console.log(`  Asset字段: 不存在 (索引 ${assetIndex} >= ${values.length})`);
      }
      
      // 检查Value (USD)字段位置
      const valueIndex = headers.indexOf('Value (USD)');
      if (valueIndex < values.length) {
        console.log(`  Value (USD)字段: "${values[valueIndex]}"`);
      } else {
        console.log(`  Value (USD)字段: 不存在 (索引 ${valueIndex} >= ${values.length})`);
      }
    }
  }
}

console.log(`\n总列数不匹配行数: ${mismatchCount}/${lines.length - 1} (${(mismatchCount/(lines.length-1)*100).toFixed(2)}%)`);

// 检查Asset字段包含数字的行
console.log('\n=== 检查Asset字段包含数字的行 ===');
let assetWithNumbers = 0;
for (let i = 1; i < Math.min(100, lines.length); i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const values = parseCsvLine(line);
  const assetIndex = headers.indexOf('Asset');
  
  if (assetIndex < values.length) {
    const assetValue = values[assetIndex];
    // 移除引号
    const cleanAsset = assetValue.replace(/^["']|["']$/g, '');
    
    // 检查是否包含数字
    if (/\d/.test(cleanAsset)) {
      assetWithNumbers++;
      if (assetWithNumbers <= 5) {
        console.log(`行 ${i + 1}: Asset = "${cleanAsset}"`);
      }
    }
  }
}

console.log(`Asset字段包含数字的行数: ${assetWithNumbers}`);
