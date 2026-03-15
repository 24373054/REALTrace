ChainTrace 支付模块设计
文档信息
- 版本: v1.0
- 创建时间: 2026-03-12
- 维护团队: ChainTrace 产品团队
- 文档状态: 已完成

---
1. 概述
1.1 设计目标
- 多样化支付: 支持多种支付方式
- 安全可靠: 支付安全，数据加密
- 用户体验: 简洁流畅的支付流程
- 对账清晰: 完整的支付记录和账单
1.2 适用范围
本文档适用于 ChainTrace 平台的支付模块，包括:
- 会员订阅支付
- 按需服务支付
- 企业定制支付
- 退款处理
1.3 支付场景
- 用户端 (C 端): 会员订阅、单次报告购买
- 商家端 (B 端): API 套餐购买、企业订阅
- 管理端 (A 端): 退款处理、对账管理

---
2. 支付方式
2.1 在线支付
2.1.1 支付宝
支持类型:
- 支付宝扫码支付
- 支付宝电脑网站支付
- 支付宝 APP 支付
配置:
alipay:
  app_id: "2021001234567890"
  merchant_private_key: "-----BEGIN RSA PRIVATE KEY-----..."
  alipay_public_key: "-----BEGIN RSA PUBLIC KEY-----..."
  notify_url: "https://api.chaintrace.io/pay/notify/alipay"
  return_url: "https://chaintrace.io/pay/result"
  sign_type: "RSA2"

支付流程:
1. 用户选择支付宝支付
2. 创建订单，生成订单号
3. 调用支付宝接口，获取订单参数
4. 前端展示二维码或跳转支付宝
5. 用户完成支付
6. 支付宝异步通知支付结果
7. 验证签名，更新订单状态
8. 激活会员/服务

2.1.2 微信支付
支持类型:
- 微信扫码支付 (JSAPI)
- 微信公众号支付
- 微信小程序支付
- 微信支付 H5
配置:
wechat:
  app_id: "wx1234567890abcdef"
  mch_id: "1234567890"
  private_key: "-----BEGIN PRIVATE KEY-----..."
  api_v3_key: "32 位密钥"
  certificate_path: "/certs/apiclient_cert.pem"
  private_key_path: "/certs/apiclient_key.pem"
  notify_url: "https://api.chaintrace.io/pay/notify/wechat"

支付流程:
1. 用户选择微信支付
2. 获取用户 OpenID(如需要)
3. 创建微信订单
4. 获取支付参数 (prepay_id)
5. 前端调起微信支付
6. 用户完成支付
7. 微信异步通知支付结果
8. 验证签名，更新订单状态
9. 激活会员/服务

2.1.3 银联支付
支持类型:
- 银联二维码支付
- 银联在线支付
- 银联 APP 支付
配置:
unionpay:
  merchant_id: "622100123456789"
  merchant_key: "32 位密钥"
  backend_cert_path: "/certs/backendCert.pem"
  front_cert_path: "/certs/frontCert.pem"
  notify_url: "https://api.chaintrace.io/pay/notify/unionpay"

2.2 加密货币支付
2.2.1 USDT 支付
支持网络:
- TRC20 (波场)
- ERC20 (以太坊)
- BSC (币安智能链)
配置:
crypto:
  usdt:
    trc20:
      address: "Txxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      network: "tron"
      confirmations: 1
    erc20:
      address: "0x1234567890abcdef1234567890abcdef12345678"
      network: "ethereum"
      confirmations: 12
    bsc:
      address: "0x1234567890abcdef1234567890abcdef12345678"
      network: "bsc"
      confirmations: 15

支付流程:
1. 用户选择 USDT 支付
2. 选择网络 (TRC20/ERC20/BSC)
3. 生成收款地址和金额
4. 展示收款二维码
5. 用户扫码转账
6. 监听区块链确认
7. 确认到账，更新订单
8. 激活会员/服务

2.2.2 BTC 支付
配置:
crypto:
  btc:
    address: "bc1qxy... "
    network: "bitcoin"
    confirmations: 3
    timeout: 1800 # 30 分钟

2.3 企业支付
2.3.1 对公转账
流程:
1. 企业用户选择对公转账
2. 展示收款账户信息
3. 企业完成转账
4. 上传转账凭证
5. 人工审核
6. 确认到账
7. 激活服务

收款账户:
账户名称：ChainTrace 科技有限公司
账户号码：6222 0210 0123 4567 890
开户银行：中国工商银行北京分行
银行代码：ICBCBKBJ001

2.3.2 月结账户
适用对象: 企业版/旗舰版客户流程:
1. 签订月结协议
2. 设置信用额度
3. 按月结算
4. 发送账单
5. 企业付款
6. 额度恢复


