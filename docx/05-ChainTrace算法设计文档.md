# ChainTrace 算法设计文档 v1.0

## 1. 算法体系概览

```
ChainTrace 算法体系
├── 溯源算法
│   ├── 路径搜索算法
│   ├── 地址聚类算法
│   └── 实体识别算法
├── 分析算法
│   ├── 风险评分算法
│   ├── 异常检测算法
│   └── 行为分析算法
├── 穿透算法 ⭐
│   ├── 混币穿透算法
│   ├── 隐私币标记算法
│   └── 跨链追踪算法
└── 图算法
    ├── 社区发现算法
    ├── 中心性算法
    └── 路径分析算法
```

## 2. 混币穿透算法 ⭐

### 2.1 算法原理

混币器通过将多个用户的资金混合，打破交易的可追踪性。我们的穿透算法基于以下原理：

1. **金额模式匹配**：分析输入输出金额的统计特征
2. **时间序列分析**：识别混币前后的时间模式
3. **地址行为分析**：分析地址的历史行为特征
4. **概率推断**：基于多维特征计算匹配概率

### 2.2 Tornado Cash 穿透算法

```python
class TornadoCashAnalyzer:
    """Tornado Cash 混币穿透分析器"""
    
    def __init__(self):
        self.deposit_pool = {}  # 存款池
        self.withdrawal_pool = {}  # 提款池
        
    def analyze_tornado_transaction(self, tx_hash: str) -> dict:
        """
        分析 Tornado Cash 交易
        """
        # 1. 识别交易类型（存款/提款）
        tx_type = self.identify_transaction_type(tx_hash)
        
        if tx_type == 'deposit':
            return self.analyze_deposit(tx_hash)
        elif tx_type == 'withdrawal':
            return self.analyze_withdrawal(tx_hash)
    
    def analyze_deposit(self, tx_hash: str) -> dict:
        """分析存款交易"""
        deposit_info = self.get_deposit_info(tx_hash)
        
        # 记录存款信息
        self.deposit_pool[tx_hash] = {
            'amount': deposit_info['amount'],
            'timestamp': deposit_info['timestamp'],
            'from_address': deposit_info['from'],
            'commitment': deposit_info['commitment']
        }
        
        return deposit_info
    
    def analyze_withdrawal(self, tx_hash: str) -> dict:
        """分析提款交易并尝试匹配存款"""
        withdrawal_info = self.get_withdrawal_info(tx_hash)
        
        # 匹配可能的存款
        candidates = self.find_deposit_candidates(withdrawal_info)
        
        # 计算匹配概率
        matches = []
        for deposit_hash, deposit_info in candidates.items():
            probability = self.calculate_match_probability(
                deposit_info, 
                withdrawal_info
            )
            
            if probability > 0.5:  # 阈值
                matches.append({
                    'deposit_hash': deposit_hash,
                    'deposit_address': deposit_info['from_address'],
                    'probability': probability,
                    'evidence': self.get_matching_evidence(
                        deposit_info, 
                        withdrawal_info
                    )
                })
        
        return {
            'withdrawal': withdrawal_info,
            'possible_deposits': sorted(
                matches, 
                key=lambda x: x['probability'], 
                reverse=True
            )
        }
    
    def find_deposit_candidates(self, withdrawal_info: dict) -> dict:
        """查找候选存款"""
        candidates = {}
        amount = withdrawal_info['amount']
        timestamp = withdrawal_info['timestamp']
        
        # 筛选条件
        for deposit_hash, deposit_info in self.deposit_pool.items():
            # 1. 金额必须匹配（Tornado 使用固定面额）
            if deposit_info['amount'] != amount:
                continue
            
            # 2. 时间窗口（存款必须在提款之前）
            time_diff = timestamp - deposit_info['timestamp']
            if time_diff < 0 or time_diff > 30 * 24 * 3600:  # 30天
                continue
            
            candidates[deposit_hash] = deposit_info
        
        return candidates
    
    def calculate_match_probability(
        self, 
        deposit_info: dict, 
        withdrawal_info: dict
    ) -> float:
        """
        计算匹配概率
        基于多个特征的加权评分
        """
        features = {}
        
        # 特征1：时间间隔（权重30%）
        time_score = self.calculate_time_score(
            deposit_info['timestamp'],
            withdrawal_info['timestamp']
        )
        features['time'] = time_score * 0.3
        
        # 特征2：Gas价格相似度（权重20%）
        gas_score = self.calculate_gas_similarity(
            deposit_info.get('gas_price', 0),
            withdrawal_info.get('gas_price', 0)
        )
        features['gas'] = gas_score * 0.2
        
        # 特征3：地址行为相似度（权重30%）
        behavior_score = self.calculate_behavior_similarity(
            deposit_info['from_address'],
            withdrawal_info['to_address']
        )
        features['behavior'] = behavior_score * 0.3
        
        # 特征4：链上关联度（权重20%）
        relation_score = self.calculate_relation_score(
            deposit_info['from_address'],
            withdrawal_info['to_address']
        )
        features['relation'] = relation_score * 0.2
        
        # 总概率
        probability = sum(features.values())
        
        return min(probability, 1.0)
    
    def calculate_time_score(
        self, 
        deposit_time: int, 
        withdrawal_time: int
    ) -> float:
        """
        计算时间评分
        混币器用户通常会等待一段时间后提款
        """
        time_diff = withdrawal_time - deposit_time
        
        # 理想等待时间：1-7天
        if 24 * 3600 <= time_diff <= 7 * 24 * 3600:
            return 1.0
        # 可接受范围：1小时-30天
        elif 3600 <= time_diff <= 30 * 24 * 3600:
            return 0.7
        # 太快或太慢
        else:
            return 0.3
    
    def calculate_gas_similarity(
        self, 
        gas1: float, 
        gas2: float
    ) -> float:
        """
        计算Gas价格相似度
        同一用户倾向于使用相似的Gas设置
        """
        if gas1 == 0 or gas2 == 0:
            return 0.5
        
        ratio = min(gas1, gas2) / max(gas1, gas2)
        return ratio
    
    def calculate_behavior_similarity(
        self, 
        addr1: str, 
        addr2: str
    ) -> float:
        """
        计算地址行为相似度
        分析交易模式、活跃时间等
        """
        # 获取地址行为特征
        behavior1 = self.get_address_behavior(addr1)
        behavior2 = self.get_address_behavior(addr2)
        
        # 计算余弦相似度
        similarity = self.cosine_similarity(
            behavior1['feature_vector'],
            behavior2['feature_vector']
        )
        
        return similarity
    
    def calculate_relation_score(
        self, 
        addr1: str, 
        addr2: str
    ) -> float:
        """
        计算地址关联度
        检查是否有间接关联
        """
        # 检查共同交互地址
        common_interactions = self.find_common_interactions(addr1, addr2)
        
        if len(common_interactions) > 0:
            return 0.8
        
        # 检查是否在同一聚类
        if self.in_same_cluster(addr1, addr2):
            return 0.9
        
        return 0.1
```

