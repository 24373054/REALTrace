ChainTrace 子模块接口文档
文档信息
- 版本: v1.0
- 创建时间: 2026-03-12
- 维护团队: ChainTrace 开发团队
- 文档状态: 已完成

---
1. 接口概述
1.1 基本信息
- API 版本: v1
- 基础 URL: https://api.chaintrace.io/api/v1
- 认证方式: JWT Bearer Token
- 数据格式: JSON
- 字符编码: UTF-8
- 时区: UTC+8
1.2 接口规范
- RESTful 风格: 使用 HTTP 方法表示操作
- 版本控制: URL 路径包含版本号 (/api/v1/)
- 错误处理: 统一错误码和错误消息格式
- 分页支持: 支持 offset/limit 分页
- 速率限制: 根据会员等级限制调用频率
1.3 认证流程
获取 Token
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 900,
    "token_type": "Bearer"
  }
}

使用 Token
GET /api/v1/addresses/0x123...
Authorization: Bearer eyJhbGc...


---
2. 用户模块接口
2.1 用户认证
2.1.1 用户登录
请求:
POST /api/v1/auth/login
Content-Type: application/json

请求参数:
{
  "email": "string",  // 必填，用户邮箱
  "password": "string",  // 必填，用户密码
  "remember_me": "boolean"  // 可选，是否记住登录状态，默认 false
}

响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "string",  // 访问令牌
    "refresh_token": "string",  // 刷新令牌
    "expires_in": 900,  // 过期时间 (秒)
    "token_type": "Bearer",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "avatar": "string",
      "membership": "free"
    }
  }
}

2.1.2 刷新 Token
请求:
POST /api/v1/auth/refresh
Content-Type: application/json

请求参数:
{
  "refresh_token": "string"  // 必填，刷新令牌
}

响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "string",
    "expires_in": 900
  }
}

2.1.3 用户登出
请求:
POST /api/v1/auth/logout
Authorization: Bearer {token}

响应:
{
  "code": 0,
  "message": "success"
}

2.2 用户信息
2.2.1 获取当前用户信息
请求:
GET /api/v1/users/me
Authorization: Bearer {token}

响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "phone": "string",
    "avatar": "string",
    "real_name": "string",
    "membership": {
      "level": "basic",
      "expire_at": "2026-12-31T23:59:59Z",
      "features": []
    },
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-12T00:00:00Z"
  }
}

2.2.2 更新用户信息
请求:
PUT /api/v1/users/me
Authorization: Bearer {token}
Content-Type: application/json

请求参数:
{
  "username": "string",  // 可选，用户名
  "avatar": "string",  // 可选，头像 URL
  "phone": "string",  // 可选，手机号
  "real_name": "string"  // 可选，真实姓名
}

响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}

2.2.3 修改密码
请求:
PUT /api/v1/users/me/password
Authorization: Bearer {token}
Content-Type: application/json

请求参数:
{
  "old_password": "string",  // 必填，旧密码
  "new_password": "string"   // 必填，新密码
}

响应:
{
  "code": 0,
  "message": "success"
}


---
3. 地址模块接口
3.1 地址查询
3.1.1 获取地址详情
请求:
GET /api/v1/addresses/{address}
Authorization: Bearer {token}

路径参数:
- address: 区块链地址 (必填)
查询参数:
- chain: 区块链类型 (可选，默认 auto)，enum: [eth, btc, bsc, polygon]
- include_transactions: 是否包含交易列表 (可选，默认 false)
- transaction_limit: 交易列表数量限制 (可选，默认 20)
响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "address": "0x123...",
    "chain": "eth",
    "type": "contract",
    "balance": {
      "eth": "1.234",
      "usd": "2345.67"
    },
    "risk_score": 45,
    "risk_level": "medium",
    "tags": ["exchange", "verified"],
    "first_seen": "2023-01-01T00:00:00Z",
    "last_seen": "2026-03-12T00:00:00Z",
    "transaction_count": 1234,
    "transactions": [
      {
        "hash": "0xabc...",
        "from": "0x123...",
        "to": "0x456...",
        "value": "1.0",
        "timestamp": "2026-03-12T10:00:00Z"
      }
    ]
  }
}

