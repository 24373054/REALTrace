import React, { useMemo } from "react";
import { GraphLink } from "./types";

interface Props {
  links: GraphLink[];
}

const TransactionList: React.FC<Props> = ({ links }) => {
  const topLinks = useMemo(() => {
    return [...links].sort((a, b) => b.value - a.value).slice(0, 50);
  }, [links]);

  return (
    <div className="w-80 bg-black/80 border-r border-red-900/30 text-white font-mono p-4 overflow-y-auto relative custom-scrollbar">
      <div className="text-xs text-red-400 tracking-widest mb-3">HEX_STREAM // TX LOG</div>
      <div className="space-y-3">
        {topLinks.map((l, i) => (
          <div key={i} className="p-3 bg-red-900/10 border border-red-900/30 rounded">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-400">{l.asset || "ASSET"}</span>
              <span className="text-emerald-400 font-bold">{l.value.toFixed(4)}</span>
            </div>
            <div className="text-[10px] text-gray-400 truncate">FROM: {(l.source as any).id || l.source}</div>
            <div className="text-[10px] text-gray-400 truncate">TO: {(l.target as any).id || l.target}</div>
            {l.hashes?.length ? (
              <div className="text-[10px] text-gray-500 mt-1 truncate">HASH: {l.hashes[0]}</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;

