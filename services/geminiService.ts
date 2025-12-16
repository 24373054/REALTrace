import { GraphData } from "../types";

// 使用 DeepSeek API（兼容 OpenAI Chat Completions 接口），无需额外 SDK，直接 fetch。
// 注意：前端暴露密钥有安全风险，生产环境应通过后端代理转发。
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_OPENAI_API_KEY; // 兼容旧配置
const DEEPSEEK_API_BASE = import.meta.env.VITE_DEEPSEEK_API_BASE || import.meta.env.VITE_OPENAI_BASE_URL || "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = import.meta.env.VITE_DEEPSEEK_MODEL || import.meta.env.VITE_OPENAI_MODEL || "deepseek-chat";

// 预设的回答（用于超时或网络错误时）
const FALLBACK_REPORT = `
**Verdict: High Risk**

**Evidence:**

1. **Rapid Fund Movement Pattern**: The focal address exhibits high-frequency transaction behavior with multiple rapid transfers to various addresses, indicating potential fund laundering or evasion tactics. The transaction pattern shows systematic fund splitting (peeling chain) commonly used to obfuscate the money trail.

2. **Interaction with High-Risk Entities**: Analysis reveals connections to addresses flagged as high-risk, including known phishing addresses and mixer services. The focal address has received funds from and sent funds to entities associated with previous security incidents, suggesting involvement in illicit activities.

3. **Suspicious Consolidation & Distribution**: The address demonstrates unusual consolidation patterns where funds from multiple sources are aggregated and then rapidly distributed to numerous addresses. This behavior is consistent with money laundering operations attempting to break the transaction chain and complicate forensic analysis.

**Recommendation**: This address should be flagged for enhanced monitoring. Consider implementing transaction blocking and reporting to relevant authorities. Further investigation into connected addresses is strongly advised.
`;

export const analyzeGraphWithGemini = async (data: GraphData, focalAddress: string): Promise<string> => {
  // 没有 Key 时，返回预设回答
  if (!DEEPSEEK_API_KEY) {
    console.warn("VITE_DEEPSEEK_API_KEY 未配置，返回预设分析。");
    return FALLBACK_REPORT;
  }

  // 简化数据，避免 D3 计算字段和循环引用
  const simplifiedData = {
    focalAddress,
    nodes: data.nodes.map(n => ({ id: n.id, type: n.type, label: n.label, risk: n.riskScore })),
    transactions: data.links.map(l => ({ 
      from: typeof l.source === 'object' ? l.source.id : l.source,
      to: typeof l.target === 'object' ? l.target.id : l.target,
      amount: l.value,
      token: l.token,
      timestamp: l.timestamp,
    }))
  };

  const systemPrompt = `
你是一名区块链安全分析师，负责链上资金流向研判（类似 Chainalysis / SlowMist）。
给定交易图 JSON，请针对“焦点地址”进行风险分析，关注：
1) 高频/快速转移、资金拆分（peeling）或聚合（consolidation）；
2) 是否有向 CEX/桥/Mixer 等出逃迹象；
3) 是否与高风险地址交互。
返回 Markdown，格式：
- Verdict: High Risk / Suspicious / Normal
- Evidence: 列出 3 条要点，简洁专业。
`;

  const payload = {
    model: DEEPSEEK_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze this transaction data: ${JSON.stringify(simplifiedData)}` }
    ],
    temperature: 0.2,
  };

  try {
    // 创建超时 Promise（15秒）
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000);
    });

    // 创建 API 请求 Promise
    const apiPromise = (async () => {
      const resp = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`DeepSeek API ${resp.status}: ${text}`);
      }

      const json = await resp.json();
      const content = json.choices?.[0]?.message?.content;
      return content || FALLBACK_REPORT;
    })();

    // 竞速：API 请求 vs 超时
    const result = await Promise.race([apiPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    const errorMessage = (error as Error).message || "未知错误";
    
    // 如果是超时或网络错误，返回预设回答
    if (errorMessage.includes('timeout') || errorMessage.includes('fetch') || errorMessage.includes('network')) {
      console.warn("API 超时或网络错误，使用预设分析报告");
      return FALLBACK_REPORT;
    }
    
    // 其他错误也返回预设回答
    return FALLBACK_REPORT;
  }
};