3.1.2 批量查询地址
请求:
POST /api/v1/addresses/batch
Authorization: Bearer {token}
Content-Type: application/json

请求参数:
{
  "addresses": ["0x123...", "0x456...", "0x789..."],  // 必填，地址列表，最多 100 个
  "chain": "eth"  // 可选，区块链类型
}

响应:
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "address": "0x123...",
      "risk_score": 45,
      "risk_level": "medium"
    },
    {
      "address": "0x456...",
      "risk_score": 85,
      "risk_level": "high"
    }
  ]
}

3.2 地址收藏
3.2.1 添加收藏
请求:
POST /api/v1/favorites
Authorization: Bearer {token}
Content-Type: application/json

请求参数:
{
  "address": "string",  // 必填，区块链地址
  "label": "string",  // 可选，标签名称
  "tags": ["string"],  // 可选，标签数组
  "note": "string"  // 可选，备注
}

响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "address": "string",
    "label": "string",
    "created_at": "2026-03-12T00:00:00Z"
  }
}

3.2.2 获取收藏列表
请求:
GET /api/v1/favorites
Authorization: Bearer {token}

查询参数:
- page: 页码 (可选，默认 1)
- pageSize: 每页数量 (可选，默认 20)
- label: 标签筛选 (可选)
响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string",
        "address": "string",
        "label": "string",
        "tags": [],
        "risk_score": 45,
        "created_at": "2026-03-12T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}

3.2.3 删除收藏
请求:
DELETE /api/v1/favorites/{id}
Authorization: Bearer {token}

响应:
{
  "code": 0,
  "message": "success"
}


---
4. 交易模块接口
4.1 交易查询
4.1.1 获取交易详情
请求:
GET /api/v1/transactions/{hash}
Authorization: Bearer {token}

路径参数:
- hash: 交易哈希 (必填)
查询参数:
- chain: 区块链类型 (可选)
- include_traces: 是否包含追踪信息 (可选，默认 false)
响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "hash": "0xabc...",
    "block_number": 12345678,
    "block_timestamp": "2026-03-12T10:00:00Z",
    "from": "0x123...",
    "to": "0x456...",
    "value": "1.0",
    "gas_used": 21000,
    "gas_price": "20000000000",
    "status": "success",
    "inputs": [],
    "outputs": [],
    "risk_score": 30
  }
}

4.1.2 查询地址交易列表
请求:
GET /api/v1/addresses/{address}/transactions
Authorization: Bearer {token}

查询参数:
- page: 页码 (可选，默认 1)
- pageSize: 每页数量 (可选，默认 20)
- type: 交易类型 (可选，enum: [in, out, all])
- start_time: 开始时间 (可选，ISO 8601)
- end_time: 结束时间 (可选，ISO 8601)
- sort: 排序字段 (可选，默认 -timestamp)
响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "hash": "0xabc...",
        "from": "0x123...",
        "to": "0x456...",
        "value": "1.0",
        "timestamp": "2026-03-12T10:00:00Z",
        "type": "out"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}

4.2 资金流向
4.2.1 获取资金流向图
请求:
GET /api/v1/addresses/{address}/flow
Authorization: Bearer {token}

查询参数:
- direction: 流向方向 (必填，enum: [in, out, both])
- depth: 追踪深度 (可选，默认 3，最大 10)
- start_time: 开始时间 (可选)
- end_time: 结束时间 (可选)
响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "nodes": [
      {
        "id": "0x123...",
        "label": "Address 1",
        "risk_score": 45,
        "balance": "1.0"
      }
    ],
    "edges": [
      {
        "source": "0x123...",
        "target": "0x456...",
        "value": "1.0",
        "timestamp": "2026-03-12T10:00:00Z"
      }
    ]
  }
}


---
5. 风险模块接口
5.1 风险评估
5.1.1 获取风险评分
请求:
GET /api/v1/risk/score/{address}
Authorization: Bearer {token}

