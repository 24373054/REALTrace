# ChainTrace 部署方案文档 v1.0

## 1. 部署架构概述

### 1.1 部署模式

```
部署模式
├── SaaS 云端部署（标准模式）
│   ├── 多租户架构
│   ├── 弹性扩展
│   └── 按需付费
├── 私有化部署（企业模式）
│   ├── 客户自有环境
│   ├── 数据隔离
│   └── 定制化配置
└── 混合部署（混合模式）
    ├── 核心服务云端
    ├── 敏感数据本地
    └── 灵活组合
```

### 1.2 技术栈

```
基础设施
├── 容器化：Docker + Kubernetes
├── 服务网格：Istio
├── CI/CD：GitLab CI / Jenkins
├── 监控：Prometheus + Grafana
├── 日志：ELK Stack
├── 配置中心：Consul / Nacos
└── 服务注册：Consul / Eureka
```

## 2. 云端 SaaS 部署

### 2.1 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    CDN + WAF                             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              负载均衡（ALB/NLB）                         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 API Gateway                              │
│              (Kong / APISIX)                             │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────┐ ┌──▼──────┐
│ 应用服务集群 │ │ 应用服务 │ │ 应用服务 │
│  (K8s Pod)   │ │ (K8s Pod)│ │ (K8s Pod)│
└───────┬──────┘ └──┬──────┘ └──┬──────┘
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────┐ ┌──▼──────┐
│ PostgreSQL   │ │ Redis   │ │ Neo4j   │
│   (RDS)      │ │ Cluster │ │ Cluster │
└──────────────┘ └─────────┘ └─────────┘
```

### 2.2 Kubernetes 部署配置

#### Namespace 配置
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: realtrace-prod
  labels:
    env: production
```

#### Deployment 配置
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: realtrace-api
  namespace: realtrace-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: realtrace-api
  template:
    metadata:
      labels:
        app: realtrace-api
        version: v1.0.0
    spec:
      containers:
      - name: api
        image: realtrace/api:1.0.0
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
```

#### Service 配置
```yaml
apiVersion: v1
kind: Service
metadata:
  name: realtrace-api
  namespace: realtrace-prod
spec:
  selector:
    app: realtrace-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP
```

#### Ingress 配置
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: realtrace-ingress
  namespace: realtrace-prod
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.realtrace.com
    secretName: realtrace-tls
  rules:
  - host: api.realtrace.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: realtrace-api
            port:
              number: 80
```

#### HPA 自动扩缩容
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: realtrace-api-hpa
  namespace: realtrace-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: realtrace-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2.3 数据库部署

#### PostgreSQL 配置
```yaml
# 使用云服务商 RDS
# AWS RDS / 阿里云 RDS / 腾讯云 CDB

配置参数：
- 实例规格：8核32GB（可扩展）
- 存储：SSD 500GB（自动扩展）
- 备份：每日全量 + 实时增量
- 高可用：主从复制 + 自动故障转移
- 读写分离：1主2从
```

#### Redis 集群配置
```yaml
# Redis Cluster 模式
nodes: 6 (3主3从)
memory: 16GB per node
persistence: AOF + RDB
maxmemory-policy: allkeys-lru
```

#### Neo4j 集群配置
```yaml
# Neo4j Causal Cluster
core_servers: 3
read_replicas: 2
memory: 32GB per core server
```

### 2.4 监控告警配置

