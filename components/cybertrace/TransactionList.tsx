import React, { useMemo, useEffect, useRef } from "react";
import { GraphLink } from "./types";

interface Props {
  links: GraphLink[];
}

const TransactionList: React.FC<Props> = ({ links }) => {
  const topLinks = useMemo(() => {
    return [...links].sort((a, b) => b.value - a.value).slice(0, 50);
  }, [links]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const content = contentRef.current;
    
    if (!container || !content) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.3; // 像素/帧，调整这个值可以改变滚动速度

    const animate = () => {
      if (!isPausedRef.current) {
        scrollPosition += scrollSpeed;
        
        // 当滚动到内容高度的一半时重置（因为我们复制了内容）
        const contentHeight = content.offsetHeight / 2;
        if (scrollPosition >= contentHeight) {
          scrollPosition = 0;
        }
        
        container.scrollTop = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // 鼠标悬停时暂停滚动
    const handleMouseEnter = () => {
      isPausedRef.current = true;
    };

    const handleMouseLeave = () => {
      isPausedRef.current = false;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [topLinks]);

  const renderTransactionItem = (l: GraphLink, i: number, key: string) => (
    <div key={key} className="p-3 bg-red-900/10 border border-red-900/30 rounded">
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
  );

  return (
    <div className="w-80 bg-black/80 border-r border-red-900/30 text-white font-mono p-4 relative overflow-hidden">
      <div className="text-xs text-red-400 tracking-widest mb-3">HEX_STREAM // TX LOG</div>
      
      {/* 隐藏滚动条的容器 */}
      <div 
        ref={scrollContainerRef}
        className="overflow-y-scroll h-full hide-scrollbar"
        style={{ 
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* 内容容器 - 复制两份以实现无缝循环 */}
        <div ref={contentRef} className="space-y-3">
          {topLinks.map((l, i) => renderTransactionItem(l, i, `original-${i}`))}
          {/* 复制一份内容以实现无缝循环 */}
          {topLinks.map((l, i) => renderTransactionItem(l, i, `duplicate-${i}`))}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;

