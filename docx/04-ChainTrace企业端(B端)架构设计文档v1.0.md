# ChainTrace 企业端（B端）架构设计文档 v1.0

## 1. B端概述

### 1.1 产品定位
ChainTrace 企业端面向加密货币交易所、区块链项目方、金融机构和安全公司，提供专业的链上风控、合规审查和深度分析服务。

### 1.2 目标客户
- 加密货币交易所：用户 KYC/AML 审查
- 区块链项目方：代币流向监控
- 金融机构：数字资产风控
- 安全审计公司：链上调查服务
- 执法机构：案件协助调查

### 1.3 核心价值
- 批量地址风险筛查
- 实时交易监控预警
- 深度资金链路追踪
- 自动化合规报告
- API 接口集成
- 团队协作管理

## 2. 功能架构

### 2.1 功能模块图

```
┌─────────────────────────────────────────────────────────┐
│                   ChainTrace B端                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              工作台 / Dashboard                   │  │
│  │  - 数据概览                                       │  │
│  │  - 待处理任务                                     │  │
│  │  - 实时预警                                       │  │
│  │  - 快捷操作                                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              风控审查模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │批量筛查    │  │风险评估    │  │白名单管理  │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │黑名单管理  │  │审查记录    │  │规则配置    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              深度分析模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │资金链追踪  │  │实体识别    │  │关系图谱    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │混币分析    │  │异常检测    │  │案例库      │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              监控预警模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │实时监控    │  │预警规则    │  │预警中心    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  │  ┌────────────┐  ┌────────────┐                  │  │
│  │  │监控看板    │  │事件处理    │                  │  │
│  │  └────────────┘  └────────────┘                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              合规报告模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │报告模板    │  │报告生成    │  │报告管理    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  │  ┌────────────┐  ┌────────────┐                  │  │
│  │  │审批流程    │  │报告归档    │                  │  │
│  │  └────────────┘  └────────────┘                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              API 管理模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │API密钥     │  │调用统计    │  │接口文档    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              团队管理模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │成员管理    │  │角色权限    │  │操作日志    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              数据管理模块                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │标签库      │  │案例库      │  │数据导入    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 2.2 业务流程

#### 风控审查流程
```
风控审查流程
├── 1. 数据导入
│   ├── 手动输入
│   ├── 批量上传（CSV/Excel）
│   └── API 对接
├── 2. 自动筛查
│   ├── 黑名单匹配
│   ├── 风险评分
│   └── 规则引擎
├── 3. 人工审核
│   ├── 高风险复核
│   ├── 深度分析
│   └── 决策判断
├── 4. 结果处理
│   ├── 通过/拒绝
│   ├── 标记跟进
│   └── 生成报告
└── 5. 记录归档
    ├── 审查记录
    ├── 证据保存
    └── 合规存档
```

## 3. 核心功能设计

### 3.1 批量风控筛查

#### 3.1.1 批量导入
```typescript
interface BatchImportParams {
  file: File;              // CSV/Excel 文件
  chain: string;           // 链类型
  columnMapping: {         // 列映射
    address: string;
    amount?: string;
    remark?: string;
  };
}

interface BatchImportResult {
  taskId: string;
  total: number;
  success: number;
  failed: number;
  errors: ImportError[];
}
```

#### 3.1.2 批量筛查
```typescript
interface BatchScreenParams {
  addresses: string[];
  chain: string;
  checkTypes: ('blacklist' | 'risk' | 'sanction')[];
  threshold?: number;      // 风险阈值
}

interface BatchScreenResult {
  taskId: string;
  total: number;
  processed: number;
  results: ScreenResult[];
  summary: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    clean: number;
  };
}

interface ScreenResult {
  address: string;
  riskScore: number;
  riskLevel: string;
  flags: string[];
  recommendation: 'approve' | 'reject' | 'review';
}
```

#### 3.1.3 筛查规则配置
```typescript
interface ScreenRule {
  id: string;
  name: string;
  type: 'blacklist' | 'amount' | 'frequency' | 'pattern';
  conditions: RuleCondition[];
  action: 'block' | 'alert' | 'review';
  priority: number;
  enabled: boolean;
}

interface RuleCondition {
  field: string;
  operator: '>' | '<' | '=' | 'in' | 'contains';
  value: any;
  logic?: 'and' | 'or';
}
```

### 3.2 实时监控预警

#### 3.2.1 监控配置
```typescript
interface MonitorConfig {
  id: string;
  name: string;
  type: 'address' | 'transaction' | 'contract';
  targets: string[];       // 监控目标
  rules: MonitorRule[];
  notifyChannels: NotifyChannel[];
  status: 'active' | 'paused';
}

interface MonitorRule {
  type: string;
  condition: any;
  threshold: any;
  action: 'alert' | 'block';
}

