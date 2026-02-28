# ChainTrace 开发协作指南 v1.0

## 1. 团队组织架构

### 1.1 团队角色

```
ChainTrace 团队
├── 产品团队
│   ├── 产品经理（1人）
│   ├── 产品运营（1人）
│   └── 用户研究（1人）
├── 技术团队
│   ├── 技术负责人（1人）
│   ├── 后端团队（6人）
│   │   ├── 后端架构师（1人）
│   │   ├── 后端开发工程师（4人）
│   │   └── 数据工程师（1人）
│   ├── 前端团队（4人）
│   │   ├── 前端架构师（1人）
│   │   └── 前端开发工程师（3人）
│   ├── 算法团队（3人）
│   │   ├── 算法负责人（1人）
│   │   └── 算法工程师（2人）
│   └── 测试团队（2人）
│       ├── 测试负责人（1人）
│       └── 测试工程师（1人）
├── 安全团队
│   ├── 安全负责人（1人）
│   └── 安全工程师（1人）
└── 运维团队
    ├── 运维负责人（1人）
    └── 运维工程师（1人）
```

### 1.2 职责分工

#### 产品团队
- 需求调研和分析
- 产品规划和设计
- 用户体验优化
- 数据分析和运营

#### 后端团队
- 系统架构设计
- API 接口开发
- 数据库设计
- 性能优化

#### 前端团队
- UI/UX 实现
- 交互逻辑开发
- 可视化组件开发
- 前端性能优化

#### 算法团队
- 算法研发
- 模型训练
- 算法优化
- 效果评估

#### 测试团队
- 测试计划制定
- 功能测试
- 性能测试
- 自动化测试

## 2. 开发流程

### 2.1 敏捷开发流程

```
Sprint 周期：2周

Sprint 流程
├── Sprint 计划会（第1天）
│   ├── 需求评审
│   ├── 任务拆分
│   └── 工作量评估
├── 每日站会（每天15分钟）
│   ├── 昨天完成的工作
│   ├── 今天计划的工作
│   └── 遇到的问题
├── 开发阶段（第2-10天）
│   ├── 编码开发
│   ├── 代码审查
│   └── 单元测试
├── 测试阶段（第11-13天）
│   ├── 功能测试
│   ├── 集成测试
│   └── Bug 修复
└── Sprint 回顾会（第14天）
    ├── 演示成果
    ├── 回顾总结
    └── 改进计划
```

### 2.2 需求管理

#### 需求提交流程
```
1. 产品经理提交需求文档
   ↓
2. 技术评审（可行性、工作量）
   ↓
3. 需求优先级排序
   ↓
4. 纳入 Sprint 计划
   ↓
5. 开发实现
   ↓
6. 测试验收
   ↓
7. 上线发布
```

#### 需求文档模板
```markdown
# 需求标题

## 需求背景
描述为什么要做这个需求

## 需求目标
明确要达成的目标

## 功能描述
详细描述功能点

## 用户故事
作为【角色】，我想要【功能】，以便【价值】

## 验收标准
- [ ] 标准1
- [ ] 标准2

## 技术方案（可选）
技术实现建议

## 优先级
P0/P1/P2/P3

## 预期工期
X 人天
```

### 2.3 任务管理

#### 使用 Jira/Trello 管理任务

**任务状态流转**
```
待办 → 进行中 → 代码审查 → 测试中 → 已完成
```

**任务优先级**
- P0：紧急且重要（立即处理）
- P1：重要不紧急（本周完成）
- P2：紧急不重要（本月完成）
- P3：不紧急不重要（排期处理）

## 3. 代码规范

### 3.1 Git 工作流

#### 分支策略
```
分支模型
├── main（主分支）
│   └── 生产环境代码
├── develop（开发分支）
│   └── 开发环境代码
├── feature/*（功能分支）
│   └── 新功能开发
├── bugfix/*（修复分支）
│   └── Bug 修复
├── hotfix/*（热修复分支）
│   └── 紧急修复
└── release/*（发布分支）
    └── 发布准备
```

#### 分支命名规范
```
feature/JIRA-123-add-mixer-detection
bugfix/JIRA-456-fix-path-calculation
hotfix/JIRA-789-fix-critical-bug
release/v1.2.0
```

#### Commit 规范
```
格式：<type>(<scope>): <subject>

type 类型：
- feat: 新功能
- fix: 修复 Bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- perf: 性能优化
- test: 测试相关
- chore: 构建/工具相关

示例：
feat(api): add mixer detection endpoint
fix(frontend): fix graph rendering issue
docs(readme): update installation guide
```

### 3.2 代码审查

