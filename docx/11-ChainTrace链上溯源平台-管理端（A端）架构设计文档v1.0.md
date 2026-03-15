ChainTrace 链上溯源平台 - 管理端（A 端）架构设计文档 v1.0
文档信息
- 版本: v1.0
- 创建时间: 2026-03-12
- 维护团队: ChainTrace 架构团队
- 文档状态: 已完成

---
1. A 端概述
1.1 产品定位
ChainTrace 管理端（A 端）是面向平台运营人员、系统管理员和数据分析师的后台管理系统。作为整个 ChainTrace 平台的"大脑"，A 端负责用户管理、内容审核、数据分析、系统配置和运营监控等核心功能，确保平台稳定运行和业务发展。
1.2 目标用户
- 平台运营人员：日常运营、用户管理、内容审核
- 系统管理员：系统配置、权限管理、日志监控
- 数据分析师：数据统计、报表生成、趋势分析
- 客服团队：用户咨询处理、投诉管理
- 安全团队：风险监控、异常检测、安全审计
1.3 核心价值
- 集中化管理：统一管理平台所有资源和用户
- 实时监控：实时掌握平台运行状态和业务数据
- 灵活配置：支持业务规则、权限策略的灵活配置
- 数据安全：完善的数据加密和访问控制机制
- 高效运营：自动化工具提升运营效率

---
2. 系统架构
2.1 整体架构
┌─────────────────────────────────────────────────────────────┐
│                     管理端前端 (Web)                         │
│              React 18 + TypeScript + Ant Design             │
└─────────────────────────────────────────────────────────────┘
                              ↕ RESTful API / WebSocket
┌─────────────────────────────────────────────────────────────┐
│                     API 网关层                                │
│         认证鉴权 │ 限流熔断 │ 日志审计 │ 请求转发            │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────┬──────────────┬──────────────┬───────────────┐
│  用户服务    │  内容服务    │  数据服务    │  系统服务     │
│  - 用户管理  │  - 审核管理  │  - 数据统计  │  - 权限管理   │
│  - 权限控制  │  - 投诉处理  │  - 报表生成  │  - 配置管理   │
│  - 角色管理  │  - 消息通知  │  - 可视化    │  - 日志管理   │
└──────────────┴──────────────┴──────────────┴───────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                     数据持久层                                │
│         PostgreSQL │ Redis │ Elasticsearch │ MinIO          │
└─────────────────────────────────────────────────────────────┘

2.2 技术栈选型
前端技术栈
- 框架: React 18 + TypeScript 5.0
- UI 组件库: Ant Design 5.0
- 状态管理: Zustand + TanStack Query
- 路由: React Router 6
- 表单: Formily / Formik
- 图表: AntV G2 / ECharts
- 构建工具: Vite 5.0
- 代码规范: ESLint + Prettier + Husky
后端技术栈
- 框架: NestJS 10.x (TypeScript)
- 数据库: PostgreSQL 15.x
- 缓存: Redis 7.x
- 搜索引擎: Elasticsearch 8.x
- 对象存储: MinIO / AWS S3
- 消息队列: RabbitMQ / Kafka
- 任务调度: BullMQ + Redis
- API 文档: Swagger / OpenAPI 3.0
运维技术栈
- 容器化: Docker + Docker Compose
- 编排: Kubernetes (生产环境)
- CI/CD: GitHub Actions / GitLab CI
- 监控: Prometheus + Grafana
- 日志: ELK Stack (Elasticsearch + Logstash + Kibana)
- 反向代理: Nginx / Traefik
2.3 架构原则
高可用性
- 多实例部署: 所有服务支持水平扩展
- 负载均衡: Nginx/HAProxy 实现负载均衡
- 故障转移: 数据库主从复制，自动故障转移
- 健康检查: 定时健康检查，自动重启异常服务
高性能
- 缓存策略: Redis 多级缓存，热点数据缓存
- 数据库优化: 索引优化、查询优化、读写分离
- CDN 加速: 静态资源 CDN 分发
- 异步处理: 耗时操作异步化，消息队列解耦
可扩展性
- 微服务架构: 模块化设计，服务独立部署
- API 版本控制: 支持 API 版本管理，平滑升级
- 插件机制: 支持功能模块热插拔
- 配置中心: 集中化配置管理，动态更新
安全性
- 认证鉴权: JWT + RBAC 权限模型
- 数据加密: 敏感数据 AES-256 加密
- 传输加密: HTTPS/TLS 1.3
- 审计日志: 所有操作留痕，可追溯
- 防攻击: WAF、限流、防 SQL 注入、XSS 防护