interface NotifyChannel {
  type: 'email' | 'webhook' | 'sms';
  config: any;
}
```

#### 3.2.2 预警事件
```typescript
interface AlertEvent {
  id: string;
  monitorId: string;
  type: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  data: any;
  status: 'pending' | 'processing' | 'resolved' | 'ignored';
  createdAt: string;
  resolvedAt?: string;
  handler?: string;
}
```

#### 3.2.3 监控看板
```
实时监控看板
┌─────────────────────────────────────────┐
│  今日预警: 23  │  待处理: 5  │  已处理: 18 │
├─────────────────────────────────────────┤
│  监控地址: 1,234                         │
│  监控交易: 5,678                         │
│  活跃规则: 45                            │
├─────────────────────────────────────────┤
│  最新预警                                │
│  • [高风险] 地址 0x123... 大额转出      │
│  • [中风险] 检测到混币器交互            │
│  • [低风险] 异常交易频率                │
└─────────────────────────────────────────┘
```

### 3.3 深度分析工具

#### 3.3.1 资金链追踪
```typescript
interface FundTraceParams {
  startAddress: string;
  chain: string;
  direction: 'forward' | 'backward' | 'both';
  depth: number;           // 追踪深度：1-100
  minAmount?: string;      // 最小金额
  timeRange?: {
    start: string;
    end: string;
  };
  filters?: {
    excludeMixers?: boolean;
    excludeExchanges?: boolean;
    onlyHighRisk?: boolean;
  };
}

interface FundTraceResult {
  taskId: string;
  graph: {
    nodes: TraceNode[];
    edges: TraceEdge[];
  };
  paths: TracePath[];
  statistics: {
    totalAmount: string;
    pathCount: number;
    nodeCount: number;
    riskNodes: number;
  };
}
```

#### 3.3.2 实体识别
```typescript
interface EntityClusterParams {
  addresses: string[];
  chain: string;
  algorithm: 'heuristic' | 'ml';
}

interface EntityClusterResult {
  entities: Entity[];
  confidence: number;
}

interface Entity {
  id: string;
  type: 'exchange' | 'mixer' | 'gambling' | 'unknown';
  addresses: string[];
  label?: string;
  riskLevel: string;
}
```

#### 3.3.3 混币分析
```typescript
interface MixerAnalysisParams {
  txHash: string;
  chain: string;
}

interface MixerAnalysisResult {
  isMixer: boolean;
  confidence: number;
  mixerType?: string;
  inputAddresses: string[];
  outputAddresses: string[];
  possibleLinks: MixerLink[];
}

interface MixerLink {
  inputAddress: string;
  outputAddress: string;
  probability: number;
  amount: string;
}
```

### 3.4 合规报告系统

#### 3.4.1 报告模板
```typescript
interface ReportTemplate {
  id: string;
  name: string;
  type: 'kyc' | 'aml' | 'sar' | 'custom';
  sections: ReportSection[];
  format: 'pdf' | 'word' | 'excel';
  language: 'zh' | 'en';
}

interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'table' | 'chart' | 'image';
  required: boolean;
  template: string;
}
```

#### 3.4.2 报告生成
```typescript
interface ReportGenerateParams {
  templateId: string;
  data: {
    subject: string;        // 报告主体（地址/交易）
    analysisType: string;
    findings: any[];
    evidence: any[];
  };
  options: {
    includeRawData: boolean;
    includeCharts: boolean;
    watermark: boolean;
  };
}

interface ReportGenerateResult {
  reportId: string;
  status: 'generating' | 'completed' | 'failed';
  fileUrl?: string;
  previewUrl?: string;
}
```

#### 3.4.3 审批流程
```typescript
interface ApprovalFlow {
  id: string;
  reportId: string;
  steps: ApprovalStep[];
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface ApprovalStep {
  order: number;
  approver: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  timestamp?: string;
}
```

### 3.5 API 接口服务

#### 3.5.1 API 密钥管理
```typescript
interface ApiKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    period: 'second' | 'minute' | 'hour' | 'day';
  };
  ipWhitelist?: string[];
  status: 'active' | 'disabled';
  createdAt: string;
  expiresAt?: string;
}
```

#### 3.5.2 API 调用统计
```typescript
interface ApiUsageStats {
  apiKeyId: string;
  period: string;
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  topEndpoints: {
    endpoint: string;
    count: number;
  }[];
  errorRate: number;
}
```

#### 3.5.3 核心 API 接口
```
API 接口列表
├── 地址风险评估
│   POST /api/v1/risk/address
│   - 单个地址风险评分
│   - 批量地址筛查
├── 交易分析
│   POST /api/v1/analysis/transaction
│   - 交易详情查询
│   - 交易风险评估
├── 资金追踪
│   POST /api/v1/trace/fund
│   - 资金流向追踪
│   - 路径分析
├── 实体识别
│   POST /api/v1/entity/identify
│   - 地址聚类
│   - 实体归属
└── 监控预警
    POST /api/v1/monitor/create
    GET /api/v1/monitor/alerts
    - 创建监控
    - 获取预警
