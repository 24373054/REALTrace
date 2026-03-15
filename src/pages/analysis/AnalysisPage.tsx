import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { useI18n } from '../../hooks/useI18n';
import styles from './AnalysisPage.module.css';

type AnalysisTab = 'graph' | 'flow' | 'trend';

export const AnalysisPage: React.FC = () => {
  const [tab, setTab] = useState<AnalysisTab>('graph');
  const navigate = useNavigate();
  const { t } = useI18n();

  const TAB_LABELS: Record<AnalysisTab, string> = {
    graph: t.analysis.graph,
    flow: t.analysis.flow,
    trend: t.analysis.trend,
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {(['graph', 'flow', 'trend'] as AnalysisTab[]).map(tb => (
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
