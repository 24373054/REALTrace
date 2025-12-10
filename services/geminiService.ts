import { GraphData } from "../types";

// 使用 DeepSeek API（兼容 OpenAI Chat Completions 接口），无需额外 SDK，直接 fetch。
// 注意：前端暴露密钥有安全风险，生产环境应通过后端代理转发。
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_OPENAI_API_KEY; // 兼容旧配置
const DEEPSEEK_API_BASE = import.meta.env.VITE_DEEPSEEK_API_BASE || import.meta.env.VITE_OPENAI_BASE_URL || "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = import.meta.env.VITE_DEEPSEEK_MODEL || import.meta.env.VITE_OPENAI_MODEL || "deepseek-chat";

export const analyzeGraphWithGemini = async (data: GraphData, focalAddress: string): Promise<string> => {
  // 没有 Key 时，返回友好提示，避免报错
  if (!DEEPSEEK_API_KEY) {
    console.warn("VITE_DEEPSEEK_API_KEY 未配置，返回离线提示。");
    return "AI 分析不可用：未配置 VITE_DEEPSEEK_API_KEY。";
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
    return content || "未能生成分析结果。";
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    return `分析失败：${(error as Error).message || "未知错误"}`;
  }
};