```


## 4. 技术实现

### 4.1 前端架构

#### 项目结构
```
src/
├── pages/
│   ├── Dashboard/           # 工作台
│   ├── RiskScreen/          # 风控筛查
│   ├── DeepAnalysis/        # 深度分析
│   ├── Monitor/             # 监控预警
│   ├── Report/              # 合规报告
│   ├── API/                 # API管理
│   ├── Team/                # 团队管理
│   └── Data/                # 数据管理
├── components/
│   ├── BatchUpload/         # 批量上传
│   ├── RiskTable/           # 风险表格
│   ├── AlertCard/           # 预警卡片
│   ├── FlowChart/           # 流程图
│   ├── ReportEditor/        # 报告编辑器
│   └── ...
├── services/
│   ├── risk.ts
│   ├── monitor.ts
│   ├── report.ts
│   └── ...
└── hooks/
    ├── useRiskScreen.ts
    ├── useMonitor.ts
    └── ...
```

#### 核心组件

##### 批量上传组件
```typescript
// components/BatchUpload/index.tsx
import React, { useState } from 'react';
import { Upload, Button, Table, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

interface BatchUploadProps {
  onUpload: (data: any[]) => Promise<void>;
}

export const BatchUpload: React.FC<BatchUploadProps> = ({ onUpload }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target?.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
    return false; // 阻止自动上传
  };

  const handleSubmit = async () => {
    if (data.length === 0) {
      message.warning('请先上传文件');
      return;
    }
    setLoading(true);
    try {
      await onUpload(data);
      message.success('上传成功');
      setData([]);
    } catch (error) {
      message.error('上传失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="batch-upload">
      <Upload beforeUpload={handleFileUpload} accept=".xlsx,.xls,.csv">
        <Button icon={<UploadOutlined />}>选择文件</Button>
      </Upload>
      {data.length > 0 && (
        <>
          <Table dataSource={data} pagination={{ pageSize: 10 }} />
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            提交筛查
          </Button>
        </>
      )}
    </div>
  );
};
```

##### 风险筛查表格
```typescript
// components/RiskTable/index.tsx
import React from 'react';
import { Table, Tag, Button, Space } from 'antd';

interface RiskTableProps {
  data: ScreenResult[];
  onDetail: (address: string) => void;
  onApprove: (address: string) => void;
  onReject: (address: string) => void;
}

export const RiskTable: React.FC<RiskTableProps> = ({
  data,
  onDetail,
  onApprove,
  onReject
}) => {
  const columns = [
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      render: (text: string) => (
        <span className="address-text">{text}</span>
      )
    },
    {
      title: '风险评分',
      dataIndex: 'riskScore',
      key: 'riskScore',
      sorter: (a, b) => a.riskScore - b.riskScore,
      render: (score: number) => (
        <span style={{ color: score > 70 ? 'red' : score > 40 ? 'orange' : 'green' }}>
          {score}
        </span>
      )
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      filters: [
        { text: '低风险', value: 'low' },
        { text: '中风险', value: 'medium' },
        { text: '高风险', value: 'high' },
        { text: '极高风险', value: 'critical' }
      ],
      onFilter: (value, record) => record.riskLevel === value,
      render: (level: string) => {
        const colorMap = {
          low: 'green',
          medium: 'orange',
          high: 'red',
          critical: 'purple'
        };
        return <Tag color={colorMap[level]}>{level}</Tag>;
      }
    },
    {
      title: '风险标签',
      dataIndex: 'flags',
      key: 'flags',
      render: (flags: string[]) => (
        <>
          {flags.map(flag => (
            <Tag key={flag}>{flag}</Tag>
          ))}
        </>
      )
    },
    {
      title: '建议',
      dataIndex: 'recommendation',
      key: 'recommendation',
      render: (rec: string) => {
        const textMap = {
          approve: '通过',
          reject: '拒绝',
          review: '人工审核'
        };
        return textMap[rec];
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => onDetail(record.address)}>
            详情
          </Button>
          <Button size="small" type="primary" onClick={() => onApprove(record.address)}>
            通过
          </Button>
          <Button size="small" danger onClick={() => onReject(record.address)}>
            拒绝
          </Button>
        </Space>
      )
    }
  ];

  return <Table columns={columns} dataSource={data} rowKey="address" />;
};
```

##### 实时监控看板
```typescript
// components/MonitorDashboard/index.tsx
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Badge } from 'antd';
import { AlertOutlined, CheckCircleOutlined } from '@ant-design/icons';

