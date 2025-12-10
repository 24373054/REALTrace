import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink, AddressType } from '../types';

interface GraphViewProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  selectedNodeId?: string;
}

export interface GraphViewHandle {
  getSvgElement: () => SVGSVGElement | null;
}

const GraphView = forwardRef<GraphViewHandle, GraphViewProps>(({ data, onNodeClick, selectedNodeId }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getSvgElement: () => svgRef.current
  }), []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("class", "cursor-move");

    // Add arrow marker definitions
    const defs = svg.append("defs");
    
    // Normal Arrow
    defs.append("marker")
      .attr("id", "arrow-normal")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25) // Position relative to node radius
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#94a3b8")
      .attr("d", "M0,-5L10,0L0,5");

    // Risk Arrow
    defs.append("marker")
      .attr("id", "arrow-risk")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#ef4444")
      .attr("d", "M0,-5L10,0L0,5");

    // Simulation Setup
    const simulation = d3.forceSimulation<GraphNode>(data.nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(data.links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Container for Zoom
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Render Links
    const link = g.append("g")
      .selectAll("g")
      .data(data.links)
      .join("g");

    // Link Path
    const linkPath = link.append("path")
      .attr("class", "link")
      .attr("stroke", (d) => {
        const target = d.target as GraphNode;
        return (target.type === AddressType.PHISHING || target.type === AddressType.MIXER) 
          ? "#fca5a5" 
          : "#cbd5e1";
      })
      .attr("stroke-width", 1.5)
      .attr("fill", "none")
      .attr("marker-end", (d) => {
         const target = d.target as GraphNode;
         return (target.type === AddressType.PHISHING || target.type === AddressType.MIXER)
          ? "url(#arrow-risk)"
          : "url(#arrow-normal)";
      });

    // Link Labels (Amount)
    const linkText = link.append("text")
      .attr("dy", -5)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-size", "10px")
      .text(d => `${d.value} ${d.token}`);

    // Render Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("class", "node cursor-pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      })
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node Shape Logic
    node.each(function(d) {
      const el = d3.select(this);
      const isSelected = d.id === selectedNodeId;
      const strokeColor = isSelected ? "#0ea5e9" : "#fff";
      const strokeWidth = isSelected ? 3 : 2;

      if (d.type === AddressType.ROOT) {
        // Star for Root
        el.append("path")
          .attr("d", d3.symbol().type(d3.symbolStar).size(500))
          .attr("fill", "#10b981") // Green
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth);
      } else if (d.type === AddressType.PHISHING || d.type === AddressType.MIXER) {
        // Triangle for Risk
        el.append("path")
          .attr("d", d3.symbol().type(d3.symbolTriangle).size(300))
          .attr("fill", "#ef4444") // Red
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth);
      } else if (d.type === AddressType.CEX) {
         // Square for CEX
        el.append("rect")
          .attr("width", 20)
          .attr("height", 20)
          .attr("x", -10)
          .attr("y", -10)
          .attr("fill", "#f59e0b") // Amber
          .attr("rx", 4)
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth);
      } else {
        // Circle for Normal
        el.append("circle")
          .attr("r", 10)
          .attr("fill", "#94a3b8") // Gray
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth);
      }
    });

    // Node Labels
    node.append("text")
      .attr("dy", 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#334155")
      .attr("font-size", "11px")
      .text(d => d.label.length > 15 ? d.label.substring(0, 12) + "..." : d.label);
      
    // Risk Warning Labels
    node.filter(d => d.riskScore > 50)
        .append("text")
        .attr("dy", -20)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text("RISK");


    // Simulation Update
    simulation.on("tick", () => {
      // Update link paths (curved)
      linkPath.attr("d", (d) => {
        const source = d.source as GraphNode;
        const target = d.target as GraphNode;
        // Calculate curve
        const dx = target.x! - source.x!;
        const dy = target.y! - source.y!;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.2; // Curve factor
        return `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
      });

      // Update link text position
      linkText
        .attr("x", d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr("y", d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);

      // Update node positions
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag Functions
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

    // Cleanup
    return () => {
      simulation.stop();
    };

  }, [data, onNodeClick, selectedNodeId]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 relative overflow-hidden">
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded shadow-sm text-xs text-slate-500 border border-slate-200">
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Start Address</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-red-500"></div> Risk / Phishing</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded bg-amber-500"></div> Exchange (CEX)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Normal Wallet</div>
      </div>
    </div>
  );
});

export default GraphView;