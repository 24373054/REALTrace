# 链上资金流向可视化工具 PRD（类似 MistTrack）

本文档可直接作为团队/甲方/开发者的需求说明框架，按实际情况增补细节。

## 一、项目背景（要解决的问题）
- 构建链上资金流向可视化分析工具：输入地址，自动追踪转入/转出路径，识别潜在风险地址（Phishing/黑名单等），以图形方式展示交易路径，并可导出分析结果。
- 典型用途：安全分析（钓鱼/黑客资金追踪）、风控研究、链上情报、科研与技术探索。

## 二、主要目标（功能层级）
- 输入地址 → 获取链上所有交易数据（首期建议 Solana，后续 Ethereum 等）。
- 自动构建交易图谱并可视化。
- 识别风险地址（scam/phishing/黑名单）。
- 提供交易列表、标注、统计指标。
- 交互：筛选/展开/折叠/只看出账/只看入账等。
- 支持导出 CSV 或图片/报告。

## 三、功能需求（执行清单）
1) 输入与基础查询模块  
   - 支持输入钱包地址；首期多链支持可先仅上线 Solana。  
   - 自动查询：入账、出账、交易时间、hash、金额、Token 类型（SOL 与 SPL）。  

2) 交易图谱（Transaction Graph）  
   - 节点=地址，边=转账，显示金额。  
   - 交互：缩放/拖拽、节点展开（子交易追踪）、深度限制（如 3 层）。  
   - 风险地址红色警示，原始地址绿色星标，普通地址灰色圆点。  
   - 可选：不同 Token 类型用不同颜色的边。  

3) 交易列表（侧栏）  
   - 列出资金流向（Recipient/Sender）、总交易次数、累计金额。  
   - 支持金额排序；点击记录高亮图谱节点。  

4) 风险分析模块  
   - 风险判定：接入外部 TI API（SlowMist/Chainalysis/MistTrack 数据库）或公开黑名单（scamsniffer、Solana 诈骗地址列表）。  
   - 标记事件类型：Phishing、Hacking、Mixer、Bridge、OJX、CEX 等。  

## 四、技术需求（实现方案）
1) 数据来源  
   - Solana：RPC Provider（Helius/QuickNode/Triton），API：getSignaturesForAddress、getTransaction、getBalance、getParsedTransaction。  
   - Ethereum（后续）：Infura/Alchemy/QuickNode；API：eth_getTransactionByHash、eth_getTransactionReceipt、getLogs 等。  

2) 后端架构  
   - 技术栈：Python(FastAPI) 或 NodeJS(NestJS)。  
   - 持久化：PostgreSQL 或 MongoDB 缓存交易。  
   - REST API 示例：  
     - GET /address/{addr}/transactions  
     - GET /address/{addr}/graph  
     - GET /risk/check?addr=  

3) 前端可视化  
   - 库：D3.js 或 Cytoscape.js。  
   - 功能：节点拖拽/缩放/点击展开，边显示金额，悬停显示交易时间/hash/金额。  
   - 节点样式：原始地址=绿色五角星，风险地址=红色警告三角，普通地址=灰色圆。  

## 五、系统输出（用户可获得）
- 交互式资金流向图（类似 MistTrack）。  
- 右侧交易列表：地址、分类标签（CEX/Phishing/Normal）、转账次数、汇总金额。  
- 导出：CSV（address,in/out,amount,tx_hash,timestamp）；可选静态 PDF 报告。  

## 六、边界与非目标
- 不负责追回资产。  
- 风险判定依赖第三方，准确率不保证 100%。  
- 默认图谱深度 ≤5 层。  
- 不做实时监控（除非后续扩展）。  

## 七、需方需准备的资料
- 首期支持的链（建议 Solana）。  
- 威胁情报 API Key 是否提供。  
- 界面是否高度仿 MistTrack。  
- 预算与交付时间。  
- 是否需要公网部署（域名/服务器）。  

## 八、一句话需求
- “需要一个类似 MistTrack 的链上资金流向分析工具，输入地址即可自动构建交易图谱，展示转出/转入路径，标记风险地址，并提供侧栏交易列表和统计。” 

