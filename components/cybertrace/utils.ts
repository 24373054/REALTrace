import { CsvRow, ParseResult, GraphLink, GraphNode } from "./types";

export const parseCsv = (csvData: string): ParseResult => {
  const lines = csvData.trim().split("\n");
  const nodeMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];
  let totalVolume = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 9) continue;

    const row: CsvRow = {
      from: cols[0],
      to: cols[1],
      asset: cols[2],
      asset_contract: cols[3],
      amount: cols[4],
      amount_raw: cols[5],
      decimals: cols[6],
      tx_count: cols[7],
      tx_hashes: cols[8],
    };

    const amount = parseFloat(row.amount);
    totalVolume += isNaN(amount) ? 0 : amount;

    // ensure nodes
    if (!nodeMap.has(row.from)) {
      nodeMap.set(row.from, { id: row.from, group: "neutral", value: 1, connectionCount: 0 });
    }
    if (!nodeMap.has(row.to)) {
      nodeMap.set(row.to, { id: row.to, group: "neutral", value: 1, connectionCount: 0 });
    }
    const fromNode = nodeMap.get(row.from)!;
    const toNode = nodeMap.get(row.to)!;
    fromNode.value += amount;
    toNode.value += amount;
    fromNode.connectionCount++;
    toNode.connectionCount++;

    links.push({
      source: row.from,
      target: row.to,
      value: amount,
      asset: row.asset,
      hashes: row.tx_hashes ? row.tx_hashes.split(";") : [],
    });
  }

  // Determine groups based on simple heuristics
  const nodes = Array.from(nodeMap.values()).map((node) => {
    if (node.connectionCount > 10) return { ...node, group: "attacker" as const };
    if (node.value > 100) return { ...node, group: "victim" as const };
    return node;
  });

  return {
    nodes,
    links,
    totalVolume,
    highValueTargets: nodes.filter((n) => n.group === "attacker" || n.group === "victim").length,
  };
};

// Generate Hexagon Path
export const hexPath = (radius: number) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    points.push(`${radius * Math.cos(angle_rad)},${radius * Math.sin(angle_rad)}`);
  }
  return `M${points.join("L")}Z`;
};

// Generate Grid Points for background
export const generateHexGrid = (width: number, height: number, radius: number) => {
  const points = [];
  const hexHeight = radius * 2;
  const hexWidth = Math.sqrt(3) * radius;
  const vertDist = hexHeight * 0.75;

  const rows = Math.ceil(height / vertDist);
  const cols = Math.ceil(width / hexWidth);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const xOffset = (r % 2) * (hexWidth / 2);
      const x = c * hexWidth + xOffset;
      const y = r * vertDist;
      points.push({ x, y });
    }
  }
  return points;
};