### 2.3 通用混币器识别

```python
class MixerDetector:
    """混币器检测器"""
    
    def detect_mixer_pattern(self, address: str) -> dict:
        """
        检测地址是否使用混币器
        """
        transactions = self.get_address_transactions(address)
        
        patterns = {
            'tornado_cash': self.detect_tornado_pattern(transactions),
            'wasabi': self.detect_wasabi_pattern(transactions),
            'coinjoin': self.detect_coinjoin_pattern(transactions),
            'custom_mixer': self.detect_custom_mixer(transactions)
        }
        
        # 综合判断
        mixer_type = None
        confidence = 0
        
        for pattern_type, result in patterns.items():
            if result['detected'] and result['confidence'] > confidence:
                mixer_type = pattern_type
                confidence = result['confidence']
        
        return {
            'is_mixer_user': confidence > 0.7,
            'mixer_type': mixer_type,
            'confidence': confidence,
            'patterns': patterns
        }
    
    def detect_tornado_pattern(self, transactions: list) -> dict:
        """检测 Tornado Cash 使用模式"""
        tornado_addresses = self.get_tornado_contract_addresses()
        
        tornado_txs = [
            tx for tx in transactions 
            if tx['to'] in tornado_addresses or tx['from'] in tornado_addresses
        ]
        
        if len(tornado_txs) > 0:
            return {
                'detected': True,
                'confidence': 0.95,
                'transactions': tornado_txs
            }
        
        return {'detected': False, 'confidence': 0}
    
    def detect_coinjoin_pattern(self, transactions: list) -> dict:
        """
        检测 CoinJoin 模式
        特征：多输入多输出，金额相似
        """
        coinjoin_indicators = 0
        
        for tx in transactions:
            # 检查是否有多个输入和输出
            if len(tx.get('inputs', [])) > 2 and len(tx.get('outputs', [])) > 2:
                # 检查输出金额是否相似
                outputs = [float(out['value']) for out in tx['outputs']]
                if self.has_similar_amounts(outputs):
                    coinjoin_indicators += 1
        
        confidence = min(coinjoin_indicators / len(transactions), 1.0)
        
        return {
            'detected': confidence > 0.3,
            'confidence': confidence,
            'indicator_count': coinjoin_indicators
        }
    
    def has_similar_amounts(self, amounts: list) -> bool:
        """检查金额是否相似"""
        if len(amounts) < 2:
            return False
        
        # 计算变异系数
        mean = sum(amounts) / len(amounts)
        variance = sum((x - mean) ** 2 for x in amounts) / len(amounts)
        std_dev = variance ** 0.5
        cv = std_dev / mean if mean > 0 else 0
        
        # 变异系数小于0.1认为金额相似
        return cv < 0.1
```

