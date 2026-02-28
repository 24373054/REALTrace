# ChainTrace 功能模块设计文档

## 1. 模块总览

### 1.1 功能架构图

```
ChainTrace 功能模块
├── 用户管理模块
│   ├── 注册登录
│   ├── 权限管理
│   └── 账户设置
├── 链上溯源模块 ⭐
│   ├── 地址追踪
│   ├── 交易分析
│   ├── 资金流向
│   └── 混币穿透
├── 智能分析模块 ⭐
│   ├── 风险评分
│   ├── 实体识别
│   ├── 行为分析
│   └── 异常检测
├── 可视化模块
│   ├── 交易图谱
│   ├── 资金流向图
│   ├── 统计报表
│   └── 时间轴分析
├── 报告生成模块
│   ├── 自动报告
│   ├── 定制报告
│   └── 报告导出
├── 监控预警模块
│   ├── 实时监控
│   ├── 规则配置
│   └── 告警通知
├── 标签管理模块
│   ├── 地址标签
│   ├── 实体标签
│   └── 标签库管理
└── 系统管理模块
    ├── 用户管理
    ├── 权限配置
    ├── 系统配置
    └── 审计日志
```

## 2. 核心模块详细设计

### 2.1 链上溯源模块 ⭐

#### 2.1.1 地址追踪功能

**功能描述**
- 支持多链地址查询（BTC/ETH/USDT/TRX/SOL等）
- 显示地址基本信息、余额、交易历史
- 关联地址挖掘和聚类分析
- 地址标签和风险评分

**输入参数**
```typescript
interface AddressQueryParams {
  chain: string;           // 链类型
  address: string;         // 地址
  depth?: number;          // 追踪深度（默认3）
  includeTokens?: boolean; // 是否包含代币交易
  timeRange?: {            // 时间范围
    start: Date;
    end: Date;
  };
}
```

**输出结果**
```typescript
interface AddressInfo {
  chain: string;
  address: string;
  balance: string;
  labels: Label[];
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  firstSeen: Date;
  lastSeen: Date;
  txCount: number;
  relatedAddresses: RelatedAddress[];
  entity?: Entity;
}
```

**业务流程**
```
用户输入地址
    ↓
验证地址格式
    ↓
查询链上数据
    ↓
计算风险评分
    ↓
关联地址分析
    ↓
返回结果展示
```

#### 2.1.2 交易分析功能

**功能描述**
- 交易详情查询和解析
- 智能合约交易解析
- 交易分类和标注
- 交易关系挖掘

**交易类型分类**
```typescript
enum TransactionType {
  TRANSFER = 'transfer',           // 普通转账
  CONTRACT_CALL = 'contract_call', // 合约调用
  TOKEN_TRANSFER = 'token_transfer', // 代币转账
  SWAP = 'swap',                   // 交易所兑换
  BRIDGE = 'bridge',               // 跨链桥
  MIXER = 'mixer',                 // 混币器
  STAKING = 'staking',             // 质押
  LENDING = 'lending',             // 借贷
  NFT = 'nft',                     // NFT交易
}
```

**交易详情结构**
```typescript
interface TransactionDetail {
  txHash: string;
  chain: string;
  blockNumber: number;
  timestamp: Date;
  from: string;
  to: string;
  value: string;
  fee: string;
  status: 'success' | 'failed' | 'pending';
  type: TransactionType;
  tokenTransfers?: TokenTransfer[];
  contractInteraction?: ContractInteraction;
  riskFlags: RiskFlag[];
}
```

#### 2.1.3 资金流向分析

**功能描述**
- 追踪资金来源和去向
- 多跳路径分析（支持100+跳）
- 资金聚合和分散模式识别
- 最短路径和关键节点分析

**路径查询参数**
```typescript
interface PathQueryParams {
  chain: string;
  fromAddress: string;
  toAddress: string;
  maxDepth: number;        // 最大深度
  minAmount?: string;      // 最小金额过滤
  timeRange?: TimeRange;
  algorithm: 'bfs' | 'dfs' | 'shortest'; // 算法选择
}
```

**路径结果**
```typescript
interface PathResult {
  paths: Path[];
  totalPaths: number;
  shortestPath: Path;
  keyNodes: Address[];     // 关键节点
  totalAmount: string;
  riskLevel: string;
}

interface Path {
  nodes: Address[];
  edges: Transaction[];
  length: number;
  totalAmount: string;
  riskScore: number;
}
```

#### 2.1.4 混币穿透功能

**功能描述**
- 识别混币器交易模式
- 概率追踪混币后资金流向
- 隐私币（Monero/Zcash）标记
- Tornado Cash 等混币协议分析

