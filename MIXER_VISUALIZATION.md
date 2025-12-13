# 混币器可视化和进出账显示

## 问题修复

### 1. 进出账颜色显示 ✅

**问题**：点击节点后，连线不再显示红色（出账）和绿色（入账）

**原因**：
- 改用 `path` 元素后，选择器从 `.link-line` 改为 `path.link-line`
- 需要根据 `source` 和 `target` 判断方向

**解决方案**：
```typescript
// 入账用绿色，出账用红色
if (targetId === selectedNode.id) return "#10b981"; // 绿色 - 入账
if (sourceId === selectedNode.id) return "#ef4444"; // 红色 - 出账
```

**效果**：
- ✅ 选中节点后，入账连线显示为绿色
- ✅ 出账连线显示为红色
- ✅ 连线宽度根据金额动态调整
- ✅ 未选中的连线变暗（透明度 0.1）

---

### 2. 混币器节点特殊标识 ✅

**混币器地址**：`0xa160cdab225685da1d56aa342ad8841c3b53f291`
**名称**：Tornado.Cash: 100 ETH

**视觉设计**：

#### a) 紫色主题
```typescript
fill: "#581c87"      // 深紫色填充
stroke: "#a855f7"    // 亮紫色边框
stroke-width: 3      // 更粗的边框
```

#### b) 外框标识
- 虚线矩形框（120×100px）
- 紫色发光效果
- 动画虚线（20秒循环）
- 圆角边框（8px）

#### c) 标签显示
- 顶部紫色标签背景
- 白色文字显示 "TORNADO CASH"
- 粗体等宽字体

#### d) 节点大小
- 混币器节点比普通节点大 1.5 倍
- 更容易识别和点击

**实现代码**：

```typescript
// 外框
g.insert("rect", ":first-child")
  .attr("class", "mixer-frame")
  .attr("x", -60)
  .attr("y", -50)
  .attr("width", 120)
  .attr("height", 100)
  .attr("fill", "none")
  .attr("stroke", "#a855f7")
  .attr("stroke-width", 3)
  .attr("stroke-dasharray", "5,5")
  .attr("rx", 8)
  .attr("filter", "url(#glow)");

// 标签
g.append("text")
  .text(d.mixerName || "MIXER")
  .attr("y", -32)
  .attr("font-weight", "bold")
  .attr("fill", "#fff");
```

---

## 节点类型

### 新增类型：mixer
```typescript
type NodeGroup = "attacker" | "victim" | "neutral" | "mixer";
```

### 颜色方案
| 类型 | 填充色 | 边框色 | 说明 |
|------|--------|--------|------|
| mixer | #581c87 | #a855f7 | 混币器（紫色） |
| attacker | #7f1d1d | #ef4444 | 攻击者（红色） |
| victim | #ef4444 | #fca5a5 | 受害者（粉红） |
| neutral | #000 | #4b5563 | 中性（灰色） |

---

## 数据处理

### 混币器识别
```typescript
const isMixer = addrTags.some(tag => 
  tag.tag_value.includes('MIXER') || 
  tag.tag_value.includes('TORNADO')
);
```

### 标签提取
```typescript
const mixerName = mixerTag
  .tag_value
  .replace('MIXER_', '')
  .replace('_', ' ');
// "MIXER_TORNADO_CASH" → "TORNADO CASH"
```

---

## 交互效果

### 选中节点
- 节点边框变为青色 (#06b6d4)
- 添加发光效果
- 相关连线高亮
- 入账连线变绿色
- 出账连线保持红色

### 悬停节点
- 填充色变浅 (#222)
- 显示地址预览
- 鼠标变为指针

### 拖拽节点
- 鼠标变为抓手 (grab/grabbing)
- 连线实时跟随
- 位置固定

---

## 动画效果

### 虚线框动画
```css
@keyframes dash {
  to {
    stroke-dashoffset: -1000;
  }
}
```
- 20 秒完整循环
- 线性动画
- 无限循环

### 连线鼓包
- 沿曲线移动
- 2-3 秒持续时间
- 随机延迟启动
- 1-4 秒间隔重复

---

## 使用说明

### 查看混币器
1. 切换到 "Case 2: KuCoin 混币器洗钱"
2. 找到紫色虚线框的节点
3. 点击查看详细信息

### 分析资金流向
1. 点击混币器节点
2. 绿色连线 = 流入混币器的资金
3. 红色连线 = 从混币器流出的资金
4. 右侧面板显示交易详情

---

## 技术细节

### 节点属性
```typescript
interface GraphNode {
  id: string;
  group: "attacker" | "victim" | "neutral" | "mixer";
  value: number;
  connectionCount: number;
  isMixer?: boolean;      // 是否是混币器
  mixerName?: string;     // 混币器名称
}
```

### 渲染顺序
1. 外框矩形（最底层）
2. 标签背景
3. 标签文字
4. 节点六边形
5. 节点文字（地址）

---

## 未来改进

### 多混币器支持
- 自动识别所有混币器
- 不同混币器用不同颜色
- 支持混币器集群

### 路径追踪
- 高亮从黑客到混币器的完整路径
- 显示资金在混币器中的停留时间
- 追踪混币器后的资金去向

### 统计分析
- 混币器总流入/流出金额
- 混币器使用频率
- 风险评分计算

---

## 测试数据

### KuCoin 案例
- 混币器地址：`0xa160cdab225685da1d56aa342ad8841c3b53f291`
- 混币器名称：Tornado.Cash: 100 ETH
- 风险评分：85.0
- 交易数：43825 入 / 71374 出
- 余额：1400.0 ETH

---

## 总结

✅ 修复了进出账颜色显示
✅ 添加了混币器特殊标识
✅ 实现了紫色主题和动画效果
✅ 提升了可视化的专业性和可读性