#### Prometheus 配置
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'realtrace-api'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - realtrace-prod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: realtrace-api
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "ChainTrace Monitoring",
    "panels": [
      {
        "title": "API QPS",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

## 3. 私有化部署方案

### 3.1 硬件要求

#### 最小配置（测试环境）
```
服务器数量：3台
配置：
- CPU：16核
- 内存：64GB
- 硬盘：1TB SSD
- 网络：千兆网卡

服务分布：
- 服务器1：应用服务 + Redis
- 服务器2：PostgreSQL + Neo4j
- 服务器3：ClickHouse + Elasticsearch
```

#### 推荐配置（生产环境）
```
服务器数量：10台

应用服务器（3台）：
- CPU：32核
- 内存：128GB
- 硬盘：500GB SSD
- 网络：万兆网卡

数据库服务器（3台）：
- CPU：64核
- 内存：256GB
- 硬盘：2TB NVMe SSD
- 网络：万兆网卡

分析服务器（2台）：
- CPU：64核
- 内存：512GB
- 硬盘：4TB NVMe SSD
- 网络：万兆网卡

负载均衡器（2台）：
- CPU：16核
- 内存：32GB
- 硬盘：500GB SSD
- 网络：万兆网卡
```

### 3.2 网络架构

```
┌─────────────────────────────────────────────────────┐
│                  外网（Internet）                    │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              防火墙 + WAF                            │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              DMZ 区（负载均衡）                      │
│         192.168.1.0/24                               │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              应用区（应用服务）                      │
│         192.168.10.0/24                              │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              数据区（数据库）                        │
│         192.168.20.0/24                              │
└─────────────────────────────────────────────────────┘
```

### 3.3 安装部署脚本

#### 一键部署脚本
```bash
#!/bin/bash
# ChainTrace 私有化部署脚本

set -e

echo "=== ChainTrace 私有化部署开始 ==="

# 1. 检查系统环境
echo "检查系统环境..."
./scripts/check_environment.sh

# 2. 安装 Docker
echo "安装 Docker..."
./scripts/install_docker.sh

# 3. 安装 Kubernetes
echo "安装 Kubernetes..."
./scripts/install_k8s.sh

# 4. 部署数据库
echo "部署数据库..."
./scripts/deploy_databases.sh

# 5. 部署应用服务
echo "部署应用服务..."
./scripts/deploy_services.sh

# 6. 配置监控
echo "配置监控..."
./scripts/setup_monitoring.sh

# 7. 初始化数据
echo "初始化数据..."
./scripts/init_data.sh

# 8. 健康检查
echo "健康检查..."
./scripts/health_check.sh

echo "=== 部署完成 ==="
echo "访问地址：https://your-domain.com"
echo "管理后台：https://your-domain.com/admin"
echo "默认账号：admin"
echo "默认密码：请查看 /opt/realtrace/credentials.txt"
```

### 3.4 Docker Compose 配置

```yaml
version: '3.8'

services:
  # API 服务
  api:
    image: realtrace/api:latest
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/realtrace
      - REDIS_URL=redis://redis:6379
      - NEO4J_URL=bolt://neo4j:7687
    depends_on:
      - postgres
      - redis
      - neo4j
    restart: always
    networks:
      - realtrace-network

  # PostgreSQL
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=realtrace
      - POSTGRES_USER=realtrace
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: always
    networks:
      - realtrace-network

  # Redis
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    restart: always
    networks:
      - realtrace-network

  # Neo4j
  neo4j:
    image: neo4j:5
    environment:
      - NEO4J_AUTH=neo4j/your_password
      - NEO4J_dbms_memory_heap_max__size=4G
    volumes:
      - neo4j-data:/data
    restart: always
    networks:
      - realtrace-network

  # Nginx
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: always
    networks:
      - realtrace-network

volumes:
  postgres-data:
  redis-data:
  neo4j-data:

networks:
  realtrace-network:
    driver: bridge
```

## 4. CI/CD 流程

### 4.1 GitLab CI 配置

```yaml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_REGISTRY: registry.realtrace.com
  IMAGE_NAME: realtrace/api

# 构建阶段
build:
  stage: build
  script:
    - docker build -t $IMAGE_NAME:$CI_COMMIT_SHA .
    - docker tag $IMAGE_NAME:$CI_COMMIT_SHA $IMAGE_NAME:latest
    - docker push $IMAGE_NAME:$CI_COMMIT_SHA
    - docker push $IMAGE_NAME:latest
  only:
    - main
    - develop

# 测试阶段
test:
  stage: test
  script:
    - npm install
    - npm run test
    - npm run lint
  coverage: '/Coverage: \d+\.\d+%/'

# 部署到开发环境
deploy_dev:
  stage: deploy
  script:
    - kubectl set image deployment/realtrace-api api=$IMAGE_NAME:$CI_COMMIT_SHA -n realtrace-dev
    - kubectl rollout status deployment/realtrace-api -n realtrace-dev
  environment:
    name: development
    url: https://dev.realtrace.com
  only:
    - develop

# 部署到生产环境
deploy_prod:
  stage: deploy
  script:
    - kubectl set image deployment/realtrace-api api=$IMAGE_NAME:$CI_COMMIT_SHA -n realtrace-prod
    - kubectl rollout status deployment/realtrace-api -n realtrace-prod
  environment:
    name: production
    url: https://api.realtrace.com
  when: manual
  only:
    - main
```

### 4.2 发布流程

```
开发流程
├── 1. 开发分支（feature/*）
│   └── 本地开发和测试
├── 2. 合并到 develop
│   ├── 自动构建
│   ├── 自动测试
│   └── 自动部署到开发环境
├── 3. 测试验证
│   └── QA 测试
├── 4. 合并到 main
│   ├── 自动构建
│   ├── 自动测试
│   └── 打标签（v1.0.0）
└── 5. 手动部署到生产
    ├── 灰度发布
    ├── 全量发布
    └── 监控验证
```

## 5. 备份与恢复

### 5.1 备份策略

```
备份策略
├── 数据库备份
│   ├── 全量备份：每日凌晨2点
│   ├── 增量备份：每小时
│   └── 保留策略：30天
├── 文件备份
│   ├── 配置文件：每次变更
│   ├── 日志文件：每日归档
│   └── 报告文件：实时备份
└── 镜像备份
    ├── Docker镜像：每次发布
    └── 保留策略：最近10个版本
```

### 5.2 备份脚本

```bash
#!/bin/bash
# 数据库备份脚本

BACKUP_DIR="/backup/realtrace"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL 备份
pg_dump -h localhost -U realtrace realtrace | gzip > $BACKUP_DIR/postgres_$DATE.sql.gz

# Neo4j 备份
neo4j-admin backup --backup-dir=$BACKUP_DIR/neo4j_$DATE

# Redis 备份
redis-cli --rdb $BACKUP_DIR/redis_$DATE.rdb

# 上传到对象存储
aws s3 sync $BACKUP_DIR s3://realtrace-backup/

# 清理旧备份（保留30天）
find $BACKUP_DIR -mtime +30 -delete
```

### 5.3 恢复流程

```bash
#!/bin/bash
# 数据恢复脚本

BACKUP_FILE=$1

# PostgreSQL 恢复
gunzip < $BACKUP_FILE | psql -h localhost -U realtrace realtrace

# Neo4j 恢复
neo4j-admin restore --from=$BACKUP_FILE --database=neo4j

# Redis 恢复
redis-cli --rdb $BACKUP_FILE
```

## 6. 安全加固

### 6.1 网络安全

```
安全措施
├── 防火墙规则
│   ├── 仅开放必要端口
│   ├── IP 白名单
│   └── DDoS 防护
├── SSL/TLS 加密
│   ├── HTTPS 强制
│   ├── TLS 1.3
│   └── 证书自动更新
└── VPN 访问
    └── 管理后台仅 VPN 访问
```

### 6.2 应用安全

```
安全配置
├── 认证加固
│   ├── 强密码策略
│   ├── 双因素认证
│   └── JWT 过期时间
├── 权限控制
│   ├── RBAC 权限模型
│   ├── API 权限验证
│   └── 数据权限隔离
└── 审计日志
    ├── 操作日志记录
    ├── 登录日志记录
    └── 异常行为告警
```

---

**文档版本**：v1.0  
**创建日期**：2026-02-28  
**维护团队**：ChainTrace 运维团队