**混币器识别规则**
```typescript
interface MixerPattern {
  type: 'tornado' | 'wasabi' | 'samourai' | 'other';
  confidence: number;      // 置信度 0-1
  indicators: string[];    // 识别指标
  inputAddresses: string[];
  outputAddresses: string[];
  mixingAmount: string;
  timestamp: Date;
}
```

**穿透算法**
```
混币器检测
    ↓
输入输出地址聚类
    ↓
金额模式匹配
    ↓
时间序列分析
    ↓
概率计算
    ↓
可能路径输出
```

### 2.2 智能分析模块 ⭐

#### 2.2.1 风险评分系统

**评分维度**
```typescript
interface RiskScoreFactors {
  // 交易行为（40%）
  transactionBehavior: {
    frequency: number;           // 交易频率异常
    amount: number;              // 金额异常
    pattern: number;             // 模式异常
  };
  
  // 关联关系（30%）
  relationships: {
    blacklistConnection: number; // 黑名单关联
    mixerUsage: number;          // 混币器使用
    highRiskInteraction: number; // 高风险交互
  };
  
  // 地址属性（20%）
  addressAttributes: {
    age: number;                 // 地址年龄
    balance: number;             // 余额异常
    diversity: number;           // 交易多样性
  };
  
  // 外部情报（10%）
  externalIntel: {
    reportedScam: number;        // 诈骗举报
    sanctionList: number;        // 制裁名单
    knownEntity: number;         // 已知实体
  };
}
```

**评分算法**
```python
def calculate_risk_score(address: str) -> RiskScore:
    """
    风险评分算法
    总分 0-100，分为5个等级
    """
    factors = analyze_risk_factors(address)
    
    # 加权计算
    score = (
        factors.transactionBehavior * 0.4 +
        factors.relationships * 0.3 +
        factors.addressAttributes * 0.2 +
        factors.externalIntel * 0.1
    )
    
    # 等级划分
    if score >= 80:
        level = 'critical'
    elif score >= 60:
        level = 'high'
    elif score >= 40:
        level = 'medium'
    elif score >= 20:
        level = 'low'
    else:
        level = 'safe'
    
    return RiskScore(score=score, level=level, factors=factors)
```

#### 2.2.2 实体识别与聚类

**实体类型**
```typescript
enum EntityType {
  EXCHANGE = 'exchange',           // 交易所
  MIXER = 'mixer',                 // 混币器
  GAMBLING = 'gambling',           // 赌博平台
  SCAM = 'scam',                   // 诈骗
  PHISHING = 'phishing',           // 钓鱼
  RANSOMWARE = 'ransomware',       // 勒索软件
  DARKNET = 'darknet',             // 暗网市场
  DEFI = 'defi',                   // DeFi协议
  BRIDGE = 'bridge',               // 跨链桥
  WALLET = 'wallet',               // 钱包服务
  MINING_POOL = 'mining_pool',     // 矿池
  ICO = 'ico',                     // ICO项目
  NORMAL_USER = 'normal_user',     // 普通用户
}
```

**聚类算法**
```typescript
interface ClusteringParams {
  algorithm: 'heuristic' | 'ml' | 'graph';
  features: string[];      // 聚类特征
  threshold: number;       // 相似度阈值
}

interface ClusterResult {
  clusterId: string;
  addresses: string[];
  entity?: Entity;
  confidence: number;
  commonFeatures: string[];
}
```

**聚类规则**
- 共同输入启发式（Common Input Heuristic）
- 一次性找零启发式（One-time Change Heuristic）
- 行为模式相似性
- 时间序列相关性

#### 2.2.3 异常检测

**异常类型**
```typescript
enum AnomalyType {
  UNUSUAL_AMOUNT = 'unusual_amount',       // 异常金额
  UNUSUAL_FREQUENCY = 'unusual_frequency', // 异常频率
  UNUSUAL_PATTERN = 'unusual_pattern',     // 异常模式
  SUDDEN_ACTIVITY = 'sudden_activity',     // 突然活跃
  DORMANT_AWAKENING = 'dormant_awakening', // 休眠唤醒
  RAPID_MOVEMENT = 'rapid_movement',       // 快速转移
  CIRCULAR_FLOW = 'circular_flow',         // 循环流动
}
```

