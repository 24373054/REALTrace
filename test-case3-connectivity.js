import fs from 'fs';

const csv = fs.readFileSync('data/case3/跨链-以太坊部分.csv', 'utf-8');

function parseCsvLine(line) {
  return line.split(',').map(field => field.trim());
}

const lines = csv.trim().split(/\r?\n/);
const headers = parseCsvLine(lines[0]);

// 构建图
const graph = new Map();
for (let i = 1; i < lines.length; i++) {
  const values = parseCsvLine(lines[i]);
  const obj = {};
  headers.forEach((h, idx) => obj[h] = values[idx]);
  
  const from = obj['From'].toLowerCase();
  const to = obj['To'].toLowerCase();
  
  if (!graph.has(from)) graph.set(from, new Set());
  if (!graph.has(to)) graph.set(to, new Set());
  
  graph.get(from).add(to);
}

console.log('总节点数:', graph.size);

// 从主要发送者开始 BFS
const mainSender = '0xac18d21721d4702fce58ae775ed9c1bd18faac88';
const visited = new Set();
const queue = [mainSender];
visited.add(mainSender);

while (queue.length > 0) {
  const current = queue.shift();
  const neighbors = graph.get(current) || new Set();
  
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      visited.add(neighbor);
      queue.push(neighbor);
    }
  }
}

console.log('从主要发送者可达的节点数:', visited.size);
console.log('孤立节点数:', graph.size - visited.size);
