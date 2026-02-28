# ChainTrace API 接口文档 v1.0

## 1. 接口概述

### 1.1 基本信息

- **Base URL**: `https://api.realtrace.com`
- **API Version**: v1
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 认证方式

#### API Key 认证
```http
GET /api/v1/address/ETH/0x123...
Authorization: Bearer YOUR_API_KEY
```

#### JWT Token 认证
```http
POST /api/v1/analysis/path
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### 1.3 通用响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 业务数据
  },
  "timestamp": 1709107200
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "Invalid address format",
  "error": {
    "type": "ValidationError",
    "details": "Address must start with 0x"
  },
  "timestamp": 1709107200
}
```

### 1.4 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 503 | 服务暂时不可用 |

## 2. 地址相关接口

### 2.1 查询地址信息

**接口**: `GET /api/v1/address/{chain}/{address}`

**描述**: 查询指定链上地址的基本信息

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| chain | string | 是 | 链类型（BTC/ETH/TRX/SOL等） |
| address | string | 是 | 地址 |

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "chain": "ETH",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "balance": "1234.567890123456789",
    "tx_count": 1523,
    "first_seen": "2020-01-15T08:30:00Z",
    "last_seen": "2026-02-28T10:00:00Z",
    "risk_score": 35,
    "risk_level": "low",
    "labels": [
      {
        "type": "entity",
        "value": "Exchange",
        "confidence": 0.95
      }
    ],
    "entity": {
      "id": 12345,
      "name": "Binance",
      "type": "exchange"
    }
  }
}
```

### 2.2 查询地址交易列表

**接口**: `GET /api/v1/address/{chain}/{address}/transactions`

**描述**: 查询地址的交易历史

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| chain | string | 是 | 链类型 |
| address | string | 是 | 地址 |
| page | integer | 否 | 页码，默认1 |
| page_size | integer | 否 | 每页数量，默认20，最大100 |
| start_time | integer | 否 | 开始时间戳 |
| end_time | integer | 否 | 结束时间戳 |
| direction | string | 否 | 方向：in/out/all，默认all |

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "total": 1523,
    "page": 1,
    "page_size": 20,
    "transactions": [
      {
        "tx_hash": "0xabc123...",
        "block_number": 12345678,
        "timestamp": "2026-02-28T10:00:00Z",
        "from": "0x123...",
        "to": "0x456...",
        "value": "10.5",
        "fee": "0.002",
        "status": "success",
        "type": "transfer"
      }
    ]
  }
}
```

### 2.3 查询地址风险评分

**接口**: `GET /api/v1/address/{chain}/{address}/risk`

**描述**: 获取地址的详细风险评分

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "total_score": 35.5,
    "risk_level": "low",
    "dimensions": {
      "transaction": {
        "score": 25,
        "factors": {
          "high_frequency": 0,
          "unusual_amount": 10,
          "rapid_movement": 0,
          "circular_flow": 0,
          "mixer_usage": 15
        }
      },
      "relationship": {
        "score": 40,
        "factors": {
          "blacklist_connection": 15,
          "high_risk_interaction": 10,
          "sanctioned_entity": 0,
          "scam_connection": 15
        }
      },
      "attribute": {
        "score": 20,
        "factors": {
          "age": 5,
          "balance": 10,
          "diversity": 5
        }
      },
      "intelligence": {
        "score": 60,
        "factors": {
          "reported_scam": 30,
          "sanction_list": 0,
          "known_entity": 30
        }
      }
    },
    "updated_at": "2026-02-28T10:00:00Z"
  }
}
```

## 3. 交易相关接口

### 3.1 查询交易详情

**接口**: `GET /api/v1/transaction/{chain}/{tx_hash}`

**描述**: 查询交易的详细信息

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "chain": "ETH",
    "tx_hash": "0xabc123...",
    "block_number": 12345678,
    "block_time": "2026-02-28T10:00:00Z",
    "from": "0x123...",
    "to": "0x456...",
    "value": "10.5",
    "fee": "0.002",
    "gas_price": "50",
    "gas_used": 21000,
    "status": "success",
    "type": "transfer",
    "token_transfers": [
      {
        "token_address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "token_symbol": "USDT",
        "from": "0x123...",
        "to": "0x456...",
        "value": "1000.0"
      }
    ],
    "risk_flags": [
      {
        "type": "high_value",
        "description": "Transaction value exceeds threshold"
      }
    ]
  }
}
```

