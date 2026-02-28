# ChainTrace 用户端（C端）架构设计文档 v1.0

## 1. C端概述

### 1.1 产品定位
ChainTrace 用户端面向个人用户、加密货币投资者和区块链研究人员，提供便捷的链上地址查询、交易追踪和风险评估服务。

### 1.2 目标用户
- 加密货币投资者：查询交易对手风险
- 区块链研究人员：分析链上数据
- 安全从业者：学习和研究
- 普通用户：了解区块链安全

### 1.3 核心功能
- 地址查询与风险评估
- 交易追踪与可视化
- 资金流向分析
- 风险预警订阅
- 简易报告生成

## 2. 功能架构

### 2.1 功能模块图

```
┌─────────────────────────────────────────────────────────┐
│                   ChainTrace C端                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              首页 / Dashboard                     │  │
│  │  - 快速查询入口                                   │  │
│  │  - 热门案例展示                                   │  │
│  │  - 数据统计概览                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              地址查询模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │地址搜索    │  │风险评分    │  │标签展示    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │交易历史    │  │资产分布    │  │关联地址    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              交易追踪模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │交易查询    │  │交易详情    │  │交易图谱    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  │  ┌────────────┐  ┌────────────┐                  │  │
│  │  │资金流向    │  │路径分析    │                  │  │
│  │  └────────────┘  └────────────┘                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              监控预警模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │地址监控    │  │预警设置    │  │通知中心    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              报告中心模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │查询历史    │  │报告生成    │  │报告下载    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              个人中心模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │账户管理    │  │会员服务    │  │使用统计    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 2.2 页面结构

```
页面层级
├── 首页
│   ├── 快速查询
│   ├── 功能导航
│   ├── 热门案例
│   └── 数据统计
├── 地址查询
│   ├── 搜索页
│   └── 详情页
│       ├── 基本信息
│       ├── 风险评分
│       ├── 交易历史
│       ├── 资产分布
│       └── 关联分析
├── 交易追踪
│   ├── 搜索页
│   └── 详情页
│       ├── 交易信息
│       ├── 交易图谱
│       └── 资金流向
├── 监控预警
│   ├── 监控列表
│   ├── 添加监控
│   └── 预警记录
├── 报告中心
│   ├── 查询历史
│   ├── 我的报告
│   └── 报告详情
└── 个人中心
    ├── 账户信息
    ├── 会员服务
    ├── 使用统计
    └── 设置
```

## 3. 核心功能设计

### 3.1 地址查询功能

#### 3.1.1 搜索功能
```typescript
interface AddressSearchParams {
  chain: string;        // 链类型：BTC/ETH/TRX等
  address: string;      // 地址
  searchType?: string;  // 搜索类型：精确/模糊
}

interface AddressSearchResult {
  address: string;
  chain: string;
  label?: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  balance: string;
  txCount: number;
  firstSeen: string;
  lastSeen: string;
}
```

#### 3.1.2 地址详情
```typescript
interface AddressDetail {
  // 基本信息
  basic: {
    address: string;
    chain: string;
    label?: string;
    balance: string;
    balanceUSD: string;
  };
  
  // 风险信息
  risk: {
    score: number;
    level: string;
    factors: RiskFactor[];
    tags: string[];
  };
  
  // 交易统计
  statistics: {
    totalTx: number;
    totalReceived: string;
    totalSent: string;
    avgTxAmount: string;
    firstTx: string;
    lastTx: string;
  };
  
  // 资产分布
  assets: Asset[];
  
  // 关联地址
  relatedAddresses: RelatedAddress[];
}
```

#### 3.1.3 风险评分展示
```
风险评分卡片
┌─────────────────────────────┐
│  风险评分: 75/100            │
│  ████████░░ 高风险           │
│                              │
│  风险因素:                   │
│  • 与混币器交互 (30分)       │
│  • 高频小额交易 (25分)       │
│  • 关联黑名单地址 (20分)     │
│                              │
│  风险标签:                   │
│  [混币器] [可疑交易]         │
└─────────────────────────────┘
```

### 3.2 交易追踪功能

#### 3.2.1 交易查询
```typescript
interface TransactionQuery {
  chain: string;
  txHash: string;
}

interface TransactionDetail {
  // 基本信息
  hash: string;
  chain: string;
  status: string;
  blockNumber: number;
  timestamp: string;
  
  // 交易信息
  from: string;
  to: string;
  amount: string;
  amountUSD: string;
  fee: string;
  
  // 风险信息
  riskScore: number;
  riskFlags: string[];
  
  // 输入输出（UTXO）
  inputs?: TxInput[];
  outputs?: TxOutput[];
}
```

#### 3.2.2 资金流向分析
```typescript
interface FundFlowParams {
  address: string;
  chain: string;
  direction: 'in' | 'out' | 'both';
  depth: number;        // 追踪深度：1-10
  minAmount?: string;   // 最小金额过滤
}

