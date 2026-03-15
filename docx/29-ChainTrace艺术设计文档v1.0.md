ChainTrace 管理端（A 端）注册登录流程设计
文档信息
- 版本: v1.0
- 创建时间: 2026-03-12
- 维护团队: ChainTrace 产品团队
- 文档状态: 已完成

---
1. 概述
1.1 设计目标
- 最高安全: 严格身份验证，多重安全机制
- 权限控制: 细粒度权限管理
- 审计追踪: 完整操作审计日志
- 便捷管理: 高效的管理员工作流程
1.2 适用范围
本文档适用于 ChainTrace 管理端 (A 端) 的注册和登录流程，包括:
- 管理员账号创建
- 管理员权限分配
- 管理端登录流程
- 安全审计机制
1.3 用户角色
- 超级管理员: 系统最高权限，管理所有功能
- 系统管理员: 系统配置、用户管理
- 内容管理员: 内容审核、数据管理
- 运营管理员: 运营配置、数据分析
- 安全管理员: 安全策略、审计日志

---
2. 管理员账号创建
2.1 创建方式
2.1.1 系统初始化创建
流程:
1. 系统首次部署
2. 运行初始化脚本
3. 输入超级管理员信息
4. 设置强密码
5. 配置安全设置
6. 创建完成

初始化脚本:
# 初始化超级管理员
npm run init:admin

# 输入信息
Email: admin@chaintrace.io
Password: [强密码]
Confirm Password: [确认密码]
Name: 管理员姓名
Phone: 手机号码

2.1.2 超级管理员创建
流程:
1. 超级管理员登录管理后台
2. 进入用户管理
3. 点击"创建管理员"
4. 填写管理员信息
5. 分配角色和权限
6. 设置安全策略
7. 发送邀请邮件
8. 管理员激活账号

2.1.3 HR 系统同步
适用场景: 大型企业同步方式:
- LDAP/AD 集成
- SSO 同步
- API 同步
2.2 账号信息
2.2.1 必填信息
interface AdminAccount {
  // 基本信息
  username: string;           // 用户名 (唯一)
  email: string;              // 邮箱
  phone: string;              // 手机号
  realName: string;           // 真实姓名
  department: string;         // 部门
  position: string;           // 职位
  
  // 角色权限
  roles: string[];            // 角色列表
  permissions: string[];      // 权限列表
  dataScope: string;          // 数据范围
  
  // 安全设置
  passwordPolicy: string;     // 密码策略
  require2FA: boolean;        // 强制 2FA
  mfaType: string;            // MFA 类型
  ipWhitelist?: string[];     // IP 白名单
  loginHours?: string;        // 允许登录时段
  
  // 账号状态
  status: 'active' | 'inactive' | 'locked' | 'expired';
  createdBy: string;          // 创建人
  createdAt: string;          // 创建时间
  expiresAt?: string;         // 过期时间
}

2.2.2 信息验证
邮箱验证:
- 格式验证
- 域名验证 (必须企业邮箱)
- 重复性检查
手机号验证:
- 格式验证
- 短信验证码
- 重复性检查
用户名验证:
- 4-20 位字符
- 字母开头
- 只能包含字母、数字、下划线
- 不能与现有用户名重复
2.3 邀请流程
2.3.1 发送邀请
邀请邮件模板:
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ChainTrace 管理后台邀请</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://chaintrace.io/logo.png" alt="ChainTrace" style="height: 50px;">
  </div>
  
  <h2 style="color: #333;">您被邀请成为 ChainTrace 管理员</h2>
  
  <p style="color: #666; line-height: 1.6;">
    <strong>{INVITER_NAME}</strong> 邀请您成为 ChainTrace 管理后台的管理员。
  </p>
  
  <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <p style="margin: 10px 0;"><strong>角色:</strong> {ROLE_NAME}</p>
    <p style="margin: 10px 0;"><strong>部门:</strong> {DEPARTMENT}</p>
    <p style="margin: 10px 0;"><strong>权限范围:</strong> {DATA_SCOPE}</p>
  </div>
  
  <div style="background: #fffbe6; border: 1px solid #faad14; padding: 15px; margin: 20px 0; border-radius: 6px;">
    <p style="margin: 0; color: #856404;">
      <strong>⚠️ 安全提醒:</strong><br>
      管理账号具有系统操作权限，请妥善保管账号信息，不要泄露给他人。
    </p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{INVITE_LINK}" style="background: #1890ff; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
      激活账号
    </a>
  </div>
  
  <p style="color: #999; font-size: 14px;">
    此邀请链接有效期为 48 小时，仅限一次使用。
  </p>
</body>
</html>

2.3.2 激活流程
1. 接收邀请邮件
2. 点击激活链接
3. 设置登录密码 (强密码策略)
4. 配置 2FA(强制)
5. 保存备用码
6. 账号激活成功


---
3. 登录流程
3.1 登录方式
3.1.1 账号密码 +2FA
标准流程:
1. 输入用户名
2. 输入密码
3. 输入 2FA 验证码
4. 登录成功

安全机制:
- 密码错误 5 次锁定 30 分钟
- 2FA 错误 3 次锁定 15 分钟
- 异地登录需要额外验证
- 新设备登录需要审批
3.1.2 硬件密钥登录
支持的密钥:
- YubiKey
- Google Titan
- Feitian ePass
登录流程:
1. 输入用户名
2. 插入硬件密钥
3. 触摸密钥确认
4. 登录成功

