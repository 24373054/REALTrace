# MatrixTrace - 区块链资金流向可视化追踪系统

## 项目概述

**MatrixTrace** (原名 ChainTrace) 是一个专业的区块链资金流向可视化分析工具，类似于 MistTrack，用于追踪和分析链上交易路径、识别风险地址、可视化资金流动，并提供 AI 驱动的智能分析报告。

### 核心定位
- **链上情报分析**: 追踪黑客攻击、洗钱路径、混币器使用
- **风险评估工具**: 识别钓鱼地址、高风险交易、可疑资金流
- **可视化平台**: 交互式图谱展示复杂的资金流向关系
- **AI 辅助调查**: 基于 DeepSeek AI 的智能分析和报告生成

### 技术栈
- **前端**: React 19 + TypeScript + Vite
- **可视化**: D3.js (SVG) + PixiJS (WebGL)
- **UI 框架**: TailwindCSS
- **AI 集成**: DeepSeek API (兼容 OpenAI API)
- **区块链**: Solana RPC + Ethereum RPC (支持多链)
- **数据库**: PostgreSQL (可选)

---

## 核心功能

### 1. 多链支持
支持 12+ 条主流区块链：
- **主流公链**: Solana, Ethereum, Bitcoin, BNB Chain, Polygon
- **Layer 2**: Arbitrum, Optimism, Base
- **其他**: Avalanche, Tron
- **隐私币**: Monero (XMR), Zcash (ZEC) - 特殊追踪方法

### 2. 交易图谱可视化

#### 标准视图 (D3.js SVG)
- **力导向图布局**: 自动计算节点位置，展示资金流向关系
- **交互式操作**: 缩放、拖拽、节点展开、深度控制
- **节点分类**:
  - 🟢 ROOT: 查询的根地址（绿色五角星）
  - 🔴 PHISHING: 钓鱼/黑客地址（红色三角形）
  - 🟡 CEX: 中心化交易所（黄色圆形）
  - 🟣 MIXER: 混币器（紫色菱形）
  - ⚪ NORMAL: 普通地址（灰色圆形）

#### 赛博视图 (PixiJS WebGL)
- **高性能渲染**: 支持 1000+ 节点的流畅交互
- **树形布局**: 清晰展示资金流向层级关系
- **动画效果**: 
  - 鼓包动画：模拟资金流动
  - 虚线边框：标识特殊节点（混币器、交易所）
  - 六边形网格背景：赛博朋克风格
- **实时交互**: 拖拽节点、点击选中、画布缩放

### 3. 交易分析面板
- **入账/出账分类**: 自动分类并统计转入/转出交易
- **多维度筛选**:
  - 代币类型过滤 (ETH, SOL, USDT, etc.)
  - 金额排序 (升序/降序)
  - 视图模式 (全部/只入账/只出账)
- **风险标识**: 实时显示地址风险评分和标签
- **区块链浏览器集成**: 一键跳转 Solscan/Etherscan 查看详情

### 4. AI 智能分析

基于 **DeepSeek AI** 的智能分析引擎：
- **交易模式识别**: 自动识别洗钱、混币、分散转账等可疑模式
- **风险评估**: 综合分析地址行为、交易频率、金额分布
- **关键实体提取**: 识别关键节点（混币器、交易所、高风险地址）
- **自然语言报告**: 生成易读的中英文分析报告
- **可视化建议**: 提供进一步调查的方向和建议

### 5. 黑客链路追踪系统 (CyberTrace)
专门用于追踪黑客攻击和洗钱路径的高级功能：

#### 支持的案例类型
1. **Case 1: Bybit 多币种洗钱**
   - 追踪 ETH、stETH、mETH、cmETH、USDT 等多币种流转
   - 涉及 Lido、Mantle 等 DeFi 协议

2. **Case 2: KuCoin 混币器洗钱**
   - Tornado Cash 100 ETH 混币器分析
   - 14 笔存款 + 17 笔提款追踪

3. **Case 3: 跨链资金转移**
   - 以太坊跨链交易追踪
   - 多个跨链桥和路由器识别

4. **Case 4: 黑客攻击链路**
   - 完整的攻击资金流向追踪
   - 洗钱路径可视化

5. **Case 5: Bybit 质押洗钱**
   - 6000+ 笔交易分析
   - Beacon Depositor 质押合约洗钱

