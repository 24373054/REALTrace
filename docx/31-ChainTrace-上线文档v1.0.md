ChainTrace 上线文档 v1.0
文档版本: v1.0创建日期: 2026-03-12维护团队: ChainTrace 运维团队

---
📋 目录
1. 上线前检查清单
2. 上线流程
3. 回滚方案
4. 上线后验证
5. 监控与告警
6. 应急预案
7. 上线沟通计划

---
1. 上线前检查清单
1.1 代码与构建
[] 所有功能开发完成并通过代码审查
[] 所有测试用例通过（单元测试/集成测试/端到端测试）
[] 性能测试通过，满足 SLA 要求
[] 安全扫描通过，无高危漏洞
[] 代码已合并到 release 分支
[] 版本号已更新
[] 构建脚本已验证
[] Docker 镜像已构建并推送到仓库
1.2 数据库
[] 数据库迁移脚本已准备
[] 迁移脚本已在测试环境验证
[] 数据库备份已完成
[] 回滚脚本已准备
[] 索引优化已完成
[] 数据清理已完成
1.3 配置与环境
[] 生产环境配置已准备
[] 环境变量已配置
[] 第三方服务配置已确认
[] API 密钥已更新
[] 域名和 SSL 证书已配置
[] CDN 配置已确认
[] 负载均衡配置已确认
1.4 监控与日志
[] 监控指标已配置
[] 告警规则已设置
[] 日志收集已配置
[] APM 追踪已启用
[] 健康检查接口已验证
1.5 文档与培训
[] 用户文档已更新
[] API 文档已更新
[] 运维手册已更新
[] 上线通知已发送
[] 客服团队已培训
[] 技术支持团队已培训
1.6 业务准备
[] 新功能已通知用户
[] 营销活动已准备
[] 客服话术已更新
[] 常见问题解答已更新

---
2. 上线流程
2.1 上线时间窗口
推荐上线时间：
- 工作日: 凌晨 02:00 - 06:00（业务低峰期）
- 周末: 全天（如影响范围小）
避免上线时间：
- 工作日 09:00 - 18:00
- 月初/月末（财务结算期）
- 节假日前后
- 重大活动期间
2.2 上线步骤（详细）
阶段一：准备（T-30 分钟）
# 1. 确认所有人员到位
# 2. 检查监控状态
# 3. 确认备份已完成
# 4. 发送上线开始通知

# 检查服务状态
curl -X GET https://api.chaintrace.com/health

# 检查数据库连接
psql -h db.chaintrace.com -U postgres -c "SELECT version();"

# 检查 Redis 连接
redis-cli -h redis.chaintrace.com ping

阶段二：数据库迁移（T-15 分钟）
# 1. 停止写入（如需）
# 2. 执行数据库迁移
# 3. 验证迁移结果
# 4. 恢复写入

# 执行迁移
cd /app/migrations
pgmigrate up

# 验证迁移
psql -h db.chaintrace.com -U postgres -c "\dt"
psql -h db.chaintrace.com -U postgres -c "SELECT * FROM schema_migrations LIMIT 5;"

# 检查数据完整性
psql -h db.chaintrace.com -U postgres -c "SELECT COUNT(*) FROM users;"
psql -h db.chaintrace.com -U postgres -c "SELECT COUNT(*) FROM transactions;"

阶段三：部署应用（T-0）
# 1. 拉取最新镜像
docker pull registry.chaintrace.com/api:1.0.0
docker pull registry.chaintrace.com/web:1.0.0

# 2. 滚动更新（零停机）
kubectl set image deployment/api-api api=registry.chaintrace.com/api:1.0.0
kubectl set image deployment/web-web web=registry.chaintrace.com/web:1.0.0

# 3. 监控更新进度
kubectl rollout status deployment/api-api
kubectl rollout status deployment/web-web

# 4. 检查 Pod 状态
kubectl get pods -n production
kubectl describe pod api-api-xxxxxxxxx -n production

阶段四：验证功能（T+15 分钟）
# 1. 健康检查
curl -X GET https://api.chaintrace.com/health
curl -X GET https://chaintrace.com/health

