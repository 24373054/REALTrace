# Case 6: Monero (门罗币) 隐私币追踪分析

## 案例背景

门罗币（Monero/XMR）是一种专注于隐私的加密货币，采用多种技术手段隐藏交易信息：
- **隐匿地址（Stealth Addresses）**：隐藏接收方
- **环签名（Ring Signatures）**：混淆发送方
- **RingCT**：隐藏交易金额
- **Kovri/I2P**：隐藏 IP 地址

## 追踪方法论

本案例展示了基于学术研究的门罗币追踪启发式方法：

### 1. 时间启发式（Temporal Heuristics）
- **最新输入假设**：真实输入往往是环成员中最新的输出
- **年龄分布分析**：真实输出与 decoy 的时间分布存在差异
- 参考：Kumar et al., IACR 2017; Möser et al., arXiv 2017

### 2. 链式推断（Chain Reaction）
- 当一笔交易的环中只有一个可能的真实输入时，可以高置信度识别
- 通过图传播算法扩散置信度

### 3. 跨链追踪（Cross-Chain Analysis）
- 利用硬分叉（如 MoneroV）中的密钥重用
- 对比不同链上的花费模式
- 参考：Hinteregger & Haslhofer, 2018

### 4. 外部情报融合
- 交易所已知地址
- 执法机构披露
- 公开举报信息

## 数据说明

**重要提示**：由于门罗币的隐私特性，本案例使用的是**合成演示数据**，用于展示追踪方法论和可视化概念。数据包含：

- `transactions.csv`：模拟的门罗币交易记录（包含环签名信息）
- `ring_members.csv`：环签名成员详情
- `heuristic_scores.csv`：各种启发式方法的评分结果
- `metadata.json`：案例元数据

## 置信度说明

- **90-100%**：基于外部情报或跨链确认的高置信度
- **70-89%**：多个启发式方法一致指向
- **50-69%**：单一启发式方法支持
- **<50%**：低置信度推测

## 学术参考

1. Kumar et al. (2017) - "A Traceability Analysis of Monero's Blockchain"
   https://eprint.iacr.org/2017/338.pdf

2. Möser et al. (2017) - "An Empirical Analysis of Traceability in the Monero Blockchain"
   https://arxiv.org/pdf/1704.04299.pdf

3. Hinteregger & Haslhofer (2018) - "Monero Cross-Chain Traceability"
   https://arxiv.org/pdf/1812.02808.pdf

## 可视化特性

- **环签名可视化**：展示每笔交易的环成员与推断的真实输入
- **时间线分析**：显示输出年龄分布与启发式评分
- **置信度热图**：多维度启发式方法的综合评分
- **跨链关联图**：展示硬分叉链上的关联信息
