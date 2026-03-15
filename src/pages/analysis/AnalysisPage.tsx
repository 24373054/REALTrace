import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { useI18n } from '../../hooks/useI18n';
import styles from './AnalysisPage.module.css';

type AnalysisTab = 'graph' | 'flow' | 'trend' | 'heatmap' | 'crosschain';

export const AnalysisPage: React.FC = () => {
  const [tab, setTab] = useState<AnalysisTab>('graph');
  const navigate = useNavigate();
  const { t } = useI18n();

  const TAB_LABELS: Record<AnalysisTab, string> = {
    graph: t.analysis.graph,
    flow: t.analysis.flow,
    trend: t.analysis.trend,
    heatmap: t.analysis.heatmap,
    crosschain: t.analysis.crosschain,
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {(['graph', 'flow', 'trend', 'heatmap', 'crosschain'] as AnalysisTab[]).map(tb => (
            <button key={tb} className={`${styles.tab} ${tab === tb ? styles.active : ''}`} onClick={() => setTab(tb)}>
              {TAB_LABELS[tb]}
            </button>
          ))}
        </div>
        {tab === 'graph' && (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/trace')}>
            {t.analysis.openFullGraph}
          </button>
        )}
      </div>

      <div className={styles.canvas}>
        {tab === 'graph' && <GraphTab navigate={navigate} t={t} />}
        {tab === 'flow' && <FlowTab t={t} />}
        {tab === 'trend' && <TrendTab t={t} />}
        {tab === 'heatmap' && <HeatmapTab t={t} />}
        {tab === 'crosschain' && <CrossChainTab t={t} />}
      </div>
    </div>
  );
};

const GraphTab: React.FC<{ navigate: (p: string) => void; t: any }> = ({ navigate, t }) => (
  <div className={styles.graphTabWrap}>
    <div className={styles.graphHint}>
      <div className={styles.hintIcon}>◈</div>
      <div className={styles.hintTitle}>{t.analysis.graphTitle}</div>
      <div className={styles.hintDesc}>
        {t.analysis.graphDesc.split('\n').map((line: string, i: number) => (
          <span key={i}>{line}{i === 0 && <br />}</span>
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/trace')}>
        {t.analysis.enterTrace}
      </button>
    </div>
    <div className={styles.miniPreview}>
      {[
        { x: 50, y: 50, label: 'Target', risk: 'critical', size: 44 },
        { x: 18, y: 22, label: 'Source A', risk: 'high', size: 30 },
        { x: 82, y: 22, label: 'Source B', risk: 'medium', size: 24 },
        { x: 12, y: 72, label: 'Mixer', risk: 'critical', size: 34 },
        { x: 78, y: 72, label: 'Exchange', risk: 'safe', size: 38 },
        { x: 50, y: 88, label: 'Dest C', risk: 'low', size: 22 },
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

const FlowTab: React.FC<{ t: any }> = ({ t }) => {
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
        { name: 'Hacker Address', itemStyle: { color: '#c0392b' } },
        { name: 'Tornado Cash', itemStyle: { color: '#e67e22' } },
        { name: 'Relay #1', itemStyle: { color: '#d4a017' } },
        { name: 'Relay #2', itemStyle: { color: '#d4a017' } },
        { name: 'Relay #3', itemStyle: { color: '#d4a017' } },
        { name: 'Binance', itemStyle: { color: '#27ae60' } },
        { name: 'OKX', itemStyle: { color: '#27ae60' } },
        { name: 'Unknown', itemStyle: { color: '#555568' } },
      ],
      links: [
        { source: 'Hacker Address', target: 'Tornado Cash', value: 4200 },
        { source: 'Tornado Cash', target: 'Relay #1', value: 1800 },
        { source: 'Tornado Cash', target: 'Relay #2', value: 1400 },
        { source: 'Tornado Cash', target: 'Relay #3', value: 1000 },
        { source: 'Relay #1', target: 'Binance', value: 1200 },
        { source: 'Relay #1', target: 'Unknown', value: 600 },
        { source: 'Relay #2', target: 'OKX', value: 900 },
        { source: 'Relay #2', target: 'Unknown', value: 500 },
        { source: 'Relay #3', target: 'Binance', value: 700 },
        { source: 'Relay #3', target: 'Unknown', value: 300 },
      ],
      label: { color: '#8888a0', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
      lineStyle: { color: 'gradient', opacity: 0.4 },
    }],
  };

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartTitle}>{t.analysis.sankeyTitle}</div>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} theme="dark" />
    </div>
  );
};

const TrendTab: React.FC<{ t: any }> = ({ t }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
      data: [t.analysis.txVolume, t.analysis.riskAlerts],
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
        name: t.analysis.txVolume,
        nameTextStyle: { color: '#555568', fontSize: 10 },
        axisLine: { lineStyle: { color: '#2a2a3a' } },
        axisLabel: { color: '#555568', fontSize: 11 },
        splitLine: { lineStyle: { color: '#1c1c26' } },
      },
      {
        type: 'value',
        name: t.analysis.riskAlerts,
        nameTextStyle: { color: '#555568', fontSize: 10 },
        axisLine: { lineStyle: { color: '#2a2a3a' } },
        axisLabel: { color: '#555568', fontSize: 11 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: t.analysis.txVolume,
        type: 'bar',
        data: txVolume,
        itemStyle: { color: '#2980b9', opacity: 0.8 },
        barMaxWidth: 32,
      },
      {
        name: t.analysis.riskAlerts,
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
      <div className={styles.chartTitle}>{t.analysis.trendTitle}</div>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} theme="dark" />
    </div>
  );
};

