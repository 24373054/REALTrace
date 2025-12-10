import { GraphData, ChainType } from "../types";
import { generateMockGraph } from "./mockData";
import { fetchSolanaGraph } from "./solanaService";
import { fetchEthereumGraph } from "./ethereumService";

// 根据链调用；若失败或未配置，回退 mock
export const fetchGraph = async (address: string, chain: ChainType, isExpand: boolean = false, beforeSignature?: string): Promise<GraphData> => {
  try {
    if (chain === ChainType.SOLANA) {
      if (import.meta.env.VITE_SOLANA_RPC || import.meta.env.VITE_SOLANA_PROXY_PATH) {
        return await fetchSolanaGraph(address, isExpand, beforeSignature);
      }
    } else if (chain === ChainType.ETHEREUM) {
      if (import.meta.env.VITE_ETH_RPC || import.meta.env.VITE_ETH_PROXY_PATH) {
        return await fetchEthereumGraph(address, isExpand);
      }
    }
  } catch (e) {
    console.warn(`${chain} RPC 调用失败，回退 mock：`, e);
  }
  return generateMockGraph(address);
};

// 独立暴露 mock 以便本地测试
export const fetchGraphMock = (address: string): GraphData => {
  return generateMockGraph(address);
};

// 预留风险查询接口（占位）
export const fetchRiskMock = async (address: string) => {
  return {
    address,
    riskScore: 50,
    sources: ["Mock TI"],
    tags: ["Placeholder"],
  };
};

