import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ParseResult, GraphNode, GraphLink } from "./types";
import { hexPath, generateHexGrid } from "./utils";
import { getEdgeColor } from "./colorUtils";

interface Props {
  data: ParseResult;
}

const CyberGraph: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle Resize
  useEffect(() => {
    if (!wrapperRef.current) return;
    const updateDims = () => {
      setDimensions({
        width: wrapperRef.current?.clientWidth || 800,
        height: wrapperRef.current?.clientHeight || 600,
      });
    };
    window.addEventListener("resize", updateDims);
    updateDims();
    return () => window.removeEventListener("resize", updateDims);
  }, []);

  // Update selection visuals
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    svg
      .selectAll<SVGPathElement, GraphNode>(".node-hex")
      .transition()
      .duration(300)
      .attr("stroke", (d) => {
        if (d === selectedNode) return "#06b6d4";
        if (d.group === "mixer") return "#a855f7";
        if (d.group === "attacker") return "#ef4444";
        if (d.group === "victim") return "#fca5a5";
        return "#4b5563";
      })
      .attr("stroke-width", (d) => {
        if (d === selectedNode) return d.isMixer ? 4 : 3;
        return d.isMixer ? 3 : 2;
      })
      .attr("filter", (d) => (d === selectedNode ? "url(#glow)" : null))
      .attr("fill", (d) => {
        if (d === selectedNode) return "#101010";
        if (d.group === "mixer") return "#581c87";
        if (d.group === "attacker") return "#7f1d1d";
        if (d.group === "victim") return "#be185d";
        return "#000";
      });

    // Update link highlighting based on selected node
    svg
      .selectAll<SVGPathElement, GraphLink>("path.link-line")
      .transition()
      .duration(300)
      .attr("stroke-opacity", (d) => {
        if (!selectedNode) return 0.5;
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        return sourceId === selectedNode.id || targetId === selectedNode.id ? 0.9 : 0.15;
      })
      .attr("stroke", (d) => {
        if (!selectedNode) {
          // 未选中时使用币种颜色
          return getEdgeColor(d.asset);
        }
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        // 选中时：相关链接用红绿区分进出，其他链接保持币种颜色但降低透明度
        if (targetId === selectedNode.id) return "#10b981"; // 绿色 - 入账
        if (sourceId === selectedNode.id) return "#ef4444"; // 红色 - 出账
        return getEdgeColor(d.asset); // 其他链接保持币种颜色
      })
      .attr("stroke-width", (d) => {
        if (!selectedNode) return Math.min(Math.sqrt(d.value) + 1, 5);
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        return sourceId === selectedNode.id || targetId === selectedNode.id 
          ? Math.min(Math.sqrt(d.value) + 2, 7) 
          : Math.min(Math.sqrt(d.value) + 1, 5);
      });
  }, [selectedNode]);

  // Initialize graph with tree layout
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;

    // Filters and gradients
    const defs = svg.append("defs");
    
    // Glow filter
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Arrow marker for links
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#ef4444");

    // Background hex grid
    const bgGroup = svg.append("g").attr("class", "bg-grid");
    const bgHexRadius = 15;
    const bgHexPoints = generateHexGrid(width * 3, height * 3, bgHexRadius);
    bgGroup
      .selectAll("path")
      .data(bgHexPoints)
      .enter()
      .append("path")
      .attr("d", hexPath(bgHexRadius - 1))
      .attr("transform", (d) => `translate(${d.x - width}, ${d.y - height})`)
      .attr("fill", "none")
      .attr("stroke", "#1a1a1a")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);

    const container = svg.append("g");

    // Zoom and pan
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        bgGroup.attr("transform", event.transform);
      });

    svg.call(zoom).on("dblclick.zoom", null);

    svg.on("click", (event) => {
      if (event.target === svg.node()) {
        setSelectedNode(null);
      }
    });

    // Build tree structure from graph data
    // Find root node (highest connection count or first attacker)
    const rootNode = data.nodes.find(n => n.group === "attacker") || data.nodes[0];
    
    // Create adjacency map
    const adjacencyMap = new Map<string, Set<string>>();
    data.nodes.forEach(n => adjacencyMap.set(n.id, new Set()));
    data.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      adjacencyMap.get(sourceId)?.add(targetId);
    });

    // BFS to build tree structure - 处理多个连通分量
    interface TreeNode extends GraphNode {
      children?: TreeNode[];
      depth?: number;
    }

    const visited = new Set<string>();
    const allTreeRoots: TreeNode[] = [];
    
    // 找到所有连通分量的根节点
    const unvisitedNodes = [...data.nodes];
    
    while (unvisitedNodes.length > 0) {
      // 找到下一个未访问的节点作为根
      const nextRoot = unvisitedNodes.find(n => !visited.has(n.id));
      if (!nextRoot) break;
      
      const treeRoot: TreeNode = { ...nextRoot, children: [], depth: 0 };
      allTreeRoots.push(treeRoot);
      
      const queue: TreeNode[] = [treeRoot];
      visited.add(nextRoot.id);

      while (queue.length > 0) {
        const current = queue.shift()!;
        const neighbors = adjacencyMap.get(current.id) || new Set();
        
        neighbors.forEach(neighborId => {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            const neighborNode = data.nodes.find(n => n.id === neighborId);
            if (neighborNode) {
              const childNode: TreeNode = { 
                ...neighborNode, 
                children: [], 
                depth: (current.depth || 0) + 1 
              };
              current.children!.push(childNode);
              queue.push(childNode);
            }
          }
        });
      }
    }
    
    console.log('[CyberGraph] 连通分量数:', allTreeRoots.length);
    console.log('[CyberGraph] 已访问节点数:', visited.size, '/', data.nodes.length);

    // Tree layout with increased spacing
    const treeLayout = d3.tree<TreeNode>()
      .size([height - 100, width - 400])
      .separation((a, b) => (a.parent === b.parent ? 2.5 : 3));

    // Position nodes (rotate 90 degrees: x becomes y, y becomes x)
    // Increase horizontal spacing between levels
    const nodePositions = new Map<string, { x: number; y: number }>();
    
    let currentYOffset = 50;
    
    // 为每个连通分量布局
    allTreeRoots.forEach((treeRoot, treeIndex) => {
      const root = d3.hierarchy(treeRoot);
      const treeData = treeLayout(root);
      
      // 计算这棵树的高度
      const treeHeight = Math.max(...treeData.descendants().map(d => d.x)) - 
                         Math.min(...treeData.descendants().map(d => d.x)) + 100;
      
      treeData.descendants().forEach(d => {
        const node = d.data as TreeNode;
        const depth = d.depth;
        nodePositions.set(node.id, {
          x: depth * 250 + 150, // horizontal position (depth) - increased spacing
          y: d.x + currentYOffset // vertical position (spread) + offset
        });
        node.x = depth * 250 + 150;
        node.y = d.x + currentYOffset;
        node.fx = node.x;
        node.fy = node.y;
      });
      
      // 为下一棵树增加垂直偏移
      currentYOffset += treeHeight;
    });

    // Links with curved paths
    const linkGroup = container.append("g").attr("class", "links");
    
    const link = linkGroup
      .selectAll<SVGPathElement, GraphLink>("path")
      .data(data.links)
      .enter()
      .append("path")
      .attr("class", "link-line")
      .attr("fill", "none")
      .attr("stroke", (d) => getEdgeColor(d.asset)) // 使用币种颜色
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", (d) => Math.min(Math.sqrt(d.value) + 1, 5))
      .attr("marker-end", "url(#arrowhead)")
      .attr("d", (d) => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        const sourcePos = nodePositions.get(sourceId);
        const targetPos = nodePositions.get(targetId);
        
        if (!sourcePos || !targetPos) return "";
        
        // Curved path
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.5;
        
        return `M${sourcePos.x},${sourcePos.y}Q${sourcePos.x + dx/2},${sourcePos.y},${targetPos.x},${targetPos.y}`;
      });

    // Animated bulge effect on links (连线鼓包动画)
    data.links.forEach((linkData, i) => {
      const sourceId = typeof linkData.source === 'object' ? linkData.source.id : linkData.source;
      const targetId = typeof linkData.target === 'object' ? linkData.target.id : linkData.target;
      const sourcePos = nodePositions.get(sourceId);
      const targetPos = nodePositions.get(targetId);
      
      if (!sourcePos || !targetPos) return;
      
      // Create a thicker segment that will move along the path
      const assetColor = getEdgeColor(linkData.asset);
      const bulge = linkGroup
        .append("path")
        .attr("class", "link-bulge")
        .attr("fill", "none")
        .attr("stroke", assetColor) // 使用币种颜色
        .attr("stroke-opacity", 0)
        .attr("stroke-width", 8)
        .attr("stroke-linecap", "round");

      // Animate bulge along path
      function animateBulge() {
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        
        // Create path segments for the bulge
        const segmentLength = 30; // Length of the bulge segment
        
        bulge
          .attr("stroke-opacity", 0)
          .transition()
          .duration(100)
          .attr("stroke-opacity", 0.6)
          .transition()
          .duration(2000 + Math.random() * 1000)
          .ease(d3.easeLinear)
          .attrTween("d", () => {
            return (t: number) => {
              // Calculate position along the curve
              const x1 = sourcePos.x + dx * Math.max(0, t - 0.05);
              const y1 = sourcePos.y + dy * Math.max(0, t - 0.05);
              const x2 = sourcePos.x + dx * Math.min(1, t + 0.05);
              const y2 = sourcePos.y + dy * Math.min(1, t + 0.05);
              
              // Control point for quadratic curve
              const cx = sourcePos.x + dx / 2;
              const cy = sourcePos.y;
              
              // Calculate points on the quadratic bezier curve
              const getPointOnCurve = (t: number) => {
                const x = (1 - t) * (1 - t) * sourcePos.x + 2 * (1 - t) * t * cx + t * t * targetPos.x;
                const y = (1 - t) * (1 - t) * sourcePos.y + 2 * (1 - t) * t * cy + t * t * targetPos.y;
                return { x, y };
              };
              
              const p1 = getPointOnCurve(Math.max(0, t - 0.05));
              const p2 = getPointOnCurve(Math.min(1, t + 0.05));
              
              return `M${p1.x},${p1.y}L${p2.x},${p2.y}`;
            };
          })
          .transition()
          .duration(200)
          .attr("stroke-opacity", 0)
          .on("end", () => {
            setTimeout(animateBulge, Math.random() * 3000 + 1000);
          });
      }
      
      setTimeout(animateBulge, Math.random() * 2000);
    });

    // Nodes
    const node = container
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(data.nodes)
      .enter()
      .append("g")
      .attr("transform", (d) => {
        const pos = nodePositions.get(d.id);
        return pos ? `translate(${pos.x},${pos.y})` : "translate(0,0)";
      })
      .style("cursor", "grab")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", function(event, d) {
            d3.select(this).style("cursor", "grabbing");
          })
          .on("drag", function(event, d) {
            const pos = nodePositions.get(d.id);
            if (pos) {
              pos.x = event.x;
              pos.y = event.y;
              d3.select(this).attr("transform", `translate(${event.x},${event.y})`);
              
              // Update connected links
              link.attr("d", function(linkData) {
                const sourceId = typeof linkData.source === 'object' ? linkData.source.id : linkData.source;
                const targetId = typeof linkData.target === 'object' ? linkData.target.id : linkData.target;
                const sourcePos = nodePositions.get(sourceId);
                const targetPos = nodePositions.get(targetId);
                
                if (!sourcePos || !targetPos) return "";
                
                const dx = targetPos.x - sourcePos.x;
                const dy = targetPos.y - sourcePos.y;
                
                return `M${sourcePos.x},${sourcePos.y}Q${sourcePos.x + dx/2},${sourcePos.y},${targetPos.x},${targetPos.y}`;
              });
            }
          })
          .on("end", function(event, d) {
            d3.select(this).style("cursor", "grab");
          })
      );

    // 为混币器节点添加外框（先添加，在六边形之前）
    node.each(function(d) {
      if (d.isMixer) {
        const g = d3.select(this);
        // 添加外框矩形
        g.insert("rect", ":first-child")
          .attr("class", "mixer-frame")
          .attr("x", -60)
          .attr("y", -70)
          .attr("width", 120)
          .attr("height", 120)
          .attr("fill", "none")
          .attr("stroke", "#a855f7")
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "5,5")
          .attr("rx", 8)
          .attr("filter", "url(#glow)")
          .style("animation", "dash 20s linear infinite");
      }
      
      // 为币安节点添加外框
      if (d.isBinance) {
        const g = d3.select(this);
        // 添加金色外框矩形
        g.insert("rect", ":first-child")
          .attr("class", "binance-frame")
          .attr("x", -60)
          .attr("y", -70)
          .attr("width", 120)
          .attr("height", 120)
          .attr("fill", "none")
          .attr("stroke", "#f59e0b")
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "5,5")
          .attr("rx", 8)
          .attr("filter", "url(#glow)")
          .style("animation", "dash 20s linear infinite");
      }
    });

    node
      .append("path")
      .attr("class", "node-hex")
      .attr("d", (d) => {
        const size = Math.max(15, Math.min(35, Math.sqrt(d.value) * 5));
        // 混币器节点更大
        return hexPath(d.isMixer ? size * 1.5 : size);
      })
      .attr("fill", (d) => {
        if (d.group === "mixer") return "#581c87"; // 紫色 - 混币器
        if (d.group === "attacker") return "#7f1d1d"; // 深红色 - 攻击者
        if (d.group === "victim") return "#be185d"; // 深粉色 - 受害者
        return "#000"; // 黑色 - 中性
      })
      .attr("stroke", (d) => {
        if (d.group === "mixer") return "#a855f7"; // 亮紫色边框
        if (d.group === "attacker") return "#ef4444"; // 红色边框
        if (d.group === "victim") return "#ec4899"; // 粉色边框
        return "#4b5563"; // 灰色边框
      })
      .attr("stroke-width", (d) => d.isMixer ? 3 : 2)
      .on("mouseover", (event, d) => {
        setHoveredNode(d);
        if (d !== selectedNode) {
          d3.select(event.currentTarget).attr("fill", "#222");
        }
      })
      .on("mouseout", (event, d) => {
        setHoveredNode(null);
        if (d !== selectedNode) {
          d3.select(event.currentTarget).attr(
            "fill",
            d.group === "mixer" ? "#581c87" : 
            d.group === "attacker" ? "#7f1d1d" : 
            d.group === "victim" ? "#be185d" : 
            "#000"
          );
        }
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      });

    node
      .append("text")
      .text((d) => d.id.substring(0, 6))
      .attr("x", 0)
      .attr("y", 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("fill", "#fff")
      .attr("font-family", "monospace")
      .attr("pointer-events", "none");

    // 为混币器节点添加标签（在六边形之后，确保在最上层）
    node.each(function(d) {
      if (d.isMixer) {
        const g = d3.select(this);
        
        // 添加混币器标签背景
        g.append("rect")
          .attr("class", "mixer-label-bg")
          .attr("x", -55)
          .attr("y", -65)
          .attr("width", 110)
          .attr("height", 20)
          .attr("fill", "#a855f7")
          .attr("rx", 4)
          .attr("pointer-events", "none");
        
        // 添加混币器标签文字
        g.append("text")
          .attr("class", "mixer-label")
          .text(d.mixerName || "MIXER")
          .attr("x", 0)
          .attr("y", -52)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .attr("fill", "#fff")
          .attr("font-family", "monospace")
          .attr("pointer-events", "none");
      }
      
      // 为币安节点添加标签
      if (d.isBinance) {
        const g = d3.select(this);
        
        // 添加币安标签背景
        g.append("rect")
          .attr("class", "binance-label-bg")
          .attr("x", -55)
          .attr("y", -65)
          .attr("width", 110)
          .attr("height", 20)
          .attr("fill", "#f59e0b")
          .attr("rx", 4)
          .attr("pointer-events", "none");
        
        // 添加币安标签文字
        g.append("text")
          .attr("class", "binance-label")
          .text("BINANCE")
          .attr("x", 0)
          .attr("y", -52)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .attr("fill", "#fff")
          .attr("font-family", "monospace")
          .attr("pointer-events", "none");
      }
    });

  }, [data, dimensions]);

  const getNodeTransactions = (node: GraphNode) => {
    return data.links.filter((l) => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      return sourceId === node.id || targetId === node.id;
    });
  };

  return (
    <div ref={wrapperRef} className="w-full h-full relative bg-gray-950 overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at center, #ef4444 0%, transparent 60%)",
          mixBlendMode: "color-dodge",
        }}
      />
      <svg ref={svgRef} className="w-full h-full block cursor-move" />

      {/* 动态图例 - 显示当前数据中使用的资产/方法 */}
      <div className="absolute bottom-4 left-4 bg-black/80 border border-gray-700 p-3 rounded text-xs font-mono z-40">
        <div className="text-gray-400 mb-2 text-[10px]">LEGEND</div>
        <div className="flex flex-wrap gap-2 max-w-md">
          {Array.from(new Set(data.links.map(l => l.asset))).map((asset: string) => {
            const color = getEdgeColor(asset);
            return (
              <div key={asset} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
                <span className="text-gray-300 text-[10px]">{asset}</span>
              </div>
            );
          })}
        </div>
      </div>

      {hoveredNode && !selectedNode && (
        <div className="absolute top-4 left-4 bg-black/90 border border-red-500 p-3 rounded text-xs font-mono max-w-sm pointer-events-none shadow-[0_0_15px_rgba(239,68,68,0.5)] z-40">
          <h3 className="text-red-400 font-bold mb-1">ID: {hoveredNode.id.substring(0, 8)}...</h3>
          <div className="text-gray-400">CLICK TO INSPECT</div>
        </div>
      )}

      <div
        className={`absolute top-0 right-0 bottom-0 w-96 bg-black/85 border-l border-red-900/50 backdrop-blur-md p-6 transform transition-transform duration-300 z-50 flex flex-col font-mono overflow-hidden ${
          selectedNode ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedNode && (
          <>
            <div className="flex justify-between items-start mb-6 border-b border-red-900/30 pb-4">
              <div>
                <h2 className="text-xl font-bold text-cyan-400 font-['Rajdhani']">TARGET_ANALYSIS</h2>
                <div className="text-[10px] text-gray-500 mt-1">HEX_ID: {selectedNode.index} // LAYER_2</div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-red-500 hover:text-white transition-colors">
                [X]
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 hide-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 tracking-widest">IDENTITY_MATRIX</label>
                <div className="bg-red-900/10 border border-red-900/30 p-3 rounded break-all">
                  <div className="text-xs text-gray-300 mb-1">WALLET_ADDRESS</div>
                  <div className="text-sm font-bold text-white font-mono">{selectedNode.id}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-red-900/10 border border-red-900/30 p-3 rounded">
                    <div className="text-[10px] text-gray-500">THREAT_TYPE</div>
                    <div className={`text-lg font-bold ${selectedNode.group === "attacker" ? "text-red-500 animate-pulse" : "text-emerald-400"}`}>
                      {selectedNode.group.toUpperCase()}
                    </div>
                  </div>
                  <div className="bg-red-900/10 border border-red-900/30 p-3 rounded">
                    <div className="text-[10px] text-gray-500">RISK_SCORE</div>
                    <div className="text-lg font-bold text-white">{(selectedNode.value * 1.5).toFixed(0)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 tracking-widest">NETWORK_TELEMETRY</label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-black border border-gray-800 p-2">
                    <div className="text-xs text-gray-500">LINKS</div>
                    <div className="text-cyan-400 font-bold">{selectedNode.connectionCount}</div>
                  </div>
                  <div className="bg-black border border-gray-800 p-2 col-span-2">
                    <div className="text-xs text-gray-500">TOTAL_VOLUME</div>
                    <div className="text-cyan-400 font-bold">{selectedNode.value.toFixed(4)} ETH</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 tracking-widest">TRANSACTION_LOG</label>
                <div className="space-y-2 max-h-64 overflow-y-auto hide-scrollbar">
                  {getNodeTransactions(selectedNode).map((link, i) => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    const isIncoming = targetId === selectedNode.id;
                    const otherAddress = isIncoming ? sourceId : targetId;
                    const assetColor = getEdgeColor(link.asset);
                    
                    return (
                      <div
                        key={i}
                        className="p-2 border-l-2 text-xs"
                        style={{ 
                          borderLeftColor: assetColor,
                          backgroundColor: `${assetColor}15`
                        }}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={isIncoming ? "text-emerald-400" : "text-red-400"}>
                            {isIncoming ? "← IN" : "→ OUT"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span 
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                              style={{ backgroundColor: assetColor, color: '#fff' }}
                            >
                              {link.asset}
                            </span>
                            <span className="text-white font-bold">{link.value.toFixed(3)}</span>
                          </div>
                        </div>
                        <div className="text-gray-500 truncate text-[10px]">
                          {isIncoming ? `FROM: ${otherAddress.slice(0, 10)}...${otherAddress.slice(-6)}` : `TO: ${otherAddress.slice(0, 10)}...${otherAddress.slice(-6)}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CyberGraph;

