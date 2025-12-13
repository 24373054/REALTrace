# CyberTrace 可视化更新说明

## 更新内容

### 1. 树状布局（Tree Layout）
- **从左到右展开**: 根节点（攻击者）位于左侧，资金流向从左向右展开
- **层次清晰**: 每一层代表资金流动的一个跳转
- **固定位置**: 节点不再随机飘动，初始位置由树状算法计算

### 2. 可拖拽画布
- **手动调整**: 可以拖拽任意节点调整其位置
- **实时更新**: 拖拽节点时，连接线会实时跟随更新
- **缩放平移**: 支持鼠标滚轮缩放和拖拽画布平移

### 3. 动画效果
- **流动粒子**: 每条连接线上都有发光的小球沿着路径移动
- **方向指示**: 粒子移动方向表示资金流向（从源地址到目标地址）
- **箭头标记**: 连接线末端有箭头指示方向
- **曲线路径**: 使用贝塞尔曲线使连接线更加美观

### 4. 多案例支持
- **Case 1**: 黑客攻击链路（原有数据）
- **Case 2**: KuCoin 混币器洗钱案例（新增）
- **下拉切换**: 顶部工具栏可快速切换不同案例

## 技术实现

### 树状布局算法
```typescript
// 使用 D3 的 tree layout
const treeLayout = d3.tree<TreeNode>()
  .size([height - 100, width - 300])
  .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));
```

### 粒子动画
```typescript
// 沿路径移动的发光粒子
particle
  .transition()
  .duration(2000 + Math.random() * 1000)
  .ease(d3.easeLinear)
  .attrTween("cx", () => d3.interpolate(sourcePos.x, targetPos.x))
  .attrTween("cy", () => curvedInterpolation)
  .on("end", () => setTimeout(animateParticle, Math.random() * 3000));
```

### 曲线路径
```typescript
// 使用二次贝塞尔曲线
const path = `M${sourcePos.x},${sourcePos.y}Q${sourcePos.x + dx/2},${sourcePos.y},${targetPos.x},${targetPos.y}`;
```

## 使用说明

### 基本操作
1. **查看图谱**: 进入黑客链路视图后自动加载
2. **切换案例**: 点击顶部"CASE:"下拉菜单选择不同案例
3. **拖拽节点**: 鼠标按住节点拖动可调整位置
4. **缩放画布**: 鼠标滚轮缩放，拖拽空白区域平移
5. **选择节点**: 点击节点查看详细信息

### 视觉元素说明
- **红色六边形**: 攻击者/黑客地址
- **粉红色六边形**: 受害者/交易所地址
- **灰色六边形**: 中性地址
- **红色连线**: 资金流动路径
- **青色粒子**: 流动的资金（动画）
- **箭头**: 资金流向

### 节点大小
- 节点大小与交易金额成正比
- 越大的节点表示涉及的资金量越大

## 性能优化

### 已实现
- 固定节点位置，避免持续计算物理模拟
- 粒子动画使用随机延迟，避免同时渲染
- 树状布局一次性计算，不需要迭代

### 建议
- 节点数超过 100 时，考虑只显示关键路径
- 可以添加"折叠/展开"功能隐藏部分子树
- 大数据集建议预处理，只保留高价值交易

## 未来改进

### 计划功能
- [ ] 时间轴播放：按时间顺序播放交易
- [ ] 路径高亮：点击节点高亮所有相关路径
- [ ] 节点分组：自动识别并折叠相似节点
- [ ] 导出功能：导出当前视图为图片
- [ ] 搜索功能：快速定位特定地址
- [ ] 过滤器：按金额、时间、风险等级过滤

### 交互增强
- [ ] 双击节点展开更多层级
- [ ] 右键菜单：复制地址、查看区块浏览器等
- [ ] 节点标注：添加自定义备注
- [ ] 路径分析：计算两个节点之间的最短路径

## 数据要求

### 必需字段
```typescript
interface GraphNode {
  id: string;              // 地址
  group: "attacker" | "victim" | "neutral";  // 节点类型
  value: number;           // 交易金额
  connectionCount: number; // 连接数
}

interface GraphLink {
  source: string | GraphNode;  // 源地址
  target: string | GraphNode;  // 目标地址
  value: number;               // 金额
  asset: string;               // 资产类型
  hashes: string[];            // 交易哈希
}
```

### 可选字段
- `depth`: 节点深度（自动计算）
- `x`, `y`: 节点位置（自动计算）
- `fx`, `fy`: 固定位置（拖拽后设置）

## 故障排查

### 节点重叠
- 调整 `separation` 参数增加节点间距
- 手动拖拽节点调整位置

### 动画卡顿
- 减少粒子数量（修改动画触发频率）
- 降低动画持续时间

### 布局混乱
- 确保数据中有明确的根节点（攻击者）
- 检查连接关系是否形成有向无环图

## 技术栈

- **D3.js**: 数据可视化和布局算法
- **React**: 组件化开发
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式设计

## 参考资料

- [D3 Tree Layout](https://github.com/d3/d3-hierarchy#tree)
- [D3 Force Simulation](https://github.com/d3/d3-force)
- [D3 Transitions](https://github.com/d3/d3-transition)