3.1.3 生物识别登录
支持的识别:
- 指纹识别
- 面部识别
- 虹膜识别
前提条件:
- 设备支持生物识别
- 已注册生物特征
- 配合密码或 2FA 使用
3.2 安全验证
3.2.1 IP 白名单
配置方式:
- 超级管理员配置全局白名单
- 系统管理员配置部门白名单
- 个人配置个人白名单
白名单格式:
192.168.1.0/24
10.0.0.0/8
203.0.113.42

3.2.2 登录时段限制
配置示例:
{
  "enabled": true,
  "schedule": [
    {
      "day": "weekday",
      "start": "08:00",
      "end": "20:00"
    }
  ],
  "timezone": "Asia/Shanghai"
}

3.2.3 设备信任
信任设备:
- 已验证的设备
- 在安全网络内
- 30 天内免 2FA
设备管理:
- 查看信任设备列表
- 移除信任设备
- 设置信任期限
3.3 登录失败处理
3.3.1 失败策略
失败类型
次数
锁定时间
通知方式
密码错误
5 次
30 分钟
邮件 + 短信
2FA 错误
3 次
15 分钟
邮件
IP 违规
3 次
1 小时
邮件 + 短信
时段违规
不限
直到允许时段
无
3.3.2 解锁方式
自动解锁: 等待锁定时间结束手动解锁: 超级管理员解锁密码重置: 通过安全流程重置

---
4. 权限管理
4.1 角色定义
4.1.1 超级管理员
权限:
- 全部系统权限
- 管理员管理
- 系统配置
- 数据访问
- 审计日志
- 安全策略
4.1.2 系统管理员
权限:
- 用户管理
- 角色管理
- 系统配置
- 日志查看
- 无超级管理员权限
4.1.3 内容管理员
权限:
- 内容审核
- 数据管理
- 标签管理
- 无用户管理权限
4.1.4 运营管理员
权限:
- 运营配置
- 数据分析
- 报告管理
- 无系统配置权限
4.1.5 安全管理员
权限:
- 安全策略
- 审计日志
- 风险监控
- 无业务操作权限
4.2 权限矩阵
功能模块
超级管理员
系统管理员
内容管理员
运营管理员
安全管理员
用户管理
✅
✅
❌
❌
⚠️
角色管理
✅
✅
❌
❌
❌
系统配置
✅
✅
❌
⚠️
⚠️
内容审核
✅
⚠️
✅
❌
❌
数据管理
✅
⚠️
✅
⚠️
❌
运营配置
✅
❌
❌
✅
❌
数据分析
✅
⚠️
⚠️
✅
⚠️
安全策略
✅
⚠️
❌
❌
✅
审计日志
✅
✅
❌
❌
✅
✅ = 完全权限⚠️ = 只读权限❌ = 无权限
4.3 数据范围
4.3.1 范围类型
- 全部数据: 访问所有数据
- 本部门数据: 仅访问本部门数据
- 本人数据: 仅访问本人创建的数据
- 自定义范围: 自定义数据筛选条件
4.3.2 范围配置
interface DataScope {
  type: 'all' | 'department' | 'self' | 'custom';
  departments?: string[];      // 部门列表
  conditions?: any;            // 自定义条件
}


---
5. 安全审计
5.1 审计日志
5.1.1 日志内容
登录事件:
{
  "eventType": "login",
  "timestamp": "2026-03-12T10:00:00Z",
  "userId": "admin001",
  "username": "zhangsan",
  "ip": "192.168.1.100",
  "location": "北京",
  "device": "Chrome on Windows",
  "result": "success",
  "details": {
    "loginType": "password+2fa",
    "duration": 5
  }
}

操作事件:
{
  "eventType": "operation",
  "timestamp": "2026-03-12T10:05:00Z",
  "userId": "admin001",
  "username": "zhangsan",
  "action": "user.delete",
  "resource": "user:12345",
  "ip": "192.168.1.100",
  "result": "success",
  "details": {
    "deletedUser": "test@example.com",
    "reason": "离职员工"
  }
}

5.1.2 日志存储
- 存储期限: 180 天
- 存储位置: 专用审计数据库
- 访问权限: 仅安全管理员
- 数据加密: AES-256 加密存储
5.2 异常检测
5.2.1 检测规则
异常登录:
- 非工作时间登录
- 异地登录
- 新设备登录
- 频繁登录失败
异常操作:
- 批量删除数据
- 导出大量数据
- 修改敏感配置
- 权限变更
异常访问:
- 访问频率异常
- 访问敏感数据
- 越权访问尝试
5.2.2 告警处理
告警级别:
- 紧急: 立即电话通知安全管理员
- 重要: 邮件 + 短信通知
- 一般: 邮件通知
处理流程:
异常检测 → 告警通知 → 人工审核 → 处理措施 → 记录归档

处理措施:
- 临时锁定账号
- 强制下线
- 密码重置
- 权限回收
- 安全调查

---
6. 附录
6.1 版本历史
- v1.0 (2026-03-12): 初始版本，完成管理端注册登录流程设计
6.2 参考资料
- NIST Identity and Access Management Guidelines
- OWASP Authentication Guidelines
6.3 相关文档
- 用户端注册登录流程
- 商家端注册登录流程
- 系统架构设计