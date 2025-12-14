# Case 3: 跨链资金转移追踪

## 数据概述

### 数据来源
- 文件：`data/case3/跨链-以太坊部分.csv`
- 记录数：2346 条交易
- 链：以太坊 (Ethereum)
- 类型：跨链交易追踪

### 数据特点
- 涉及多个跨链桥和路由器
- 包含 ERC-20 代币转账
- 记录了详细的合约名称标签
- 时间范围：2025-12-13

---

## 数据结构

### CSV 列定义

| 列名 | 说明 | 示例 |
|------|------|------|
| Transaction Hash | 交易哈希 | 0x5480a4ca... |
| Status | 交易状态 | Success |
| Type | 交易类型 | ERC-20 |
| Method | 调用方法 | transfer, sendFrom, send |
| Block | 区块号 | 24004649 |
| Age | 时间戳 | 2025-12-13T15:42:59.000000Z |
| From | 发送地址 | 0xAc18D21... |
| From_NameTag | 发送方标签 | (通常为空) |
| From_Note | 发送方备注 | (通常为空) |
| To | 接收地址 | 0xD2D9c93... |
| To_NameTag | 接收方标签 | NttManagerWithExecutor |
| To_Note | 接收方备注 | (通常为空) |
| Amount | 金额 | 0.000447653853916627 |
| Value (USD) | 美元价值 | $1.39 |
| Asset | 资产类型 | Ethereum(ETH) |
| Txn Fee | 交易费用 | 1.084036232955e-05 |

---

## 节点分类

### 主要地址（攻击者/发起者）
- 标识：交易频率最高的地址
- 颜色：红色
- 特征：作为大部分交易的发送方

### 跨链桥/路由器（受害者/目标）
- 标识：具有特殊名称标签的合约
- 颜色：粉红色
- 关键词：
  - Bridge
  - Router
  - Proxy
  - Interchain
  - Manager
  - Wrapper

### 中性地址
- 标识：其他地址
- 颜色：灰色

---

## 涉及的跨链协议

### 已识别的协议/合约

1. **NttManagerWithExecutor**
   - 类型：跨链消息管理器
   - 功能：执行跨链交易

2. **ProxyOFTWithFee**
   - 类型：代理合约
   - 功能：带手续费的跨链代币转移

3. **RaveToken**
   - 类型：代币合约
   - 功能：代币发送

4. **Interchain Token Service**
   - 类型：跨链代币服务
   - 功能：跨链代币转移

5. **Squid Router Proxy**
   - 类型：路由器代理
   - 功能：跨链路由

6. **ControllerWrapper**
   - 类型：控制器包装器
   - 功能：控制跨链操作

---

## 数据处理逻辑

### 节点创建
```typescript
// 统计每个地址的交易频率和金额
nodeStats.set(address, {
  value: totalAmount,
  connectionCount: txCount,
  nameTag: contractName
});

// 找到主要地址（交易频率最高）
const mainAddress = Array.from(nodeStats.entries())
  .sort((a, b) => b[1].connectionCount - a[1].connectionCount)[0]?.[0];
```

### 节点分类
```typescript
if (address === mainAddress) {
  group = "attacker"; // 主要发起者
} else if (nameTag.includes('bridge') || 
           nameTag.includes('router') || 
           nameTag.includes('proxy') ||
           nameTag.includes('interchain')) {
  group = "victim"; // 跨链桥/路由器
} else {
  group = "neutral"; // 其他地址
}
```

### 链接聚合
```typescript
// 相同方向的交易合并
const key = `${from}-${to}`;
if (linkMap.has(key)) {
  link.value += amount;
  link.hashes.push(txHash);
}
```

---

## 可视化特点

### 布局
- 树状布局，从左到右展开
- 主要地址在左侧（根节点）
- 跨链桥/路由器向右展开

### 颜色方案
- 红色：主要发起者
- 粉红色：跨链桥/路由器
- 灰色：其他地址
- 绿色连线：入账
- 红色连线：出账

### 交互
- 点击节点查看详情
- 查看交易日志
- 拖拽调整位置
- 缩放和平移画布

---

## 使用说明

### 查看 Case 3
1. 进入黑客链路视图
2. 在顶部下拉菜单选择 "Case 3: 跨链资金转移"
3. 等待数据加载（2346 条交易）

### 分析跨链路径
1. 找到红色节点（主要发起者）
2. 跟踪红色连线（出账）到跨链桥
3. 查看跨链桥的标签名称
4. 分析资金流向和金额

### 查看交易详情
1. 点击任意节点
2. 右侧面板显示：
   - 地址信息
   - 交易统计
   - 交易日志（入账/出账）

---

## 数据统计

### 预期指标
- 节点数：约 100-200 个地址
- 链接数：2346 条交易
- 主要发起者：1 个
- 跨链桥/路由器：10-20 个
- 总交易量：根据实际数据计算

### 性能考虑
- 2346 条交易，数据量适中
- 加载时间：< 2 秒
- 渲染性能：流畅

---

## 与其他 Case 的区别

### Case 1: 黑客攻击链路
- 数据格式：简单 CSV（from, to, amount）
- 特点：黑客攻击路径
- 节点类型：攻击者、受害者

### Case 2: KuCoin 混币器洗钱
- 数据格式：三个 CSV（交易、地址、标签）
- 特点：混币器洗钱
- 节点类型：黑客、交易所、混币器

### Case 3: 跨链资金转移
- 数据格式：单个 CSV（详细交易记录）
- 特点：跨链交易
- 节点类型：发起者、跨链桥、其他地址
- 特殊字段：合约名称标签、方法名

---

## 技术实现

### CSV 解析
```typescript
// 处理带引号的字段
function parseCsvLine(line: string): string[] {
  let inQuotes = false;
  // 逐字符解析，处理逗号和引号
}
```

### 数据转换
```typescript
interface Case3Transaction {
  "Transaction Hash": string;
  From: string;
  To: string;
  Amount: string;
  To_NameTag: string;
  // ...
}
```

### 节点统计
```typescript
// 统计每个地址的交易频率和金额
nodeStats.set(address, {
  value: totalAmount,
  connectionCount: txCount,
  nameTag: contractName
});
```

---

## 未来改进

### 数据增强
- [ ] 添加 Solana 部分的跨链数据
- [ ] 识别更多跨链协议
- [ ] 添加时间轴分析

### 可视化增强
- [ ] 跨链桥节点特殊标识（类似混币器）
- [ ] 按协议类型分组显示
- [ ] 显示跨链路径高亮

### 分析功能
- [ ] 计算跨链手续费
- [ ] 识别异常跨链行为
- [ ] 生成跨链报告

---

## 总结

Case 3 展示了以太坊上的跨链资金转移路径，包含：
- ✅ 2346 条交易记录
- ✅ 多个跨链桥和路由器
- ✅ 详细的合约名称标签
- ✅ 完整的交易信息

通过可视化，可以清晰地看到：
- 资金从哪个地址发起
- 经过哪些跨链桥
- 最终流向哪里
- 每笔交易的金额和费用