---
3. 核心功能模块
3.1 用户管理模块
3.1.1 用户列表
- 功能描述: 查看所有注册用户，支持多维度筛选和搜索
- 核心字段: 用户 ID、用户名、邮箱、手机号、注册时间、最后登录时间、用户状态、用户等级
- 筛选条件: 注册时间、用户状态、用户等级、搜索关键词
- 批量操作: 批量封禁、批量解封、批量删除、批量导出
3.1.2 用户详情
- 基本信息: 用户名、头像、邮箱、手机号、注册时间、IP 地址
- 账户状态: 是否正常、封禁原因、封禁时间、解封时间
- 权限信息: 角色列表、权限列表、权限有效期
- 行为记录: 登录日志、操作日志、违规记录
- 关联数据: 创建的内容、参与的订单、收到的消息
3.1.3 用户审核
- 注册审核: 对新注册用户进行审核（如需）
- 资料审核: 对用户提交的资料进行审核
- 实名认证: 审核用户提交的实名认证信息
- 企业认证: 审核企业用户的资质证明
3.1.4 用户权限
- 角色管理: 创建、编辑、删除用户角色
- 权限配置: 为角色配置功能权限和数据权限
- 权限分配: 为用户分配角色
- 权限审计: 查看权限变更历史
3.2 内容审核模块
3.2.1 待审核列表
- 审核类型: 用户发布内容、评论、私信、图片、视频
- 审核状态: 待审核、已通过、已拒绝、待人工审核
- 审核优先级: 高优先级（敏感内容）、普通优先级
- 审核队列: 按时间、优先级排序的审核队列
3.2.2 审核操作
- 审核内容: 查看待审核内容的详细信息
- 审核决策: 通过、拒绝、转人工审核
- 审核理由: 填写拒绝原因或备注
- 批量审核: 批量处理相似内容
3.2.3 审核规则
- 关键词过滤: 配置敏感词库，自动拦截
- 图片识别: AI 识别违规图片（色情、暴力等）
- 行为分析: 检测异常行为（刷量、spam 等）
- 规则配置: 灵活配置审核规则，支持正则表达式
3.2.4 审核统计
- 审核量统计: 每日/每周/每月审核量趋势
- 通过率统计: 各类内容的通过率分析
- 审核员绩效: 审核员工作量、审核质量统计
- 违规类型分布: 各类违规内容的占比分析
3.3 数据统计模块
3.3.1 数据概览
- 核心指标: 用户数、活跃度、内容数、订单数、收入
- 实时数据: 实时在线用户数、实时请求量
- 趋势图表: 核心指标的趋势变化图
- 数据对比: 同比、环比数据对比
3.3.2 用户统计
- 用户增长: 新增用户、流失用户、净增用户
- 用户活跃: DAU、MAU、活跃率、留存率
- 用户分布: 地域分布、年龄分布、设备分布
- 用户行为: 页面访问、功能使用、停留时长
3.3.3 内容统计
- 内容发布: 发布量、类型分布、热度排名
- 内容互动: 阅读量、点赞数、评论数、分享数
- 内容质量: 优质内容占比、违规内容占比
- 创作者分析: 创作者数量、活跃度、产出量
3.3.4 业务统计
- 订单统计: 订单量、订单金额、退款率
- 支付统计: 支付方式分布、支付成功率
- 收入统计: 总收入、分成收入、手续费收入
- 成本统计: 服务器成本、带宽成本、人力成本
3.3.5 报表生成
- 自定义报表: 选择指标、时间范围、维度生成报表
- 定时报表: 配置报表生成周期，自动发送邮件
- 报表导出: 支持 Excel、PDF、CSV 格式导出
- 报表分享: 生成分享链接，授权查看
3.4 系统配置模块
3.4.1 基础配置
- 站点信息: 站点名称、Logo、favicon、版权信息
- 联系方式: 客服电话、邮箱、地址、社交媒体
- SEO 配置: 站点标题、关键词、描述
- 语言配置: 支持语言、默认语言、语言包管理
3.4.2 业务配置
- 用户配置: 注册方式、登录方式、密码策略
- 内容配置: 内容类型、分类管理、标签管理
- 支付配置: 支付方式、费率配置、结算周期
- 通知配置: 邮件模板、短信模板、推送模板
3.4.3 安全配置
- 登录安全: 验证码策略、登录失败限制、异地登录提醒
- 数据加密: 加密算法、密钥管理、加密范围
- 访问控制: IP 白名单、访问频率限制
- 备份策略: 数据备份周期、备份存储位置
3.4.4 性能配置
- 缓存配置: 缓存策略、缓存过期时间、缓存大小
- CDN 配置: CDN 服务商、加速域名、缓存规则
- 数据库配置: 连接池大小、查询超时时间
- 队列配置: 队列大小、消费者数量、重试策略
3.5 日志监控模块
3.5.1 操作日志
- 登录日志: 用户登录、登出、登录失败
- 操作日志: 增删改查操作、配置变更
- 审核日志: 审核操作、审核结果
- 系统日志: 系统启动、停止、异常
3.5.2 访问日志
- 请求日志: 所有 API 请求记录
- 响应日志: 响应状态码、响应时间
- 错误日志: 错误类型、错误堆栈、错误位置
- 性能日志: 慢查询、慢接口、资源消耗
3.5.3 安全日志
- 安全事件: 暴力破解、SQL 注入、XSS 攻击
- 异常访问: 异常 IP、异常频率、异常行为
- 权限变更: 权限授予、权限回收、角色变更
- 数据泄露: 敏感数据访问、批量导出
3.5.4 监控告警
- 系统监控: CPU、内存、磁盘、网络
- 应用监控: 请求量、响应时间、错误率
- 业务监控: 用户数、订单量、收入
- 告警规则: 阈值配置、告警方式、告警级别