export const MonitorDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalAlerts: 0,
    pending: 0,
    resolved: 0,
    monitoredAddresses: 0
  });
  const [recentAlerts, setRecentAlerts] = useState<AlertEvent[]>([]);

  useEffect(() => {
    // 加载统计数据和最新预警
    loadDashboardData();
    // 设置定时刷新
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    // API 调用
  };

  return (
    <div className="monitor-dashboard">
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日预警"
              value={stats.totalAlerts}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理"
              value={stats.pending}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已处理"
              value={stats.resolved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="监控地址"
              value={stats.monitoredAddresses}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最新预警" style={{ marginTop: 16 }}>
        <List
          dataSource={recentAlerts}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Badge status={item.level === 'high' ? 'error' : 'warning'} />}
                title={item.title}
                description={item.description}
              />
              <div>{new Date(item.createdAt).toLocaleString()}</div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
```

### 4.2 后端服务设计

#### 微服务架构
```
后端服务
├── 用户服务 (user-service)
│   ├── 企业账户管理
│   ├── 团队成员管理
│   └── 权限控制
├── 风控服务 (risk-service)
│   ├── 批量筛查
│   ├── 风险评估
│   └── 规则引擎
├── 监控服务 (monitor-service)
│   ├── 实时监控
│   ├── 预警生成
│   └── 事件处理
├── 分析服务 (analysis-service)
│   ├── 资金追踪
│   ├── 实体识别
│   └── 混币分析
├── 报告服务 (report-service)
│   ├── 报告生成
│   ├── 模板管理
│   └── 审批流程
└── API服务 (api-service)
    ├── API网关
    ├── 密钥管理
    └── 调用统计
```

#### 核心服务接口

##### 风控服务
```go
// services/risk/handler.go
package risk

type RiskService struct {
    db     *gorm.DB
    cache  *redis.Client
    engine *RuleEngine
}

// 批量地址筛查
func (s *RiskService) BatchScreen(ctx context.Context, req *BatchScreenRequest) (*BatchScreenResponse, error) {
    // 1. 参数验证
    if err := validateRequest(req); err != nil {
        return nil, err
    }

    // 2. 创建筛查任务
    task := &ScreenTask{
        ID:        uuid.New().String(),
        Total:     len(req.Addresses),
        Status:    "processing",
        CreatedAt: time.Now(),
    }
    s.db.Create(task)

    // 3. 异步处理
    go s.processScreenTask(task, req)

    return &BatchScreenResponse{
        TaskID: task.ID,
        Status: "processing",
    }, nil
}

// 处理筛查任务
func (s *RiskService) processScreenTask(task *ScreenTask, req *BatchScreenRequest) {
    results := make([]*ScreenResult, 0, len(req.Addresses))

    for _, address := range req.Addresses {
        // 查询缓存
        cacheKey := fmt.Sprintf("risk:%s:%s", req.Chain, address)
        if cached, err := s.cache.Get(ctx, cacheKey).Result(); err == nil {
            var result ScreenResult
            json.Unmarshal([]byte(cached), &result)
            results = append(results, &result)
            continue
        }

        // 执行风险评估
        result := s.evaluateRisk(req.Chain, address, req.CheckTypes)
        results = append(results, result)

        // 缓存结果
        data, _ := json.Marshal(result)
        s.cache.Set(ctx, cacheKey, data, 1*time.Hour)
    }

    // 更新任务状态
    task.Status = "completed"
    task.Results = results
    task.CompletedAt = time.Now()
    s.db.Save(task)
}

// 风险评估
func (s *RiskService) evaluateRisk(chain, address string, checkTypes []string) *ScreenResult {
    result := &ScreenResult{
        Address:   address,
        RiskScore: 0,
        Flags:     []string{},
    }

    // 黑名单检查
    if contains(checkTypes, "blacklist") {
        if s.checkBlacklist(chain, address) {
            result.RiskScore += 100
            result.Flags = append(result.Flags, "黑名单")
        }
    }

    // 风险评分
    if contains(checkTypes, "risk") {
        score := s.calculateRiskScore(chain, address)
        result.RiskScore += score
    }

    // 制裁名单
    if contains(checkTypes, "sanction") {
        if s.checkSanction(chain, address) {
            result.RiskScore += 100
            result.Flags = append(result.Flags, "制裁名单")
        }
    }

    // 确定风险等级
    result.RiskLevel = s.getRiskLevel(result.RiskScore)
    result.Recommendation = s.getRecommendation(result.RiskScore)

    return result
}
```

##### 监控服务
```go
// services/monitor/handler.go
package monitor

type MonitorService struct {
    db        *gorm.DB
    cache     *redis.Client
    kafka     *kafka.Producer
    wsManager *WebSocketManager
}

// 创建监控
func (s *MonitorService) CreateMonitor(ctx context.Context, req *CreateMonitorRequest) (*Monitor, error) {
    monitor := &Monitor{
        ID:             uuid.New().String(),
        UserID:         req.UserID,
        Name:           req.Name,
        Type:           req.Type,
        Targets:        req.Targets,
        Rules:          req.Rules,
        NotifyChannels: req.NotifyChannels,
        Status:         "active",
        CreatedAt:      time.Now(),
    }

    if err := s.db.Create(monitor).Error; err != nil {
        return nil, err
    }

    // 启动监控
    s.startMonitor(monitor)

    return monitor, nil
}

// 启动监控
func (s *MonitorService) startMonitor(monitor *Monitor) {
    // 订阅链上事件
    for _, target := range monitor.Targets {
        s.subscribeChainEvents(monitor.ID, target)
    }
}

// 处理链上事件
func (s *MonitorService) handleChainEvent(event *ChainEvent) {
    // 查询相关监控
    monitors := s.getRelatedMonitors(event)

    for _, monitor := range monitors {
        // 检查规则
        if s.checkRules(monitor, event) {
            // 生成预警
            alert := s.createAlert(monitor, event)
            
            // 保存预警
            s.db.Create(alert)
            
            // 发送通知
            s.sendNotifications(monitor, alert)
            
            // WebSocket 推送
            s.wsManager.Broadcast(monitor.UserID, alert)
        }
    }
}

// 检查规则
func (s *MonitorService) checkRules(monitor *Monitor, event *ChainEvent) bool {
    for _, rule := range monitor.Rules {
        if s.evaluateRule(rule, event) {
            return true
        }
    }
    return false
}
```

##### 报告服务
```go
// services/report/handler.go
package report

type ReportService struct {
    db       *gorm.DB
    storage  *MinIOClient
    renderer *ReportRenderer
}

// 生成报告
func (s *ReportService) GenerateReport(ctx context.Context, req *GenerateReportRequest) (*Report, error) {
    // 1. 获取模板
    template, err := s.getTemplate(req.TemplateID)
    if err != nil {
        return nil, err
    }

    // 2. 收集数据
    data, err := s.collectReportData(req)
    if err != nil {
        return nil, err
    }

    // 3. 渲染报告
    content, err := s.renderer.Render(template, data)
    if err != nil {
        return nil, err
    }

    // 4. 生成文件
    fileURL, err := s.generateFile(content, template.Format)
    if err != nil {
        return nil, err
    }

    // 5. 保存报告记录
    report := &Report{
        ID:         uuid.New().String(),
        UserID:     req.UserID,
        TemplateID: req.TemplateID,
        Title:      req.Title,
        Content:    content,
        FileURL:    fileURL,
        Status:     "completed",
        CreatedAt:  time.Now(),
    }
    s.db.Create(report)

    return report, nil
}

// 收集报告数据
func (s *ReportService) collectReportData(req *GenerateReportRequest) (map[string]interface{}, error) {
    data := make(map[string]interface{})

    // 基本信息
    data["subject"] = req.Data.Subject
    data["analysisType"] = req.Data.AnalysisType
    data["generatedAt"] = time.Now()

    // 分析结果
    data["findings"] = req.Data.Findings
    data["evidence"] = req.Data.Evidence

    // 统计数据
    stats, _ := s.calculateStatistics(req.Data)
    data["statistics"] = stats

    // 图表数据
    if req.Options.IncludeCharts {
        charts, _ := s.generateCharts(req.Data)
        data["charts"] = charts
    }

    return data, nil
}
```

### 4.3 数据库设计

#### 企业相关表
```sql
-- 企业表
CREATE TABLE enterprises (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50),
    industry VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    subscription_plan VARCHAR(50),
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 团队成员表
CREATE TABLE team_members (
    id BIGSERIAL PRIMARY KEY,
    enterprise_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    permissions JSONB,
    status VARCHAR(20) DEFAULT 'active',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
);

-- 筛查任务表
CREATE TABLE screen_tasks (
    id VARCHAR(50) PRIMARY KEY,
    enterprise_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    name VARCHAR(200),
    total INTEGER,
    processed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    results JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
);

-- 监控配置表
CREATE TABLE monitors (
    id VARCHAR(50) PRIMARY KEY,
    enterprise_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    targets TEXT[],
    rules JSONB,
    notify_channels JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
);

-- 预警事件表
CREATE TABLE alert_events (
    id VARCHAR(50) PRIMARY KEY,
    monitor_id VARCHAR(50) NOT NULL,
    enterprise_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    title VARCHAR(200),
    description TEXT,
    data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    handler_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (monitor_id) REFERENCES monitors(id),
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
);

-- 报告表
CREATE TABLE reports (
    id VARCHAR(50) PRIMARY KEY,
    enterprise_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    template_id VARCHAR(50),
    title VARCHAR(200),
    content JSONB,
    file_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft',
    approval_flow JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
);

-- API密钥表
CREATE TABLE api_keys (
    id VARCHAR(50) PRIMARY KEY,
    enterprise_id BIGINT NOT NULL,
    name VARCHAR(200),
    key_hash VARCHAR(255) NOT NULL,
    permissions TEXT[],
    rate_limit JSONB,
    ip_whitelist TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
);

-- API调用日志表
CREATE TABLE api_call_logs (
    id BIGSERIAL PRIMARY KEY,
    api_key_id VARCHAR(50) NOT NULL,
    endpoint VARCHAR(200),
    method VARCHAR(10),
    status_code INTEGER,
    response_time INTEGER,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
);
```

## 5. 权限与安全

### 5.1 角色权限设计

```
企业角色体系
├── 企业管理员 (Admin)
│   ├── 所有功能权限
│   ├── 成员管理
│   ├── 订阅管理
│   └── 系统配置
├── 风控主管 (Risk Manager)
│   ├── 风控审查
│   ├── 规则配置
│   ├── 报告审批
│   └── 团队管理
├── 风控专员 (Risk Analyst)
│   ├── 地址筛查
│   ├── 深度分析
│   ├── 报告生成
│   └── 监控配置
├── 开发者 (Developer)
│   ├── API调用
│   ├── 密钥管理
│   └── 文档查看
└── 查看者 (Viewer)
    ├── 数据查看
    └── 报告查看
```

### 5.2 数据隔离

```
数据隔离策略
├── 企业级隔离
│   ├── 每个企业独立数据空间
│   ├── 数据访问权限控制
│   └── 跨企业数据不可见
├── 团队级隔离
│   ├── 团队成员权限分组
│   ├── 数据访问范围限制
│   └── 操作日志记录
└── 项目级隔离
    ├── 项目数据独立管理
    ├── 项目成员权限控制
    └── 项目资源隔离
```

### 5.3 安全措施

#### API 安全
```typescript
// API 请求签名
interface ApiRequest {
  apiKey: string;
  timestamp: number;
  nonce: string;
  signature: string;  // HMAC-SHA256(apiKey + timestamp + nonce + body, secret)
  body: any;
}

// 签名验证
function verifySignature(req: ApiRequest, secret: string): boolean {
  const message = `${req.apiKey}${req.timestamp}${req.nonce}${JSON.stringify(req.body)}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  return req.signature === expectedSignature;
}

// 时间戳验证（防重放攻击）
function verifyTimestamp(timestamp: number): boolean {
  const now = Date.now();
  const diff = Math.abs(now - timestamp);
  return diff < 5 * 60 * 1000; // 5分钟内有效
}
```

#### 数据加密
```
加密策略
├── 传输加密
│   ├── HTTPS/TLS 1.3
│   └── WebSocket WSS
├── 存储加密
│   ├── 敏感字段 AES-256
│   ├── API密钥加密存储
│   └── 报告文件加密
└── 访问控制
    ├── JWT Token 认证
    ├── RBAC 权限控制
    └── IP 白名单
```

## 6. 性能优化

### 6.1 批量处理优化

```go
// 批量处理优化
func (s *RiskService) BatchScreenOptimized(addresses []string) {
    const batchSize = 100
    const concurrency = 10
    
    // 分批处理
    batches := splitIntoBatches(addresses, batchSize)
    
    // 并发处理
    var wg sync.WaitGroup
    semaphore := make(chan struct{}, concurrency)
    
    for _, batch := range batches {
        wg.Add(1)
        go func(addrs []string) {
            defer wg.Done()
            semaphore <- struct{}{}
            defer func() { <-semaphore }()
            
            s.processBatch(addrs)
        }(batch)
    }
    
    wg.Wait()
}
```

### 6.2 缓存策略

```
缓存层次
├── L1: 本地缓存（内存）
│   ├── 热点地址信息
│   ├── 风险评分结果
│   └── 过期时间: 5分钟
├── L2: Redis 缓存
│   ├── 地址详情
│   ├── 筛查结果
│   ├── 监控配置
│   └── 过期时间: 1小时
└── L3: 数据库
    └── 持久化存储
```

### 6.3 数据库优化

```sql
-- 索引优化
CREATE INDEX idx_screen_tasks_enterprise ON screen_tasks(enterprise_id, created_at DESC);
CREATE INDEX idx_monitors_enterprise_status ON monitors(enterprise_id, status);
CREATE INDEX idx_alert_events_monitor_status ON alert_events(monitor_id, status, created_at DESC);
CREATE INDEX idx_reports_enterprise_created ON reports(enterprise_id, created_at DESC);

-- 分区表（按月分区）
CREATE TABLE api_call_logs_2026_01 PARTITION OF api_call_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE api_call_logs_2026_02 PARTITION OF api_call_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

## 7. 监控与运维

### 7.1 系统监控

```
监控指标
├── 业务指标
│   ├── 筛查任务数
│   ├── 预警事件数
│   ├── API 调用量
│   └── 活跃企业数
├── 性能指标
│   ├── 响应时间
│   ├── 吞吐量
│   ├── 错误率
│   └── 并发数
├── 资源指标
│   ├── CPU 使用率
│   ├── 内存使用率
│   ├── 磁盘使用率
│   └── 网络流量
└── 数据库指标
    ├── 连接数
    ├── 慢查询
    ├── 锁等待
    └── 缓存命中率
```

### 7.2 告警规则

```yaml
# Prometheus 告警规则
groups:
  - name: business_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(api_errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API 错误率过高"
          
      - alert: SlowResponse
        expr: histogram_quantile(0.95, api_response_time_seconds) > 3
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API 响应时间过长"
          
      - alert: HighConcurrency
        expr: active_requests > 1000
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "并发请求数过高"
```

### 7.3 日志管理

```
日志体系
├── 应用日志
│   ├── 业务日志
│   ├── 错误日志
│   └── 审计日志
├── 访问日志
│   ├── API 访问日志
│   ├── Web 访问日志
│   └── 数据库访问日志
└── 系统日志
    ├── 服务启动日志
    ├── 健康检查日志
    └── 性能日志
```

## 8. 部署方案

### 8.1 容器化部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  # B端前端
  b-frontend:
    image: chaintrace/b-frontend:latest
    ports:
      - "3001:80"
    environment:
      - API_BASE_URL=http://api-gateway:8080
    depends_on:
      - api-gateway

  # API 网关
  api-gateway:
    image: chaintrace/api-gateway:latest
    ports:
      - "8080:8080"
    environment:
      - REDIS_URL=redis://redis:6379
      - DB_URL=postgresql://postgres:5432/chaintrace
    depends_on:
      - redis
      - postgres

  # 风控服务
  risk-service:
    image: chaintrace/risk-service:latest
    environment:
      - REDIS_URL=redis://redis:6379
      - DB_URL=postgresql://postgres:5432/chaintrace
    depends_on:
      - redis
      - postgres

  # 监控服务
  monitor-service:
    image: chaintrace/monitor-service:latest
    environment:
      - REDIS_URL=redis://redis:6379
      - KAFKA_URL=kafka:9092
    depends_on:
      - redis
      - kafka

  # 报告服务
  report-service:
    image: chaintrace/report-service:latest
    environment:
      - DB_URL=postgresql://postgres:5432/chaintrace
      - MINIO_URL=minio:9000
    depends_on:
      - postgres
      - minio

  # PostgreSQL
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=chaintrace
      - POSTGRES_USER=chaintrace
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data

  # Redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

  # Kafka
  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
    depends_on:
      - zookeeper

  # MinIO
  minio:
    image: minio/minio:latest
    command: server /data
    environment:
      - MINIO_ROOT_USER=${MINIO_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}
    volumes:
      - minio-data:/data

volumes:
  postgres-data:
  redis-data:
  minio-data:
```

### 8.2 Kubernetes 部署

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: b-frontend
  namespace: chaintrace-b
spec:
  replicas: 3
  selector:
    matchLabels:
      app: b-frontend
  template:
    metadata:
      labels:
        app: b-frontend
    spec:
      containers:
      - name: frontend
        image: chaintrace/b-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: b-frontend
  namespace: chaintrace-b
spec:
  selector:
    app: b-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: b-frontend-ingress
  namespace: chaintrace-b
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - b.chaintrace.com
    secretName: b-frontend-tls
  rules:
  - host: b.chaintrace.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: b-frontend
            port:
              number: 80
```

## 9. 用户手册

### 9.1 快速开始

#### 注册与登录
1. 访问 https://b.chaintrace.com
2. 点击"企业注册"
3. 填写企业信息
4. 验证邮箱
5. 完成注册

#### 首次配置
1. 登录后进入"设置"
2. 完善企业资料
3. 邀请团队成员
4. 配置权限角色
5. 设置通知方式

### 9.2 功能使用指南

#### 批量地址筛查
```
操作步骤：
1. 进入"风控审查" > "批量筛查"
2. 点击"上传文件"
3. 选择 CSV/Excel 文件
4. 映射列字段（地址、金额等）
5. 选择筛查类型（黑名单/风险/制裁）
6. 点击"开始筛查"
7. 等待处理完成
8. 查看筛查结果
9. 导出报告
```

#### 设置实时监控
```
操作步骤：
1. 进入"监控预警" > "创建监控"
2. 填写监控名称
3. 选择监控类型（地址/交易）
4. 添加监控目标
5. 配置预警规则
   - 金额阈值
   - 频率限制
   - 风险等级
6. 设置通知渠道
   - 邮件
   - Webhook
   - 短信
7. 保存并启动监控
```

#### 生成合规报告
```
操作步骤：
1. 进入"合规报告" > "创建报告"
2. 选择报告模板
3. 填写报告信息
4. 添加分析数据
5. 上传证据材料
6. 预览报告
7. 提交审批（如需要）
8. 下载报告文件
```

### 9.3 API 集成指南

#### 获取 API 密钥
```
1. 进入"API管理" > "密钥管理"
2. 点击"创建密钥"
3. 填写密钥名称
4. 选择权限范围
5. 设置限流规则
6. 配置 IP 白名单（可选）
7. 保存并获取密钥
```

#### API 调用示例

##### Python 示例
```python
import requests
import hmac
import hashlib
import time
import json

class ChainTraceClient:
    def __init__(self, api_key, api_secret):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = "https://api.chaintrace.com"
    
    def _sign_request(self, timestamp, nonce, body):
        message = f"{self.api_key}{timestamp}{nonce}{json.dumps(body)}"
        signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def risk_check(self, chain, address):
        endpoint = "/api/v1/risk/address"
        timestamp = int(time.time() * 1000)
        nonce = str(time.time())
        body = {
            "chain": chain,
            "address": address
        }
        
        signature = self._sign_request(timestamp, nonce, body)
        
        headers = {
            "X-API-Key": self.api_key,
            "X-Timestamp": str(timestamp),
            "X-Nonce": nonce,
            "X-Signature": signature,
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{self.base_url}{endpoint}",
            headers=headers,
            json=body
        )
        
        return response.json()

# 使用示例
client = ChainTraceClient("your_api_key", "your_api_secret")
result = client.risk_check("ETH", "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
print(result)
```

##### JavaScript 示例
```javascript
const crypto = require('crypto');
const axios = require('axios');

class ChainTraceClient {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.chaintrace.com';
  }

  signRequest(timestamp, nonce, body) {
    const message = `${this.apiKey}${timestamp}${nonce}${JSON.stringify(body)}`;
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
    return signature;
  }

  async riskCheck(chain, address) {
    const endpoint = '/api/v1/risk/address';
    const timestamp = Date.now();
    const nonce = String(Date.now());
    const body = { chain, address };

    const signature = this.signRequest(timestamp, nonce, body);

    const response = await axios.post(
      `${this.baseUrl}${endpoint}`,
      body,
      {
        headers: {
          'X-API-Key': this.apiKey,
          'X-Timestamp': timestamp,
          'X-Nonce': nonce,
          'X-Signature': signature,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }
}

// 使用示例
const client = new ChainTraceClient('your_api_key', 'your_api_secret');
client.riskCheck('ETH', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

## 10. 常见问题

### 10.1 功能相关

**Q: 批量筛查最多支持多少地址？**
A: 单次批量筛查最多支持 10,000 个地址。如需处理更多地址，建议分批上传。

**Q: 监控预警的延迟是多少？**
A: 链上事件监控延迟通常在 1-3 个区块确认时间内，具体取决于不同的区块链网络。

**Q: 报告可以自定义模板吗？**
A: 企业版用户可以自定义报告模板，包括添加企业 Logo、调整报告结构等。

**Q: API 调用有频率限制吗？**
A: 是的，不同订阅计划有不同的限流规则。基础版：100次/分钟，专业版：1000次/分钟，企业版：可定制。

### 10.2 技术相关

**Q: 支持哪些区块链？**
A: 目前支持 BTC、ETH、USDT（ERC20/TRC20）、TRX、SOL 等主流公链，更多公链持续接入中。

**Q: 数据更新频率是多少？**
A: 链上数据实时同步，风险标签库每日更新，黑名单库实时更新。

**Q: 如何保证数据安全？**
A: 采用多层安全措施：HTTPS 传输加密、数据库加密存储、严格的权限控制、完整的审计日志。

**Q: 支持私有化部署吗？**
A: 企业版支持私有化部署，提供完整的部署文档和技术支持。

### 10.3 账户相关

**Q: 如何升级订阅计划？**
A: 进入"设置" > "订阅管理"，选择新的计划并完成支付即可升级。

**Q: 可以添加多少团队成员？**
A: 基础版：5人，专业版：20人，企业版：无限制。

**Q: 如何管理团队成员权限？**
A: 进入"团队管理" > "成员管理"，可以为每个成员分配不同的角色和权限。

## 11. 技术支持

### 11.1 联系方式

- **技术支持邮箱**: support@chaintrace.com
- **商务合作**: business@chaintrace.com
- **紧急热线**: 400-xxx-xxxx（工作日 9:00-18:00）
- **在线客服**: 登录后点击右下角客服图标

### 11.2 文档资源

- **API 文档**: https://docs.chaintrace.com/api
- **用户手册**: https://docs.chaintrace.com/manual
- **视频教程**: https://docs.chaintrace.com/videos
- **开发者社区**: https://community.chaintrace.com

### 11.3 服务承诺

- **响应时间**: 
  - 紧急问题：2小时内响应
  - 一般问题：24小时内响应
  
- **系统可用性**: 99.9%

- **数据备份**: 每日全量备份 + 实时增量备份

- **技术培训**: 企业版用户提供免费技术培训

---

**文档版本**: v1.0  
**创建日期**: 2026-02-28  
**维护团队**: ChainTrace B端产品团队  
**最后更新**: 2026-02-28
