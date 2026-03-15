ChainTrace 技术选型
文档信息
- 版本: v1.0
- 创建时间: 2026-03-12
- 维护团队: ChainTrace 架构团队
- 文档状态: 已完成

---
1. 技术选型原则
1.1 选型标准
- 成熟度: 选择经过大规模验证的成熟技术
- 社区活跃度: 活跃的开源社区和持续更新
- 生态系统: 完善的生态工具和第三方集成
- 性能: 满足高并发、低延迟的业务需求
- 可维护性: 代码清晰、文档完善、易于维护
- 成本: 综合考虑许可成本、学习成本、运维成本
- 安全性: 良好的安全记录和及时的安全更新
1.2 技术栈分层
┌─────────────────────────────────────────┐
│           前端层 (Presentation)          │
│      React + TypeScript + Vite          │
├─────────────────────────────────────────┤
│           后端层 (Application)           │
│      NestJS + TypeScript + PostgreSQL   │
├─────────────────────────────────────────┤
│           数据层 (Data)                  │
│  PostgreSQL + Redis + Elasticsearch     │
├─────────────────────────────────────────┤
│           基础设施层 (Infrastructure)    │
│  Docker + Kubernetes + Prometheus       │
└─────────────────────────────────────────┘


---
2. 前端技术选型
2.1 核心框架
React 18.x
选择理由:
- 成熟的生态系统，丰富的组件库
- 虚拟 DOM 性能优秀
- 支持 Server Components (RSC)
- 社区活跃，人才储备充足
- TypeScript 支持完善
版本: React 18.2+关键特性:
- Concurrent Rendering
- Automatic Batching
- Suspense for Data Fetching
- useTransition, useDeferredValue
TypeScript 5.0+
选择理由:
- 静态类型检查，减少运行时错误
- 更好的 IDE 支持
- 代码可维护性强
- 团队开发协作友好
配置:
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}

2.2 构建工具
Vite 5.0+
选择理由:
- 基于 ESM，启动速度极快
- 原生支持 TypeScript、JSX
- HMR 性能优秀
- 插件生态丰富
- 打包优化自动配置
对比 Webpack:
- 启动速度：Vite 快 10-100 倍
- HMR 速度：Vite 几乎瞬时
- 配置复杂度：Vite 更简单
- 打包大小：相当 (都使用 Rollup)
2.3 UI 组件库
Ant Design 5.0+
选择理由:
- 企业级 UI 组件库，组件丰富
- 支持 Theme 定制 (CSS Variables)
- TypeScript 支持完善
- 文档完善，示例丰富
- 社区活跃
关键特性:
- 5.0 版本全面支持 CSS Variables
- 更灵活的 Theme 定制
- 性能优化
- 更好的无障碍支持
2.4 状态管理
Zustand
选择理由:
- API 简洁，学习成本低
- 体积小 (~1KB)
- 支持 TypeScript
- 支持中间件
- 无 Provider 包裹
对比 Redux:
- 代码量：Zustand 少 60%
- 学习曲线：Zustand 更平缓
- 性能：相当
- 生态：Redux 更丰富
TanStack Query (React Query)
选择理由:
- 服务端状态管理最佳实践
- 自动缓存、重试、去重
- 乐观更新支持
- TypeScript 支持完善
使用场景:
- API 数据获取
- 缓存管理
- 乐观更新
- 轮询
2.5 路由管理
React Router 6.x
选择理由:
- React 官方推荐
- 支持嵌套路由
- 支持路由懒加载
- TypeScript 支持完善
- 社区生态丰富
关键特性:
- 声明式路由
- 路由守卫
- 路由传参
- 路由动画
2.6 表单管理
Formily
选择理由:
- 企业级表单解决方案
- 支持复杂表单场景
- 表单引擎强大
- 支持 React/Vue
- TypeScript 支持完善
对比 Formik:
- 复杂度：Formily 支持更复杂场景
- 性能：Formily 更优 (细粒度响应式)
- 生态：Formik 更成熟
- 学习曲线：Formik 更简单
选型决策: 简单表单用 Formik，复杂表单用 Formily
2.7 图表可视化
AntV G2
选择理由:
- 阿里开源，成熟稳定
- 声明式 API，易上手
- 图表类型丰富
- 支持自定义图形
- TypeScript 支持完善
ECharts
选择理由:
- 百度开源，生态丰富
- 图表类型最丰富
- 性能优秀
- 配置项丰富
- 社区活跃
使用场景:
- G2: 关系图、力导向图、自定义图形
- ECharts: 常规统计图表 (折线图、柱状图、饼图等)
2.8 代码规范
ESLint + Prettier + Husky
工具组合:
- ESLint: 代码 lint 检查
- Prettier: 代码格式化
- Husky: Git hooks 管理
- lint-staged:  staged 文件 lint
配置文件:
// .eslintrc.js
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
}