6. **Case 6: Monero 隐私币追踪**
   - 环签名分析
   - 时间启发式追踪
   - 跨链追踪方法

#### 特色功能
- **案例切换**: 下拉菜单快速切换不同案例
- **渲染模式**: PIXI (WebGL) / SVG (D3) 双模式
- **统计面板**: 实时显示节点数、链接数、交易量、威胁数
- **交易列表**: 侧边栏展示详细交易记录

---

## 数据架构

### 核心数据类型

```typescript
// 节点类型
enum AddressType {
  ROOT = 'ROOT',           // 查询根地址
  NORMAL = 'NORMAL',       // 普通地址
  PHISHING = 'PHISHING',   // 钓鱼/黑客
  CEX = 'CEX',             // 中心化交易所
  MIXER = 'MIXER'          // 混币器
}

// 图节点
interface GraphNode {
  id: string;              // 地址
  label: string;           // 显示标签
  type: AddressType;       // 节点类型
  balance: number;         // 余额
  currency: string;        // 币种
  riskScore: number;       // 风险评分 (0-100)
  tags: string[];          // 标签 (Phishing, CEX, Mixer, etc.)
  intelSources?: string[]; // 威胁情报来源
}

// 图链接
interface GraphLink {
  source: string | GraphNode;  // 发送方
  target: string | GraphNode;  // 接收方
  value: number;               // 金额
  txHash: string;              // 交易哈希
  timestamp: string;           // 时间戳
  token: string;               // 代币类型
}
```

### 数据来源

#### 1. RPC 节点查询
- **Solana**: Helius, QuickNode, Triton, Alchemy
- **Ethereum**: Infura, Alchemy, QuickNode
- **查询方法**:
  - Solana: `getSignaturesForAddress` + `getTransaction`
  - Ethereum: `eth_getBlockByNumber` + `eth_getLogs`

#### 2. 本地 CSV 数据
支持导入本地交易数据：
- **简单格式**: from, to, asset, amount, tx_hash
- **详细格式**: 
  - 交易数据 (tx_hash, from, to, amount, risk_score)
  - 地址数据 (address, risk_score, balance, tx_count)
  - 标签数据 (address, tag_type, tag_value, source)

#### 3. 威胁情报集成 (预留)
- SlowMist
- Chainalysis
- MistTrack
- Scamsniffer
- Blockscout

---

## 技术实现

### 前端架构

```
src/
├── components/
│   ├── Header.tsx              # 顶部导航栏
│   ├── GraphView.tsx           # D3.js 图谱视图
│   ├── AnalysisPanel.tsx       # 右侧分析面板
│   ├── LoginModal.tsx          # 登录模态框
│   ├── ReportDetailView.tsx    # AI 报告详情
│   └── cybertrace/
│       ├── HackerTraceView.tsx    # 黑客链路主视图
│       ├── CyberGraphPixi.tsx     # PixiJS 图谱
│       ├── CyberGraph.tsx         # D3.js 图谱
│       ├── TransactionList.tsx    # 交易列表
│       ├── data.ts                # Case 1 数据加载
│       ├── kucoinData.ts          # Case 2 数据加载
│       ├── case3Data.ts           # Case 3 数据加载
│       ├── case4Data.ts           # Case 4 数据加载
│       ├── case5Data.ts           # Case 5 数据加载
│       ├── case6Data.ts           # Case 6 数据加载
│       ├── colorUtils.ts          # 颜色工具
│       └── utils.ts               # 工具函数
├── services/
│   ├── api.ts                  # API 统一入口
│   ├── solanaService.ts        # Solana RPC 服务
│   ├── ethereumService.ts      # Ethereum RPC 服务
│   ├── geminiService.ts        # AI 分析服务
│   ├── hackerTraceService.ts   # 黑客链路服务
│   └── mockData.ts             # Mock 数据
├── types.ts                    # 类型定义
└── App.tsx                     # 主应用
```

### 关键算法

#### 1. 深度过滤算法
从根节点出发，使用 BFS 遍历，限制显示深度：
```typescript
const applyDepthFilter = (graph: GraphData, depthLimit: number) => {
  const root = graph.nodes.find(n => n.type === 'ROOT');
  const depthMap = new Map<string, number>();
  depthMap.set(root.id, 0);
  
  let frontier = [root.id];
  for (let depth = 1; depth <= depthLimit; depth++) {
    const next: string[] = [];
    graph.links.forEach(l => {
      if (frontier.includes(l.source) && !depthMap.has(l.target)) {
        depthMap.set(l.target, depth);
        next.push(l.target);
      }
    });
    frontier = next;
  }
  
  return filterByDepthMap(graph, depthMap);
};
```

