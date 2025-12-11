import React, { useEffect, useState } from "react";
import CyberGraph from "./CyberGraph";
import TransactionList from "./TransactionList";
import { ParseResult } from "./types";

interface Props {
  loader: () => ParseResult;
}

const HackerTraceView: React.FC<Props> = ({ loader }) => {
  const [data, setData] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(loader());
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [loader]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-red-600 font-mono">
        <div className="text-4xl font-bold animate-pulse mb-4">INITIALIZING TRACE PROTOCOL...</div>
        <div className="w-64 h-2 bg-gray-800 rounded overflow-hidden border border-red-900">
          <div className="h-full bg-red-600 animate-[width_1.5s_ease-in-out_forwards]" style={{ width: "100%" }}></div>
        </div>
        <div className="mt-2 text-xs text-red-400">DECRYPTING PACKETS // PARSING HEX STREAMS</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-black text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-12 bg-black/80 border-b border-red-900/50 z-20 flex items-center px-4 backdrop-blur-md justify-between">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
          <h1 className="font-['Rajdhani'] font-bold text-2xl tracking-wider text-white">
            CYBER<span className="text-red-600">TRACE</span> // VISUALIZER
          </h1>
        </div>
        <div className="flex gap-8 text-xs font-mono text-gray-400">
          <div>
            NODES: <span className="text-white">{data.nodes.length}</span>
          </div>
          <div>
            LINKS: <span className="text-white">{data.links.length}</span>
          </div>
          <div>
            VOLUME: <span className="text-white">{data.totalVolume.toFixed(2)} ETH</span>
          </div>
          <div>
            THREATS: <span className="text-red-500 font-bold">{data.highValueTargets}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 pt-12">
        <TransactionList links={data.links} />
        <div className="flex-1 relative">
          <CyberGraph data={data} />
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-red-500 opacity-50 pointer-events-none"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-red-500 opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-red-500 opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-red-500 opacity-50 pointer-events-none"></div>
        </div>
      </div>

      <div className="absolute bottom-4 right-6 font-mono text-[10px] text-red-900/60 z-10 pointer-events-none select-none">
        SECURE_CONNECTION: FALSE <br />
        ENCRYPTION: BROKEN <br />
        LATENCY: 14ms
      </div>
    </div>
  );
};

export default HackerTraceView;

