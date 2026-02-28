# ChainTrace 数据库设计文档 v1.0

## 1. 数据库架构概述

### 1.1 数据库选型

```
数据存储架构
├── PostgreSQL（业务数据）
│   ├── 用户数据
│   ├── 订单数据
│   ├── 配置数据
│   └── 审计日志
├── Neo4j（图数据）
│   ├── 地址关系
│   ├── 交易网络
│   └── 实体关系
├── ClickHouse（分析数据）
│   ├── 交易明细
│   ├── 统计数据
│   └── 日志数据
├── Redis（缓存）
│   ├── 热点数据
│   ├── 会话数据
│   └── 限流计数
└── Elasticsearch（搜索）
    ├── 地址搜索
    ├── 交易搜索
    └── 全文检索
```

### 1.2 数据分层

```
数据层次
├── ODS层（原始数据层）
│   └── 链上原始数据
├── DWD层（明细数据层）
│   └── 清洗后的交易明细
├── DWS层（汇总数据层）
│   └── 统计汇总数据
└── ADS层（应用数据层）
    └── 面向业务的数据
```

## 2. PostgreSQL 数据库设计

### 2.1 用户相关表

#### users - 用户表
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(32) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(100),
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### user_profiles - 用户资料表
```sql
CREATE TABLE user_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id),
    avatar_url VARCHAR(500),
    company VARCHAR(100),
    position VARCHAR(50),
    industry VARCHAR(50),
    country VARCHAR(50),
    city VARCHAR(50),
    bio TEXT,
    website VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### subscriptions - 订阅表
```sql
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    plan_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method VARCHAR(50),
    amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