# 2. API 测试
curl -X GET https://api.chaintrace.com/v1/addresses/test123 \
  -H "Authorization: Bearer test_token"

# 3. 前端页面检查
# - 打开首页
# - 测试登录
# - 测试核心功能

# 4. 数据库查询验证
curl -X POST https://api.chaintrace.com/v1/addresses/query \
  -H "Content-Type: application/json" \
  -d '{"address": "0x1234...", "chain": "eth"}'

阶段五：观察与监控（T+30 分钟 ~ T+2 小时）
- 实时监控错误率
- 监控响应时间
- 监控资源使用率
- 监控业务指标
- 观察用户反馈
2.3 上线检查点
时间点
检查项
负责人
T-30min
确认准备完成
上线负责人
T-15min
数据库迁移完成
DBA
T-0
应用部署完成
运维工程师
T+5min
服务健康检查通过
运维工程师
T+15min
核心功能验证通过
测试工程师
T+30min
监控指标正常
运维工程师
T+1h
业务指标正常
产品经理
T+2h
上线成功确认
上线负责人

---
3. 回滚方案
3.1 回滚触发条件
必须回滚的情况：
- 核心功能不可用
- 数据丢失或损坏
- 严重性能问题（响应时间 > 10s）
- 错误率 > 5%
- 安全漏洞
考虑回滚的情况：
- 非核心功能异常
- 用户体验问题
- 轻微性能下降
3.2 回滚步骤
快速回滚（10 分钟内）
# 1. 回滚应用版本
kubectl rollout undo deployment/api-api -n production
kubectl rollout undo deployment/web-web -n production

# 2. 监控回滚进度
kubectl rollout status deployment/api-api -n production
kubectl rollout status deployment/web-web -n production

# 3. 验证回滚成功
curl -X GET https://api.chaintrace.com/health
curl -X GET https://api.chaintrace.com/v1/version

完整回滚（含数据库，30 分钟内）
# 1. 回滚应用（同上）

# 2. 回滚数据库
# 停止服务
kubectl scale deployment/api-api --replicas=0 -n production

# 恢复数据库备份
pg_restore -h db.chaintrace.com -U postgres -d chaintrace \
  /backup/chaintrace_20260312_020000.dump

# 恢复服务
kubectl scale deployment/api-api --replicas=5 -n production

# 3. 验证回滚
psql -h db.chaintrace.com -U postgres -c "SELECT COUNT(*) FROM users;"

3.3 回滚决策流程
发现问题 → 评估影响 → 5 分钟内决策 → 执行回滚 → 验证回滚 → 通知相关方
           ↓
    是否影响核心功能？
    是 → 立即回滚
    否 → 快速修复或回滚


---
4. 上线后验证
4.1 功能验证清单
核心功能：
[] 用户登录/注册
[] 地址查询
[] 交易查询
[] 资金流向分析
[] 风险评分
[] 报告生成
[] 数据导出
API 接口：
[] GET /v1/addresses/{address}
[] GET /v1/transactions/{txid}
[] POST /v1/analysis/flow
[] POST /v1/analysis/risk
[] GET /v1/reports/{report_id}
前端页面：
[] 首页加载正常
[] 登录页面正常
[] 查询页面正常
[] 结果展示正常
[] 图表渲染正常
4.2 性能验证
# 压力测试
wrk -t12 -c400 -d30s https://api.chaintrace.com/v1/addresses/test

# 预期结果：
# - QPS: > 1000
# - 平均响应时间：< 200ms
# - P99 响应时间：< 500ms
# - 错误率：< 0.1%

4.3 业务验证
[] 查询结果准确
[] 风险评分合理
[] 报告内容完整
[] 数据更新及时