#### 2. 图合并算法
展开节点时，合并新旧图数据，避免重复：
```typescript
const mergeGraphs = (base: GraphData, incoming: GraphData) => {
  const nodesMap = new Map<string, GraphNode>();
  
  // 保留原节点类型（特别是 ROOT）
  base.nodes.forEach(n => nodesMap.set(n.id, n));
  incoming.nodes.forEach(n => {
    if (!nodesMap.has(n.id)) {
      nodesMap.set(n.id, n);
    }
  });
  
  // 去重链接
  const linksMap = new Map<string, GraphLink>();
  [...base.links, ...incoming.links].forEach(l => {
    const key = `${l.source}-${l.target}-${l.txHash}`;
    linksMap.set(key, l);
  });
  
  return {
    nodes: Array.from(nodesMap.values()),
    links: Array.from(linksMap.values())
  };
};
```

#### 3. 树形布局算法
用于 PixiJS 赛博视图的层级布局：
```typescript
const buildTreeLayout = () => {
  // 1. 构建邻接表
  const adjacencyMap = new Map<string, Set<string>>();
  
  // 2. BFS 构建树
  const treeRoot = { ...rootNode, children: [], depth: 0 };
  const queue = [treeRoot];
  
  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = adjacencyMap.get(current.id);
    
    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        const childNode = { ...neighborNode, depth: current.depth + 1 };
        current.children.push(childNode);
        queue.push(childNode);
      }
    });
  }
  
  // 3. 分配 Y 坐标（模拟 D3 tree separation）
  assignYPositions(treeRoot, 0, treeHeight);
  
  return treeRoot;
};
```

---

## 部署与运维

### 环境配置

#### 1. 环境变量 (.env)
```bash
# AI API
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_DEEPSEEK_API_BASE=https://api.deepseek.com/v1
VITE_DEEPSEEK_MODEL=deepseek-chat

# RPC 节点 (后端)
SOLANA_RPC_URL=https://your-solana-rpc-url
ETH_RPC_URL=https://your-eth-rpc-url

# 代理服务器 (前端)
VITE_SOLANA_PROXY_PATH=http://localhost:3001/api/solana
VITE_ETH_PROXY_PATH=http://localhost:3001/api/eth

# 数据库 (可选)
DATABASE_URL=postgresql://user:password@localhost:5432/chaintrace
```

#### 2. 启动命令
```bash
# 安装依赖
npm install

# 启动代理服务器 (推荐)
npm run proxy

# 启动前端应用
npm run dev

# 生产构建
npm run build
npm run preview
```

### 生产部署

#### 1. Nginx 配置
```nginx
server {
    listen 443 ssl http2;
    server_name trace.matrixlab.work;
    
    ssl_certificate /etc/letsencrypt/live/trace.matrixlab.work/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/trace.matrixlab.work/privkey.pem;
    
    # 前端应用
    location / {
        proxy_pass http://localhost:3113;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 后端代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 2. PM2 进程管理
```bash
# 启动前端
pm2 start npm --name "matrixtrace-frontend" -- run dev

# 启动后端代理
pm2 start npm --name "matrixtrace-proxy" -- run proxy

# 查看状态
pm2 status

# 查看日志
pm2 logs matrixtrace-frontend

# 设置开机自启
pm2 startup
pm2 save
```

#### 3. SSL 证书
```bash
# 申请证书
sudo certbot --nginx -d trace.matrixlab.work

