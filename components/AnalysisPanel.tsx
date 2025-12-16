import React, { useState } from 'react';
import { GraphData, GraphNode, AddressType, GraphLink, ChainType, NetworkType } from '../types';
import { AlertTriangle, ShieldCheck, DollarSign, ExternalLink, Bot, Loader2, Copy, FileText } from 'lucide-react';
import ReportDetailView from './ReportDetailView';

interface AnalysisPanelProps {
  data: GraphData;
  links: GraphLink[];
  selectedNode: GraphNode | null;
  onAnalyze: () => Promise<void>;
  aiReport: string | null;
  isAnalyzing: boolean;
  viewMode: 'all' | 'incoming' | 'outgoing';
  onExpandDepth: () => void;
  depthLimit: number;
  maxDepth: number;
  onExpandNode: () => Promise<void>;
  isExpanding: boolean;
  chain: ChainType;
  network: NetworkType;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ 
  data, 
  links,
  selectedNode, 
  onAnalyze, 
  aiReport, 
  isAnalyzing,
  viewMode,
  onExpandDepth,
  depthLimit,
  maxDepth,
  onExpandNode,
  isExpanding,
  chain,
  network
}) => {
  // 生成区块链浏览器链接
  const getExplorerUrl = (txHash: string, address?: string) => {
    const hash = address || txHash;
    
    if (chain === ChainType.SOLANA) {
      const baseUrl = network === NetworkType.MAINNET 
        ? 'https://solscan.io'
        : network === NetworkType.TESTNET
        ? 'https://solscan.io/?cluster=testnet'
        : 'https://solscan.io/?cluster=devnet';
      
      if (address) {
        return `${baseUrl}/account/${hash}`;
      }
      return `${baseUrl}/tx/${hash}`;
    } else if (chain === ChainType.ETHEREUM) {
      const baseUrl = network === NetworkType.MAINNET
        ? 'https://etherscan.io'
        : network === NetworkType.TESTNET
        ? 'https://sepolia.etherscan.io'
        : 'https://goerli.etherscan.io';
      
      if (address) {
        return `${baseUrl}/address/${hash}`;
      }
      return `${baseUrl}/tx/${hash}`;
    }
    
    return '#';
  };
  const [activeTab, setActiveTab] = useState<'details' | 'list'>('list');
  const [tokenFilter, setTokenFilter] = useState<string>('ALL');
  const [sortDir, setSortDir] = useState<'DESC' | 'ASC'>('DESC');
  const [showReportDetail, setShowReportDetail] = useState(false);

  // Helpers
  const formatAddr = (addr: string | undefined) => {
    if (!addr) return 'Unknown';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };
  
  const getRiskBadge = (score: number, type: AddressType) => {
    if (type === AddressType.PHISHING || score > 80) return <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded border border-red-200 flex items-center gap-1"><AlertTriangle size={10} /> Phishing</span>;
    if (type === AddressType.CEX) return <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded border border-amber-200">Exchange</span>;
    if (type === AddressType.MIXER) return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded border border-purple-200">Mixer</span>;
    return <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded border border-green-200 flex items-center gap-1"><ShieldCheck size={10} /> Normal</span>;
  };

  // Helper to resolve a node from a link source/target which might be a string ID or a Node object
  const resolveNode = (nodeOrId: string | GraphNode): GraphNode | undefined => {
    if (typeof nodeOrId === 'object') return nodeOrId;
    return data.nodes.find(n => n.id === nodeOrId);
  };

  // Filter links safely
  // token 过滤与排序
  const applyListFilters = (txs: GraphLink[]) => {
    const filtered = tokenFilter === 'ALL' ? txs : txs.filter(t => t.token === tokenFilter);
    const sorted = [...filtered].sort((a, b) => {
      return sortDir === 'DESC' ? b.value - a.value : a.value - b.value;
    });
    return sorted;
  };

  const incomingTxs = applyListFilters(links.filter(l => {
    const targetId = typeof l.target === 'object' ? l.target.id : l.target;
    return targetId === selectedNode?.id;
  }));

  const outgoingTxs = applyListFilters(links.filter(l => {
    const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
    return sourceId === selectedNode?.id;
  }));

  const availableTokens = Array.from(new Set(links.map(l => l.token)));

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-xl w-96 z-10">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Inspection Panel</h2>
        {selectedNode ? (
            <div className="mt-2">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-slate-900">{formatAddr(selectedNode.id)}</span>
                    <button className="text-slate-400 hover:text-brand-600"><Copy size={12} /></button>
                </div>
                <div className="flex gap-2 mt-1">
                    {getRiskBadge(selectedNode.riskScore, selectedNode.type)}
                    <span className="text-[10px] px-2 py-0.5 rounded border border-slate-200 text-slate-500 bg-white">
                        视图: {viewMode === 'all' ? '全部' : viewMode === 'incoming' ? '只入账' : '只出账'}
                    </span>
                    {selectedNode.intelSources && selectedNode.intelSources.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded border border-amber-200 text-amber-700 bg-amber-50">
                        Threat Intel: {selectedNode.intelSources.join(', ')}
                      </span>
                    )}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <button
                    onClick={onExpandDepth}
                    disabled={depthLimit >= maxDepth}
                    className="px-3 py-1 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    展开一层 (Depth {depthLimit}/{maxDepth})
                  </button>
                  <span className="text-slate-400">深度裁剪当前视图；RPC 展开请用下方按钮。</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <button
                    onClick={onExpandNode}
                    disabled={!selectedNode || isExpanding}
                    className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isExpanding ? '展开中...' : '向后端请求下一层'}
                  </button>
                  <span className="text-slate-400">基于选中地址从 RPC 拉取新交易并合并。</span>
                </div>
            </div>
        ) : (
            <div className="mt-2 text-sm text-slate-500 italic">Select a node to inspect</div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'list' ? 'text-brand-600 border-b-2 border-brand-600 bg-white' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
        >
          Transactions
        </button>
        <button 
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'details' ? 'text-brand-600 border-b-2 border-brand-600 bg-white' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
        >
          AI Insight
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        
        {/* Transaction List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            {!selectedNode && (
                <div className="text-center py-10 text-slate-400">
                    <DollarSign className="mx-auto mb-2 opacity-50" size={32} />
                    <p>Select an address on the graph to view its transaction history.</p>
                </div>
            )}

            {selectedNode && (
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Token:</span>
                  <select
                    className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"
                    value={tokenFilter}
                    onChange={(e) => setTokenFilter(e.target.value)}
                  >
                    <option value="ALL">ALL</option>
                    {availableTokens.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">排序:</span>
                  <select
                    className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"
                    value={sortDir}
                    onChange={(e) => setSortDir(e.target.value as 'DESC' | 'ASC')}
                  >
                    <option value="DESC">金额降序</option>
                    <option value="ASC">金额升序</option>
                  </select>
                </div>
              </div>
            )}

            {selectedNode && outgoingTxs.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div> Outgoing Funds
                    </h3>
                    <div className="space-y-2">
                        {outgoingTxs.map((tx, idx) => {
                             const target = resolveNode(tx.target);
                             if (!target) return null;

                             return (
                                <div key={idx} className="bg-white border border-slate-100 rounded p-3 hover:border-brand-200 transition-colors shadow-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400">Recipient</span>
                                            <span className="text-xs font-mono text-slate-700">{formatAddr(target.id)}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-sm font-bold text-slate-800">-{tx.value} {tx.token}</span>
                                            <span className="text-[10px] text-slate-400">{tx.timestamp.split(' ')[0]}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                                        {getRiskBadge(target.riskScore, target.type)}
                                        <a 
                                          href={getExplorerUrl(tx.txHash)} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-xs text-brand-500 hover:underline flex items-center gap-1"
                                        >
                                          View Hash <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                </div>
            )}

            {selectedNode && incomingTxs.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div> Incoming Funds
                    </h3>
                    <div className="space-y-2">
                        {incomingTxs.map((tx, idx) => {
                            const source = resolveNode(tx.source);
                            if (!source) return null;

                            return (
                                <div key={idx} className="bg-white border border-slate-100 rounded p-3 hover:border-brand-200 transition-colors shadow-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400">Sender</span>
                                            <span className="text-xs font-mono text-slate-700">{formatAddr(source.id)}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-sm font-bold text-green-600">+{tx.value} {tx.token}</span>
                                            <span className="text-[10px] text-slate-400">{tx.timestamp.split(' ')[0]}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                                        {getRiskBadge(source.riskScore, source.type)}
                                        <a 
                                          href={getExplorerUrl(tx.txHash)} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-xs text-brand-500 hover:underline flex items-center gap-1"
                                        >
                                          View Hash <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
          </div>
        )}

        {/* AI Insight Tab */}
        {activeTab === 'details' && (
          <div className="space-y-4">
             <div className="bg-brand-50 border border-brand-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="bg-brand-100 p-2 rounded-lg text-brand-600 mt-1">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="text-brand-900 font-bold text-sm">Mitrix AI Investigator</h3>
                        <p className="text-brand-700 text-xs mt-1">
                            Use DeepSeek AI to analyze the transaction patterns of the current graph view.
                        </p>
                    </div>
                </div>
                
                {!aiReport && (
                    <button 
                        onClick={onAnalyze}
                        disabled={isAnalyzing}
                        className="w-full mt-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2 px-4 rounded shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isAnalyzing ? <><Loader2 className="animate-spin" size={16} /> Analyzing Chain Data...</> : 'Generate Report'}
                    </button>
                )}
             </div>

             {aiReport && (
                 <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed shadow-inner">
                     <div className="prose prose-sm prose-slate max-w-none">
                         <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                     </div>
                     <div className="flex gap-3 mt-4">
                        <button 
                           onClick={() => setShowReportDetail(true)}
                           className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded hover:bg-slate-900 transition-colors"
                        >
                           <FileText size={16} />
                           View Full Report
                        </button>
                        <button 
                           onClick={onAnalyze}
                           disabled={isAnalyzing}
                           className="px-4 py-2 text-sm text-brand-600 hover:text-brand-800 font-medium border border-brand-200 rounded hover:bg-brand-50 transition-colors"
                        >
                           Regenerate
                        </button>
                     </div>
                 </div>
             )}
          </div>
        )}

      </div>

      {/* Report Detail Modal */}
      {showReportDetail && aiReport && (
        <ReportDetailView
          aiReport={aiReport}
          data={data}
          selectedNode={selectedNode}
          onClose={() => setShowReportDetail(false)}
        />
      )}
    </div>
  );
};

export default AnalysisPanel;