## 4. 分析相关接口

### 4.1 资金流向分析

**接口**: `POST /api/v1/analysis/path`

**描述**: 分析两个地址之间的资金流向路径

**请求体**:
```json
{
  "chain": "ETH",
  "from_address": "0x123...",
  "to_address": "0x456...",
  "max_depth": 5,
  "min_amount": "1.0",
  "start_time": 1640995200,
  "end_time": 1709107200,
  "algorithm": "bfs"
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "from": "0x123...",
    "to": "0x456...",
    "total_paths": 15,
    "shortest_path": {
      "length": 3,
      "nodes": ["0x123...", "0xaaa...", "0xbbb...", "0x456..."],
      "edges": [
        {
          "from": "0x123...",
          "to": "0xaaa...",
          "tx_hash": "0xtx1...",
          "amount": "100.0",
          "timestamp": "2026-01-15T10:00:00Z"
        }
      ],
      "total_amount": "95.5",
      "risk_score": 45
    },
    "all_paths": [
      // 所有路径列表
    ],
    "key_nodes": [
      {
        "address": "0xaaa...",
        "role": "intermediary",
        "centrality": 0.85
      }
    ]
  }
}
```

### 4.2 地址关联分析

**接口**: `POST /api/v1/analysis/related`

**描述**: 分析地址的关联地址

**请求体**:
```json
{
  "chain": "ETH",
  "address": "0x123...",
  "depth": 2,
  "min_tx_count": 3,
  "include_labels": true
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "address": "0x123...",
    "related_addresses": [
      {
        "address": "0x456...",
        "relation_type": "frequent_interaction",
        "tx_count": 25,
        "total_amount": "1500.5",
        "confidence": 0.92,
        "labels": ["Exchange"],
        "risk_score": 20
      }
    ],
    "clusters": [
      {
        "cluster_id": "cluster_001",
        "addresses": ["0x123...", "0x789...", "0xabc..."],
        "confidence": 0.88,
        "reason": "Common input heuristic"
      }
    ]
  }
}
```

### 4.3 混币器检测

**接口**: `POST /api/v1/analysis/mixer`

**描述**: 检测地址是否使用混币器

**请求体**:
```json
{
  "chain": "ETH",
  "address": "0x123...",
  "lookback_days": 30
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "address": "0x123...",
    "mixer_detected": true,
    "mixer_type": "tornado_cash",
    "confidence": 0.95,
    "transactions": [
      {
        "tx_hash": "0xabc...",
        "mixer_contract": "0x_tornado_cash...",
        "amount": "1.0",
        "timestamp": "2026-02-15T10:00:00Z",
        "type": "deposit"
      }
    ],
    "penetration_analysis": {
      "possible_matches": [
        {
          "withdrawal_tx": "0xdef...",
          "withdrawal_address": "0x789...",
          "probability": 0.75,
          "evidence": [
            "Time interval matches pattern",
            "Gas price similarity: 0.92"
          ]
        }
      ]
    }
  }
}
```

## 5. 报告相关接口

### 5.1 创建分析报告

**接口**: `POST /api/v1/reports`

**描述**: 创建地址分析报告

**请求体**:
```json
{
  "report_type": "address_analysis",
  "title": "Address 0x123... Analysis Report",
  "params": {
    "chain": "ETH",
    "address": "0x123...",
    "depth": 3,
    "include_graph": true
  },
  "format": "pdf"
}
```

**响应示例**:
```json
{
  "code": 201,
  "data": {
    "report_id": "rpt_abc123",
    "status": "processing",
    "estimated_time": 30
  }
}
```

### 5.2 查询报告状态

