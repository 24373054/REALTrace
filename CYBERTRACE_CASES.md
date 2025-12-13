# CyberTrace 案例系统

## 概述

CyberTrace 黑客链路追踪系统现在支持多个案例（Case）的可视化分析。用户可以通过下拉菜单在不同的案例之间切换，查看不同的黑客攻击和洗钱路径。

## 当前案例

### Case 1: 黑客攻击链路
- **数据源**: `data/hacker_flow_full.csv`
- **描述**: 追踪黑客攻击的资金流向和洗钱路径
- **特点**: 展示从攻击者到受害者的完整资金流动链路

### Case 2: KuCoin 混币器洗钱
- **数据源**: `data/KUCOIN数据/`
  - `交易数据.csv` - 交易记录
  - `地址数据.csv` - 地址信息和风险评分
  - `标签数据.csv` - 地址标签（交易所、混币器、黑客等）
- **描述**: KuCoin 交易所被盗资金通过混币器洗钱的追踪分析
- **特点**: 
  - 展示交易所被盗资金的流向
  - 标识混币器（Tornado Cash）的使用
  - 显示高风险地址和洗钱路径

## 如何使用

1. **进入黑客链路视图**
   - 点击主界面工具栏中的"黑客链路"按钮
   - 或点击眼睛图标切换到赛博视图

2. **切换案例**
   - 在顶部工具栏找到"CASE:"下拉菜单
   - 选择想要查看的案例
   - 图谱会自动重新加载并显示新案例的数据

3. **查看案例信息**
   - 案例名称显示在下拉菜单中
   - 案例描述显示在下拉菜单右侧
   - 统计信息（节点数、链接数、交易量、威胁数）显示在右上角

## 添加新案例

要添加新的案例，需要以下步骤：

### 1. 准备数据

根据案例类型准备数据文件：

**方式 A: 简单格式（类似 Case 1）**
```csv
from,to,asset,asset_contract,amount,amount_raw,decimals,tx_count,tx_hashes
0xabc...,0xdef...,ETH,,1.5,1500000000000000000,18,1,0x123...
```

**方式 B: 详细格式（类似 Case 2）**

交易数据 (`交易数据.csv`):
```csv
tx_hash,chain,from_address,to_address,amount,token_symbol,risk_score,is_suspected,attributes
0x123...,ETHEREUM,0xabc...,0xdef...,100.5,ETH,90.0,true,"{""from_name"": ""Hacker""}"
```

地址数据 (`地址数据.csv`):
```csv
address,chain,risk_score,is_fraud,balance,tx_count_in,tx_count_out,additional_attributes
0xabc...,ETHEREUM,95.0,true,1000.5,50,100,"{""name"": ""Hacker Address""}"
```

标签数据 (`标签数据.csv`):
```csv
address,chain,tag_type,tag_value,source,confidence
0xabc...,ETHEREUM,FRAUD,HACKER,Blockscout,95.0
0xdef...,ETHEREUM,ENTITY,MIXER_TORNADO_CASH,Blockscout,100.0
```

### 2. 创建数据加载器

在 `components/cybertrace/` 目录下创建新的数据加载文件，例如 `case3Data.ts`:

```typescript
import csvRaw from "../../data/case3/data.csv?raw";
import { parseCsv } from "./utils";

export const loadCase3Data = () => parseCsv(csvRaw);
```

或者如果使用详细格式，参考 `kucoinData.ts` 的实现。

### 3. 注册案例

在 `App.tsx` 中添加新案例到 `hackerCases` 数组：

```typescript
const hackerCases: CaseConfig[] = [
  {
    id: 'case1',
    name: 'Case 1: 黑客攻击链路',
    description: '追踪黑客攻击的资金流向和洗钱路径',
    loader: loadHackerCsvData,
  },
  {
    id: 'case2',
    name: 'Case 2: KuCoin 混币器洗钱',
    description: 'KuCoin 交易所被盗资金通过混币器洗钱的追踪分析',
    loader: loadKucoinData,
  },
  {
    id: 'case3',
    name: 'Case 3: 你的案例名称',
    description: '你的案例描述',
    loader: loadCase3Data,
  },
];
```

### 4. 导入数据加载器

在 `App.tsx` 顶部添加导入：

```typescript
import { loadCase3Data } from './components/cybertrace/case3Data';
```

## 数据格式说明

### 节点类型
- `attacker`: 攻击者/黑客地址（红色）
- `victim`: 受害者/交易所地址（蓝色）
- `neutral`: 中性地址（灰色）

### 节点分类规则
系统会根据以下规则自动分类节点：
- 标签包含 "HACKER" 或类型为 "FRAUD" → 攻击者
- 标签包含 "EXCHANGE" 且不包含 "HACKER" → 受害者
- 标签包含 "MIXER" 或 "TORNADO" → 攻击者（高风险）
- 其他 → 中性

## 技术架构

```
App.tsx
  └─ HackerTraceView (cases: CaseConfig[])
      ├─ Case 选择器 (下拉菜单)
      ├─ CyberGraph (可视化图谱)
      └─ TransactionList (交易列表)

数据加载流程:
1. 用户选择 Case
2. 调用对应的 loader() 函数
3. 解析 CSV 数据
4. 生成节点和链接
5. 渲染图谱
```

## 注意事项

1. **CSV 文件编码**: 确保 CSV 文件使用 UTF-8 编码
2. **文件大小**: 大型 CSV 文件可能导致加载缓慢，建议控制在 10MB 以内
3. **数据质量**: 确保地址格式正确，金额为有效数字
4. **性能优化**: 节点数超过 1000 时可能影响性能，建议预处理数据

## 未来扩展

- [ ] 支持实时数据源（API）
- [ ] 支持更多数据格式（JSON、GraphML）
- [ ] 添加案例对比功能
- [ ] 支持自定义节点颜色和样式
- [ ] 添加时间轴动画