interface FundFlowResult {
  nodes: FlowNode[];    // 节点列表
  edges: FlowEdge[];    // 边列表
  summary: {
    totalAmount: string;
    pathCount: number;
    riskAddresses: number;
  };
}
```

#### 3.2.3 交易图谱可视化
```
交易图谱
        ┌─────────┐
        │ 地址A   │
        └────┬────┘
             │ 10 BTC
        ┌────▼────┐
        │ 地址B   │
        └────┬────┘
        ┌────┴────┐
   5 BTC│         │5 BTC
   ┌────▼────┐ ┌──▼──────┐
   │ 地址C   │ │ 地址D   │
   └─────────┘ └─────────┘
```

### 3.3 监控预警功能

#### 3.3.1 地址监控
```typescript
interface AddressMonitor {
  id: string;
  address: string;
  chain: string;
  monitorType: 'balance' | 'transaction' | 'risk';
  conditions: MonitorCondition[];
  notifyChannels: ('email' | 'sms' | 'push')[];
  status: 'active' | 'paused';
  createdAt: string;
}

interface MonitorCondition {
  type: string;         // 条件类型
  operator: string;     // 操作符：>、<、=
  value: string;        // 阈值
}
```

#### 3.3.2 预警规则
```
预警类型
├── 余额变动
│   ├── 余额增加 > X
│   ├── 余额减少 > X
│   └── 余额清零
├── 交易活动
│   ├── 新交易发生
│   ├── 大额交易 > X
│   └── 高频交易
└── 风险变化
    ├── 风险评分上升
    ├── 新增风险标签
    └── 关联高风险地址
```

### 3.4 报告生成功能

#### 3.4.1 报告类型
```typescript
interface ReportTemplate {
  type: 'address' | 'transaction' | 'flow';
  name: string;
  sections: ReportSection[];
}

interface ReportSection {
  title: string;
  type: 'text' | 'table' | 'chart' | 'graph';
  content: any;
}
```

#### 3.4.2 报告内容
```
地址分析报告
├── 封面
│   ├── 报告标题
│   ├── 生成时间
│   └── 查询地址
├── 概要
│   ├── 风险评分
│   ├── 关键发现
│   └── 建议
├── 详细分析
│   ├── 基本信息
│   ├── 交易统计
│   ├── 资金流向
│   └── 风险分析
├── 可视化图表
│   ├── 交易时间线
│   ├── 资金流向图
│   └── 关联网络图
└── 附录
    ├── 数据来源
    └── 免责声明
```

## 4. 技术实现

### 4.1 前端技术栈

#### 核心框架
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "react-router-dom": "^6.10.0",
  "redux-toolkit": "^1.9.0",
  "axios": "^1.4.0"
}
```

#### UI 组件库
```json
{
  "antd": "^5.5.0",
  "@ant-design/icons": "^5.1.0",
  "styled-components": "^6.0.0"
}
```

#### 可视化库
```json
{
  "echarts": "^5.4.0",
  "echarts-for-react": "^3.0.0",
  "cytoscape": "^3.25.0",
  "cytoscape-react": "^2.0.0",
  "d3": "^7.8.0"
}
```

### 4.2 项目结构

```
src/
├── assets/              # 静态资源
│   ├── images/
│   ├── icons/
│   └── styles/
├── components/          # 通用组件
│   ├── AddressCard/
│   ├── RiskBadge/
│   ├── TransactionList/
│   ├── FlowGraph/
│   └── ...
├── pages/              # 页面组件
│   ├── Home/
│   ├── AddressQuery/
│   ├── TransactionTrace/
│   ├── Monitor/
│   ├── Report/
│   └── Profile/
├── layouts/            # 布局组件
│   ├── MainLayout/
│   └── AuthLayout/
├── services/           # API 服务
│   ├── api.ts
│   ├── address.ts
│   ├── transaction.ts
│   └── ...
├── store/              # 状态管理
│   ├── slices/
│   └── index.ts
├── hooks/              # 自定义 Hooks
│   ├── useAddress.ts
│   ├── useTransaction.ts
│   └── ...
├── utils/              # 工具函数
│   ├── format.ts
│   ├── validate.ts
│   └── ...
├── types/              # 类型定义
│   └── index.ts
├── config/             # 配置文件
│   └── constants.ts
├── App.tsx
└── main.tsx
```


### 4.3 核心组件实现

