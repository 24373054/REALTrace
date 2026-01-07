# OG 图片设计指南

## 尺寸要求
- **主图**: 1200 x 630 像素
- **格式**: JPG 或 PNG
- **文件大小**: < 1MB

## 设计元素

### 1. 背景
- 深色渐变背景（#000000 到 #1a1a2e）
- 或使用区块链网络可视化图作为背景（半透明）

### 2. Logo 和品牌
- ChainTrace Logo（左上角或居中）
- 尺寸：200-300px 宽

### 3. 主标题
```
ChainTrace
区块链资金追踪平台
```
- 字体：粗体，60-80px
- 颜色：白色或品牌色

### 4. 副标题/卖点
```
✓ 多链支持 (Solana/Ethereum)
✓ 交易图谱可视化
✓ 智能风险识别
```
- 字体：常规，30-40px
- 颜色：浅灰色 (#cccccc)

### 5. 视觉元素
- 交易图谱示意图（节点和连线）
- 或产品界面截图（半透明叠加）

### 6. 底部信息
```
trace.matrixlab.work
```
- 字体：20-24px
- 颜色：#888888

## 配色方案

### 方案 1：科技蓝
- 主色：#0066FF
- 辅色：#00CCFF
- 背景：#0a0e27

### 方案 2：安全绿
- 主色：#00FF88
- 辅色：#00CC66
- 背景：#0d1117

### 方案 3：专业紫
- 主色：#8B5CF6
- 辅色：#A78BFA
- 背景：#1e1b4b

## 在线设计工具

1. **Canva** (推荐)
   - https://www.canva.com
   - 搜索 "Open Graph" 模板
   - 尺寸：1200 x 630

2. **Figma**
   - https://www.figma.com
   - 专业设计工具

3. **Photopea**
   - https://www.photopea.com
   - 免费在线 Photoshop

## 快速生成方案

如果没有设计资源，可以使用以下工具自动生成：

### 1. OG Image Generator
```bash
# 使用 HTML/CSS 生成
https://og-image.vercel.app/
```

### 2. Cloudinary
```bash
# 使用 URL 参数生成
https://res.cloudinary.com/demo/image/upload/
  l_text:Arial_80_bold:ChainTrace,co_rgb:FFFFFF,g_north,y_100/
  l_text:Arial_40:区块链资金追踪平台,co_rgb:CCCCCC,g_center/
  v1/sample.jpg
```

## 保存位置
```
public/og-image.jpg
public/screenshot.jpg (产品截图)
public/twitter-card.jpg (可选，Twitter 专用)
```

## 测试工具

### 1. Facebook Sharing Debugger
https://developers.facebook.com/tools/debug/

### 2. Twitter Card Validator
https://cards-dev.twitter.com/validator

### 3. LinkedIn Post Inspector
https://www.linkedin.com/post-inspector/

---

**提示**: 如果暂时没有设计资源，可以先使用产品截图作为 OG 图片，后续再优化。
