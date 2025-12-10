import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import GraphView, { GraphViewHandle } from './components/GraphView';
import AnalysisPanel from './components/AnalysisPanel';
import { INITIAL_ADDRESS } from './services/mockData';
import { fetchGraph } from './services/api';
import { analyzeGraphWithGemini } from './services/geminiService';
import { GraphData, GraphLink, GraphNode, ChainType } from './types';
import { Download, RefreshCw, ArrowDownLeft, ArrowUpRight, PanelLeft, Plus, Minus, Image as ImageIcon, FileDown, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

function App() {
  const [addressInput, setAddressInput] = useState(INITIAL_ADDRESS);
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [depthLimit, setDepthLimit] = useState(2); // 默认展示 2 层
  const MAX_DEPTH = 5;
  const graphRef = useRef<GraphViewHandle | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [chain, setChain] = useState<ChainType>(ChainType.SOLANA);

  // Initialize with mock data (只在首次加载时)
  useEffect(() => {
    // 首次加载时使用初始地址
    const initialData = fetchGraph(INITIAL_ADDRESS, chain);
    initialData.then(newData => {
      setData(newData);
      const rootNode = newData.nodes.find(n => n.type === 'ROOT');
      if (rootNode) setSelectedNode(rootNode);
    });
  }, []);

  // 当链切换时，如果地址输入框有值，自动搜索
  useEffect(() => {
    if (addressInput && addressInput !== INITIAL_ADDRESS) {
      handleSearch();
    }
  }, [chain]);

  const handleSearch = async () => {
    const searchAddress = addressInput.trim() || INITIAL_ADDRESS;
    console.log(`[搜索] 地址: ${searchAddress}, 链: ${chain}`);
    
    if (!searchAddress || searchAddress === '') {
      alert('请输入有效的地址');
      return;
    }
    
    const newData = await fetchGraph(searchAddress, chain);
    setData(newData);
    // Auto-select the root node
    const rootNode = newData.nodes.find(n => n.type === 'ROOT' || n.id === searchAddress);
    if (rootNode) setSelectedNode(rootNode);
    setAiReport(null);
  };

  // 根据深度限制过滤图数据（从 ROOT 或选中的根地址出发）
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
        if (frontier.includes(s) && !depthMap.has(t)) {
          depthMap.set(t, depth);
          next.push(t);
        }
        if (frontier.includes(t) && !depthMap.has(s)) {
          depthMap.set(s, depth);
          next.push(s);
        }
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

  // 根据入/出账视图过滤（基于深度裁剪后的图）
  const applyViewFilter = (graph: GraphData): GraphData => {
    if (viewMode === 'all' || !selectedNode) return graph;

    const filteredLinks: GraphLink[] = graph.links.filter(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      if (viewMode === 'incoming') return targetId === selectedNode.id;
      return sourceId === selectedNode.id; // outgoing
    });

    const nodeIds = new Set<string>();
    filteredLinks.forEach(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      nodeIds.add(sourceId);
      nodeIds.add(targetId);
    });
    if (selectedNode) nodeIds.add(selectedNode.id);

    const filteredNodes = graph.nodes.filter(n => nodeIds.has(n.id));
    return { nodes: filteredNodes, links: filteredLinks };
  };

  const depthFiltered = applyDepthFilter(data);
  const filteredGraph = applyViewFilter(depthFiltered);

  const handleExpandDepth = () => {
    setViewMode('all');
    setDepthLimit(d => Math.min(MAX_DEPTH, d + 1));
  };

  const exportSVG = () => {
    const svgEl = graphRef.current?.getSvgElement();
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chaintrace_${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = async () => {
    const svgEl = graphRef.current?.getSvgElement();
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const svg64 = btoa(unescape(encodeURIComponent(source)));
    const image64 = `data:image/svg+xml;base64,${svg64}`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image64;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgEl.clientWidth || svgEl.getBoundingClientRect().width;
      canvas.height = svgEl.clientHeight || svgEl.getBoundingClientRect().height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chaintrace_${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    };
  };

  // 将当前视图（过滤后）导出为 PDF，包含节点摘要与 AI 报告
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("ChainTrace Analysis Report", 10, 15);
    doc.setFontSize(10);
    doc.text(`Address: ${selectedNode?.id || 'N/A'}`, 10, 25);
    doc.text(`View: ${viewMode}`, 10, 32);
    doc.text(`Depth: ${depthLimit}`, 10, 39);
    doc.text(`Tx Count: ${filteredGraph.links.length}`, 10, 46);

    if (selectedNode?.tags?.length) {
      doc.text(`Tags: ${selectedNode.tags.join(', ')}`, 10, 53);
    }
    if (selectedNode?.intelSources?.length) {
      doc.text(`Intel: ${selectedNode.intelSources.join(', ')}`, 10, 60);
    }

    // 列举前 10 条交易
    const maxRows = 10;
    const startY = 68;
    doc.text("Top Transactions (amount desc)", 10, startY);
    const sorted = [...filteredGraph.links].sort((a, b) => b.value - a.value).slice(0, maxRows);
    sorted.forEach((l, idx) => {
      const y = startY + 7 + idx * 6;
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      doc.text(`${idx + 1}. ${sourceId.slice(0,6)}... -> ${targetId.slice(0,6)}... ${l.value} ${l.token}`, 10, y);
    });

    // AI 报告
    const report = aiReport || "No AI report generated yet.";
    const split = doc.splitTextToSize(report, 180);
    doc.text("AI Insight:", 10, 68 + 7 + maxRows * 6 + 5);
    doc.text(split, 10, 68 + 7 + maxRows * 6 + 12);

    doc.save(`chaintrace_report_${Date.now()}.pdf`);
  };

  // 节点展开：向 RPC 拉取该地址相关交易并合并到现有图
  const expandNode = async (nodeId: string) => {
    if (isExpanding) return;
    setIsExpanding(true);
    try {
      console.log(`[展开节点] 地址: ${nodeId}, 链: ${chain}`);
      
      // 对于 Solana，从现有图中提取与目标地址相关的最后一个交易签名
      // Solana 的交易签名是按时间倒序返回的，所以使用最早的交易签名作为 before 参数
      let beforeSignature: string | undefined;
      if (chain === ChainType.SOLANA) {
        // 找到所有与目标地址相关的链接
        const relatedLinks = data.links.filter(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          return sourceId === nodeId || targetId === nodeId;
        });
        
        if (relatedLinks.length > 0) {
          // 找到时间戳最小的交易（最早的交易），作为 before 参数
          const earliestLink = relatedLinks.reduce((earliest, current) => {
            const earliestTime = new Date(earliest.timestamp).getTime();
            const currentTime = new Date(current.timestamp).getTime();
            return currentTime < earliestTime ? current : earliest;
          });
          beforeSignature = earliestLink.txHash;
          console.log(`[展开节点] 使用 before 参数: ${beforeSignature.slice(0, 8)}... (查询更早的交易)`);
        }
      }
      
      // 添加超时保护（根据链类型设置不同的超时时间和提示）
      const timeoutSeconds = chain === ChainType.ETHEREUM ? 15 : 30; // Solana 需要更多时间解析交易
      const timeoutMessage = chain === ChainType.ETHEREUM 
        ? '展开超时（15秒）。提示：Ethereum 查询仅扫描最近5个区块，如果该地址最近没有交易，可能无法找到。'
        : '展开超时（30秒）。提示：Solana 查询需要解析多笔交易，请稍候或稍后重试。';
      
      const timeoutPromise = new Promise<GraphData>((_, reject) => {
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutSeconds * 1000);
      });
      
      const fetchPromise = fetchGraph(nodeId, chain, true, beforeSignature); // 传递 isExpand=true 和 beforeSignature
      const more = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log(`[展开节点] 找到 ${more.nodes.length} 个节点, ${more.links.length} 条链接`);
      
      if (more && (more.nodes.length > 0 || more.links.length > 0)) {
        setData(prev => mergeGraphs(prev, more));
      } else {
        console.warn('展开节点未找到新交易');
        const message = chain === ChainType.ETHEREUM
          ? '该地址在最近区块中未找到新交易。提示：Ethereum 查询仅扫描最近5个区块，如果该地址最近没有交易，可能无法找到。'
          : '该地址在当前查询范围内未找到新交易。';
        alert(message);
      }
    } catch (e: any) {
      console.error("展开失败", e);
      alert(`展开失败: ${e.message || '未知错误'}`);
    } finally {
      setIsExpanding(false);
    }
  };

  const mergeGraphs = (base: GraphData, incoming: GraphData): GraphData => {
    const nodesMap = new Map<string, GraphNode>();
    
    // 先添加基础图的节点（深拷贝，避免引用问题）
    base.nodes.forEach(n => {
      nodesMap.set(n.id, { 
        ...n, 
        x: n.x, 
        y: n.y,
        fx: n.fx,
        fy: n.fy,
      });
    });
    
    // 然后添加新节点，但保留已存在节点的类型和属性（避免覆盖 ROOT 类型）
    const newNodes: string[] = [];
    const duplicateNodes: string[] = [];
    
    incoming.nodes.forEach(n => {
      const existing = nodesMap.get(n.id);
      if (existing) {
        // 如果节点已存在，保留原节点的类型（特别是 ROOT），但更新其他属性
        duplicateNodes.push(n.id);
        nodesMap.set(n.id, {
          ...existing,
          ...n,
          type: existing.type, // 保留原类型
          label: existing.label || n.label, // 保留原标签
          // 保留原位置（如果已固定）
          x: existing.x,
          y: existing.y,
          fx: existing.fx,
          fy: existing.fy,
        });
      } else {
        // 新节点，直接添加
        newNodes.push(n.id);
        nodesMap.set(n.id, { ...n });
      }
    });
    
    console.log(`[合并图] 新增节点: ${newNodes.length} 个 (${newNodes.slice(0, 3).map(id => id.slice(0, 8)).join(', ')}${newNodes.length > 3 ? '...' : ''})`);
    console.log(`[合并图] 重复节点: ${duplicateNodes.length} 个 (${duplicateNodes.slice(0, 3).map(id => id.slice(0, 8)).join(', ')}${duplicateNodes.length > 3 ? '...' : ''})`);

    // 获取最终的节点数组（D3 需要数组引用）
    // 确保没有重复节点，并重置位置（避免节点重叠）
    const finalNodes = Array.from(nodesMap.values()).map((node, index) => {
      // 如果是新节点（不在基础图中），重置位置，让 D3 重新布局
      const isNewNode = !base.nodes.some(n => n.id === node.id);
      if (isNewNode) {
        return {
          ...node,
          x: undefined,
          y: undefined,
          fx: undefined,
          fy: undefined,
        };
      }
      return node;
    });
    
    // 验证：确保没有重复的节点 ID
    const nodeIds = new Set(finalNodes.map(n => n.id));
    if (nodeIds.size !== finalNodes.length) {
      console.error(`[合并图] 警告：发现重复节点！节点数: ${finalNodes.length}, 唯一ID数: ${nodeIds.size}`);
      // 去重：保留第一个出现的节点
      const uniqueNodes = Array.from(new Map(finalNodes.map(n => [n.id, n])).values());
      return { nodes: uniqueNodes, links: [] };
    }
    
    // 创建节点 ID 到节点对象的映射（用于链接引用）
    const nodeById = new Map<string, GraphNode>();
    finalNodes.forEach(n => nodeById.set(n.id, n));

    // 辅助函数：将链接的 source/target 从字符串 ID 转换为节点对象引用
    // 重要：必须使用 finalNodes 数组中的实际对象引用，而不是创建新对象
    const resolveLinkEndpoints = (link: GraphLink): GraphLink => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      // 从 finalNodes 数组中查找节点（使用实际的对象引用）
      const sourceNode = finalNodes.find(n => n.id === sourceId);
      const targetNode = finalNodes.find(n => n.id === targetId);
      
      if (!sourceNode || !targetNode) {
        console.warn(`[合并图] 链接端点未找到: ${sourceId} -> ${targetId}`);
        // 如果找不到，返回原链接，让 D3 的 forceLink.id() 处理
        return link;
      }
      
      // 返回新链接对象，但使用 finalNodes 中的实际节点引用
      return {
        ...link,
        source: sourceNode, // 使用 finalNodes 中的实际对象引用
        target: targetNode, // 使用 finalNodes 中的实际对象引用
      };
    };

    const linkKey = (l: GraphLink) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      return `${s}-${t}-${l.txHash}`;
    };
    
    const linksMap = new Map<string, GraphLink>();
    const newLinks: string[] = [];
    const duplicateLinks: string[] = [];
    
    // 处理基础图的链接，确保 source/target 是节点对象
    base.links.forEach(l => {
      const resolved = resolveLinkEndpoints(l);
      const key = linkKey(resolved);
      // 如果链接端点都找到了，才添加
      if (resolved.source && resolved.target && 
          typeof resolved.source === 'object' && typeof resolved.target === 'object') {
        linksMap.set(key, resolved);
      } else {
        console.warn(`[合并图] 跳过无效链接: ${key}`);
      }
    });
    
    // 处理新链接，确保 source/target 是节点对象
    incoming.links.forEach(l => {
      const resolved = resolveLinkEndpoints(l);
      const key = linkKey(resolved);
      // 如果链接端点都找到了，才添加（允许覆盖重复的链接）
      if (resolved.source && resolved.target && 
          typeof resolved.source === 'object' && typeof resolved.target === 'object') {
        if (linksMap.has(key)) {
          duplicateLinks.push(key);
        } else {
          newLinks.push(key);
        }
        linksMap.set(key, resolved);
      } else {
        console.warn(`[合并图] 跳过无效链接: ${key}`);
      }
    });
    
    console.log(`[合并图] 新增链接: ${newLinks.length} 条`);
    console.log(`[合并图] 重复链接: ${duplicateLinks.length} 条`);

    let finalLinks = Array.from(linksMap.values());
    
    // 最终验证：确保所有链接的 source/target 都是 finalNodes 中的实际对象引用
    const nodeObjects = new Map(finalNodes.map(n => [n.id, n]));
    
    finalLinks = finalLinks.map(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      const sourceNode = nodeObjects.get(sourceId);
      const targetNode = nodeObjects.get(targetId);
      
      if (!sourceNode || !targetNode) {
        console.warn(`[合并图] 链接端点无效: ${sourceId} -> ${targetId}`);
        return null;
      }
      
      // 确保使用 finalNodes 中的实际对象引用
      return {
        ...link,
        source: sourceNode,
        target: targetNode,
      };
    }).filter((link): link is GraphLink => link !== null);
    
    // 再次验证：确保链接的 source/target 确实是 finalNodes 中的对象
    const invalidLinks = finalLinks.filter(l => {
      const sourceInNodes = finalNodes.includes(l.source as GraphNode);
      const targetInNodes = finalNodes.includes(l.target as GraphNode);
      return !sourceInNodes || !targetInNodes;
    });
    
    if (invalidLinks.length > 0) {
      console.warn(`[合并图] 发现 ${invalidLinks.length} 条链接的端点不是节点数组中的对象引用`);
      finalLinks = finalLinks.filter(l => {
        const sourceInNodes = finalNodes.includes(l.source as GraphNode);
        const targetInNodes = finalNodes.includes(l.target as GraphNode);
        return sourceInNodes && targetInNodes;
      });
    }

    console.log(`[合并图] 基础: ${base.nodes.length} 节点, ${base.links.length} 链接`);
    console.log(`[合并图] 新增: ${incoming.nodes.length} 节点, ${incoming.links.length} 链接`);
    console.log(`[合并图] 合并后: ${finalNodes.length} 节点, ${finalLinks.length} 链接`);

    return { nodes: finalNodes, links: finalLinks };
  };

  const handleAnalyze = async () => {
    if (!selectedNode) return;
    setIsAnalyzing(true);
    // We analyze the whole graph context relative to the selected node
    const report = await analyzeGraphWithGemini(data, selectedNode.id);
    setAiReport(report);
    setIsAnalyzing(false);
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const exportCSV = () => {
    const header = "source,target,amount,token,timestamp,txHash\n";
    const rows = data.links.map(l => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        return `${sourceId},${targetId},${l.value},${l.token},${l.timestamp},${l.txHash}`;
    }).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaintrace_${new Date().getTime()}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100">
      <Header 
        addressInput={addressInput} 
        setAddressInput={setAddressInput} 
        onSearch={handleSearch} 
        chain={chain}
        setChain={setChain}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Graph Area */}
        <div className="flex-1 flex flex-col relative">
            
            {/* Toolbar Overlay */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="bg-white rounded shadow-sm border border-slate-200 p-1 flex">
                    <button 
                        onClick={exportCSV}
                        className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors tooltip"
                        title="Export CSV"
                    >
                        <Download size={18} />
                    </button>
                    <button 
                        onClick={exportSVG}
                        className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors tooltip"
                        title="Export SVG"
                    >
                        <FileDown size={18} />
                    </button>
                    <button 
                        onClick={exportPNG}
                        className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors tooltip"
                        title="Export PNG"
                    >
                        <ImageIcon size={18} />
                    </button>
                    <button 
                        onClick={exportPDF}
                        className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors tooltip"
                        title="Export PDF"
                    >
                        <FileText size={18} />
                    </button>
                </div>

                <div className="bg-white rounded shadow-sm border border-slate-200 p-1 flex items-center gap-1">
                    <button 
                        onClick={() => setDepthLimit(d => Math.max(1, d - 1))}
                        className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                        title="减少可见深度"
                    >
                        <Minus size={16} />
                    </button>
                    <span className="text-xs px-2 text-slate-600">Depth {depthLimit}/{MAX_DEPTH}</span>
                    <button 
                        onClick={() => setDepthLimit(d => Math.min(MAX_DEPTH, d + 1))}
                        className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                        title="展开一层（mock 数据）"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="bg-white rounded shadow-sm border border-slate-200 p-1 flex items-center gap-1">
                    <button 
                        onClick={() => setViewMode('all')}
                        className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1 ${viewMode === 'all' ? 'bg-brand-50 text-brand-700 border border-brand-100' : 'text-slate-600 hover:bg-slate-50'}`}
                        title="显示全部转入/转出"
                    >
                        <PanelLeft size={14} />
                        全部
                    </button>
                    <button 
                        onClick={() => setViewMode('incoming')}
                        className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1 ${viewMode === 'incoming' ? 'bg-green-50 text-green-700 border border-green-100' : 'text-slate-600 hover:bg-slate-50'}`}
                        title="只看选中地址的入账"
                    >
                        <ArrowDownLeft size={14} />
                        入账
                    </button>
                    <button 
                        onClick={() => setViewMode('outgoing')}
                        className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1 ${viewMode === 'outgoing' ? 'bg-red-50 text-red-700 border border-red-100' : 'text-slate-600 hover:bg-slate-50'}`}
                        title="只看选中地址的出账"
                    >
                        <ArrowUpRight size={14} />
                        出账
                    </button>
                </div>

                <div className="bg-white rounded shadow-sm border border-slate-200 p-1 flex">
                    <button 
                        onClick={handleSearch}
                        className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                <div className="bg-white rounded shadow-sm border border-slate-200 px-3 py-2 flex items-center gap-2 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Depth: {depthLimit}</span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1"> Tx Count: {filteredGraph.links.length}</span>
                </div>
            </div>

            <GraphView 
                data={filteredGraph} 
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedNode?.id}
                ref={graphRef}
            />
        </div>

        {/* Right Analysis Panel */}
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
        />
      </div>
    </div>
  );
}

export default App;