#### 4.3.1 地址搜索组件
```typescript
// components/AddressSearch/index.tsx
import React, { useState } from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface AddressSearchProps {
  onSearch: (chain: string, address: string) => void;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({ onSearch }) => {
  const [chain, setChain] = useState('BTC');
  const [address, setAddress] = useState('');

  const handleSearch = () => {
    if (address) {
      onSearch(chain, address);
    }
  };

  return (
    <div className="address-search">
      <Select value={chain} onChange={setChain} style={{ width: 120 }}>
        <Select.Option value="BTC">Bitcoin</Select.Option>
        <Select.Option value="ETH">Ethereum</Select.Option>
        <Select.Option value="TRX">Tron</Select.Option>
      </Select>
      <Input
        placeholder="输入地址"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onPressEnter={handleSearch}
      />
      <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
        查询
      </Button>
    </div>
  );
};
```

#### 4.3.2 风险评分组件
```typescript
// components/RiskScore/index.tsx
import React from 'react';
import { Progress, Tag } from 'antd';

interface RiskScoreProps {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors?: RiskFactor[];
}

export const RiskScore: React.FC<RiskScoreProps> = ({ score, level, factors }) => {
  const getColor = () => {
    if (score < 30) return 'success';
    if (score < 60) return 'warning';
    return 'exception';
  };

  const getLevelText = () => {
    const map = {
      low: '低风险',
      medium: '中风险',
      high: '高风险',
      critical: '极高风险'
    };
    return map[level];
  };

  return (
    <div className="risk-score">
      <div className="score-header">
        <span>风险评分</span>
        <Tag color={getColor()}>{getLevelText()}</Tag>
      </div>
      <Progress percent={score} status={getColor()} />
      {factors && (
        <div className="risk-factors">
          <h4>风险因素</h4>
          {factors.map((factor, index) => (
            <div key={index} className="factor-item">
              <span>{factor.name}</span>
              <span>{factor.score}分</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### 4.3.3 交易图谱组件
```typescript
// components/FlowGraph/index.tsx
import React, { useEffect, useRef } from 'react';
import Cytoscape from 'cytoscape';

interface FlowGraphProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export const FlowGraph: React.FC<FlowGraphProps> = ({ nodes, edges }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = Cytoscape({
      container: containerRef.current,
      elements: {
        nodes: nodes.map(node => ({
          data: { id: node.id, label: node.label, ...node }
        })),
        edges: edges.map(edge => ({
          data: { source: edge.from, target: edge.to, label: edge.amount }
        }))
      },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(label)',
            'width': 40,
            'height': 40
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'label': 'data(label)',
            'curve-style': 'bezier'
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true
      }
    });

    return () => cy.destroy();
  }, [nodes, edges]);

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />;
};
```

### 4.4 状态管理

#### Redux Store 设计
```typescript
// store/slices/addressSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addressService } from '@/services/address';

export const fetchAddressDetail = createAsyncThunk(
  'address/fetchDetail',
  async ({ chain, address }: { chain: string; address: string }) => {
    const response = await addressService.getDetail(chain, address);
    return response.data;
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    current: null,
    loading: false,
    error: null,
    history: []
  },
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddressDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddressDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        state.history.push(action.payload);
      })
      .addCase(fetchAddressDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearCurrent } = addressSlice.actions;
export default addressSlice.reducer;
```

### 4.5 API 服务封装

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 30000
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

```typescript
// services/address.ts
import api from './api';

export const addressService = {
  // 查询地址详情
  getDetail: (chain: string, address: string) => {
    return api.get(`/api/v1/address/${chain}/${address}`);
  },

  // 获取交易历史
  getTransactions: (chain: string, address: string, params: any) => {
    return api.get(`/api/v1/address/${chain}/${address}/transactions`, { params });
  },

  // 获取关联地址
  getRelated: (chain: string, address: string) => {
    return api.get(`/api/v1/address/${chain}/${address}/related`);
  },

  // 获取资金流向
  getFlow: (chain: string, address: string, params: any) => {
    return api.post(`/api/v1/address/${chain}/${address}/flow`, params);
  }
};
```

## 5. 用户体验设计

### 5.1 响应式设计

#### 断点设置
```css
/* 移动端 */
@media (max-width: 768px) {
  .container { padding: 10px; }
  .search-bar { flex-direction: column; }
}

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) {
  .container { padding: 20px; }
}

/* 桌面端 */
@media (min-width: 1025px) {
  .container { padding: 30px; }
}
```

### 5.2 加载状态

#### 骨架屏
```typescript
// components/AddressSkeleton/index.tsx
import { Skeleton } from 'antd';

export const AddressSkeleton = () => (
  <div className="address-skeleton">
    <Skeleton active paragraph={{ rows: 4 }} />
    <Skeleton active paragraph={{ rows: 6 }} />
  </div>
);
```

#### 加载动画
```typescript
// components/Loading/index.tsx
import { Spin } from 'antd';

