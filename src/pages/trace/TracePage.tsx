/**
 * TracePage - 原有的链路追踪可视化功能完整保留
 * 包含 Standard 视图（D3 力导向图 + AI 分析）和 Cyber 视图（6个 Case）
 */
import React, { useState, useEffect, useRef } from 'react';
import { X, Download, RefreshCw, ArrowDownLeft, ArrowUpRight, PanelLeft, Plus, Minus, Image as ImageIcon, FileDown, FileText, Eye } from 'lucide-react';
import HackerTraceView from '../../../components/cybertrace/HackerTraceView';
import GraphView, { GraphViewHandle } from '../../../components/GraphView';
import AnalysisPanel from '../../../components/AnalysisPanel';
import { loadHackerCsvData } from '../../../components/cybertrace/data';
import { loadKucoinData } from '../../../components/cybertrace/kucoinData';
import { loadCase3Data } from '../../../components/cybertrace/case3Data';
import { loadCase4Data } from '../../../components/cybertrace/case4Data';
import { loadCase5Data } from '../../../components/cybertrace/case5Data';
import { loadCase6Data } from '../../../components/cybertrace/case6Data';
import { INITIAL_ADDRESS } from '../../../services/mockData';
import { fetchGraph } from '../../../services/api';
import { loadHackerTraceGraph, HACKER_ROOT_ADDRESS } from '../../../services/hackerTraceService';
import { analyzeGraphWithGemini } from '../../../services/geminiService';
import { GraphData, GraphLink, GraphNode, ChainType, NetworkType } from '../../../types';
import jsPDF from 'jspdf';
import type { CaseConfig } from '../../../components/cybertrace/HackerTraceView';
import styles from './TracePage.module.css';

const MAX_DEPTH = 5;

const hackerCases: CaseConfig[] = [
  {
    id: 'case5',
    name: 'Case 1: Bybit 多币种洗钱',
    description: 'Bybit 被攻击后的多币种资金流转（ETH、stETH、mETH、cmETH、USDT），涉及 Lido、Mantle 等协议',
    loader: loadCase5Data,
  },
  {
    id: 'case2',
    name: 'Case 2: KuCoin 混币器洗钱',
    description: 'KuCoin 交易所被盗资金通过 Tornado Cash 100 ETH 混币器洗钱（包含 14 笔存款和 17 笔提款）',
    loader: loadKucoinData,
  },
  {
    id: 'case3',
    name: 'Case 3: 跨链资金转移',
    description: '以太坊跨链交易追踪，涉及多个跨链桥和路由器',
    loader: loadCase3Data,
  },
  {
    id: 'case1',
    name: 'Case 4: 黑客攻击链路',
    description: '追踪黑客攻击的资金流向和洗钱路径',
    loader: loadHackerCsvData,
  },
  {
    id: 'case4',
    name: 'Case 5: Bybit 质押洗钱',
    description: 'Bybit 交易所被攻击后，黑客通过以太坊质押合约（Beacon Depositor）洗钱（6000+笔交易）',
    loader: loadCase4Data,
  },
  {
    id: 'case6',
    name: 'Case 6: Monero 隐私币追踪',
    description: '门罗币（XMR）隐私币追踪分析，展示环签名、时间启发式、跨链追踪等方法（合成演示数据）',
    loader: loadCase6Data,
  },
];

