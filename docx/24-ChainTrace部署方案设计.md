1. 部署架构概述
1.1 部署模式
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
1.2 技术栈
基础设施
├── 容器化：Docker + Kubernetes
├── 服务网格：Istio
├── CI/CD：GitLab CI / Jenkins
├── 监控：Prometheus + Grafana
├── 日志：ELK Stack
├── 配置中心：Consul / Nacos
└── 服务注册：Consul / Eureka
2. 云端 SaaS 部署
2.1 架构设计
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
2.2 Kubernetes 部署配置
Namespace 配置
apiVersion: v1kind: Namespacemetadata:name: realtrace-prodlabels:env: production
Deployment 配置
apiVersion: apps/v1kind: Deploymentmetadata:name: realtrace-apinamespace: realtrace-prodspec:replicas: 3selector:matchLabels:app: realtrace-apitemplate:metadata:labels:app: realtrace-apiversion: v1.0.0spec:containers:- name: apiimage: realtrace/api:1.0.0ports:- containerPort: 8080name: httpenv:- name: DATABASE_URLvalueFrom:secretKeyRef:name: db-credentialskey: url- name: REDIS_URLvalueFrom:configMapKeyRef:name: redis-configkey: urlresources:requests:memory: "512Mi"cpu: "500m"limits:memory: "1Gi"cpu: "1000m"livenessProbe:httpGet:path: /healthport: 8080initialDelaySeconds: 30periodSeconds: 10readinessProbe:httpGet:path: /readyport: 8080initialDelaySeconds: 10periodSeconds: 5
Service 配置
apiVersion: v1kind: Servicemetadata:name: realtrace-apinamespace: realtrace-prodspec:selector:app: realtrace-apiports:- protocol: TCPport: 80targetPort: 8080type: ClusterIP
Ingress 配置
apiVersion: networking.k8s.io/v1kind: Ingressmetadata:name: realtrace-ingressnamespace: realtrace-prodannotations:kubernetes.io/ingress.class: nginxcert-manager.io/cluster-issuer: letsencrypt-prodspec:tls:- hosts:- api.realtrace.comsecretName: realtrace-tlsrules:- host: api.realtrace.comhttp:paths:- path: /pathType: Prefixbackend:service:name: realtrace-apiport:number: 80
HPA 自动扩缩容
apiVersion: autoscaling/v2kind: HorizontalPodAutoscalermetadata:name: realtrace-api-hpanamespace: realtrace-prodspec:scaleTargetRef:apiVersion: apps/v1kind: Deploymentname: realtrace-apiminReplicas: 3maxReplicas: 20metrics:- type: Resourceresource:name: cputarget:type: UtilizationaverageUtilization: 70- type: Resourceresource:name: memorytarget:type: UtilizationaverageUtilization: 80
2.3 数据库部署
PostgreSQL 配置
# 使用云服务商 RDS# AWS RDS / 阿里云 RDS / 腾讯云 CDB配置参数：- 实例规格：8核32GB（可扩展）- 存储：SSD 500GB（自动扩展）- 备份：每日全量 + 实时增量- 高可用：主从复制 + 自动故障转移- 读写分离：1主2从
Redis 集群配置
# Redis Cluster 模式nodes: 6 (3主3从)memory: 16GB per nodepersistence: AOF + RDBmaxmemory-policy: allkeys-lru
Neo4j 集群配置
# Neo4j Causal Clustercore_servers: 3read_replicas: 2memory: 32GB per core server
2.4 监控告警配置
Prometheus 配置
global:scrape_interval: 15sevaluation_interval: 15sscrape_configs:- job_name: 'realtrace-api'kubernetes_sd_configs:- role: podnamespaces:names:- realtrace-prodrelabel_configs:- source_labels: [__meta_kubernetes_pod_label_app]
        action: keepregex: realtrace-api
Grafana Dashboard
{"dashboard": {"title": "ChainTrace Monitoring","panels": [{"title": "API QPS","targets": [{"expr": "rate(http_requests_total[5m])"}]},{"title": "Response Time","targets": [{"expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"}]},{"title": "Error Rate","targets": [{"expr": "rate(http_requests_total{status=~\"5..\"}[5m])"}]}]}}
3. 私有化部署方案
3.1 硬件要求
最小配置（测试环境）
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
推荐配置（生产环境）
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
3.2 网络架构
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
3.3 安装部署脚本
一键部署脚本
#!/bin/bash# ChainTrace 私有化部署脚本set -e

echo "=== ChainTrace 私有化部署开始 ==="# 1. 检查系统环境echo "检查系统环境..."
./scripts/check_environment.sh

# 2. 安装 Dockerecho "安装 Docker..."
./scripts/install_docker.sh

# 3. 安装 Kubernetesecho "安装 Kubernetes..."
./scripts/install_k8s.sh