# 自动续期
sudo certbot renew --dry-run
```

---

## 使用指南

### 基础操作

#### 1. 地址查询
1. 在顶部搜索框输入地址
2. 选择区块链网络 (Solana/Ethereum/etc.)
3. 点击 "Check" 按钮
4. 等待图谱加载

#### 2. 图谱交互
- **缩放**: 鼠标滚轮
- **拖拽画布**: 按住空白区域拖动
- **拖拽节点**: 按住节点拖动
- **选中节点**: 点击节点
- **取消选中**: 点击空白区域

#### 3. 视图控制
- **深度控制**: 使用 +/- 按钮调整显示深度 (1-5 层)
- **视图模式**:
  - 全部: 显示所有交易
  - 入账: 只显示转入选中地址的交易
  - 出账: 只显示从选中地址转出的交易

#### 4. 节点展开
- **深度展开**: 点击 "展开一层" 按钮，基于现有数据增加显示深度
- **RPC 展开**: 点击 "向后端请求下一层"，从 RPC 节点拉取新交易

#### 5. AI 分析
1. 选中一个节点
2. 切换到 "AI Insight" 标签
3. 点击 "Generate Report" 按钮
4. 等待 AI 生成分析报告
5. 点击 "View Full Report" 查看完整报告

### 高级功能

#### 1. 黑客链路追踪
1. 点击工具栏中的 "黑客链路" 按钮
2. 或点击眼睛图标切换到赛博视图
3. 使用下拉菜单切换不同案例
4. 选择渲染模式 (PIXI WebGL / SVG D3)

#### 2. 数据导出
- **CSV**: 导出交易数据
- **SVG**: 导出矢量图
- **PNG**: 导出位图
- **PDF**: 导出分析报告

#### 3. 交易筛选
- **代币过滤**: 选择特定代币类型
- **金额排序**: 按金额升序/降序排列
- **风险筛选**: 查看高风险交易

---

## 案例研究

### Case 2: KuCoin 混币器洗钱分析

#### 背景
2020 年 9 月，KuCoin 交易所遭受黑客攻击，损失超过 2.8 亿美元。黑客使用 Tornado Cash 混币器洗钱。

#### 数据特征
- **交易数**: 31 笔 (14 笔存款 + 17 笔提款)
- **混币器**: Tornado Cash 100 ETH Pool
- **总金额**: 3100 ETH
- **时间跨度**: 2020-09-26 至 2020-09-27

#### 追踪方法
1. **识别混币器地址**: 
   - 0x910cbd523d972eb0a6f4cae4618ad62622b39dbf (Tornado Cash)
   
2. **分析存款模式**:
   - 14 笔存款，每笔 100 ETH
   - 来自不同的中间地址（分散策略）
   
3. **追踪提款路径**:
   - 17 笔提款，每笔 100 ETH
   - 提款地址分散，难以直接关联
   
4. **时间关联分析**:
   - 存款和提款时间间隔较短
   - 可能存在时间关联性

#### 可视化特征
- **紫色节点**: Tornado Cash 混币器（中心节点）
- **红色箭头**: 存款交易（流入混币器）
- **绿色箭头**: 提款交易（流出混币器）
- **橙色节点**: MAJOR HUB（资金汇聚点）

#### AI 分析结果
```
风险等级: CRITICAL

关键发现:
1. 检测到 Tornado Cash 混币器使用
2. 存款金额固定（100 ETH），符合混币器特征
3. 提款地址高度分散，疑似洗钱行为
4. 时间间隔短，可能存在关联性

建议:
1. 进一步追踪提款地址的后续交易
2. 分析提款地址之间的关联性
3. 结合链下情报进行综合分析
```

---

## 常见问题

### Q1: 为什么查询不到交易？
**A**: 可能的原因：
1. 地址格式错误（检查是否为有效地址）
2. 该地址在最近区块中没有交易
3. RPC 节点限制（Ethereum 仅扫描最近 100 个区块）
4. 网络连接问题

**解决方法**:
- 检查地址格式
- 尝试切换到 Solana 链（查询更高效）
- 检查 RPC 配置
- 查看浏览器控制台错误日志

### Q2: 节点展开失败？
**A**: 可能的原因：
1. RPC 节点响应超时
2. 该地址没有更多交易
3. API 限流

**解决方法**:
- 等待一段时间后重试
- 检查 RPC 配置
- 使用代理服务器

### Q3: AI 分析失败？
**A**: 可能的原因：
1. DeepSeek API Key 未配置
2. API 限流
3. 网络连接问题

**解决方法**:
- 检查 `.env` 文件中的 `VITE_DEEPSEEK_API_KEY`
- 等待一段时间后重试
- 检查网络连接

### Q4: 图谱渲染卡顿？
**A**: 可能的原因：
1. 节点数过多（>1000）
2. 浏览器性能不足

**解决方法**:
- 减少显示深度
- 切换到 PixiJS WebGL 渲染模式
- 使用视图过滤（只入账/只出账）

---

## 开发指南

### 添加新案例

#### 1. 准备数据
创建 CSV 文件，格式如下：
```csv
from,to,asset,amount,tx_hash
0xabc...,0xdef...,ETH,100.5,0x123...
```

#### 2. 创建数据加载器
```typescript
// components/cybertrace/case7Data.ts
import csvRaw from "../../data/case7/data.csv?raw";
import { parseCsv } from "./utils";