---
4. 数据库设计
4.1 用户相关表
users (用户表)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    real_name VARCHAR(50),
    id_card VARCHAR(20),
    status INTEGER DEFAULT 1, -- 0: 禁用，1: 正常，2: 待审核
    role_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50)
);

roles (角色表)
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

permissions (权限表)
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

4.2 内容相关表
contents (内容表)
CREATE TABLE contents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200),
    content TEXT,
    content_type VARCHAR(50) NOT NULL,
    status INTEGER DEFAULT 0, -- 0: 待审核，1: 已通过，2: 已拒绝
    audit_status INTEGER DEFAULT 0,
    audit_remark TEXT,
    audit_by BIGINT,
    audit_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

audits (审核记录表)
CREATE TABLE audits (
    id BIGSERIAL PRIMARY KEY,
    content_id BIGINT NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    audit_type VARCHAR(50) NOT NULL,
    audit_result INTEGER NOT NULL, -- 0: 待审核，1: 通过，2: 拒绝
    audit_remark TEXT,
    audit_rule VARCHAR(100),
    audit_by BIGINT,
    audit_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES contents(id)
);

4.3 日志相关表
operation_logs (操作日志表)
CREATE TABLE operation_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50),
    target_type VARCHAR(50),
    target_id BIGINT,
    request_method VARCHAR(10),
    request_path VARCHAR(500),
    request_params JSONB,
    response_status INTEGER,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