# 4. 部署数据库echo "部署数据库..."
./scripts/deploy_databases.sh

# 5. 部署应用服务echo "部署应用服务..."
./scripts/deploy_services.sh

# 6. 配置监控echo "配置监控..."
./scripts/setup_monitoring.sh

# 7. 初始化数据echo "初始化数据..."
./scripts/init_data.sh

# 8. 健康检查echo "健康检查..."
./scripts/health_check.sh

echo "=== 部署完成 ==="echo "访问地址：https://your-domain.com"echo "管理后台：https://your-domain.com/admin"echo "默认账号：admin"echo "默认密码：请查看 /opt/realtrace/credentials.txt"
3.4 Docker Compose 配置
version: '3.8'services:# API 服务api:image: realtrace/api:latestports:- "8080:8080"environment:- DATABASE_URL=postgresql://user:pass@postgres:5432/realtrace- REDIS_URL=redis://redis:6379- NEO4J_URL=bolt://neo4j:7687depends_on:- postgres- redis- neo4jrestart: alwaysnetworks:- realtrace-network# PostgreSQLpostgres:image: postgres:15environment:- POSTGRES_DB=realtrace- POSTGRES_USER=realtrace- POSTGRES_PASSWORD=your_passwordvolumes:- postgres-data:/var/lib/postgresql/datarestart: alwaysnetworks:- realtrace-network# Redisredis:image: redis:7-alpinecommand: redis-server --appendonly yesvolumes:- redis-data:/datarestart: alwaysnetworks:- realtrace-network# Neo4jneo4j:image: neo4j:5environment:- NEO4J_AUTH=neo4j/your_password- NEO4J_dbms_memory_heap_max__size=4Gvolumes:- neo4j-data:/datarestart: alwaysnetworks:- realtrace-network# Nginxnginx:image: nginx:alpineports:- "80:80"- "443:443"volumes:- ./nginx.conf:/etc/nginx/nginx.conf- ./ssl:/etc/nginx/ssldepends_on:- apirestart: alwaysnetworks:- realtrace-networkvolumes:postgres-data:redis-data:neo4j-data:networks:realtrace-network:driver: bridge
4. CI/CD 流程
4.1 GitLab CI 配置
stages:- build- test- deployvariables:DOCKER_REGISTRY: registry.realtrace.comIMAGE_NAME: realtrace/api# 构建阶段build:stage: buildscript:- docker build -t $IMAGE_NAME:$CI_COMMIT_SHA .- docker tag $IMAGE_NAME:$CI_COMMIT_SHA $IMAGE_NAME:latest- docker push $IMAGE_NAME:$CI_COMMIT_SHA- docker push $IMAGE_NAME:latestonly:- main- develop# 测试阶段test:stage: testscript:- npm install- npm run test- npm run lintcoverage: '/Coverage: \d+\.\d+%/'# 部署到开发环境deploy_dev:stage: deployscript:- kubectl set image deployment/realtrace-api api=$IMAGE_NAME:$CI_COMMIT_SHA -n realtrace-dev- kubectl rollout status deployment/realtrace-api -n realtrace-devenvironment:name: developmenturl: https://dev.realtrace.comonly:- develop# 部署到生产环境deploy_prod:stage: deployscript:- kubectl set image deployment/realtrace-api api=$IMAGE_NAME:$CI_COMMIT_SHA -n realtrace-prod- kubectl rollout status deployment/realtrace-api -n realtrace-prodenvironment:name: productionurl: https://api.realtrace.comwhen: manualonly:- main
4.2 发布流程
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
5. 备份与恢复
5.1 备份策略
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
5.2 备份脚本
#!/bin/bash# 数据库备份脚本

BACKUP_DIR="/backup/realtrace"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL 备份
pg_dump -h localhost -U realtrace realtrace | gzip > $BACKUP_DIR/postgres_$DATE.sql.gz

# Neo4j 备份
neo4j-admin backup --backup-dir=$BACKUP_DIR/neo4j_$DATE# Redis 备份
redis-cli --rdb $BACKUP_DIR/redis_$DATE.rdb

# 上传到对象存储
aws s3 sync $BACKUP_DIR s3://realtrace-backup/

# 清理旧备份（保留30天）
find $BACKUP_DIR -mtime +30 -delete
5.3 恢复流程
#!/bin/bash# 数据恢复脚本

BACKUP_FILE=$1# PostgreSQL 恢复
gunzip < $BACKUP_FILE | psql -h localhost -U realtrace realtrace

# Neo4j 恢复
neo4j-admin restore --from=$BACKUP_FILE --database=neo4j

# Redis 恢复
redis-cli --rdb $BACKUP_FILE
6. 安全加固
6.1 网络安全
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
6.2 应用安全
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

---
文档版本：v1.0
创建日期：2026-02-28
维护团队：ChainTrace 运维团队