```

### 2.2 区块链数据表

#### chains - 链信息表
```sql
CREATE TABLE chains (
    id SERIAL PRIMARY KEY,
    chain_code VARCHAR(20) UNIQUE NOT NULL,
    chain_name VARCHAR(50) NOT NULL,
    chain_type VARCHAR(20) NOT NULL,
    native_token VARCHAR(20),
    explorer_url VARCHAR(200),
    rpc_url VARCHAR(200),
    status VARCHAR(20) DEFAULT 'active',
    sync_status VARCHAR(20),
    last_block_number BIGINT,
    last_sync_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### addresses - 地址表
```sql
CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL REFERENCES chains(id),
    address VARCHAR(100) NOT NULL,
    address_type VARCHAR(50),
    balance DECIMAL(36, 18) DEFAULT 0,
    tx_count INTEGER DEFAULT 0,
    first_tx_time TIMESTAMP,
    last_tx_time TIMESTAMP,
    risk_score INTEGER DEFAULT 0,
    risk_level VARCHAR(20),
    entity_id BIGINT,
    is_contract BOOLEAN DEFAULT FALSE,
    contract_creator VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chain_id, address)
);

CREATE INDEX idx_addresses_chain_address ON addresses(chain_id, address);
CREATE INDEX idx_addresses_risk_score ON addresses(risk_score DESC);
CREATE INDEX idx_addresses_entity_id ON addresses(entity_id);
CREATE INDEX idx_addresses_last_tx_time ON addresses(last_tx_time DESC);
```

#### transactions - 交易表（分区表）
```sql
CREATE TABLE transactions (
    id BIGSERIAL,
    chain_id INTEGER NOT NULL REFERENCES chains(id),
    tx_hash VARCHAR(100) NOT NULL,
    block_number BIGINT NOT NULL,
    block_time TIMESTAMP NOT NULL,
    from_address VARCHAR(100) NOT NULL,
    to_address VARCHAR(100),
    value DECIMAL(36, 18),
    fee DECIMAL(36, 18),
    gas_price DECIMAL(36, 18),
    gas_used INTEGER,
    nonce INTEGER,
    status VARCHAR(20) NOT NULL,
    tx_type VARCHAR(50),
    input_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, block_time)
) PARTITION BY RANGE (block_time);

-- 创建分区（按月）
CREATE TABLE transactions_2026_01 PARTITION OF transactions
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE transactions_2026_02 PARTITION OF transactions
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE INDEX idx_transactions_hash ON transactions(chain_id, tx_hash);
CREATE INDEX idx_transactions_from ON transactions(from_address, block_time DESC);
CREATE INDEX idx_transactions_to ON transactions(to_address, block_time DESC);
CREATE INDEX idx_transactions_block ON transactions(chain_id, block_number);
```

#### token_transfers - 代币转账表
```sql
CREATE TABLE token_transfers (
    id BIGSERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL REFERENCES chains(id),
    tx_hash VARCHAR(100) NOT NULL,
    block_number BIGINT NOT NULL,
    block_time TIMESTAMP NOT NULL,
    token_address VARCHAR(100) NOT NULL,
    from_address VARCHAR(100) NOT NULL,
    to_address VARCHAR(100) NOT NULL,
    value DECIMAL(36, 18) NOT NULL,
    token_symbol VARCHAR(20),
    token_decimals INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_token_transfers_tx ON token_transfers(chain_id, tx_hash);
CREATE INDEX idx_token_transfers_from ON token_transfers(from_address, block_time DESC);
CREATE INDEX idx_token_transfers_to ON token_transfers(to_address, block_time DESC);
CREATE INDEX idx_token_transfers_token ON token_transfers(token_address);
```

### 2.3 标签与实体表

#### labels - 标签表
```sql
CREATE TABLE labels (
    id BIGSERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL REFERENCES chains(id),
    address VARCHAR(100) NOT NULL,
    label_category VARCHAR(50) NOT NULL,
    label_type VARCHAR(50) NOT NULL,
    label_value VARCHAR(200) NOT NULL,
    confidence DECIMAL(5, 2) DEFAULT 100.00,
    source VARCHAR(50) NOT NULL,
    source_url VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    verified_by BIGINT REFERENCES users(id),
    verified_at TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_labels_address ON labels(chain_id, address);
CREATE INDEX idx_labels_category ON labels(label_category);
CREATE INDEX idx_labels_type ON labels(label_type);
```

#### entities - 实体表
```sql
CREATE TABLE entities (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(200) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    description TEXT,
    website VARCHAR(200),
    country VARCHAR(50),
    risk_level VARCHAR(20),
    verified BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_name ON entities(entity_name);
```

#### entity_addresses - 实体地址关联表
```sql
CREATE TABLE entity_addresses (
    id BIGSERIAL PRIMARY KEY,
    entity_id BIGINT NOT NULL REFERENCES entities(id),
    chain_id INTEGER NOT NULL REFERENCES chains(id),
    address VARCHAR(100) NOT NULL,
    confidence DECIMAL(5, 2) DEFAULT 100.00,
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_id, chain_id, address)
);

CREATE INDEX idx_entity_addresses_entity ON entity_addresses(entity_id);
CREATE INDEX idx_entity_addresses_address ON entity_addresses(chain_id, address);
```

### 2.4 分析与报告表

#### analysis_tasks - 分析任务表
```sql
CREATE TABLE analysis_tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    task_type VARCHAR(50) NOT NULL,
    task_name VARCHAR(200),
    params JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_tasks_user ON analysis_tasks(user_id, created_at DESC);
CREATE INDEX idx_analysis_tasks_status ON analysis_tasks(status);
```

#### reports - 报告表
```sql
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    task_id BIGINT REFERENCES analysis_tasks(id),
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    content JSONB,
    file_url VARCHAR(500),
    file_size BIGINT,
    format VARCHAR(20),
    is_public BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_user ON reports(user_id, created_at DESC);
CREATE INDEX idx_reports_task ON reports(task_id);
CREATE INDEX idx_reports_public ON reports(is_public, created_at DESC);
```

### 2.5 风控与监控表

#### risk_events - 风险事件表
```sql
CREATE TABLE risk_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    event_level VARCHAR(20) NOT NULL,
    chain_id INTEGER NOT NULL REFERENCES chains(id),
    address VARCHAR(100),
    tx_hash VARCHAR(100),
    risk_score INTEGER,
    description TEXT,
    details JSONB,
    status VARCHAR(20) DEFAULT 'new',
    handled_by BIGINT REFERENCES users(id),
    handled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risk_events_type ON risk_events(event_type, created_at DESC);
CREATE INDEX idx_risk_events_level ON risk_events(event_level, created_at DESC);
CREATE INDEX idx_risk_events_address ON risk_events(chain_id, address);
CREATE INDEX idx_risk_events_status ON risk_events(status);
```

#### monitors - 监控配置表
```sql
CREATE TABLE monitors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    monitor_name VARCHAR(200) NOT NULL,
    monitor_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_value VARCHAR(200) NOT NULL,
    conditions JSONB NOT NULL,
    alert_channels JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    last_check_time TIMESTAMP,
    last_alert_time TIMESTAMP,
    alert_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monitors_user ON monitors(user_id);
CREATE INDEX idx_monitors_status ON monitors(status);
CREATE INDEX idx_monitors_target ON monitors(target_type, target_value);
```

#### alerts - 告警记录表
```sql
CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    monitor_id BIGINT NOT NULL REFERENCES monitors(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    alert_level VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    status VARCHAR(20) DEFAULT 'new',
    acknowledged_by BIGINT REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    resolved_by BIGINT REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_monitor ON alerts(monitor_id, created_at DESC);
CREATE INDEX idx_alerts_user ON alerts(user_id, status, created_at DESC);
CREATE INDEX idx_alerts_status ON alerts(status, created_at DESC);
```

### 2.6 系统管理表

#### api_keys - API密钥表
```sql
CREATE TABLE api_keys (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    api_secret VARCHAR(64) NOT NULL,
    permissions JSONB,
    rate_limit INTEGER,
    ip_whitelist TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_key ON api_keys(api_key);
CREATE INDEX idx_api_keys_status ON api_keys(status);
```

#### audit_logs - 审计日志表
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path VARCHAR(500),
    request_params JSONB,
    response_status INTEGER,
    duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

## 3. Neo4j 图数据库设计

### 3.1 节点类型

#### Address 节点
```cypher
(:Address {
    chain: String,
    address: String,
    balance: Float,
    tx_count: Integer,
    risk_score: Integer,
    risk_level: String,
    entity_id: Integer,
    labels: [String],
    first_seen: DateTime,
    last_seen: DateTime,
    created_at: DateTime
})

// 索引
CREATE INDEX address_chain_addr FOR (a:Address) ON (a.chain, a.address);
CREATE INDEX address_risk FOR (a:Address) ON (a.risk_score);
```

#### Entity 节点
```cypher
(:Entity {
    entity_id: Integer,
    entity_name: String,
    entity_type: String,
    risk_level: String,
    verified: Boolean,
    created_at: DateTime
})

CREATE INDEX entity_id FOR (e:Entity) ON (e.entity_id);
CREATE INDEX entity_type FOR (e:Entity) ON (e.entity_type);
```

#### Transaction 节点
```cypher
(:Transaction {
    chain: String,
    tx_hash: String,
    block_number: Integer,
    timestamp: DateTime,
    value: Float,
    fee: Float,
    tx_type: String,
    status: String
})

CREATE INDEX tx_hash FOR (t:Transaction) ON (t.chain, t.tx_hash);
CREATE INDEX tx_timestamp FOR (t:Transaction) ON (t.timestamp);
```

### 3.2 关系类型

#### TRANSFER 关系（转账）
```cypher
(:Address)-[:TRANSFER {
    tx_hash: String,
    amount: Float,
    token: String,
    timestamp: DateTime,
    block_number: Integer
}]->(:Address)
```

#### BELONGS_TO 关系（归属）
```cypher
(:Address)-[:BELONGS_TO {
    confidence: Float,
    source: String,
    created_at: DateTime
}]->(:Entity)
```

#### RELATED_TO 关系（关联）
```cypher
(:Address)-[:RELATED_TO {
    relation_type: String,
    confidence: Float,
    reason: String,
    created_at: DateTime
}]->(:Address)
```

### 3.3 常用查询

#### 查询地址的所有转账关系
```cypher
MATCH (a:Address {chain: 'ETH', address: '0x123...'})-[r:TRANSFER]->(b:Address)
WHERE r.timestamp > datetime('2026-01-01')
RETURN a, r, b
ORDER BY r.timestamp DESC
LIMIT 100;
```

#### 查询资金流向路径
```cypher
MATCH path = (start:Address {address: '0x123...'})-[:TRANSFER*1..5]->(end:Address {address: '0x456...'})
WHERE ALL(r IN relationships(path) WHERE r.amount > 1000)
RETURN path
ORDER BY length(path)
LIMIT 10;
```

#### 查询实体的所有地址
```cypher
MATCH (e:Entity {entity_id: 123})<-[:BELONGS_TO]-(a:Address)
RETURN e, a;
```

## 4. ClickHouse 数据库设计

### 4.1 交易明细表
```sql
CREATE TABLE transaction_details (
    date Date,
    timestamp DateTime,
    chain String,
    tx_hash String,
    block_number UInt64,
    from_address String,
    to_address String,
    value Decimal(36, 18),
    fee Decimal(36, 18),
    tx_type String,
    status String,
    token_address String,
    token_symbol String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (chain, timestamp, tx_hash)
SETTINGS index_granularity = 8192;
```

### 4.2 地址统计表
```sql
CREATE TABLE address_statistics (
    date Date,
    chain String,
    address String,
    tx_count UInt32,
    in_count UInt32,
    out_count UInt32,
    in_amount Decimal(36, 18),
    out_amount Decimal(36, 18),
    balance Decimal(36, 18),
    unique_counterparties UInt32,
    risk_score UInt8
) ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (chain, address, date)
SETTINGS index_granularity = 8192;
```

### 4.3 风险事件表
```sql
CREATE TABLE risk_events_log (
    timestamp DateTime,
    event_type String,
    event_level String,
    chain String,
    address String,
    tx_hash String,
    risk_score UInt8,
    description String,
    details String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (event_type, timestamp)
SETTINGS index_granularity = 8192;
```

## 5. Redis 缓存设计

### 5.1 缓存键设计

```
缓存键命名规范：{业务模块}:{数据类型}:{标识}

示例：
- address:info:ETH:0x123...        # 地址信息
- tx:detail:ETH:0xabc...           # 交易详情
- user:session:token123            # 用户会话
- risk:score:ETH:0x456...          # 风险评分
- path:result:0x123:0x456:5        # 路径查询结果
- ratelimit:user:12345             # 用户限流
- ratelimit:ip:192.168.1.1         # IP限流
```

### 5.2 数据结构

#### String 类型
```redis
# 地址信息
SET address:info:ETH:0x123... '{"balance":"100","tx_count":50}' EX 3600

# 风险评分
SET risk:score:ETH:0x123... '85' EX 1800
```

#### Hash 类型
```redis
# 用户会话
HSET user:session:token123 user_id 12345 username "alice" role "pro"
EXPIRE user:session:token123 604800
```

#### List 类型
```redis
# 最近交易
LPUSH address:recent_tx:ETH:0x123... '{"tx_hash":"0xabc...","amount":"10"}'
LTRIM address:recent_tx:ETH:0x123... 0 99
```

#### Set 类型
```redis
# 关联地址
SADD address:related:ETH:0x123... 0x456... 0x789...
```

#### Sorted Set 类型
```redis
# 热门地址排行
ZADD hot:addresses:ETH 1000 0x123... 950 0x456...
```

### 5.3 过期策略

```
数据类型          过期时间
地址信息          1小时
交易详情          24小时
风险评分          30分钟
路径查询结果      30分钟
统计数据          1小时
用户会话          7天
验证码            5分钟
限流计数          1分钟/1小时/1天
```

## 6. 数据同步策略

### 6.1 链上数据同步

```
同步流程
├── 全量同步（历史数据）
│   ├── 按区块范围分批同步
│   ├── 多线程并行处理
│   └── 断点续传
└── 增量同步（实时数据）
    ├── 监听新区块
    ├── 解析交易数据
    └── 实时入库
```

### 6.2 数据一致性

```
一致性保证
├── PostgreSQL → Neo4j
│   ├── 事务日志同步
│   └── 定时校验
├── PostgreSQL → ClickHouse
│   ├── Kafka 消息队列
│   └── 批量导入
└── 数据库 → Redis
    ├── 缓存更新策略
    └── 缓存失效机制
```

---

**文档版本**：v1.0  
**创建日期**：2026-02-28  
**维护团队**：ChainTrace 数据团队
