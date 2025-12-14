# Case 3 修复说明

## 问题修复

### 1. 节点数量过少（只有 5 个）✅

**问题原因**：
- 原代码只找了一个主要地址作为攻击者
- 其他地址都被标记为 neutral
- 导致大部分节点没有被正确分类

**解决方案**：
```typescript
// 修改前：只找一个主要地址
const mainAddress = Array.from(nodeStats.entries())
  .sort((a, b) => b[1].connectionCount - a[1].connectionCount)[0]?.[0];

// 修改后：找前 10 个主要发送者
const topSenders = Array.from(nodeStats.entries())
  .filter(([_, stats]) => stats.asFrom > 0)
  .sort((a, b) => b[1].asFrom - a[1].asFrom)
  .slice(0, 10)
  .map(([addr, _]) => addr);
```

**改进的分类逻辑**：

#### a) 攻击者（红色）
- 前 10 个主要发送者
- 作为 From 地址出现最多的

#### b) 受害者（粉红色）
- 有 NameTag 的合约地址（跨链桥、路由器等）
- 关键词：bridge, router, proxy, interchain, manager, wrapper, token, vault
- 主要接收者（作为 To 出现 > 10 次但从不作为 From）

#### c) 中性（灰色）
- 其他地址

**统计信息增强**：
```typescript
interface NodeStats {
  value: number;           // 总交易金额
  connectionCount: number; // 总连接数
  nameTag: string;         // 合约名称标签
  asFrom: number;          // 作为发送方的次数
  asTo: number;            // 作为接收方的次数
}
```

---

### 2. 粉红色不显示（victim 显示为红色）✅

**问题原因**：
- victim 的填充色设置为 `#ef4444`（红色）
- 与 attacker 的边框色相同，导致混淆

**解决方案**：

#### 颜色方案更新

| 节点类型 | 填充色 | 边框色 | 说明 |
|---------|--------|--------|------|
| mixer | #581c87 | #a855f7 | 深紫色/亮紫色 |
| attacker | #7f1d1d | #ef4444 | 深红色/红色 |
| victim | #be185d | #ec4899 | **深粉色/粉色** ← 修复 |
| neutral | #000 | #4b5563 | 黑色/灰色 |

#### 代码修改
```typescript
// 填充色
if (d.group === "mixer") return "#581c87";
if (d.group === "attacker") return "#7f1d1d";
if (d.group === "victim") return "#be185d";  // 改为深粉色
return "#000";

// 边框色
if (d.group === "mixer") return "#a855f7";
if (d.group === "attacker") return "#ef4444";
if (d.group === "victim") return "#ec4899";  // 改为粉色
return "#4b5563";
```

#### 鼠标悬停恢复
```typescript
.on("mouseout", (event, d) => {
  d3.select(event.currentTarget).attr(
    "fill",
    d.group === "mixer" ? "#581c87" : 
    d.group === "attacker" ? "#7f1d1d" : 
    d.group === "victim" ? "#be185d" :  // 添加 victim 的恢复
    "#000"
  );
})
```

---

## 预期效果

### 节点数量
- **修复前**：5 个节点
- **修复后**：100+ 个节点（根据实际数据）

### 节点分布
- **红色（攻击者）**：10 个主要发送者
- **粉红色（受害者）**：20-30 个跨链桥/合约
- **灰色（中性）**：其他地址

### 可视化效果
- ✅ 红色节点：主要发送者，位于左侧
- ✅ 粉红色节点：跨链桥/路由器，清晰可见
- ✅ 灰色节点：其他参与地址
- ✅ 颜色区分明显，不再混淆

---

## 数据统计

### 地址分类示例

#### 主要发送者（前 10）
```
0xcA74F404E0C7bfA35B13B511097df966D5a65597  (373 次)
0xAc18D21721d4702Fce58Ae775ED9C1bd18FAAC88  (369 次)
0x65A8F07Bd9A8598E1b5B6C0a88F4779DBC077675  (150 次)
0x3E0954d9b32F823aFF2F66173ffEd5f453DEdD93  (146 次)
...
```

#### 跨链桥/合约（NameTag）
```
NttManagerWithExecutor
ProxyOFTWithFee
RaveToken
Interchain Token Service
Squid Router Proxy
ControllerWrapper
OrigamiHOhmVault
...
```

---

## 测试验证

### 测试步骤
1. 切换到 "Case 3: 跨链资金转移"
2. 等待数据加载
3. 检查节点数量（应该 > 100）
4. 检查颜色：
   - 红色节点（攻击者）
   - 粉红色节点（受害者/跨链桥）
   - 灰色节点（中性）

### 预期结果
- ✅ 节点数量显著增加
- ✅ 粉红色节点清晰可见
- ✅ 颜色区分明显
- ✅ 可以看到完整的跨链路径

---

## 技术细节

### 节点统计
```typescript
// 统计每个地址作为发送方和接收方的次数
fromStats.asFrom++;  // 作为 From
toStats.asTo++;      // 作为 To
```

### 分类优先级
1. 检查是否是主要发送者 → attacker
2. 检查是否有 NameTag（合约） → victim
3. 检查是否是主要接收者 → victim
4. 其他 → neutral

### 颜色选择
- 使用 Tailwind CSS 的颜色系统
- `#be185d` = pink-700（深粉色）
- `#ec4899` = pink-500（粉色）
- 与红色有明显区别

---

## 总结

✅ 修复了节点数量过少的问题
✅ 修复了粉红色不显示的问题
✅ 改进了节点分类逻辑
✅ 增强了数据统计功能
✅ 提升了可视化效果

现在 Case 3 可以正确显示所有节点，并且颜色区分清晰！