**检测算法**
```python
# 基于统计的异常检测
def detect_statistical_anomaly(transactions):
    """使用 Z-score 检测异常交易"""
    amounts = [tx.amount for tx in transactions]
    mean = np.mean(amounts)
    std = np.std(amounts)
    
    anomalies = []
    for tx in transactions:
        z_score = (tx.amount - mean) / std
        if abs(z_score) > 3:  # 3-sigma 规则
            anomalies.append({
                'transaction': tx,
                'z_score': z_score,
                'type': 'unusual_amount'
            })
    
    return anomalies

# 基于机器学习的异常检测
def detect_ml_anomaly(address_features):
    """使用 Isolation Forest 检测异常地址"""
    model = IsolationForest(contamination=0.1)
    predictions = model.fit_predict(address_features)
    
    anomalies = []
    for idx, pred in enumerate(predictions):
        if pred == -1:  # 异常
            anomalies.append({
                'address': addresses[idx],
                'anomaly_score': model.score_samples([address_features[idx]])[0]
            })
    
    return anomalies
```

#### 2.2.4 行为分析

**用户画像**
```typescript
interface UserProfile {
  address: string;
  userType: 'trader' | 'holder' | 'miner' | 'defi_user' | 'bot';
  activityLevel: 'high' | 'medium' | 'low';
  tradingPattern: {
    avgTransactionAmount: string;
    transactionFrequency: number;
    preferredTime: string;      // 活跃时间段
    preferredTokens: string[];
  };
  riskProfile: {
    riskTolerance: 'high' | 'medium' | 'low';
    mixerUsage: boolean;
    highRiskInteractions: number;
  };
  networkMetrics: {
    degree: number;              // 连接数
    betweenness: number;         // 中介中心性
    clustering: number;          // 聚类系数
  };
}
```

### 2.3 可视化模块

#### 2.3.1 交易图谱

**图谱配置**
```typescript
interface GraphConfig {
  layout: 'force' | 'circular' | 'hierarchical' | 'radial';
  nodeSize: 'fixed' | 'byBalance' | 'byDegree';
  edgeWidth: 'fixed' | 'byAmount';
  colorScheme: {
    safeNode: string;
    riskNode: string;
    targetNode: string;
    normalEdge: string;
    highValueEdge: string;
  };
  filters: {
    minAmount?: string;
    maxDepth?: number;
    hideSmallTransactions?: boolean;
  };
}
```

**交互功能**
- 节点点击：展开/折叠子节点
- 节点悬停：显示详细信息
- 节点拖拽：调整布局
- 缩放平移：查看全局/局部
- 路径高亮：显示特定路径
- 时间轴播放：动态展示交易过程

#### 2.3.2 统计报表

**报表类型**
```typescript
enum ReportType {
  TRANSACTION_SUMMARY = 'transaction_summary',   // 交易汇总
  RISK_ANALYSIS = 'risk_analysis',               // 风险分析
  ENTITY_REPORT = 'entity_report',               // 实体报告
  FLOW_ANALYSIS = 'flow_analysis',               // 流向分析
  TIME_SERIES = 'time_series',                   // 时序分析
  COMPARISON = 'comparison',                     // 对比分析
}
```

**图表组件**
- 折线图：交易趋势、余额变化
- 柱状图：交易量统计、风险分布
- 饼图：交易类型占比、实体分布
- 热力图：交易时间分布、地理分布
- 桑基图：资金流向
- 雷达图：风险维度评估

### 2.4 报告生成模块

#### 2.4.1 自动报告

**报告模板**
```typescript
interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  sections: ReportSection[];
  format: 'pdf' | 'html' | 'docx';
}

interface ReportSection {
  title: string;
  type: 'text' | 'table' | 'chart' | 'graph';
  dataSource: string;
  template: string;
}
```

**报告内容**
1. 执行摘要
   - 分析目标
   - 关键发现
   - 风险评估
   - 建议措施

2. 地址概况
   - 基本信息
   - 余额历史
   - 交易统计
   - 标签信息

3. 交易分析
   - 交易列表
   - 交易分类
   - 异常交易
   - 关键交易

4. 关系分析
   - 关联地址
   - 实体识别
   - 交易图谱
   - 资金流向

5. 风险评估
   - 风险评分
   - 风险因素
   - 风险事件
   - 合规建议

6. 附录
   - 数据来源
   - 分析方法
   - 技术说明

#### 2.4.2 报告导出

**导出格式**
- PDF：适合打印和分享
- HTML：适合在线查看
- DOCX：适合编辑
- CSV：原始数据导出
- JSON：API 数据导出

### 2.5 监控预警模块

#### 2.5.1 实时监控

**监控对象**
```typescript
interface MonitorTarget {
  id: string;
  type: 'address' | 'entity' | 'transaction_pattern';
  target: string;
  conditions: MonitorCondition[];
  alertChannels: AlertChannel[];
  status: 'active' | 'paused';
}

interface MonitorCondition {
  type: 'amount' | 'frequency' | 'risk_score' | 'blacklist';
  operator: '>' | '<' | '=' | 'contains';
  value: any;
  timeWindow?: number;  // 时间窗口（秒）
}
```