#### Code Review 流程
```
1. 开发完成后提交 Pull Request
   ↓
2. 自动化检查（CI）
   ├── 代码格式检查
   ├── 单元测试
   └── 代码覆盖率
   ↓
3. 指定审查人员（至少2人）
   ↓
4. 审查人员 Review
   ├── 代码质量
   ├── 业务逻辑
   ├── 性能考虑
   └── 安全问题
   ↓
5. 修改反馈意见
   ↓
6. 审查通过，合并代码
```

#### Code Review 检查清单
```markdown
## 功能性
- [ ] 功能是否符合需求
- [ ] 边界条件是否处理
- [ ] 错误处理是否完善

## 代码质量
- [ ] 代码是否清晰易读
- [ ] 命名是否规范
- [ ] 是否有重复代码
- [ ] 是否有过度设计

## 性能
- [ ] 是否有性能问题
- [ ] 数据库查询是否优化
- [ ] 是否有内存泄漏

## 安全
- [ ] 是否有安全漏洞
- [ ] 输入是否验证
- [ ] 敏感信息是否加密

## 测试
- [ ] 是否有单元测试
- [ ] 测试覆盖率是否达标
- [ ] 是否有集成测试
```

### 3.3 编码规范

#### 后端编码规范（Python）
```python
# 1. 命名规范
class AddressAnalyzer:  # 类名：大驼峰
    def calculate_risk_score(self, address: str) -> int:  # 方法名：小写+下划线
        risk_score = 0  # 变量名：小写+下划线
        MAX_SCORE = 100  # 常量：大写+下划线
        
# 2. 类型注解
def get_address_info(address: str, chain: str = 'ETH') -> dict:
    pass

# 3. 文档字符串
def analyze_transaction(tx_hash: str) -> dict:
    """
    分析交易详情
    
    Args:
        tx_hash: 交易哈希
        
    Returns:
        dict: 交易分析结果
        
    Raises:
        ValueError: 交易哈希格式错误
    """
    pass

# 4. 错误处理
try:
    result = risky_operation()
except SpecificException as e:
    logger.error(f"Operation failed: {e}")
    raise
finally:
    cleanup()
```

#### 前端编码规范（TypeScript）
```typescript
// 1. 命名规范
interface AddressInfo {  // 接口：大驼峰
  address: string;
  balance: number;
}

class AddressService {  // 类名：大驼峰
  private apiUrl: string;  // 私有属性：小驼峰
  
  public getAddressInfo(address: string): Promise<AddressInfo> {  // 方法：小驼峰
    // ...
  }
}

const MAX_RETRY = 3;  // 常量：大写+下划线

// 2. 类型定义
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface RiskScore {
  score: number;
  level: RiskLevel;
  factors: Record<string, number>;
}

// 3. 函数注释
/**
 * 计算地址风险评分
 * @param address - 地址
 * @param chain - 链类型
 * @returns 风险评分结果
 */
async function calculateRiskScore(
  address: string,
  chain: string
): Promise<RiskScore> {
  // ...
}

// 4. 错误处理
try {
  const result = await fetchData();
} catch (error) {
  if (error instanceof NetworkError) {
    handleNetworkError(error);
  } else {
    handleUnknownError(error);
  }
}
```

## 4. 测试规范

### 4.1 测试策略

```
测试金字塔
├── 单元测试（70%）
│   ├── 函数级测试
│   └── 类级测试
├── 集成测试（20%）
│   ├── API 测试
│   └── 数据库测试
└── E2E 测试（10%）
    ├── 用户流程测试
    └── UI 测试
```

### 4.2 单元测试

#### Python 单元测试示例
```python
import pytest
from app.services.risk_scorer import RiskScorer

class TestRiskScorer:
    @pytest.fixture
    def scorer(self):
        return RiskScorer()
    
    def test_calculate_risk_score_normal_address(self, scorer):
        """测试正常地址的风险评分"""
        address = "0x123..."
        result = scorer.calculate_risk_score(address)
        
        assert result['total_score'] >= 0
        assert result['total_score'] <= 100
        assert result['risk_level'] in ['safe', 'low', 'medium', 'high', 'critical']
    
    def test_calculate_risk_score_blacklist_address(self, scorer):
        """测试黑名单地址的风险评分"""
        address = "0xblacklist..."
        result = scorer.calculate_risk_score(address)
        
        assert result['total_score'] >= 80
        assert result['risk_level'] in ['high', 'critical']
    
    @pytest.mark.parametrize("address,expected_level", [
        ("0xsafe...", "safe"),
        ("0xlow...", "low"),
        ("0xhigh...", "high"),
    ])
    def test_risk_levels(self, scorer, address, expected_level):
        """参数化测试不同风险等级"""
        result = scorer.calculate_risk_score(address)
        assert result['risk_level'] == expected_level
```

