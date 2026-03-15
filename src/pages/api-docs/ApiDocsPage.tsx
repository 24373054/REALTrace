import React, { useState } from 'react';
import { useUserStore } from '../../stores/user';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import { CopyButton } from '../../components/common/CopyButton';
import { UpgradePrompt } from '../../components/common/UpgradePrompt';
import { UsageBar } from '../../components/common/UsageBar';
import styles from './ApiDocsPage.module.css';

const MOCK_API_KEY = 'ct_live_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
const MOCK_USAGE = { used: 234, total: 1000 };

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/address/{chain}/{address}',
    desc_zh: '查询地址详情、风险评分、余额、标签',
    desc_en: 'Get address details, risk score, balance, labels',
    params: [
      { name: 'chain', type: 'string', required: true, desc: 'BTC / ETH / TRX / SOL' },
      { name: 'address', type: 'string', required: true, desc: 'Blockchain address' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/transaction/{chain}/{hash}',
    desc_zh: '查询交易详情、风险标记、资金路径',
    desc_en: 'Get transaction details, risk flags, fund path',
    params: [
      { name: 'chain', type: 'string', required: true, desc: 'BTC / ETH / TRX / SOL' },
      { name: 'hash', type: 'string', required: true, desc: 'Transaction hash' },
    ],
  },
  {
    method: 'POST',
    path: '/api/v1/address/{chain}/{address}/flow',
    desc_zh: '获取地址资金流向图（节点+边）',
    desc_en: 'Get fund flow graph (nodes + edges)',
    params: [
      { name: 'direction', type: 'string', required: false, desc: 'in / out / both (default: both)' },
      { name: 'depth', type: 'number', required: false, desc: 'Trace depth 1-10 (default: 3)' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/risk/score/{chain}/{address}',
    desc_zh: '获取地址风险评分及风险因素详情',
    desc_en: 'Get risk score and factor breakdown',
    params: [
      { name: 'chain', type: 'string', required: true, desc: 'BTC / ETH / TRX / SOL' },
      { name: 'address', type: 'string', required: true, desc: 'Blockchain address' },
    ],
  },
  {
    method: 'POST',
    path: '/api/v1/monitor',
    desc_zh: '创建地址监控规则',
    desc_en: 'Create address monitor rule',
    params: [
      { name: 'address', type: 'string', required: true, desc: 'Address to monitor' },
      { name: 'chain', type: 'string', required: true, desc: 'Chain' },
      { name: 'type', type: 'string', required: true, desc: 'transaction / balance / risk' },
      { name: 'threshold', type: 'number', required: false, desc: 'Alert threshold value' },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'var(--color-success)',
  POST: 'var(--color-warning)',
  DELETE: 'var(--risk-critical)',
  PUT: '#2980b9',
};

export const ApiDocsPage: React.FC = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [activeEndpoint, setActiveEndpoint] = useState(0);
  const [keyVisible, setKeyVisible] = useState(false);

  if (!user || user.role === 'free') {
    return (
      <div className={styles.page}>
        <UpgradePrompt feature={locale === 'zh' ? 'API 访问' : 'API Access'} requiredPlan="Basic" />
      </div>
    );
  }

  const maskedKey = keyVisible ? MOCK_API_KEY : MOCK_API_KEY.slice(0, 12) + '••••••••••••••••••••••••';
  const ep = ENDPOINTS[activeEndpoint];

  const exampleResponse = JSON.stringify({
    code: 0,
    message: 'success',
    data: {
      address: '0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2',
      chain: 'ETH',
      riskScore: 94,
      riskLevel: 'critical',
      balance: '1247.83',
      balanceUSD: '4891234.50',
      tags: ['Mixer', 'OFAC Sanctioned'],
    },
  }, null, 2);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{locale === 'zh' ? 'API 文档' : 'API Documentation'}</div>
        <div className={styles.headerSub}>{locale === 'zh' ? `Base URL: https://api.chaintrace.io` : `Base URL: https://api.chaintrace.io`}</div>
      </div>

      {/* API Key section */}
      <div className={styles.keySection}>
        <div className={styles.keySectionTitle}>{locale === 'zh' ? 'API 密钥' : 'API Key'}</div>
        <div className={styles.keyRow}>
          <span className={`${styles.keyValue} mono`}>{maskedKey}</span>
          <button className={styles.keyToggle} onClick={() => setKeyVisible(!keyVisible)}>
            {keyVisible ? (locale === 'zh' ? '隐藏' : 'Hide') : (locale === 'zh' ? '显示' : 'Show')}
          </button>
          <CopyButton text={MOCK_API_KEY} />
          <button className="btn btn-sm">{locale === 'zh' ? '重新生成' : 'Regenerate'}</button>
        </div>
        <div className={styles.keyUsage}>
          <UsageBar
            label={locale === 'zh' ? `本月 API 调用 (${user.role === 'basic' ? '1,000' : '10,000'}/月)` : `Monthly API Calls (${user.role === 'basic' ? '1,000' : '10,000'}/mo)`}
            used={MOCK_USAGE.used}
            total={MOCK_USAGE.total}
            unit=" "
          />
        </div>
        <div className={styles.authNote}>
          <span className={styles.authNoteLabel}>{locale === 'zh' ? '认证方式' : 'Authentication'}:</span>
          <code className={styles.authCode}>Authorization: Bearer {'<YOUR_API_KEY>'}</code>
        </div>
      </div>

      {/* Endpoints */}
      <div className={styles.docsLayout}>
        <div className={styles.endpointList}>
          <div className={styles.endpointListTitle}>{locale === 'zh' ? '接口列表' : 'Endpoints'}</div>
          {ENDPOINTS.map((e, i) => (
            <button
              key={i}
              className={`${styles.endpointItem} ${activeEndpoint === i ? styles.endpointActive : ''}`}
              onClick={() => setActiveEndpoint(i)}
            >
              <span className={styles.methodBadge} style={{ color: METHOD_COLORS[e.method] }}>{e.method}</span>
              <span className={`${styles.endpointPath} mono`}>{e.path.replace('/api/v1', '')}</span>
            </button>
          ))}
        </div>

        <div className={styles.endpointDetail}>
          <div className={styles.endpointHeader}>
            <span className={styles.methodBadgeLg} style={{ color: METHOD_COLORS[ep.method] }}>{ep.method}</span>
            <span className={`${styles.endpointPathLg} mono`}>{ep.path}</span>
          </div>
          <div className={styles.endpointDesc}>{locale === 'zh' ? ep.desc_zh : ep.desc_en}</div>

          <div className={styles.paramsSection}>
            <div className={styles.paramsSectionTitle}>{locale === 'zh' ? '参数' : 'Parameters'}</div>
            <div className={styles.paramsTable}>
              <div className={styles.paramsHeader}>
                <span>{locale === 'zh' ? '参数名' : 'Name'}</span>
                <span>{locale === 'zh' ? '类型' : 'Type'}</span>
                <span>{locale === 'zh' ? '必填' : 'Required'}</span>
                <span>{locale === 'zh' ? '说明' : 'Description'}</span>
              </div>
              {ep.params.map((p, i) => (
                <div key={i} className={styles.paramsRow}>
                  <span className={`${styles.paramName} mono`}>{p.name}</span>
                  <span className={styles.paramType}>{p.type}</span>
                  <span className={styles.paramRequired} style={{ color: p.required ? 'var(--risk-critical)' : 'var(--color-text-muted)' }}>
                    {p.required ? (locale === 'zh' ? '是' : 'Yes') : (locale === 'zh' ? '否' : 'No')}
                  </span>
                  <span className={styles.paramDesc}>{p.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.responseSection}>
            <div className={styles.responseSectionTitle}>{locale === 'zh' ? '响应示例' : 'Response Example'}</div>
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span>JSON</span>
                <CopyButton text={exampleResponse} />
              </div>
              <pre className={styles.code}>{exampleResponse}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