---
5. API 接口设计
5.1 用户管理接口
GET /api/admin/users
获取用户列表
{
  "page": 1,
  "pageSize": 20,
  "total": 1000,
  "data": [
    {
      "id": 1,
      "username": "user001",
      "email": "user@example.com",
      "status": 1,
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ]
}

GET /api/admin/users/:id
获取用户详情
PUT /api/admin/users/:id
更新用户信息
DELETE /api/admin/users/:id
删除用户
POST /api/admin/users/batch-operate
批量操作用户
5.2 内容审核接口
GET /api/admin/audits/pending
获取待审核列表
POST /api/admin/audits/:id/decision
审核决策
{
  "result": 1, // 1: 通过，2: 拒绝
  "remark": "审核通过"
}

GET /api/admin/audits/rules
获取审核规则
PUT /api/admin/audits/rules
更新审核规则
5.3 数据统计接口
GET /api/admin/stats/overview
获取数据概览
GET /api/admin/stats/users
获取用户统计
GET /api/admin/stats/content
获取内容统计
POST /api/admin/stats/reports
生成报表
5.4 系统配置接口
GET /api/admin/configs
获取所有配置
PUT /api/admin/configs/:key
更新配置项
POST /api/admin/configs/batch
批量更新配置
5.5 日志监控接口
GET /api/admin/logs/operation
获取操作日志
GET /api/admin/logs/access
获取访问日志
GET /api/admin/logs/security
获取安全日志
GET /api/admin/monitoring/metrics
获取监控指标

---
6. 部署架构
6.1 开发环境
# docker-compose.dev.yml
version: '3.8'
services:
  admin-frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:3001
  
  admin-backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/chaintrace_admin
      - REDIS_URL=redis://redis:6379
  
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:

6.2 生产环境
- 前端: Nginx 托管静态文件 + CDN 加速
- 后端: Kubernetes 部署，3 个 replica，HPA 自动扩缩容
- 数据库: PostgreSQL 主从集群，读写分离
- 缓存: Redis 哨兵模式，高可用
- 监控: Prometheus + Grafana 实时监控
- 日志: ELK Stack 集中日志管理
6.3 安全加固
- HTTPS: Let's Encrypt 免费 SSL 证书
- WAF: Cloudflare / AWS WAF 防护
- DDoS 防护: 云服务商 DDoS 防护
- 数据备份: 每日全量备份 + 实时增量备份
- 灾备: 异地灾备中心

---
7. 性能指标
7.1 响应时间
- API 响应: P99 < 200ms
- 页面加载: 首屏 < 2s
- 查询操作: < 1s
- 批量操作: < 10s
7.2 并发能力
- 并发用户: 支持 1000+ 并发用户
- QPS: 支持 5000+ QPS
- 吞吐量: 支持 10000+ 请求/秒
7.3 可用性
- 系统可用性: 99.9%
- 数据可用性: 99.99%
- 故障恢复: < 5 分钟

---
8. 未来规划
8.1 短期目标（3 个月）
- 完成核心功能开发
- 实现基础监控告警
- 优化性能指标
8.2 中期目标（6 个月）
- 引入 AI 审核能力
- 实现智能推荐
- 完善数据分析功能
8.3 长期目标（12 个月）
- 支持多租户 SaaS 模式
- 开放 API 生态
- 国际化支持

---
9. 附录
9.1 术语表
- A 端: 管理端，Admin 端
- RBAC: 基于角色的访问控制
- DAU: 日活跃用户数
- MAU: 月活跃用户数
- QPS: 每秒查询率
9.2 参考资料
- Ant Design 官方文档
- NestJS 官方文档
- PostgreSQL 官方文档
9.3 版本历史
- v1.0 (2026-03-12): 初始版本，完成架构设计文档