---
3. 订单管理
3.1 订单结构
3.1.1 订单模型
interface Order {
  // 订单基本信息
  orderId: string;            // 订单号 (唯一)
  userId: string;             // 用户 ID
  userType: 'user' | 'enterprise'; // 用户类型
  
  // 订单内容
  productType: string;        // 产品类型 (membership/api/report)
  productId: string;          // 产品 ID
  productName: string;        // 产品名称
  quantity: number;           // 数量
  duration?: number;          // 时长 (月)
  
  // 金额信息
  originalAmount: number;     // 原价 (分)
  discountAmount: number;     // 优惠金额 (分)
  payAmount: number;          // 实付金额 (分)
  currency: string;           // 币种 (CNY/USD/USDT)
  
  // 支付信息
  paymentMethod: string;      // 支付方式
  paymentStatus: string;      // 支付状态
  paymentTime?: string;       // 支付时间
  transactionId?: string;     // 交易流水号
  
  // 订单状态
  status: string;             // 订单状态
  createTime: string;         // 创建时间
  updateTime: string;         // 更新时间
  expireTime?: string;        // 过期时间
  
  // 其他信息
  remark?: string;            // 备注
  ip?: string;                // IP 地址
  device?: string;            // 设备信息
}

3.1.2 订单状态
状态流转:
created(已创建) → paid(已支付) → completed(已完成)
                ↓
           timeout(已超时)
                ↓
           cancelled(已取消)

状态说明:
- created: 订单创建，等待支付
- paid: 已收到支付，处理中
- completed: 订单完成，服务已激活
- timeout: 订单超时，未支付
- cancelled: 订单已取消
- refunded: 已退款
3.2 订单生成
3.2.1 创建订单
API 接口:
POST /api/v1/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "membership_basic_year",
  "paymentMethod": "alipay",
  "couponCode": "WELCOME10" // 可选
}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "ORD20260312100001",
    "payAmount": 26900,
    "expireTime": "2026-03-12T11:00:00Z",
    "paymentUrl": "https://api.chaintrace.io/pay/ORD20260312100001"
  }
}

3.2.2 订单号规则
格式: ORD{YYYYMMDD}{NNNNNN}
- ORD: 订单前缀
- YYYYMMDD: 创建日期
- NNNNNN: 6 位序列号
示例: ORD20260312000001
3.3 订单查询
3.3.1 查询订单
API 接口:
GET /api/v1/orders/{orderId}
Authorization: Bearer {token}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "ORD20260312100001",
    "productName": "基础版会员 (年付)",
    "payAmount": 26900,
    "status": "completed",
    "paymentTime": "2026-03-12T10:05:00Z"
  }
}

3.3.2 订单列表
API 接口:
GET /api/v1/orders
Authorization: Bearer {token}

Query Parameters:
- page: 1
- pageSize: 20
- status: completed (可选)
- startTime: 2026-03-01T00:00:00Z (可选)
- endTime: 2026-03-12T23:59:59Z (可选)


---
4. 支付处理
4.1 支付回调
4.1.1 回调处理
// 支付宝回调处理
async function handleAlipayNotify(req, res) {
  const data = req.body;
  
  // 1. 验证签名
  const signValid = await alipay.verifySign(data);
  if (!signValid) {
    return res.send('fail');
  }
  
  // 2. 查询订单
  const order = await Order.findOne({ 
    orderId: data.out_trade_no 
  });
  
  // 3. 检查订单状态
  if (order.status !== 'created') {
    return res.send('success');
  }
  
  // 4. 验证金额
  if (order.payAmount !== data.total_amount * 100) {
    return res.send('fail');
  }
  
  // 5. 更新订单状态
  order.status = 'completed';
  order.paymentTime = new Date();
  order.transactionId = data.trade_no;
  await order.save();
  
  // 6. 激活服务
  await activateService(order);
  
  // 7. 发送通知
  await sendOrderSuccessNotification(order);
  
  res.send('success');
}

4.1.2 回调安全
- 签名验证: 必须验证支付平台签名
- IP 白名单: 只接受支付平台 IP
- 金额验证: 验证支付金额一致
- 幂等处理: 防止重复处理
4.2 支付超时
4.2.1 超时设置
超时时间:
- 支付宝/微信:30 分钟
- 加密货币:60 分钟
- 对公转账:7 天
4.2.2 超时处理
// 定时任务：检查超时订单
cron.schedule('*/5 * * * *', async () => {
  const now = new Date();
  
  // 查询超时未支付订单
  const timeoutOrders = await Order.find({
    status: 'created',
    expireTime: { $lt: now }
  });
  
  // 更新为超时状态
  for (const order of timeoutOrders) {
    order.status = 'timeout';
    await order.save();
    
    // 发送超时通知
    await sendOrderTimeoutNotification(order);
  }
});

