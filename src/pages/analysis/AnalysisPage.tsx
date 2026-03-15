import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import styles from './AnalysisPage.module.css';

type AnalysisTab = 'graph' | 'flow' | 'trend';

export const AnalysisPage: React.FC = () => {
  const [tab, setTab] = useState<AnalysisTab>('graph');
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {(['graph', 'flow', 'trend'] as AnalysisTab[]).map(t => (
            <button key={t} className={`${styles.tab} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>
              {{ graph: '交易图谱', flow: '资金流向', trend: '趋势分析' }[t]}
            </button>
          ))}
        </div>
        {tab === 'graph' && (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/trace')}>
            打开完整图谱 →
          </button>
        )}
      </div>

      <div className={styles.canvas}>
        {tab === 'graph' && <GraphTab navigate={navigate} />}
        {tab === 'flow' && <FlowTab />}
        {tab === 'trend' && <TrendTab />}
      </div>
    </div>
  );
};

// Graph tab - redirect hint + mini preview
const GraphTab: React.FC<{ navigate: (p: string) => void }> = ({ navigate }) => (
  <div className={styles.graphTabWrap}>
    <div className={styles.graphHint}>
      <div className={styles.hintIcon}>◈</div>
      <div className={styles.hintTitle}>交易图谱 · 链路追踪</div>
      <div className={styles.hintDesc}>
        完整的 D3 力导向图、6 大真实案例（Bybit、KuCoin、Monero 等）<br />
        支持节点展开、深度控制、AI 分析、CSV/SVG/PNG/PDF 导出
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/trace')}>
        进入链路追踪 →
      </button>
    </div>
    <div className={styles.miniPreview}>
      {[
        { x: 50, y: 50, label: '目标地址', risk: 'critical', size: 44 },
        { x: 18, y: 22, label: '来源A', risk: 'high', size: 30 },
        { x: 82, y: 22, label: '来源B', risk: 'medium', size: 24 },
        { x: 12, y: 72, label: '混币器', risk: 'critical', size: 34 },
        { x: 78, y: 72, label: '交易所', risk: 'safe', size: 38 },
        { x: 50, y: 88, label: '去向C', risk: 'low', size: 22 },
      ].map((n, i) => (
        <div key={i} className={styles.mockNode} style={{
          left: `${n.x}%`, top: `${n.y}%`,
          width: n.size, height: n.size,
          borderColor: `var(--risk-${n.risk})`,
          color: `var(--risk-${n.risk})`,
          transform: 'translate(-50%,-50%)',
        }}>
          {n.label}
        </div>
      ))}
    </div>
  </div>
);

// Sankey flow chart
const FlowTab: React.FC = () => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: '#16161e',
      borderColor: '#2a2a3a',
      textStyle: { color: '#e0e0e6', fontSize: 12 },
    },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      nodeAlign: 'left',
      data: [
        { name: '黑客地址', itemStyle: { color: '#c0392b' } },
        { name: 'Tornado Cash', itemStyle: { color: '#e67e22' } },
        { name: '中转地址 #1', itemStyle: { color: '#d4a017' } },
        { name: '中转地址 #2', itemStyle: { color: '#d4a017' } },
        { name: '中转地址 #3', itemStyle: { color: '#d4a017' } },
        { name: 'Binance', itemStyle: { color: '#27ae60' } },
        { name: 'OKX', itemStyle: { color: '#27ae60' } },
        { name: '未知地址', itemStyle: { color: '#555568' } },
      ],
      links: [
        { source: '黑客地址', target: 'Tornado Cash', value: 4200 },
        { source: 'Tornado Cash', target: '中转地址 #1', value: 1800 },
        { source: 'Tornado Cash', target: '中转地址 #2', value: 1400 },
        { source: 'Tornado Cash', target: '中转地址 #3', value: 1000 },
        { source: '中转地址 #1', target: 'Binance', value: 1200 },
        { source: '中转地址 #1', target: '未知地址', value: 600 },
        { source: '中转地址 #2', target: 'OKX', value: 900 },
        { source: '中转地址 #2', target: '未知地址', value: 500 },
        { source: '中转地址 #3', target: 'Binance', value: 700 },
        { source: '中转地址 #3', target: '未知地址', value: 300 },
      ],
      label: {
        color: '#8888a0',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace',
      },
      lineStyle: { color: 'gradient', opacity: 0.4 },
    }],
  };

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartTitle}>资金流向桑基图 · Bybit 黑客案例（演示数据）</div>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} theme="dark" />
    </div>
  );
};

// Trend charts
const TrendTab: React.FC = () => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const txVolume = [1200, 1900, 1500, 2800, 2200, 3100, 2700, 3800, 3200, 4100, 3600, 4800];
  const riskCount = [12, 18, 14, 31, 24, 38, 29, 45, 37, 52, 41, 58];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#16161e',
      borderColor: '#2a2a3a',
      textStyle: { color: '#e0e0e6', fontSize: 12 },
    },
    legend: {
      data: ['交易量', '风险预警'],
      textStyle: { color: '#8888a0', fontSize: 11 },
      top: 8,
    },
    grid: { left: 60, right: 20, top: 48, bottom: 40 },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#555568', fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: '交易量',
        nameTextStyle: { color: '#555568', fontSize: 10 },
        axisLine: { lineStyle: { color: '#2a2a3a' } },
        axisLabel: { color: '#555568', fontSize: 11 },
        splitLine: { lineStyle: { color: '#1c1c26' } },
      },
      {
        type: 'value',
        name: '预警数',
        nameTextStyle: { color: '#555568', fontSize: 10 },
        axisLine: { lineStyle: { color: '#2a2a3a' } },
        axisLabel: { color: '#555568', fontSize: 11 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '交易量',
        type: 'bar',
        data: txVolume,
        itemStyle: { color: '#2980b9', opacity: 0.8 },
        barMaxWidth: 32,
      },
      {
        name: '风险预警',
        type: 'line',
        yAxisIndex: 1,
        data: riskCount,
        lineStyle: { color: '#c0392b', width: 2 },
        itemStyle: { color: '#c0392b' },
        symbol: 'circle',
        symbolSize: 5,
        smooth: false,
      },
    ],
  };

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartTitle}>交易量 & 风险预警趋势 · 2025年（演示数据）</div>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} theme="dark" />
    </div>
  );
};