const HeatmapTab: React.FC<{ t: any }> = ({ t }) => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data: [number, number, number][] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const base = (d < 5 && h >= 8 && h <= 20) ? 40 : 10;
      data.push([h, d, Math.round(base + Math.random() * 60)]);
    }
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      backgroundColor: '#16161e',
      borderColor: '#2a2a3a',
      textStyle: { color: '#e0e0e6', fontSize: 11 },
      formatter: (p: any) => `${days[p.data[1]]} ${hours[p.data[0]]}<br/>Tx Count: <b>${p.data[2]}</b>`,
    },
    grid: { left: 60, right: 20, top: 40, bottom: 60 },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#555568', fontSize: 9, interval: 1 },
      splitArea: { show: true, areaStyle: { color: ['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.02)'] } },
    },
    yAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: '#2a2a3a' } },
      axisLabel: { color: '#555568', fontSize: 10 },
      splitArea: { show: true, areaStyle: { color: ['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.02)'] } },
    },
    visualMap: {
      min: 0, max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 8,
      textStyle: { color: '#555568', fontSize: 10 },
      inRange: { color: ['#0d0d14', '#1a1a2e', '#2980b9', '#c0392b'] },
    },
    series: [{
      type: 'heatmap',
      data,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
    }],
  };

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartTitle}>{t.analysis.heatmapTitle}</div>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} theme="dark" />
    </div>
  );
};

const CrossChainTab: React.FC<{ t: any }> = ({ t }) => {
  const CHAINS = ['ETH', 'BTC', 'TRX', 'SOL', 'BSC', 'ARB'];
  const BRIDGES = ['Wormhole', 'LayerZero', 'Stargate', 'Hop', 'Across'];

  const flowData = [
    { from: 'ETH', to: 'BTC', bridge: 'Wormhole', amount: 1240, risk: 72 },
    { from: 'ETH', to: 'TRX', bridge: 'LayerZero', amount: 890, risk: 88 },
    { from: 'BTC', to: 'ETH', bridge: 'Stargate', amount: 560, risk: 34 },
    { from: 'SOL', to: 'ETH', bridge: 'Wormhole', amount: 320, risk: 45 },
    { from: 'ETH', to: 'BSC', bridge: 'Hop', amount: 2100, risk: 61 },
    { from: 'ARB', to: 'ETH', bridge: 'Across', amount: 780, risk: 22 },
    { from: 'TRX', to: 'BTC', bridge: 'LayerZero', amount: 430, risk: 91 },
  ];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#16161e',
      borderColor: '#2a2a3a',
      textStyle: { color: '#e0e0e6', fontSize: 11 },
      formatter: (p: any) => {
        if (p.dataType === 'edge') {
          return `${p.data.source} → ${p.data.target}<br/>Bridge: ${p.data.bridge}<br/>Amount: $${p.data.value.toLocaleString()}K<br/>Risk: ${p.data.risk}`;
        }
        return p.name;
      },
    },
    series: [{
      type: 'graph',
      layout: 'circular',
      roam: true,
      circular: { rotateLabel: true },
      label: { show: true, color: '#8888a0', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
      lineStyle: { opacity: 0.6, width: 2, curveness: 0.3 },
      edgeLabel: { show: true, fontSize: 9, color: '#555568', formatter: (p: any) => p.data.bridge || '' },
      data: CHAINS.map(c => ({
        name: c,
        symbolSize: 40,
        itemStyle: {
          color: c === 'ETH' ? '#2980b9' : c === 'BTC' ? '#e67e22' : c === 'TRX' ? '#c0392b' : c === 'SOL' ? '#9b59b6' : c === 'BSC' ? '#f1c40f' : '#27ae60',
        },
        label: { color: '#dddde8', fontWeight: 600 },
      })),
      links: flowData.map(f => ({
        source: f.from,
        target: f.to,
        value: f.amount,
        bridge: f.bridge,
        risk: f.risk,
        lineStyle: {
          color: f.risk > 80 ? '#c0392b' : f.risk > 60 ? '#e67e22' : '#2980b9',
          width: Math.max(1, Math.floor(f.amount / 400)),
          opacity: 0.7,
        },
      })),
    }],
  };

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartTitle}>{t.analysis.crosschainTitle}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, height: 'calc(100% - 32px)' }}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} theme="dark" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>
            Cross-Chain Flows
          </div>
          {flowData.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 11 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{f.from} → {f.to}</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>{f.bridge}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>${f.amount.toLocaleString()}K</span>
                <span style={{ fontSize: 10, color: f.risk > 80 ? 'var(--risk-critical)' : f.risk > 60 ? 'var(--risk-high)' : 'var(--risk-safe)' }}>
                  Risk {f.risk}
                </span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', fontSize: 10, color: 'var(--color-text-muted)' }}>
            {BRIDGES.map(b => (
              <div key={b} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>{b}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{flowData.filter(f => f.bridge === b).length} flows</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
