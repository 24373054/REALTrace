# Bug 修复：交易日志和混币器标签

## 问题 1: TRANSACTION_LOG 不显示 ✅

### 问题原因
在树状布局中，`link.source` 和 `link.target` 可能是字符串 ID，而不是对象引用。

原代码使用对象引用比较：
```typescript
// ❌ 错误：对象引用比较
const isIncoming = link.target === selectedNode;
return data.links.filter((l) => l.source === node || l.target === node);
```

### 解决方案
改用 ID 字符串比较：
```typescript
// ✅ 正确：ID 字符串比较
const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
const targetId = typeof link.target === 'object' ? link.target.id : link.target;
const isIncoming = targetId === selectedNode.id;
```

### 修复位置
1. `getNodeTransactions` 函数
2. 详情面板的交易列表渲染

### 效果
- ✅ 点击节点后，右侧详情面板显示 TRANSACTION_LOG
- ✅ 绿色边框 = 入账交易
- ✅ 红色边框 = 出账交易
- ✅ 显示交易金额和对方地址

---

## 问题 2: 混币器标签被六边形遮挡 ✅

### 问题原因
SVG 元素的渲染顺序是按添加顺序，后添加的元素在上层。

原代码顺序：
1. 外框矩形
2. 标签背景
3. 标签文字
4. **六边形** ← 遮挡了标签
5. 地址文字

### 解决方案
调整元素添加顺序：
1. 外框矩形（最底层）
2. **六边形**
3. 地址文字
4. 标签背景（最上层）
5. 标签文字（最上层）

### 代码调整
```typescript
// 1. 先添加外框（在六边形之前）
node.each(function(d) {
  if (d.isMixer) {
    g.insert("rect", ":first-child") // 插入到最前面
      .attr("class", "mixer-frame")
      ...
  }
});

// 2. 添加六边形
node.append("path")
  .attr("class", "node-hex")
  ...

// 3. 添加地址文字
node.append("text")
  ...

// 4. 最后添加混币器标签（在最上层）
node.each(function(d) {
  if (d.isMixer) {
    g.append("rect") // 标签背景
      .attr("class", "mixer-label-bg")
      ...
    g.append("text") // 标签文字
      .attr("class", "mixer-label")
      ...
  }
});
```

### 位置调整
- 外框高度：从 100px 增加到 120px
- 外框 Y 位置：从 -50 调整到 -70
- 标签 Y 位置：从 -45 调整到 -65（标签背景）
- 标签文字 Y：从 -32 调整到 -52

### 效果
- ✅ 混币器标签显示在六边形上方
- ✅ 标签清晰可见，不被遮挡
- ✅ 外框完整包围节点和标签

---

## 测试验证

### 测试步骤
1. 切换到 "Case 2: KuCoin 混币器洗钱"
2. 点击任意节点
3. 查看右侧详情面板的 TRANSACTION_LOG
4. 点击混币器节点（紫色虚线框）
5. 检查标签是否清晰可见

### 预期结果
- ✅ 所有节点都显示交易日志
- ✅ 入账交易显示绿色边框
- ✅ 出账交易显示红色边框
- ✅ 混币器标签在六边形上方
- ✅ 标签文字 "TORNADO CASH" 清晰可读

---

## 技术细节

### D3 元素顺序
SVG 中没有 z-index，元素顺序决定层级：
- 先添加的元素在底层
- 后添加的元素在顶层

### 插入方法
```typescript
g.insert("rect", ":first-child")  // 插入到最前面（底层）
g.append("rect")                   // 添加到最后面（顶层）
```

### ID 比较的重要性
在 D3 force simulation 和 tree layout 中：
- Force simulation: `source` 和 `target` 是对象引用
- Tree layout: 可能是字符串 ID
- 需要统一使用 ID 字符串比较

---

## 总结

✅ 修复了交易日志不显示的问题
✅ 修复了混币器标签被遮挡的问题
✅ 保持了连线高亮功能
✅ 提升了用户体验