---
3. 后端技术选型
3.1 核心框架
NestJS 10.x
选择理由:
- 基于 TypeScript，类型安全
- 模块化架构，代码组织清晰
- 内置依赖注入
- 支持微服务架构
- 生态丰富 (装饰器、中间件、管道等)
- 学习曲线平缓 (类 Angular 设计)
对比 Express/Fastify:
- 架构：NestJS 更结构化
- 类型安全：NestJS 更优 (TypeScript 原生)
- 性能：Fastify > NestJS > Express
- 学习成本：Express < NestJS
- 企业级特性：NestJS 更完善
核心特性:
- 依赖注入 (DI)
- 控制层 (Controller)
- 业务层 (Service)
- 数据层 (Repository)
- 中间件 (Middleware)
- 管道 (Pipe)
- 守卫 (Guard)
- 过滤器 (Exception Filter)
3.2 数据库
PostgreSQL 15.x
选择理由:
- 开源关系型数据库，功能强大
- 支持 JSONB，兼具 NoSQL 特性
- 支持全文搜索
- 支持地理空间数据 (PostGIS)
- 社区活跃，生态丰富
- 性能优秀，稳定性高
对比 MySQL:
- 功能：PostgreSQL 更丰富
- JSON 支持：PostgreSQL (JSONB) 更优
- 并发性能：相当
- 生态：MySQL 略优
- 学习曲线：相当
关键特性:
- JSONB 类型
- 全文搜索 (tsvector)
- 行列级权限控制
- 物化视图
- 并行查询
TypeORM
选择理由:
- NestJS 官方推荐 ORM
- 支持 TypeScript
- 支持多种数据库
- 支持关系映射
- 迁移工具完善
对比 Prisma:
- 成熟度：TypeORM 更成熟
- 类型安全：Prisma 更优
- 性能：Prisma 略优
- 功能：TypeORM 更丰富
- 学习曲线：Prisma 更简单
选型决策: TypeORM (功能丰富，与 NestJS 集成好)
3.3 缓存
Redis 7.x
选择理由:
- 高性能内存数据库
- 支持多种数据结构
- 支持持久化
- 支持集群模式
- 生态丰富
使用场景:
- 会话存储 (Session)
- 热点数据缓存
- 分布式锁
- 消息队列
- 计数器
ioredis
选择理由:
- Node.js Redis 客户端
- 支持 Redis 集群
- 支持 Sentinel
- 性能优秀
- TypeScript 支持完善
3.4 搜索引擎
Elasticsearch 8.x
选择理由:
- 分布式搜索引擎
- 全文搜索性能优秀
- 支持聚合分析
- 支持实时搜索
- 生态丰富 (Kibana、Logstash)
使用场景:
- 全文搜索
- 日志检索
- 数据分析
- 监控告警
@elastic/elasticsearch
选择理由:
- 官方 Node.js 客户端
- 支持 TypeScript
- API 完整
- 文档完善
3.5 消息队列
RabbitMQ
选择理由:
- 成熟稳定，广泛使用
- 支持多种消息协议
- 支持消息持久化
- 支持消息确认
- 管理界面友好
对比 Kafka:
- 使用场景：RabbitMQ 适合业务消息，Kafka 适合日志/流处理
- 性能：Kafka 吞吐量更高
- 复杂度：RabbitMQ 更简单
- 生态：相当
选型决策: RabbitMQ (业务消息队列)
amqplib
选择理由:
- RabbitMQ 官方 Node.js 客户端
- 支持 TypeScript
- API 完整
3.6 任务调度
BullMQ
选择理由:
- 基于 Redis 的任务队列
- 支持延迟任务
- 支持重复任务 (cron)
- 支持任务优先级
- 支持任务重试
- 支持进度跟踪
使用场景:
- 异步任务处理
- 定时任务
- 延迟任务
- 任务队列管理
3.7 API 文档
Swagger / OpenAPI 3.0
选择理由:
- 行业标准 API 文档规范
- 自动生成文档
- 支持在线调试
- 支持代码生成
- 生态丰富
@nestjs/swagger
选择理由:
- NestJS 官方 Swagger 集成
- 装饰器自动生成文档
- 支持 TypeScript
- 配置简单

