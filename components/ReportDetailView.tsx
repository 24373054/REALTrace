import React, { useState } from 'react';
import { X, Download, FileText, Calendar, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { GraphData, GraphNode } from '../types';
import jsPDF from 'jspdf';

interface ReportDetailViewProps {
  aiReport: string;
  data: GraphData;
  selectedNode: GraphNode | null;
  onClose: () => void;
}

interface ReportSection {
  id: string;
  title: string;
  content: string;
  images?: string[];
}

const ReportDetailView: React.FC<ReportDetailViewProps> = ({
  aiReport,
  data,
  selectedNode,
  onClose,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'ai-analysis']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };
  const handleDownloadPDF = () => {
    // 直接下载预先准备好的 PDF 文件
    const link = document.createElement('a');
    link.href = '/测试报告/区块链交易溯源报告(1).pdf';
    link.download = '区块链交易溯源报告.pdf';
    link.click();
  };

  const handleDownloadText = () => {
    const content = `
ChainTrace Investigation Report
Generated: ${new Date().toLocaleString()}

===========================================
SUMMARY
===========================================

Target Address: ${selectedNode?.id || 'N/A'}
Total Nodes: ${data.nodes.length}
Total Transactions: ${data.links.length}
High Risk Nodes: ${data.nodes.filter(n => n.riskScore > 70).length}

===========================================
AI ANALYSIS
===========================================

${aiReport}

===========================================
TRANSACTION DETAILS
===========================================

${data.links.slice(0, 50).map((link, idx) => {
  const source = typeof link.source === 'object' ? link.source.id : link.source;
  const target = typeof link.target === 'object' ? link.target.id : link.target;
  return `${idx + 1}. ${source.slice(0, 10)}... → ${target.slice(0, 10)}... | ${link.value} ${link.token} | ${link.timestamp}`;
}).join('\n')}

${data.links.length > 50 ? `\n... and ${data.links.length - 50} more transactions` : ''}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaintrace_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highRiskNodes = data.nodes.filter(n => n.riskScore > 70);
  const totalVolume = data.links.reduce((sum, link) => sum + link.value, 0);
  
  // 生成报告章节
  const reportSections: ReportSection[] = [
    {
      id: 'summary',
      title: 'Executive Summary',
      content: `This investigation report analyzes blockchain transaction patterns for address ${selectedNode?.id || 'N/A'}. The analysis covers ${data.nodes.length} addresses and ${data.links.length} transactions, with a total volume of ${totalVolume.toFixed(2)} tokens. ${highRiskNodes.length} high-risk addresses have been identified through pattern analysis and risk scoring algorithms.`,
    },
    {
      id: 'ai-analysis',
      title: 'AI-Powered Analysis',
      content: aiReport,
    },
    {
      id: 'deposits',
      title: 'Transaction Flow Analysis',
      content: `The investigation traced ${data.links.length} transactions across the network. Analysis of deposit and withdrawal patterns reveals significant activity clusters. The following diagram illustrates the connections between addresses believed to be controlled by related entities.`,
      images: ['测试报告/报告图片/0_ydyPOHzEMo8A6dC1.png', '测试报告/报告图片/1_upsWRC6mYnCJlZi9HcQqQw.png'],
    },
    {
      id: 'timeline',
      title: 'Transaction Timeline',
      content: `Temporal analysis of transaction activity shows distinct patterns over time. The following timeline visualizes when key transactions occurred, helping identify coordinated activities and potential wash trading patterns.`,
      images: ['测试报告/报告图片/0_0NS6iDUrfRCRyrTb.png'],
    },
    {
      id: 'addresses',
      title: 'Address Analysis',
      content: `Detailed examination of address behavior and transaction patterns. The table below shows key addresses and their transaction volumes. Addresses are sorted by activity level and risk score.`,
      images: ['测试报告/报告图片/1_4llawFzZ2MLlSFtDtLgjaA.png'],
    },
    {
      id: 'withdrawals',
      title: 'Withdrawal Pattern Analysis',
      content: `Analysis of withdrawal patterns reveals unusual activity. The following charts show withdrawal frequency and amounts over time, highlighting anomalies that warrant further investigation.`,
      images: ['测试报告/报告图片/0_VhNYzAEmIiNrrseY.png', '测试报告/报告图片/1_LE_3tuVtrxPCduE1HtR1Ow.png'],
    },
    {
      id: 'comparison',
      title: 'Comparative Analysis',
      content: `Comparison with normal transaction patterns helps identify suspicious behavior. The data shows significant deviations from typical user activity patterns.`,
      images: ['测试报告/报告图片/0_f-YsIbLe6ntHWXz-.png', '测试报告/报告图片/0_r1XQAimEb9KG5eVw.png'],
    },
    {
      id: 'destinations',
      title: 'Fund Destination Analysis',
      content: `Tracing the final destinations of funds reveals connections to known exchanges and services. The following addresses show where funds ultimately ended up.`,
      images: ['测试报告/报告图片/1_x60AgnweaYPV5y9FHXjozQ.png', '测试报告/报告图片/1_Fzx06iEyd7rAjZeXXdUkMA.png'],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Blockchain Investigation Report</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generated on {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="text-xs text-slate-500 mb-1 font-medium">Total Addresses</div>
              <div className="text-2xl font-bold text-slate-800">{data.nodes.length}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="text-xs text-slate-500 mb-1 font-medium">Transactions</div>
              <div className="text-2xl font-bold text-slate-800">{data.links.length}</div>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
              <div className="text-xs text-red-600 mb-1 flex items-center gap-1 font-medium">
                <AlertTriangle size={12} />
                High Risk
              </div>
              <div className="text-2xl font-bold text-red-700">{highRiskNodes.length}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1 font-medium">
                <TrendingUp size={12} />
                Volume
              </div>
              <div className="text-2xl font-bold text-slate-800">{totalVolume.toFixed(2)}</div>
            </div>
          </div>

          {/* Target Address */}
          {selectedNode && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Investigation Target</h3>
              <div className="font-mono text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 break-all">
                {selectedNode.id}
              </div>
              {selectedNode.tags && selectedNode.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedNode.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Report Sections */}
          {reportSections.map((section) => (
            <div key={section.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-base font-semibold text-slate-800">{section.title}</h3>
                {expandedSections.has(section.id) ? (
                  <ChevronUp size={20} className="text-slate-400" />
                ) : (
                  <ChevronDown size={20} className="text-slate-400" />
                )}
              </button>
              
              {expandedSections.has(section.id) && (
                <div className="px-5 pb-5 border-t border-slate-100">
                  <div className="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed mt-4">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: section.content
                          .replace(/\n\n/g, '</p><p>')
                          .replace(/\n/g, '<br/>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/^/, '<p>')
                          .replace(/$/, '</p>'),
                      }}
                    />
                  </div>
                  
                  {/* Images */}
                  {section.images && section.images.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {section.images.map((imagePath, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <img
                            src={`/${imagePath}`}
                            alt={`${section.title} - Figure ${idx + 1}`}
                            className="w-full h-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* High Risk Addresses Appendix */}
          {highRiskNodes.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Appendix: High Risk Addresses</h3>
              <div className="space-y-2">
                {highRiskNodes.slice(0, 15).map((node, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded hover:bg-red-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-mono text-xs text-slate-700 mb-1">{node.id}</div>
                      {node.tags && node.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {node.tags.map((tag, tagIdx) => (
                            <span
                              key={tagIdx}
                              className="text-xs text-red-600 bg-red-200 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-xs text-slate-500">Risk</div>
                      <div className="text-lg font-bold text-red-600">{node.riskScore}</div>
                    </div>
                  </div>
                ))}
                {highRiskNodes.length > 15 && (
                  <div className="text-xs text-slate-500 text-center py-2 bg-slate-50 rounded">
                    ... and {highRiskNodes.length - 15} more high risk addresses
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-white">
          <div className="text-xs text-slate-500">
            <div className="font-semibold">ChainTrace Investigation Report</div>
            <div className="mt-0.5">Confidential • For authorized use only</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadText}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium shadow-sm"
            >
              <Download size={16} />
              TXT
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium shadow-sm"
            >
              <Download size={16} />
              PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailView;