## 3. 隐私币标记算法

### 3.1 Monero 追踪算法

```python
class MoneroTracer:
    """Monero 隐私币追踪"""
    
    def trace_monero_flow(self, tx_hash: str) -> dict:
        """
        追踪 Monero 资金流向
        虽然无法直接追踪，但可以标记和分析模式
        """
        # 1. 识别 Monero 交易
        is_monero = self.identify_monero_transaction(tx_hash)
        
        if not is_monero:
            return {'error': 'Not a Monero-related transaction'}
        
        # 2. 分析交易前后的链上行为
        before_analysis = self.analyze_before_monero(tx_hash)
        after_analysis = self.analyze_after_monero(tx_hash)
        
        # 3. 时间和金额关联分析
        correlations = self.find_correlations(
            before_analysis,
            after_analysis
        )
        
        return {
            'monero_detected': True,
            'before_monero': before_analysis,
            'after_monero': after_analysis,
            'possible_correlations': correlations,
            'confidence': self.calculate_correlation_confidence(correlations)
        }
    
    def analyze_before_monero(self, tx_hash: str) -> dict:
        """分析进入 Monero 前的行为"""
        # 查找转入交易所的交易
        exchange_deposits = self.find_exchange_deposits(tx_hash, lookback=10)
        
        return {
            'exchange_deposits': exchange_deposits,
            'total_amount': sum(d['amount'] for d in exchange_deposits),
            'time_window': self.calculate_time_window(exchange_deposits)
        }
    
    def analyze_after_monero(self, tx_hash: str) -> dict:
        """分析从 Monero 出来后的行为"""
        # 查找从交易所提款的交易
        exchange_withdrawals = self.find_exchange_withdrawals(
            tx_hash, 
            lookforward=10
        )
        
        return {
            'exchange_withdrawals': exchange_withdrawals,
            'total_amount': sum(w['amount'] for w in exchange_withdrawals),
            'time_window': self.calculate_time_window(exchange_withdrawals)
        }
    
    def find_correlations(
        self, 
        before: dict, 
        after: dict
    ) -> list:
        """
        查找关联
        基于金额和时间的匹配
        """
        correlations = []
        
        for deposit in before['exchange_deposits']:
            for withdrawal in after['exchange_withdrawals']:
                # 金额相似度
                amount_similarity = self.calculate_amount_similarity(
                    deposit['amount'],
                    withdrawal['amount']
                )
                
                # 时间合理性
                time_reasonable = self.check_time_reasonable(
                    deposit['timestamp'],
                    withdrawal['timestamp']
                )
                
                if amount_similarity > 0.8 and time_reasonable:
                    correlations.append({
                        'deposit': deposit,
                        'withdrawal': withdrawal,
                        'amount_similarity': amount_similarity,
                        'confidence': amount_similarity * 0.7
                    })
        
        return correlations
```

### 3.2 隐私币交易标记

```python
class PrivacyCoinMarker:
    """隐私币交易标记"""
    
    PRIVACY_COINS = {
        'XMR': 'Monero',
        'ZEC': 'Zcash',
        'DASH': 'Dash',
        'GRIN': 'Grin',
        'BEAM': 'Beam'
    }
    
    def mark_privacy_coin_usage(self, address: str) -> dict:
        """标记地址的隐私币使用情况"""
        transactions = self.get_address_transactions(address)
        
        privacy_usage = {
            'has_privacy_coin': False,
            'coins_used': [],
            'transaction_count': 0,
            'total_volume': 0,
            'risk_score_increase': 0
        }
        
        for tx in transactions:
            # 检查是否涉及隐私币
            coin = self.identify_privacy_coin(tx)
            
            if coin:
                privacy_usage['has_privacy_coin'] = True
                if coin not in privacy_usage['coins_used']:
                    privacy_usage['coins_used'].append(coin)
                
                privacy_usage['transaction_count'] += 1
                privacy_usage['total_volume'] += tx.get('amount', 0)
        
        # 计算风险评分增加值
        if privacy_usage['has_privacy_coin']:
            privacy_usage['risk_score_increase'] = self.calculate_risk_increase(
                privacy_usage
            )
        
        return privacy_usage
    
    def calculate_risk_increase(self, usage: dict) -> int:
        """
        计算使用隐私币导致的风险评分增加
        """
        base_score = 20  # 基础分
        
        # 使用多种隐私币
        coin_penalty = len(usage['coins_used']) * 5
        
        # 交易频率
        frequency_penalty = min(usage['transaction_count'] * 2, 30)
        
        # 交易量
        volume_penalty = min(usage['total_volume'] / 10000, 20)
        
        total_increase = base_score + coin_penalty + frequency_penalty + volume_penalty
        
        return min(int(total_increase), 50)  # 最多增加50分
```