export const TracePage: React.FC = () => {
  const [addressInput, setAddressInput] = useState(INITIAL_ADDRESS);
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [depthLimit, setDepthLimit] = useState(2);
  const [viewLayout, setViewLayout] = useState<'standard' | 'cyber'>('standard');
  const graphRef = useRef<GraphViewHandle | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [chain, setChain] = useState<ChainType>(ChainType.SOLANA);
  const [network] = useState<NetworkType>(NetworkType.MAINNET);

  useEffect(() => {
    fetchGraph(INITIAL_ADDRESS, chain).then(newData => {
      setData(newData);
      const rootNode = newData.nodes.find(n => n.type === 'ROOT');
      if (rootNode) setSelectedNode(rootNode);
    });
  }, []);

  const handleSearch = async () => {
    const searchAddress = addressInput.trim() || INITIAL_ADDRESS;
    if (!searchAddress) return;
    const newData = await fetchGraph(searchAddress, chain);
    setData(newData);
    const rootNode = newData.nodes.find(n => n.type === 'ROOT' || n.id === searchAddress);
    if (rootNode) setSelectedNode(rootNode);
    setAiReport(null);
  };

  const applyDepthFilter = (graph: GraphData): GraphData => {
    const root = graph.nodes.find(n => n.type === 'ROOT') || graph.nodes[0];
    if (!root) return graph;
    const depthMap = new Map<string, number>();
    depthMap.set(root.id, 0);
    let frontier = [root.id];
    for (let depth = 1; depth <= depthLimit; depth++) {
      const next: string[] = [];
      graph.links.forEach(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        if (frontier.includes(s) && !depthMap.has(t)) { depthMap.set(t, depth); next.push(t); }
        if (frontier.includes(t) && !depthMap.has(s)) { depthMap.set(s, depth); next.push(s); }
      });
      frontier = next;
    }
    const nodes = graph.nodes.filter(n => depthMap.has(n.id));
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = graph.links.filter(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      return nodeIds.has(s) && nodeIds.has(t);
    });
    return { nodes, links };
  };

  const applyViewFilter = (graph: GraphData): GraphData => {
    if (viewMode === 'all' || !selectedNode) return graph;
    const filteredLinks = graph.links.filter(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      if (viewMode === 'incoming') return targetId === selectedNode.id;
      return sourceId === selectedNode.id;
    });
    const nodeIds = new Set<string>();
    filteredLinks.forEach(l => {
      nodeIds.add(typeof l.source === 'object' ? l.source.id : l.source);
      nodeIds.add(typeof l.target === 'object' ? l.target.id : l.target);
    });
    if (selectedNode) nodeIds.add(selectedNode.id);
    return { nodes: graph.nodes.filter(n => nodeIds.has(n.id)), links: filteredLinks };
  };

  const depthFiltered = applyDepthFilter(data);
  const filteredGraph = applyViewFilter(depthFiltered);

  const handleExpandDepth = () => {
    setViewMode('all');
    setDepthLimit(d => Math.min(MAX_DEPTH, d + 1));
  };

  const exportCSV = () => {
    const header = "source,target,amount,token,timestamp,txHash\n";
    const rows = data.links.map(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      return `${s},${t},${l.value},${l.token},${l.timestamp},${l.txHash}`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `chaintrace_${Date.now()}.csv`; a.click();
  };

  const exportSVG = () => {
    const svgEl = graphRef.current?.getSvgElement();
    if (!svgEl) return;
    const source = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `chaintrace_${Date.now()}.svg`; link.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = async () => {
    const svgEl = graphRef.current?.getSvgElement();
    if (!svgEl) return;
    const source = new XMLSerializer().serializeToString(svgEl);
    const svg64 = btoa(unescape(encodeURIComponent(source)));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `data:image/svg+xml;base64,${svg64}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgEl.clientWidth || svgEl.getBoundingClientRect().width;
      canvas.height = svgEl.clientHeight || svgEl.getBoundingClientRect().height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = `chaintrace_${Date.now()}.png`; link.click();
        URL.revokeObjectURL(url);
      });
    };
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("ChainTrace Analysis Report", 10, 15);
    doc.setFontSize(10);
    doc.text(`Address: ${selectedNode?.id || 'N/A'}`, 10, 25);
    doc.text(`View: ${viewMode}`, 10, 32);
    doc.text(`Depth: ${depthLimit}`, 10, 39);
    doc.text(`Tx Count: ${filteredGraph.links.length}`, 10, 46);
    if (selectedNode?.tags?.length) doc.text(`Tags: ${selectedNode.tags.join(', ')}`, 10, 53);
    const maxRows = 10;
    const startY = 68;
    doc.text("Top Transactions (amount desc)", 10, startY);
    const sorted = [...filteredGraph.links].sort((a, b) => b.value - a.value).slice(0, maxRows);
    sorted.forEach((l, idx) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      doc.text(`${idx + 1}. ${s.slice(0,6)}... -> ${t.slice(0,6)}... ${l.value} ${l.token}`, 10, startY + 7 + idx * 6);
    });
    const report = aiReport || "No AI report generated yet.";
    const split = doc.splitTextToSize(report, 180);
    doc.text("AI Insight:", 10, startY + 7 + maxRows * 6 + 5);
    doc.text(split, 10, startY + 7 + maxRows * 6 + 12);
    doc.save(`chaintrace_report_${Date.now()}.pdf`);
  };

  const mergeGraphs = (base: GraphData, incoming: GraphData): GraphData => {
    const nodesMap = new Map<string, GraphNode>();
    base.nodes.forEach(n => nodesMap.set(n.id, { ...n }));
    incoming.nodes.forEach(n => {
      const existing = nodesMap.get(n.id);
      if (existing) {
        nodesMap.set(n.id, { ...existing, ...n, type: existing.type, x: existing.x, y: existing.y, fx: existing.fx, fy: existing.fy });
      } else {
        nodesMap.set(n.id, { ...n });
      }
    });
    const finalNodes = Array.from(nodesMap.values()).map(node => {
      const isNew = !base.nodes.some(n => n.id === node.id);
      return isNew ? { ...node, x: undefined, y: undefined, fx: undefined, fy: undefined } : node;
    });
    const nodeObjects = new Map(finalNodes.map(n => [n.id, n]));
    const resolveLinkEndpoints = (link: GraphLink): GraphLink | null => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      const sourceNode = nodeObjects.get(sourceId);
      const targetNode = nodeObjects.get(targetId);
      if (!sourceNode || !targetNode) return null;
      return { ...link, source: sourceNode, target: targetNode };
    };
    const linkKey = (l: GraphLink) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      return `${s}-${t}-${l.txHash}`;
    };
    const linksMap = new Map<string, GraphLink>();
    [...base.links, ...incoming.links].forEach(l => {
      const resolved = resolveLinkEndpoints(l);
      if (resolved) linksMap.set(linkKey(resolved), resolved);
    });
    return { nodes: finalNodes, links: Array.from(linksMap.values()) };
  };

  const expandNode = async (nodeId: string) => {
    if (isExpanding) return;
    setIsExpanding(true);
    try {
      const more = await fetchGraph(nodeId, chain, true);
      if (more && (more.nodes.length > 0 || more.links.length > 0)) {
        setData(prev => mergeGraphs(prev, more));
      } else {
        alert('该地址在当前查询范围内未找到新交易。');
      }
    } catch (e: any) {
      alert(`展开失败: ${e.message || '未知错误'}`);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedNode) return;
    setIsAnalyzing(true);
    const report = await analyzeGraphWithGemini(data, selectedNode.id);
    setAiReport(report);
    setIsAnalyzing(false);
  };

  const handleLoadHackerTrace = () => {
    const hackerGraph = loadHackerTraceGraph();
    setData(hackerGraph);
    const rootNode = hackerGraph.nodes.find(n => n.id.toLowerCase() === HACKER_ROOT_ADDRESS.toLowerCase()) || hackerGraph.nodes[0] || null;
    setSelectedNode(rootNode);
    setViewMode('all');
    setAiReport(null);
    setDepthLimit(2);
  };

  if (viewLayout === 'cyber') {
    return (
      <div className={styles.cyberWrap}>
        <button className={styles.backBtn} onClick={() => setViewLayout('standard')}>
          <X size={14} /> 返回主视图
        </button>
        <HackerTraceView cases={hackerCases} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Address search bar */}
      <div className={styles.toolbar}>
        <div className={styles.searchRow}>
          <select
            className={styles.chainSelect}
            value={chain}
            onChange={e => setChain(e.target.value as ChainType)}
          >
            <option value={ChainType.SOLANA}>SOL</option>
            <option value={ChainType.ETHEREUM}>ETH</option>
          </select>
          <input
            className={styles.addressInput}
            type="text"
            value={addressInput}
            onChange={e => setAddressInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="输入区块链地址..."
          />
          <button className={styles.searchBtn} onClick={handleSearch}>
            <RefreshCw size={14} /> 查询
          </button>
        </div>

        <div className={styles.toolRow}>
          {/* Export */}
          <div className={styles.toolGroup}>
            <button className={styles.toolBtn} title="Export CSV" onClick={exportCSV}><Download size={15} /></button>
            <button className={styles.toolBtn} title="Export SVG" onClick={exportSVG}><FileDown size={15} /></button>
            <button className={styles.toolBtn} title="Export PNG" onClick={exportPNG}><ImageIcon size={15} /></button>
            <button className={styles.toolBtn} title="Export PDF" onClick={exportPDF}><FileText size={15} /></button>
          </div>

          {/* Depth */}
          <div className={styles.toolGroup}>
            <button className={styles.toolBtn} onClick={() => setDepthLimit(d => Math.max(1, d - 1))}><Minus size={14} /></button>
            <span className={styles.depthLabel}>Depth {depthLimit}/{MAX_DEPTH}</span>
            <button className={styles.toolBtn} onClick={() => setDepthLimit(d => Math.min(MAX_DEPTH, d + 1))}><Plus size={14} /></button>
          </div>

          {/* View mode */}
          <div className={styles.toolGroup}>
            <button className={`${styles.toolBtn} ${viewMode === 'all' ? styles.active : ''}`} onClick={() => setViewMode('all')}>
              <PanelLeft size={14} /> 全部
            </button>
            <button className={`${styles.toolBtn} ${viewMode === 'incoming' ? styles.activeGreen : ''}`} onClick={() => setViewMode('incoming')}>
              <ArrowDownLeft size={14} /> 入账
            </button>
            <button className={`${styles.toolBtn} ${viewMode === 'outgoing' ? styles.activeRed : ''}`} onClick={() => setViewMode('outgoing')}>
              <ArrowUpRight size={14} /> 出账
            </button>
          </div>

          {/* Special actions */}
          <div className={styles.toolGroup}>
            <button className={styles.toolBtnRed} onClick={handleLoadHackerTrace} title="载入黑客攻击链路">黑客链路</button>
            <button className={styles.toolBtn} onClick={() => setViewLayout('cyber')} title="切换到 CyberTrace 视图">
              <Eye size={14} /> Cyber
            </button>
          </div>

          <div className={styles.statsLabel}>
            Depth: {depthLimit} | Tx: {filteredGraph.links.length}
          </div>
        </div>
      </div>

      {/* Graph + Panel */}
      <div className={styles.content}>
        <div className={styles.graphArea}>
          <GraphView
            data={filteredGraph}
            onNodeClick={node => setSelectedNode(node)}
            selectedNodeId={selectedNode?.id}
            ref={graphRef}
            isDarkMode={true}
          />
        </div>
        <AnalysisPanel
          data={data}
          links={filteredGraph.links}
          selectedNode={selectedNode}
          onAnalyze={handleAnalyze}
          aiReport={aiReport}
          isAnalyzing={isAnalyzing}
          viewMode={viewMode}
          onExpandDepth={handleExpandDepth}
          depthLimit={depthLimit}
          maxDepth={MAX_DEPTH}
          onExpandNode={() => selectedNode ? expandNode(selectedNode.id) : Promise.resolve()}
          isExpanding={isExpanding}
          chain={chain}
          network={network}
          isDarkMode={true}
        />
      </div>
    </div>
  );
};

export default TracePage;