#### TypeScript 单元测试示例
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { AddressService } from '@/services/AddressService';

describe('AddressService', () => {
  let service: AddressService;
  
  beforeEach(() => {
    service = new AddressService();
  });
  
  it('should fetch address info successfully', async () => {
    const address = '0x123...';
    const result = await service.getAddressInfo(address);
    
    expect(result).toBeDefined();
    expect(result.address).toBe(address);
    expect(result.balance).toBeGreaterThanOrEqual(0);
  });
  
  it('should throw error for invalid address', async () => {
    const invalidAddress = 'invalid';
    
    await expect(
      service.getAddressInfo(invalidAddress)
    ).rejects.toThrow('Invalid address format');
  });
  
  it('should handle network errors', async () => {
    // Mock network error
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    
    await expect(
      service.getAddressInfo('0x123...')
    ).rejects.toThrow('Network error');
  });
});
```

### 4.3 集成测试

#### API 集成测试
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestAddressAPI:
    def test_get_address_info(self):
        """测试获取地址信息接口"""
        response = client.get("/api/v1/address/ETH/0x123...")
        
        assert response.status_code == 200
        data = response.json()
        assert data['code'] == 200
        assert 'address' in data['data']
    
    def test_get_address_info_invalid_chain(self):
        """测试无效链类型"""
        response = client.get("/api/v1/address/INVALID/0x123...")
        
        assert response.status_code == 400
        data = response.json()
        assert data['code'] == 400
    
    def test_rate_limit(self):
        """测试限流"""
        # 发送大量请求
        for _ in range(101):
            response = client.get("/api/v1/address/ETH/0x123...")
        
        assert response.status_code == 429
```

### 4.4 测试覆盖率要求

```
覆盖率要求
├── 核心业务代码：>= 80%
├── 工具类代码：>= 70%
├── API 接口：>= 90%
└── 整体覆盖率：>= 75%
```

## 5. 文档规范

### 5.1 代码文档

#### API 文档（使用 OpenAPI/Swagger）
```yaml
openapi: 3.0.0
info:
  title: ChainTrace API
  version: 1.0.0
  description: 区块链溯源分析平台 API

paths:
  /api/v1/address/{chain}/{address}:
    get:
      summary: 查询地址信息
      parameters:
        - name: chain
          in: path
          required: true
          schema:
            type: string
        - name: address
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AddressInfo'
```

### 5.2 技术文档

#### 文档目录结构
```
docs/
├── architecture/          # 架构文档
│   ├── system-design.md
│   └── database-design.md
├── api/                   # API 文档
│   └── api-reference.md
├── development/           # 开发文档
│   ├── setup-guide.md
│   └── coding-standards.md
├── deployment/            # 部署文档
│   └── deployment-guide.md
└── user/                  # 用户文档
    └── user-manual.md
```

## 6. 沟通协作

### 6.1 沟通工具

```
工具选择
├── 即时通讯：Slack / 企业微信
├── 视频会议：Zoom / 腾讯会议
├── 项目管理：Jira / Trello
├── 文档协作：Confluence / 语雀
├── 代码托管：GitLab / GitHub
└── 设计协作：Figma / 蓝湖
```

### 6.2 会议规范

#### 每日站会
- 时间：每天上午 10:00
- 时长：15 分钟
- 内容：
  - 昨天完成的工作
  - 今天计划的工作
  - 遇到的问题和阻碍

#### Sprint 计划会
- 时间：Sprint 第一天
- 时长：2 小时
- 参与人：全体团队成员
- 内容：
  - 需求评审
  - 任务拆分
  - 工作量评估
  - Sprint 目标确定

#### Sprint 回顾会
- 时间：Sprint 最后一天
- 时长：1 小时
- 内容：
  - 成果演示
  - 问题回顾
  - 改进措施

## 7. 知识管理

### 7.1 知识库建设

```
知识库结构
├── 技术文档
│   ├── 架构设计
│   ├── 技术方案
│   └── 最佳实践
├── 业务文档
│   ├── 产品需求
│   ├── 业务流程
│   └── 用户手册
├── 运维文档
│   ├── 部署指南
│   ├── 故障处理
│   └── 监控告警
└── 团队文档
    ├── 开发规范
    ├── 协作流程
    └── 培训资料
```

### 7.2 技术分享

- 每周技术分享会（周五下午）
- 主题：新技术、最佳实践、踩坑经验
- 形式：PPT 演讲 + 讨论
- 记录：分享内容归档到知识库

---

**文档版本**：v1.0  
**创建日期**：2026-02-28  
**维护团队**：ChainTrace 全体团队