**接口**: `GET /api/v1/reports/{report_id}`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "report_id": "rpt_abc123",
    "status": "completed",
    "title": "Address 0x123... Analysis Report",
    "format": "pdf",
    "file_url": "https://cdn.realtrace.com/reports/rpt_abc123.pdf",
    "file_size": 2048576,
    "created_at": "2026-02-28T10:00:00Z",
    "completed_at": "2026-02-28T10:00:35Z"
  }
}
```

## 6. 监控相关接口

### 6.1 创建监控任务

**接口**: `POST /api/v1/monitors`

**请求体**:
```json
{
  "monitor_name": "High Value Transfer Alert",
  "monitor_type": "transaction",
  "target_type": "address",
  "target_value": "0x123...",
  "conditions": [
    {
      "type": "amount",
      "operator": ">",
      "value": "100000"
    }
  ],
  "alert_channels": ["email", "webhook"],
  "webhook_url": "https://your-domain.com/webhook"
}
```

**响应示例**:
```json
{
  "code": 201,
  "data": {
    "monitor_id": "mon_abc123",
    "status": "active",
    "created_at": "2026-02-28T10:00:00Z"
  }
}
```

### 6.2 查询告警列表

**接口**: `GET /api/v1/alerts`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态：new/acknowledged/resolved |
| level | string | 否 | 级别：info/warning/critical |
| page | integer | 否 | 页码 |
| page_size | integer | 否 | 每页数量 |

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "total": 50,
    "alerts": [
      {
        "alert_id": "alt_abc123",
        "monitor_id": "mon_abc123",
        "level": "warning",
        "title": "High Value Transfer Detected",
        "message": "Address 0x123... transferred 150000 USDT",
        "data": {
          "tx_hash": "0xdef...",
          "amount": "150000",
          "to_address": "0x456..."
        },
        "status": "new",
        "created_at": "2026-02-28T10:00:00Z"
      }
    ]
  }
}
```

## 7. 标签相关接口

### 7.1 查询地址标签

**接口**: `GET /api/v1/labels/{chain}/{address}`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "address": "0x123...",
    "labels": [
      {
        "label_id": 12345,
        "category": "entity",
        "type": "exchange",
        "value": "Binance",
        "confidence": 0.95,
        "source": "official",
        "verified": true,
        "created_at": "2020-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 7.2 提交地址标签

**接口**: `POST /api/v1/labels`

**请求体**:
```json
{
  "chain": "ETH",
  "address": "0x123...",
  "label_category": "entity",
  "label_type": "exchange",
  "label_value": "Binance",
  "evidence": "Official announcement",
  "source_url": "https://..."
}
```

## 8. 限流说明

### 8.1 限流规则

| 用户类型 | 每秒请求 | 每日请求 |
|----------|----------|----------|
| 免费用户 | 1 | 100 |
| 基础会员 | 5 | 1000 |
| 专业会员 | 20 | 10000 |
| 企业客户 | 100 | 无限制 |

### 8.2 限流响应头

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709107260
```

### 8.3 超限响应

```json
{
  "code": 429,
  "message": "Rate limit exceeded",
  "error": {
    "type": "RateLimitError",
    "retry_after": 60
  }
}
```

## 9. Webhook 回调

### 9.1 告警回调

**URL**: 用户配置的 webhook_url

**Method**: POST

**请求体**:
```json
{
  "event_type": "alert",
  "alert_id": "alt_abc123",
  "monitor_id": "mon_abc123",
  "level": "warning",
  "title": "High Value Transfer Detected",
  "message": "Address 0x123... transferred 150000 USDT",
  "data": {
    "chain": "ETH",
    "tx_hash": "0xdef...",
    "from": "0x123...",
    "to": "0x456...",
    "amount": "150000",
    "token": "USDT"
  },
  "timestamp": 1709107200
}
```

### 9.2 签名验证

请求头包含签名：
```http
X-Signature: sha256=abc123...
```

验证方法：
```python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

---

**文档版本**：v1.0  
**创建日期**：2026-02-28  
**维护团队**：ChainTrace API 团队
