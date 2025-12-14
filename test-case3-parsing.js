// 测试 Case 3 数据解析
import fs from 'fs';

const csvRaw = fs.readFileSync('data/case3/跨链-以太坊部分.csv', 'utf-8');

function parseCsvLine(line) {
  return line.split(',').map(field => field.trim());
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
      obj[header] = values[index] || '';
    });
    
    data.push(obj);
  }
  
  return data;
}

const transactions = parseCsv(csvRaw);

console.log('解析的交易数:', transactions.length);
console.log('\n前3条交易:');
transactions.slice(0, 3).forEach((tx, i) => {
  console.log(`  ${i+1}. From: ${tx.From}, To: ${tx.To}, Amount: ${tx.Amount}`);
});

// 统计地址
const addresses = new Set();
transactions.forEach(tx => {
  addresses.add(tx.From.toLowerCase());
  addresses.add(tx.To.toLowerCase());
});

console.log('\n唯一地址数:', addresses.size);

// 统计主要发送者
const fromCount = new Map();
transactions.forEach(tx => {
  const from = tx.From.toLowerCase();
  fromCount.set(from, (fromCount.get(from) || 0) + 1);
});

const topSenders = Array.from(fromCount.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

console.log('\n主要发送者（前10）:');
topSenders.forEach(([addr, count], i) => {
  console.log(`  ${i+1}. ${addr.substring(0, 10)}... (${count} 次)`);
});

// 统计有 NameTag 的地址
const withNameTag = transactions.filter(tx => tx.To_NameTag).length;
console.log('\n有 To_NameTag 的交易数:', withNameTag);

const uniqueNameTags = new Set();
transactions.forEach(tx => {
  if (tx.To_NameTag) uniqueNameTags.add(tx.To_NameTag);
});
console.log('唯一的 NameTag 数:', uniqueNameTags.size);
console.log('NameTag 列表:', Array.from(uniqueNameTags).slice(0, 10));