4.3 支付失败
4.3.1 失败原因
- 用户取消支付
- 支付超时
- 余额不足
- 银行卡验证失败
- 系统错误
4.3.2 失败处理
- 记录失败原因
- 发送失败通知
- 允许重新支付
- 提供客服支持

---
5. 退款管理
5.1 退款政策
5.1.1 退款条件
可退款:
- 7 天内未使用服务
- 服务出现严重问题
- 重复支付
- 系统错误导致的支付
不可退款:
- 已使用服务
- 超过退款期限
- 用户主动要求 (非质量问题)
- 促销活动商品
5.1.2 退款比例
使用情况
退款比例
未使用
100%
使用<10%
90%
使用<50%
50%
使用≥50%
0%
5.2 退款流程
5.2.1 用户申请
流程:
1. 用户提交退款申请
2. 填写退款原因
3. 上传相关凭证
4. 系统自动审核 (符合条件)
5. 人工审核 (需要时)
6. 审核通过，发起退款
7. 退款到账
8. 关闭订单

5.2.2 退款处理
async function processRefund(order, refundAmount, reason) {
  // 1. 检查退款资格
  const eligible = await checkRefundEligibility(order);
  if (!eligible) {
    throw new Error('不符合退款条件');
  }
  
  // 2. 创建退款记录
  const refund = await Refund.create({
    orderId: order.orderId,
    amount: refundAmount,
    reason: reason,
    status: 'processing'
  });
  
  // 3. 调用支付平台退款接口
  let result;
  switch (order.paymentMethod) {
    case 'alipay':
      result = await alipay.refund({
        out_trade_no: order.orderId,
        refund_fee: refundAmount
      });
      break;
    case 'wechat':
      result = await wechat.refund({
        transaction_id: order.transactionId,
        refund: refundAmount
      });
      break;
  }
  
  // 4. 更新退款状态
  refund.status = 'completed';
  refund.transactionId = result.transactionId;
  await refund.save();
  
  // 5. 更新订单状态
  order.status = 'refunded';
  await order.save();
  
  // 6. 取消服务
  await cancelService(order);
  
  // 7. 发送通知
  await sendRefundSuccessNotification(order, refund);
}

5.3 退款查询
5.3.1 退款记录
interface Refund {
  refundId: string;          // 退款单号
  orderId: string;           // 订单号
  userId: string;            // 用户 ID
  amount: number;            // 退款金额
  reason: string;            // 退款原因
  status: string;            // 退款状态
  transactionId?: string;    // 退款流水号
  applyTime: string;         // 申请时间
  processTime?: string;      // 处理时间
  remark?: string;           // 备注
}


---
6. 对账管理
6.1 自动对账
6.1.1 对账流程
1. 下载支付平台对账单 (每日)
2. 解析对账单数据
3. 与本地订单比对
4. 标记差异订单
5. 生成对账报告
6. 发送对账结果

6.1.2 对账规则
匹配规则:
- 订单号匹配
- 金额匹配 (允许±1 分误差)
- 时间匹配 (同一天)
差异类型:
- 平台有，本地无 (漏单)
- 本地有，平台无 (假单)
- 金额不一致 (错单)
6.2 对账报告
6.2.1 报告内容
interface ReconciliationReport {
  date: string;              // 对账日期
  platform: string;          // 支付平台
  
  // 统计信息
  totalOrders: number;       // 总订单数
  totalAmount: number;       // 总金额
  matchedOrders: number;     // 匹配订单数
  matchedAmount: number;     // 匹配金额
  diffOrders: number;        // 差异订单数
  diffAmount: number;        // 差异金额
  
  // 差异详情
  missingOrders: Order[];    // 漏单列表
  falseOrders: Order[];      // 假单列表
  wrongOrders: Order[];      // 错单列表
  
  generatedAt: string;       // 生成时间
}

6.2.2 差异处理
漏单处理:
- 查询支付平台
- 补录订单
- 激活服务
假单处理:
- 调查原因
- 撤销订单
- 追回服务
错单处理:
- 联系用户
- 多退少补
- 调整订单

---
7. 附录
7.1 版本历史
- v1.0 (2026-03-12): 初始版本，完成支付模块设计文档
7.2 参考资料
- 支付宝开放平台文档
- 微信支付官方文档
- PCDN 安全规范
7.3 相关文档
- 用户端功能手册
- 商家端功能手册
- API 接口文档