查询参数:
- chain: 区块链类型 (可选)
- include_factors: 是否包含风险因素 (可选，默认 false)
响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "address": "0x123...",
    "risk_score": 45,
    "risk_level": "medium",
    "risk_factors": [
      {
        "name": "mixer_usage",
        "score": 20,
        "description": "使用过混币服务"
      },
      {
        "name": "high_risk_association",
        "score": 25,
        "description": "与高风险地址关联"
      }
    ]
  }
}

5.1.2 批量风险评估
请求:
POST /api/v1/risk/score/batch
Authorization: Bearer {token}
Content-Type: application/json

请求参数:
{
  "addresses": ["0x123...", "0x456..."],
  "chain": "eth"
}

响应:
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "address": "0x123...",
      "risk_score": 45,
      "risk_level": "medium"
    }
  ]
}

5.2 风险预警
5.2.1 创建预警规则
请求:
POST /api/v1/alerts
Authorization: Bearer {token}
Content-Type: application/json

请求参数:
{
  "address": "string",  // 必填，监控地址
  "name": "string",  // 必填，规则名称
  "conditions": {
    "risk_score_threshold": 80,  // 风险评分阈值
    "transaction_amount_threshold": 10.0,  // 交易金额阈值
    "frequency_threshold": 100  // 频率阈值 (次/小时)
  },
  "notification": {
    "email": true,
    "webhook_url": "https://example.com/webhook"
  }
}

响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "address": "string",
    "name": "string",
    "created_at": "2026-03-12T00:00:00Z"
  }
}

5.2.2 获取预警列表
请求:
GET /api/v1/alerts
Authorization: Bearer {token}

响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string",
        "address": "string",
        "name": "string",
        "status": "active",
        "created_at": "2026-03-12T00:00:00Z"
      }
    ],
    "total": 10
  }
}


---
6. 报告模块接口
6.1 报告生成
6.1.1 生成地址报告
请求:
POST /api/v1/reports/address
Authorization: Bearer {token}
Content-Type: application/json

请求参数:
{
  "address": "string",  // 必填，地址
  "format": "pdf",  // 可选，报告格式，enum: [pdf, excel, json]
  "template": "standard",  // 可选，报告模板
  "include_charts": true,  // 可选，是否包含图表
  "include_transactions": true  // 可选，是否包含交易列表
}

响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "report_id": "string",
    "status": "processing",
    "download_url": null,
    "expires_at": null
  }
}

6.1.2 获取报告状态
请求:
GET /api/v1/reports/{report_id}
Authorization: Bearer {token}

响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "report_id": "string",
    "status": "completed",
    "download_url": "https://cdn.chaintrace.io/reports/xxx.pdf",
    "expires_at": "2026-03-13T00:00:00Z",
    "created_at": "2026-03-12T00:00:00Z"
  }
}

6.2 报告管理
6.2.1 获取报告列表
请求:
GET /api/v1/reports
Authorization: Bearer {token}

查询参数:
- page: 页码 (可选)
- pageSize: 每页数量 (可选)
- status: 状态筛选 (可选，enum: [processing, completed, failed])
响应:
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "report_id": "string",
        "type": "address",
        "status": "completed",
        "created_at": "2026-03-12T00:00:00Z"
      }
    ],
    "total": 50
  }
}

6.2.2 下载报告
请求:
GET /api/v1/reports/{report_id}/download
Authorization: Bearer {token}

响应: 文件流 (application/pdf 或 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

---
7. 错误码说明
7.1 全局错误码
错误码
说明
0
成功
1001
参数错误
1002
认证失败
1003
权限不足
1004
资源不存在
1005
资源已存在
1006
操作被拒绝
1007
配额不足
1008
频率限制
5000
服务器内部错误
5001
服务暂时不可用
7.2 错误响应格式
{
  "code": 1002,
  "message": "认证失败，Token 无效",
  "data": null,
  "request_id": "req_123456789"
}


---
8. 附录
8.1 版本历史
- v1.0 (2026-03-12): 初始版本，完成子模块接口文档
8.2 参考资料
- OpenAPI 3.0 规范
- RESTful API 设计最佳实践
8.3 相关文档
- 后端架构设计
- 前端架构设计
- API 使用指南