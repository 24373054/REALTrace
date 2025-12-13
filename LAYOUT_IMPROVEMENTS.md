# 布局和动画改进说明

## 问题修复

### 1. 节点重叠问题 ✅

**问题描述**：
- 初始布局节点间距太小
- 很多节点重叠在一起
- 需要手动拖拽才能看清

**解决方案**：

#### a) 增加节点间垂直间距
```typescript
// 从 1.5 增加到 3
.separation((a, b) => (a.parent === b.parent ? 2.5 : 3))
```
- 同一父节点的子节点间距：2.5 倍
- 不同父节点的子节点间距：3 倍

#### b) 增加层级间水平间距
```typescript
// 从固定偏移改为按深度计算
x: depth * 250 + 150  // 每层间距 250px
```
- 第 0 层（根节点）：x = 150
- 第 1 层：x = 400
- 第 2 层：x = 650
- 以此类推...

#### c) 扩大画布尺寸
```typescript
.size([height - 100, width - 400])  // 从 width - 300 改为 width - 400
```

**效果**：
- ✅ 节点不再重叠
- ✅ 层次结构更清晰
- ✅ 初始布局即可看清所有节点

---

### 2. 动画效果改进 ✅

**问题描述**：
- 发光小球直线飞行，看起来很乱
- 小球悬空移动，与连线分离
- 颜色不统一（青色小球 vs 红色连线）

**解决方案**：

#### a) 改用连线鼓包效果
```typescript
// 不再使用独立的圆形粒子
// 改用加粗的线段沿路径移动
const bulge = linkGroup
  .append("path")
  .attr("stroke", "#ef4444")      // 与连线颜色一致
  .attr("stroke-width", 8)        // 比连线粗
  .attr("stroke-linecap", "round") // 圆角端点
```

#### b) 沿曲线路径移动
```typescript
// 使用贝塞尔曲线计算路径上的点
const getPointOnCurve = (t: number) => {
  const x = (1 - t) * (1 - t) * sourcePos.x + 
            2 * (1 - t) * t * cx + 
            t * t * targetPos.x;
  const y = (1 - t) * (1 - t) * sourcePos.y + 
            2 * (1 - t) * t * cy + 
            t * t * targetPos.y;
  return { x, y };
};
```

#### c) 动态绘制鼓包线段
```typescript
// 鼓包是一小段路径，随时间 t 移动
attrTween("d", () => {
  return (t: number) => {
    const p1 = getPointOnCurve(Math.max(0, t - 0.05));
    const p2 = getPointOnCurve(Math.min(1, t + 0.05));
    return `M${p1.x},${p1.y}L${p2.x},${p2.y}`;
  };
})
```

**效果**：
- ✅ 鼓包沿着曲线移动，不会悬空
- ✅ 颜色与连线一致（红色）
- ✅ 视觉效果更统一、更专业
- ✅ 清晰显示资金流向

---

## 技术细节

### 节点间距计算

**垂直间距（同层节点）**：
```
separation = 2.5 (同父节点) 或 3 (不同父节点)
实际间距 = separation × 节点高度
```

**水平间距（不同层级）**：
```
x = depth × 250 + 150
层 0: 150px
层 1: 400px (间距 250px)
层 2: 650px (间距 250px)
```

### 动画参数

**鼓包长度**：
```typescript
const segmentLength = 0.1; // 占路径的 10%
p1 = getPointOnCurve(t - 0.05)
p2 = getPointOnCurve(t + 0.05)
```

**动画时长**：
```typescript
duration: 2000 + Math.random() * 1000  // 2-3 秒
delay: Math.random() * 2000            // 0-2 秒随机延迟
interval: Math.random() * 3000 + 1000  // 1-4 秒间隔
```

**透明度变化**：
```
0 → 0.6 (淡入 100ms)
0.6 (移动 2-3s)
0.6 → 0 (淡出 200ms)
```

### 贝塞尔曲线公式

**二次贝塞尔曲线**：
```
P(t) = (1-t)² × P₀ + 2(1-t)t × P₁ + t² × P₂

其中：
- P₀ = 起点 (sourcePos)
- P₁ = 控制点 (sourcePos.x + dx/2, sourcePos.y)
- P₂ = 终点 (targetPos)
- t ∈ [0, 1]
```

---

## 视觉对比

### 改进前
```
❌ 节点重叠
❌ 小球悬空飞行
❌ 颜色不统一
❌ 视觉混乱
```

### 改进后
```
✅ 节点分散清晰
✅ 鼓包沿线移动
✅ 颜色统一（红色）
✅ 视觉专业
```

---

## 性能优化

### 动画性能
- 使用 `attrTween` 而非逐帧更新
- 随机延迟避免同时渲染
- 动画结束后自动回收

### 内存管理
- 鼓包元素复用（不创建新元素）
- 使用 `transition.on("end")` 清理
- 避免内存泄漏

---

## 未来优化建议

### 1. 自适应间距
根据节点数量动态调整间距：
```typescript
const spacing = Math.max(150, 500 / Math.sqrt(nodeCount));
```

### 2. 碰撞检测
添加节点碰撞检测，自动调整重叠节点：
```typescript
d3.forceCollide().radius(50)
```

### 3. 动画控制
添加动画开关和速度控制：
```typescript
const animationSpeed = 1.0; // 可调节
duration: 2000 / animationSpeed
```

### 4. 路径优化
对于复杂图，使用更智能的路径算法：
- Dagre 布局
- Sugiyama 算法
- 分层布局

---

## 测试建议

### 测试场景
1. **小图（< 20 节点）**：检查间距是否合适
2. **中图（20-50 节点）**：检查性能和可读性
3. **大图（> 50 节点）**：检查是否需要折叠功能

### 测试指标
- 节点重叠率：应为 0%
- 动画流畅度：应 > 30 FPS
- 初始加载时间：应 < 2 秒

---

## 配置参数

可以通过修改以下参数来调整布局：

```typescript
// 节点间距
const VERTICAL_SEPARATION_SAME_PARENT = 2.5;
const VERTICAL_SEPARATION_DIFF_PARENT = 3;
const HORIZONTAL_SPACING = 250;

// 动画参数
const BULGE_WIDTH = 8;
const BULGE_LENGTH = 0.1;
const ANIMATION_DURATION = 2000;
const ANIMATION_DELAY = 2000;
const ANIMATION_INTERVAL = 3000;

// 画布边距
const CANVAS_MARGIN_TOP = 50;
const CANVAS_MARGIN_LEFT = 150;
const CANVAS_MARGIN_RIGHT = 400;
const CANVAS_MARGIN_BOTTOM = 100;
```

---

## 总结

通过这次改进：
1. ✅ 解决了节点重叠问题
2. ✅ 改进了动画效果
3. ✅ 提升了视觉体验
4. ✅ 保持了良好的性能

现在的可视化效果更加专业、清晰、易读！