---
4. 数据存储选型
4.1 对象存储
MinIO
选择理由:
- 开源对象存储
- S3 兼容
- 自部署，数据可控
- 性能优秀
- 支持分布式部署
对比 AWS S3:
- 成本：MinIO 更低 (自部署)
- 控制：MinIO 更自主
- 生态：S3 更丰富
- 运维：S3 无需运维
选型决策:
- 开发/测试：MinIO 自部署
- 生产：AWS S3 / 阿里云 OSS
4.2 时序数据库
TimescaleDB
选择理由:
- 基于 PostgreSQL 的时序数据库
- 兼容 PostgreSQL 生态
- 支持 SQL 查询
- 支持自动分区
- 支持连续聚合
使用场景:
- 监控数据
- 日志数据
- 指标数据

---
5. 基础设施选型
5.1 容器化
Docker
选择理由:
- 行业标准容器技术
- 生态丰富
- 工具链完善
- 社区活跃
Docker Compose
选择理由:
- 多容器应用编排
- 配置简单
- 开发环境友好
5.2 容器编排
Kubernetes
选择理由:
- 行业标准容器编排
- 自动化部署、扩展、管理
- 生态丰富
- 云厂商支持
使用场景:
- 生产环境部署
- 微服务架构
- 自动扩缩容
5.3 监控告警
Prometheus
选择理由:
- 开源监控解决方案
- 时间序列数据库
- 强大的查询语言 (PromQL)
- 生态丰富
- Kubernetes 原生支持
Grafana
选择理由:
- 开源可视化平台
- 支持多种数据源
- 丰富的可视化组件
- 告警功能完善
- dashboard 模板丰富
5.4 日志管理
ELK Stack
组件:
- Elasticsearch: 日志存储和检索
- Logstash: 日志收集和处理
- Kibana: 日志可视化和分析
替代方案: Loki + Grafana (更轻量)
5.5 CI/CD
GitHub Actions
选择理由:
- 集成在 GitHub
- 配置简单 (YAML)
- 生态丰富
- 免费额度充足
- 支持自托管 runner
对比 GitLab CI:
- 集成度：相当
- 易用性：GitHub Actions 略优
- 生态：相当
- 成本：相当
5.6 反向代理
Nginx
选择理由:
- 高性能 HTTP 服务器
- 反向代理、负载均衡
- 配置灵活
- 生态丰富
- 稳定性高
Traefik
选择理由:
- 现代 HTTP 反向代理
- Kubernetes 原生支持
- 自动证书管理 (Let's Encrypt)
- 动态配置
- middleware 丰富
选型决策:
- 开发环境：Traefik
- 生产环境：Nginx

---
6. 开发工具选型
6.1 版本控制
Git
分支策略: Git Flow
- main: 生产分支
- develop: 开发分支
- feature/: 功能分支
- release/: 发布分支
- hotfix/: 热修复分支
6.2 代码质量
工具组合
- ESLint: 代码 lint
- Prettier: 代码格式化
- Husky: Git hooks
- lint-staged: staged 文件 lint
- commitlint: commit 规范
- cz-git: commit 助手
6.3 测试工具
Jest
选择理由:
- 全功能测试框架
- 支持单元测试、集成测试
- 支持 Mock
- 支持覆盖率统计
- TypeScript 支持完善
Supertest
选择理由:
- HTTP 测试库
- 与 Jest 集成好
- API 测试友好
6.4 性能测试
k6
选择理由:
- 现代性能测试工具
- 基于 JavaScript
- 云原生友好
- 支持 CI/CD 集成
- 报告丰富

---
7. 安全相关选型
7.1 认证鉴权
JWT (JSON Web Token)
选择理由:
- 无状态，易于扩展
- 标准规范
- 生态丰富
- 支持刷新令牌
@nestjs/jwt
选择理由:
- NestJS 官方 JWT 集成
- 配置简单
- 支持刷新令牌
7.2 密码加密
bcrypt
选择理由:
- 成熟可靠的密码哈希算法
- 支持盐值
- 防彩虹表攻击
- 社区广泛使用
7.3 数据加密
crypto (Node.js 内置)
使用场景:
- AES-256 对称加密
- RSA 非对称加密
- HMAC 签名
7.4 安全中间件
helmet
选择理由:
- 设置 HTTP 安全头
- 防止常见 Web 攻击
- 配置简单
cors
选择理由:
- 跨域配置
- 灵活控制
- NestJS 内置支持

---
8. 技术栈总结
8.1 完整技术栈
前端:
  - React 18.x + TypeScript 5.0
  - Vite 5.0 (构建工具)
  - Ant Design 5.0 (UI 组件)
  - Zustand (状态管理)
  - TanStack Query (服务端状态)
  - React Router 6 (路由)
  - Formily (表单)
  - AntV G2 + ECharts (图表)

后端:
  - NestJS 10.x + TypeScript 5.0
  - PostgreSQL 15.x (关系数据库)
  - Redis 7.x (缓存)
  - Elasticsearch 8.x (搜索引擎)
  - RabbitMQ (消息队列)
  - BullMQ (任务队列)
  - MinIO (对象存储)
  - TypeORM (ORM)
  - Swagger (API 文档)

基础设施:
  - Docker + Docker Compose
  - Kubernetes (生产环境)
  - Prometheus + Grafana (监控)
  - ELK Stack (日志)
  - GitHub Actions (CI/CD)
  - Nginx (反向代理)

开发工具:
  - Git (版本控制)
  - ESLint + Prettier (代码规范)
  - Jest (测试)
  - k6 (性能测试)

8.2 技术栈优势
- TypeScript 全栈: 前后端统一语言，降低学习成本
- 成熟稳定: 所有技术都经过大规模验证
- 生态丰富: 完善的技术生态和工具链
- 性能优秀: 满足高并发、低延迟需求
- 易于维护: 代码结构清晰，文档完善
- 社区活跃: 遇到问题容易找到解决方案
8.3 技术栈成本
- 学习成本: 中等 (TypeScript 需要学习)
- 运维成本: 中等 (需要维护多个服务)
- 人力成本: 中等 (需要全栈工程师)
- 许可成本: 低 (大部分开源免费)

---
9. 附录
9.1 版本历史
- v1.0 (2026-03-12): 初始版本，完成技术选型文档
9.2 参考资料
- NestJS 官方文档
- React 官方文档
- PostgreSQL 官方文档
- TypeScript 官方文档
9.3 相关文档
- 架构设计文档
- 数据库设计文档
- 部署方案文档