export const Loading = ({ tip = '加载中...' }) => (
  <div className="loading-container">
    <Spin size="large" tip={tip} />
  </div>
);
```

### 5.3 错误处理

```typescript
// components/ErrorBoundary/index.tsx
import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="出错了"
          subTitle="抱歉，页面出现了一些问题"
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 5.4 性能优化

#### 代码分割
```typescript
// App.tsx
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/Loading';

const Home = lazy(() => import('@/pages/Home'));
const AddressQuery = lazy(() => import('@/pages/AddressQuery'));
const TransactionTrace = lazy(() => import('@/pages/TransactionTrace'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/address" element={<AddressQuery />} />
        <Route path="/transaction" element={<TransactionTrace />} />
      </Routes>
    </Suspense>
  );
}
```

#### 虚拟列表
```typescript
// 使用 react-window 处理大量数据
import { FixedSizeList } from 'react-window';

const TransactionList = ({ transactions }) => (
  <FixedSizeList
    height={600}
    itemCount={transactions.length}
    itemSize={80}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <TransactionItem data={transactions[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

## 6. 会员体系

### 6.1 会员等级

```
会员体系
├── 免费用户
│   ├── 每日查询：10次
│   ├── 追踪深度：3跳
│   ├── 监控地址：1个
│   └── 报告导出：不支持
├── 基础会员（¥99/月）
│   ├── 每日查询：100次
│   ├── 追踪深度：10跳
│   ├── 监控地址：5个
│   └── 报告导出：PDF
├── 专业会员（¥299/月）
│   ├── 每日查询：1000次
│   ├── 追踪深度：50跳
│   ├── 监控地址：20个
│   ├── 报告导出：PDF/Excel
│   └── API 访问：基础
└── 企业会员（定制）
    ├── 无限查询
    ├── 追踪深度：100跳
    ├── 监控地址：无限
    ├── 报告导出：全格式
    ├── API 访问：高级
    └── 专属客服
```

### 6.2 权限控制

```typescript
// utils/permission.ts
export enum UserRole {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export const permissions = {
  [UserRole.FREE]: {
    dailyQueries: 10,
    traceDepth: 3,
    monitorAddresses: 1,
    exportReport: false
  },
  [UserRole.BASIC]: {
    dailyQueries: 100,
    traceDepth: 10,
    monitorAddresses: 5,
    exportReport: true
  },
  [UserRole.PRO]: {
    dailyQueries: 1000,
    traceDepth: 50,
    monitorAddresses: 20,
    exportReport: true
  },
  [UserRole.ENTERPRISE]: {
    dailyQueries: -1, // 无限
    traceDepth: 100,
    monitorAddresses: -1,
    exportReport: true
  }
};

export const checkPermission = (user: User, action: string) => {
  const userPermissions = permissions[user.role];
  // 权限检查逻辑
};
```

## 7. 数据可视化

### 7.1 图表类型

#### 风险评分雷达图
```typescript
// 使用 ECharts
const riskRadarOption = {
  radar: {
    indicator: [
      { name: '交易频率', max: 100 },
      { name: '交易金额', max: 100 },
      { name: '关联风险', max: 100 },
      { name: '行为异常', max: 100 },
      { name: '黑名单', max: 100 }
    ]
  },
  series: [{
    type: 'radar',
    data: [{
      value: [80, 60, 70, 50, 90],
      name: '风险指标'
    }]
  }]
};
```

#### 交易时间线
```typescript
const timelineOption = {
  xAxis: { type: 'time' },
  yAxis: { type: 'value' },
  series: [{
    type: 'line',
    data: transactions.map(tx => [tx.timestamp, tx.amount])
  }]
};
```

#### 资金流向桑基图
```typescript
const sankeyOption = {
  series: [{
    type: 'sankey',
    data: nodes,
    links: edges
  }]
};
```

### 7.2 交互设计

- 图表联动：点击图表元素联动其他视图
- 缩放平移：支持图表缩放和平移
- 数据筛选：时间范围、金额范围筛选
- 导出功能：图表导出为图片

## 8. 移动端适配

### 8.1 移动端特性

- 触摸手势支持
- 下拉刷新
- 上拉加载更多
- 底部导航栏
- 简化的交互流程

### 8.2 PWA 支持

```javascript
// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('realtrace-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/css/main.css',
        '/static/js/main.js'
      ]);
    })
  );
});
```

## 9. 安全措施

### 9.1 前端安全

- XSS 防护：输入过滤和输出转义
- CSRF 防护：Token 验证
- 敏感数据加密：本地存储加密
- HTTPS：强制使用 HTTPS

### 9.2 数据保护

- 查询历史加密存储
- 敏感信息脱敏显示
- 定期清理本地缓存

---

**文档版本**：v1.0  
**创建日期**：2026-02-28  
**维护团队**：ChainTrace 前端团队  
**审核状态**：待审核