---
5. 监控与告警
5.1 监控指标
基础设施监控：
- CPU 使用率（阈值：80%）
- 内存使用率（阈值：85%）
- 磁盘使用率（阈值：80%）
- 网络带宽（阈值：70%）
应用监控：
- 请求量（QPS）
- 响应时间（P50/P90/P99）
- 错误率（HTTP 5xx）
- 吞吐量
业务监控：
- 活跃用户数
- 查询次数
- 报告生成数
- API 调用量
数据库监控：
- 连接数
- 慢查询数
- 锁等待
- 主从延迟
5.2 告警规则
指标
警告阈值
严重阈值
通知方式
CPU 使用率
> 80% (5min)
> 90% (2min)
飞书 + 短信
内存使用率
> 85% (5min)
> 95% (1min)
飞书 + 短信
错误率
> 1% (5min)
> 5% (1min)
飞书 + 电话
响应时间 P99
> 1s (5min)
> 3s (1min)
飞书
服务不可用
-
> 0 (1min)
飞书 + 电话
数据库主从延迟
> 10s
> 60s
飞书 + 短信
5.3 告警响应
P0 告警（电话 + 飞书）：
- 响应时间：≤ 5 分钟
- 处理人员：值班工程师 + 技术负责人
P1 告警（短信 + 飞书）：
- 响应时间：≤ 15 分钟
- 处理人员：值班工程师
P2 告警（飞书）：
- 响应时间：≤ 1 小时
- 处理人员：对应负责人

---
6. 应急预案
6.1 常见故障处理
服务不可用
# 1. 检查 Pod 状态
kubectl get pods -n production

# 2. 重启异常 Pod
kubectl delete pod api-api-xxxxxxxxx -n production

# 3. 检查日志
kubectl logs api-api-xxxxxxxxx -n production --tail=100

# 4. 如无法恢复，回滚版本
kubectl rollout undo deployment/api-api -n production

数据库连接失败
# 1. 检查数据库状态
kubectl get pods -n database
psql -h db.chaintrace.com -U postgres -c "SELECT 1;"

# 2. 检查连接数
psql -h db.chaintrace.com -U postgres -c \
  "SELECT count(*) FROM pg_stat_activity;"

# 3. 清理僵尸连接
psql -h db.chaintrace.com -U postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity \
   WHERE state = 'idle' AND query_start < NOW() - INTERVAL '1 hour';"

# 4. 如主库故障，切换从库
# （需 DBA 操作）

响应时间过长
# 1. 检查慢查询
psql -h db.chaintrace.com -U postgres -c \
  "SELECT query, calls, mean_time FROM pg_stat_statements \
   ORDER BY mean_time DESC LIMIT 10;"

# 2. 检查资源使用
kubectl top pods -n production

# 3. 临时扩容
kubectl scale deployment/api-api --replicas=10 -n production

# 4. 开启降级模式
# 设置环境变量 ENABLE_DEGRADATION=true

6.2 紧急联系人
角色
姓名
电话
飞书
技术负责人
-
-
-
运维负责人
-
-
-
DBA
-
-
-
后端负责人
-
-
-
前端负责人
-
-
-

---
7. 上线沟通计划
7.1 沟通对象
内部沟通：
- 开发团队
- 测试团队
- 运维团队
- 产品团队
- 客服团队
- 管理层
外部沟通：
- 企业客户（提前通知）
- 公开公告（如需）
- 社交媒体（如需）
7.2 沟通时间点
时间
对象
内容
方式
T-3 天
全员
上线预告
飞书群
T-1 天
相关人员
上线确认
会议
T-30min
相关人员
上线开始
飞书群
T+30min
相关人员
上线进度
飞书群
T+2h
全员
上线成功
飞书群
T+24h
管理层
上线总结
邮件
7.3 沟通模板
上线预告：
【上线预告】ChainTrace v1.0 将于 3 月 15 日凌晨 02:00 上线

主要更新：
- 新增功能：XXX
- 优化改进：XXX
- Bug 修复：XXX

预计影响：服务会有 5 分钟短暂不可用
回滚方案：已准备

如有疑问，请联系：@技术负责人

上线成功：
【上线成功】ChainTrace v1.0 已成功上线！

上线时间：2026-03-15 02:00 - 02:30
上线内容：XXX
验证结果：所有功能正常，监控指标正常

感谢各位的辛勤工作！🎉


---
📞 联系方式
- 上线负责人: -
- 技术负责人: -
- 运维负责人: -
- 紧急联系: 见应急预案

---
最后更新: 2026-03-12