export const loadCase7Data = () => parseCsv(csvRaw);
```

#### 3. 注册案例
```typescript
// App.tsx
const hackerCases: CaseConfig[] = [
  // ... 现有案例
  {
    id: 'case7',
    name: 'Case 7: 你的案例名称',
    description: '案例描述',
    loader: loadCase7Data,
  },
];
```

### 添加新链支持

#### 1. 添加链类型
```typescript
// types.ts
export enum ChainType {
  // ... 现有链
  NEW_CHAIN = 'NEW_CHAIN',
}
```

#### 2. 创建服务
```typescript
// services/newChainService.ts
export const fetchNewChainGraph = async (address: string) => {
  // 实现 RPC 查询逻辑
  return { nodes: [], links: [] };
};
```

#### 3. 集成到 API
```typescript
// services/api.ts
export const fetchGraph = async (address: string, chain: ChainType) => {
  if (chain === ChainType.NEW_CHAIN) {
    return await fetchNewChainGraph(address);
  }
  // ...
};
```

---

## 性能优化

### 前端优化
1. **虚拟化列表**: 大量交易时使用虚拟滚动
2. **懒加载**: 按需加载图谱数据
3. **Web Worker**: 将计算密集型任务移到 Worker
4. **缓存**: 使用 React Query 缓存 API 响应

### 渲染优化
1. **PixiJS WebGL**: 大规模图谱使用 WebGL 渲染
2. **节点裁剪**: 限制显示深度，减少渲染节点数
3. **动画优化**: 使用 requestAnimationFrame
4. **内存管理**: 及时清理不用的图形对象

### 后端优化
1. **连接池**: 使用 RPC 连接池
2. **批量查询**: 合并多个 RPC 请求
3. **缓存**: 缓存常用地址的交易数据
4. **限流**: 防止 API 滥用

---

## 安全考虑

### API Key 保护
- ❌ 不要在前端直接暴露 API Key
- ✅ 使用后端代理服务器
- ✅ 使用环境变量管理密钥
- ✅ 定期轮换 API Key

### 输入验证
- ✅ 验证地址格式
- ✅ 防止 SQL 注入
- ✅ 防止 XSS 攻击
- ✅ 限制查询频率

### 数据隐私
- ✅ 不存储用户查询历史
- ✅ 使用 HTTPS 加密传输
- ✅ 遵守 GDPR 等隐私法规

---

## 未来规划

### 短期 (1-3 个月)
- [ ] 支持更多区块链 (Cosmos, Polkadot, etc.)
- [ ] 增强 AI 分析能力（多模型支持）
- [ ] 添加实时监控功能
- [ ] 优化移动端体验

### 中期 (3-6 个月)
- [ ] 集成更多威胁情报源
- [ ] 支持自定义标签和注释
- [ ] 添加团队协作功能
- [ ] 开发浏览器插件

### 长期 (6-12 个月)
- [ ] 构建威胁情报数据库
- [ ] 开发 API 服务
- [ ] 支持私有化部署
- [ ] 机器学习模型训练

---

## 贡献指南

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 编写单元测试
- 添加代码注释

### 提交规范
```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建/工具链更新
```

### Pull Request
1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 PR
5. 等待审核

---

## 许可证

本项目采用 MIT 许可证。

---

## 联系方式

- **项目地址**: https://trace.matrixlab.work
- **GitHub**: [项目仓库]
- **文档**: [在线文档]
- **问题反馈**: [Issue Tracker]

---

## 致谢

感谢以下开源项目和服务：
- React & TypeScript
- D3.js & PixiJS
- TailwindCSS
- DeepSeek AI
- Solana & Ethereum
- 所有贡献者

---

**最后更新**: 2025-01-07
**版本**: 1.0.0
**维护者**: MatrixLab Team