**监控规则示例**
```typescript
// 大额转账监控
{
  type: 'amount',
  operator: '>',
  value: '100000',
  timeWindow: 3600
}

// 高频交易监控
{
  type: 'frequency',
  operator: '>',
  value: 100,
  timeWindow: 3600
}

// 风险评分监控
{
  type: 'risk_score',
  operator: '>',
  value: 80
}
```

#### 2.5.2 告警通知

**通知渠道**
```typescript
enum AlertChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  IN_APP = 'in_app',
  TELEGRAM = 'telegram',
  SLACK = 'slack',
}

interface Alert {
  id: string;
  monitorId: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  data: any;
  timestamp: Date;
  status: 'new' | 'acknowledged' | 'resolved';
}
```

### 2.6 标签管理模块

#### 2.6.1 标签体系

**标签分类**
```typescript
interface LabelCategory {
  // 实体类型标签
  entityType: EntityType;
  
  // 风险标签
  riskLabels: [
    'scam',
    'phishing',
    'ransomware',
    'darknet',
    'sanctioned',
    'stolen_funds'
  ];
  
  // 服务标签
  serviceLabels: [
    'exchange',
    'wallet',
    'defi',
    'bridge',
    'mixer',
    'gambling'
  ];
  
  // 自定义标签
  customLabels: string[];
}
```

#### 2.6.2 标签来源

**数据来源**
- 官方标注：平台官方标注
- 用户提交：用户贡献标签
- 第三方数据：Chainalysis、慢雾等
- 自动识别：AI 自动标注
- 社区共享：社区协作标注

**标签置信度**
```typescript
interface Label {
  address: string;
  chain: string;
  labelType: string;
  labelValue: string;
  confidence: number;    // 0-1
  source: string;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 3. 用户端功能设计

### 3.1 C端（个人用户）功能

**核心功能**
- 地址查询（每日限额）
- 基础交易分析
- 简化版图谱展示
- 风险评分查看
- 报告查看（不可导出）

**会员权益**
```typescript
interface MembershipTier {
  free: {
    dailyQueries: 10,
    maxDepth: 3,
    reportExport: false,
    apiAccess: false
  },
  basic: {
    dailyQueries: 100,
    maxDepth: 5,
    reportExport: true,
    apiAccess: false
  },
  pro: {
    dailyQueries: 1000,
    maxDepth: 10,
    reportExport: true,
    apiAccess: true
  }
}
```

### 3.2 B端（企业用户）功能

**核心功能**
- 无限查询
- 深度追踪（100+跳）
- 高级分析功能
- 自定义报告
- API 接口
- 团队协作
- 私有标签库
- 专属客服

**企业版特性**
- 批量查询
- 定时任务
- 数据导出
- 白名单管理
- 审计日志
- SSO 单点登录
- 私有化部署选项

### 3.3 A端（管理后台）功能

**系统管理**
- 用户管理
- 权限配置
- 订阅管理
- 财务管理

**数据管理**
- 标签库管理
- 黑名单管理
- 数据源配置
- 缓存管理

**运营管理**
- 统计分析
- 用户行为分析
- 系统监控
- 日志审计

**内容管理**
- 公告管理
- 帮助文档
- 案例库管理

## 4. API 接口设计

### 4.1 RESTful API

**地址查询**
```
GET /api/v1/address/{chain}/{address}
Response: AddressInfo
```

**交易查询**
```
GET /api/v1/transaction/{chain}/{txHash}
Response: TransactionDetail
```

**路径分析**
```
POST /api/v1/path/analyze
Body: PathQueryParams
Response: PathResult
```

**风险评分**
```
GET /api/v1/risk/score/{chain}/{address}
Response: RiskScore
```

**实体查询**
```
GET /api/v1/entity/{entityId}
Response: Entity
```

### 4.2 WebSocket API

**实时监控**
```
ws://api.realtrace.com/ws/monitor
Message: {
  type: 'subscribe' | 'unsubscribe' | 'alert',
  data: any
}
```

## 5. 性能指标

### 5.1 响应时间
- 地址查询：< 500ms
- 交易查询：< 200ms
- 路径分析（10跳）：< 3s
- 路径分析（100跳）：< 30s
- 图谱渲染：< 2s

### 5.2 并发能力
- API QPS：10000+
- WebSocket 连接：50000+
- 同时在线用户：100000+

### 5.3 数据规模
- 地址数据：1亿+
- 交易数据：10亿+
- 标签数据：1000万+
- 实体数据：100万+

---

**文档版本**：v1.0  
**创建日期**：2026-02-28  
**维护团队**：ChainTrace 产品团队
