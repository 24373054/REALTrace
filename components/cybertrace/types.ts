export interface CsvRow {
  from: string;
  to: string;
  asset: string;
  asset_contract: string;
  amount: string;
  amount_raw: string;
  decimals: string;
  tx_count: string;
  tx_hashes: string;
}

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  group: "attacker" | "victim" | "neutral" | "mixer";
  value: number;
  connectionCount: number;
  index?: number;
  isMixer?: boolean;
  mixerName?: string;
  isBinance?: boolean;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
  asset: string;
  hashes: string[];
}

export interface ParseResult {
  nodes: GraphNode[];
  links: GraphLink[];
  totalVolume: number;
  highValueTargets: number;
}

