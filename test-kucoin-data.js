// 快速测试 KuCoin 数据加载
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('测试 KuCoin 数据文件...\n');

const dataDir = path.join(__dirname, 'data', 'KUCOIN数据');

const files = [
  '交易数据.csv',
  '地址数据.csv',
  '标签数据.csv'
];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    console.log(`✓ ${file}:`);
    console.log(`  - 总行数: ${lines.length}`);
    console.log(`  - 表头: ${lines[0].substring(0, 80)}...`);
    console.log(`  - 第一行数据: ${lines[1] ? lines[1].substring(0, 80) + '...' : '无数据'}`);
    console.log('');
  } catch (error) {
    console.log(`✗ ${file}: 读取失败 - ${error.message}\n`);
  }
});

console.log('测试完成！');
