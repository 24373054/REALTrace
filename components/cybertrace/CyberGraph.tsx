import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ParseResult, GraphNode, GraphLink } from "./types";
import { hexPath, generateHexGrid } from "./utils";

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
        if (d.group === "attacker") return "#ef4444";
        if (d.group === "victim") return "#fca5a5";
        return "#4b5563";
      })
      .attr("stroke-width", (d) => (d === selectedNode ? 3 : 2))
      .attr("filter", (d) => (d === selectedNode ? "url(#glow)" : null))
      .attr("fill", (d) => {
        if (d === selectedNode) return "#101010";
        if (d.group === "attacker") return "#7f1d1d";
        if (d.group === "victim") return "#ef4444";
        return "#000";
      });

    svg
      .selectAll<SVGLineElement, GraphLink>(".link-line")
      .attr("opacity", (d) => {
        if (!selectedNode) return 0.4;
        return d.source === selectedNode || d.target === selectedNode ? 0.8 : 0.1;
      })
      .attr("stroke", (d) => {
        if (!selectedNode) return "#ef4444";
        return d.source === selectedNode || d.target === selectedNode ? "#06b6d4" : "#ef4444";
      });
  }, [selectedNode]);

  // Initialize graph
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;

    // Filters
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

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

    // Zoom
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

    // Simulation
    const simulation = d3
      .forceSimulation<GraphNode>(data.nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(data.links).id((d) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Links
    const link = container
      .append("g")
      .attr("class", "links")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("class", "link-line")
      .attr("stroke", "#ef4444")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", (d) => Math.min(Math.sqrt(d.value), 4));

    // Nodes
    const node = container
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(data.nodes)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    node
      .append("path")
      .attr("class", "node-hex")
      .attr("d", (d) => {
        const size = Math.max(10, Math.min(30, Math.sqrt(d.value) * 5));
        return hexPath(size);
      })
      .attr("fill", (d) => {
        if (d.group === "attacker") return "#7f1d1d";
        if (d.group === "victim") return "#ef4444";
        return "#000";
      })
      .attr("stroke", (d) => {
        if (d.group === "attacker") return "#ef4444";
        if (d.group === "victim") return "#fca5a5";
        return "#4b5563";
      })
      .attr("stroke-width", 2)
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
            d.group === "attacker" ? "#7f1d1d" : d.group === "victim" ? "#ef4444" : "#000"
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

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, dimensions]);

  const getNodeTransactions = (node: GraphNode) => {
    return data.links.filter((l) => l.source === node || l.target === node);
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

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
                <div className="space-y-2">
                  {getNodeTransactions(selectedNode).map((link, i) => {
                    const isIncoming = link.target === selectedNode;
                    return (
                      <div
                        key={i}
                        className={`p-2 border-l-2 text-xs ${
                          isIncoming ? "border-emerald-500 bg-emerald-900/10" : "border-red-500 bg-red-900/10"
                        }`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className={isIncoming ? "text-emerald-400" : "text-red-400"}>
                            {isIncoming ? "<- INCOMING" : "-> OUTGOING"}
                          </span>
                          <span className="text-white font-bold">{link.value.toFixed(3)} {link.asset}</span>
                        </div>
                        <div className="text-gray-500 truncate">
                          {isIncoming ? `FROM: ${(link.source as GraphNode).id}` : `TO: ${(link.target as GraphNode).id}`}
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

