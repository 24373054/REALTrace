// 检查有问题的行（列数不匹配）
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
const headers = parseCsvLine(lines[0]);

console.log('检查有问题的行（列数不匹配）:');
console.log('================================');

// 找到所有列数不匹配的行
const problemLines = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const values = parseCsvLine(line);
  if (values.length !== headers.length) {
    problemLines.push({ lineNumber: i + 1, values, originalLine: line });
  }
}

console.log(`找到 ${problemLines.length} 个有问题的行`);

// 详细检查每个有问题的行
problemLines.forEach((problem, idx) => {
  console.log(`\n=== 问题行 ${idx + 1}: 行号 ${problem.lineNumber} ===`);
  console.log(`原始行（前200字符）: ${problem.originalLine.substring(0, 200)}${problem.originalLine.length > 200 ? '...' : ''}`);
  console.log(`解析列数: ${problem.values.length} (期望: ${headers.length})`);
  
  console.log('\n解析的字段:');
  problem.values.forEach((value, colIdx) => {
    const header = colIdx < headers.length ? headers[colIdx] : `额外列${colIdx - headers.length + 1}`;
    console.log(`  [${colIdx}] ${header}: "${value}"`);
  });
  
  // 特别检查Asset和Value (USD)字段
  const assetIndex = headers.indexOf('Asset');
  const valueIndex = headers.indexOf('Value (USD)');
  
  console.log('\n关键字段检查:');
  if (assetIndex < problem.values.length) {
    console.log(`  Asset (索引 ${assetIndex}): "${problem.values[assetIndex]}"`);
  } else {
    console.log(`  Asset: 字段不存在 (索引 ${assetIndex} >= ${problem.values.length})`);
  }
  
  if (valueIndex < problem.values.length) {
    console.log(`  Value (USD) (索引 ${valueIndex}): "${problem.values[valueIndex]}"`);
  } else {
    console.log(`  Value (USD): 字段不存在 (索引 ${valueIndex} >= ${problem.values.length})`);
  }
  
  // 检查是否有数字出现在Asset字段位置
  if (assetIndex < problem.values.length) {
    const assetValue = problem.values[assetIndex];
    if (assetValue && /\d/.test(assetValue)) {
      console.log(`  ⚠️ Asset字段包含数字: "${assetValue}"`);
    }
  }
});

// 现在测试case3Data.ts中的修复逻辑
console.log('\n\n=== 测试case3Data.ts中的修复逻辑 ===');
console.log('====================================');

// 模拟case3Data.ts中的修复逻辑
function fixMismatchedValues(values, headers) {
  if (values.length > headers.length) {
    // 找到可能是引号内逗号导致的额外列
    const fixedValues = [];
    let j = 0;
    let inQuotes = false;
    
    while (j < values.length) {
      let value = values[j];
      
      // 检查是否以引号开始但未以引号结束
      if ((value.startsWith('"') && !value.endsWith('"')) || 
          (value.startsWith("'") && !value.endsWith("'"))) {
        inQuotes = true;
        let combinedValue = value;
        j++;
        
        // 继续合并直到找到结束引号
        while (j < values.length && inQuotes) {
          combinedValue += ',' + values[j];
          if (values[j].endsWith('"') || values[j].endsWith("'")) {
            inQuotes = false;
          }
          j++;
        }
        fixedValues.push(combinedValue);
      } else {
        fixedValues.push(value);
        j++;
      }
    }
    
    // 如果修复后的列数仍然不匹配，只取前 headers.length 列
    if (fixedValues.length >= headers.length) {
      return fixedValues.slice(0, headers.length);
    } else {
      // 填充缺失的列
      const result = [...values];
      while (result.length < headers.length) {
        result.push('');
      }
      return result;
    }
  } else if (values.length < headers.length) {
    // 填充缺失的列
    const result = [...values];
    while (result.length < headers.length) {
      result.push('');
    }
    return result;
  }
  
  return values;
}

// 测试修复逻辑
problemLines.forEach((problem, idx) => {
  console.log(`\n修复问题行 ${idx + 1} (行号 ${problem.lineNumber}):`);
  const fixedValues = fixMismatchedValues(problem.values, headers);
  console.log(`修复后列数: ${fixedValues.length}`);
  
  const assetIndex = headers.indexOf('Asset');
  const valueIndex = headers.indexOf('Value (USD)');
  
  if (assetIndex < fixedValues.length) {
    console.log(`  修复后Asset: "${fixedValues[assetIndex]}"`);
  }
  if (valueIndex < fixedValues.length) {
    console.log(`  修复后Value (USD): "${fixedValues[valueIndex]}"`);
  }
});