## 4. 风险评分算法

### 4.1 多维度风险评分

```python
class RiskScorer:
    """风险评分系统"""
    
    def calculate_risk_score(self, address: str) -> dict:
        """
        计算地址风险评分
        总分0-100，分为5个等级
        """
        # 收集各维度数据
        transaction_risk = self.analyze_transaction_risk(address)
        relationship_risk = self.analyze_relationship_risk(address)
        attribute_risk = self.analyze_attribute_risk(address)
        intel_risk = self.analyze_intelligence_risk(address)
        
        # 加权计算
        weights = {
            'transaction': 0.35,
            'relationship': 0.30,
            'attribute': 0.20,
            'intelligence': 0.15
        }
        
        total_score = (
            transaction_risk['score'] * weights['transaction'] +
            relationship_risk['score'] * weights['relationship'] +
            attribute_risk['score'] * weights['attribute'] +
            intel_risk['score'] * weights['intelligence']
        )
        
        # 确定风险等级
        risk_level = self.determine_risk_level(total_score)
        
        return {
            'address': address,
            'total_score': round(total_score, 2),
            'risk_level': risk_level,
            'dimensions': {
                'transaction': transaction_risk,
                'relationship': relationship_risk,
                'attribute': attribute_risk,
                'intelligence': intel_risk
            },
            'timestamp': datetime.now()
        }
    
    def analyze_transaction_risk(self, address: str) -> dict:
        """分析交易行为风险"""
        transactions = self.get_address_transactions(address)
        
        risk_factors = {
            'high_frequency': 0,      # 高频交易
            'unusual_amount': 0,      # 异常金额
            'rapid_movement': 0,      # 快速转移
            'circular_flow': 0,       # 循环流动
            'mixer_usage': 0          # 混币器使用
        }
        
        # 检测高频交易
        if self.detect_high_frequency(transactions):
            risk_factors['high_frequency'] = 15
        
        # 检测异常金额
        unusual_txs = self.detect_unusual_amounts(transactions)
        risk_factors['unusual_amount'] = min(len(unusual_txs) * 3, 20)
        
        # 检测快速转移
        if self.detect_rapid_movement(transactions):
            risk_factors['rapid_movement'] = 20
        
        # 检测循环流动
        if self.detect_circular_flow(address):
            risk_factors['circular_flow'] = 25
        
        # 检测混币器使用
        mixer_usage = self.detect_mixer_usage(transactions)
        if mixer_usage['detected']:
            risk_factors['mixer_usage'] = 20
        
        score = sum(risk_factors.values())
        
        return {
            'score': min(score, 100),
            'factors': risk_factors
        }
    
    def analyze_relationship_risk(self, address: str) -> dict:
        """分析关联关系风险"""
        risk_factors = {
            'blacklist_connection': 0,    # 黑名单关联
            'high_risk_interaction': 0,   # 高风险交互
            'sanctioned_entity': 0,       # 制裁实体
            'scam_connection': 0          # 诈骗关联
        }
        
        # 检查黑名单关联
        blacklist_connections = self.find_blacklist_connections(address)
        if len(blacklist_connections) > 0:
            risk_factors['blacklist_connection'] = min(
                len(blacklist_connections) * 15,
                40
            )
        
        # 检查高风险交互
        high_risk_txs = self.find_high_risk_interactions(address)
        risk_factors['high_risk_interaction'] = min(
            len(high_risk_txs) * 5,
            30
        )
        
        # 检查制裁名单
        if self.check_sanctioned(address):
            risk_factors['sanctioned_entity'] = 50
        
        # 检查诈骗关联
        scam_connections = self.find_scam_connections(address)
        risk_factors['scam_connection'] = min(
            len(scam_connections) * 10,
            30
        )
        
        score = sum(risk_factors.values())
        
        return {
            'score': min(score, 100),
            'factors': risk_factors
        }
    
    def determine_risk_level(self, score: float) -> str:
        """确定风险等级"""
        if score >= 80:
            return 'critical'
        elif score >= 60:
            return 'high'
        elif score >= 40:
            return 'medium'
        elif score >= 20:
            return 'low'
        else:
            return 'safe'
```

---

**文档版本**：v1.0  
**创建日期**：2026-02-28  
**维护团队**：ChainTrace 算法团队
