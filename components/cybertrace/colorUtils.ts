import { ASSET_COLORS } from "./case5Data";
import { HEURISTIC_COLORS } from "./case6Data";

// 通用颜色获取函数
export function getEdgeColor(asset: string): string {
  // 首先尝试作为启发式方法（Case 6）
  if (HEURISTIC_COLORS[asset]) {
    return HEURISTIC_COLORS[asset];
  }
  
  // 然后尝试作为资产类型（Case 5 等）
  if (ASSET_COLORS[asset]) {
    return ASSET_COLORS[asset];
  }
  
  // 默认颜色
  return ASSET_COLORS['default'] || '#ef4444';
}

// 导出所有颜色映射供图例使用
export { ASSET_COLORS, HEURISTIC_COLORS };
