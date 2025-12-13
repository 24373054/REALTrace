# 部署说明 - trace.matrixlab.work

## 端口配置

- **前端应用端口**: 3113
- **后端代理端口**: 3001 (proxy-server.js)

## 部署步骤

### 1. 配置 Nginx 和 SSL 证书

运行配置脚本（需要 sudo 权限）：

```bash
cd /home/ubuntu/yz/Web3/REALTrace
sudo ./setup-nginx-ssl.sh
```

脚本会自动：
- 复制 Nginx 配置文件到 `/etc/nginx/sites-available/trace.matrixlab.work`
- 创建符号链接到 `/etc/nginx/sites-enabled/`
- 测试 Nginx 配置
- 申请 Let's Encrypt SSL 证书（如果尚未申请）
- 重新加载 Nginx

### 2. 确保域名 DNS 解析正确

在申请 SSL 证书之前，请确保：
- `trace.matrixlab.work` 的 A 记录指向服务器 IP
- DNS 解析已生效（可以使用 `dig trace.matrixlab.work` 或 `nslookup trace.matrixlab.work` 检查）

### 3. 启动应用

#### 开发模式
```bash
cd /home/ubuntu/yz/Web3/REALTrace
npm run dev
```

应用将在端口 3113 上启动。

#### 生产模式（构建后）
```bash
npm run build
npm run preview
```

### 4. 启动后端代理服务器（可选）

如果需要使用后端代理功能：

```bash
npm run proxy
```

代理服务器将在端口 3001 上启动。

### 5. 使用 PM2 管理进程（推荐）

为了确保应用持续运行，建议使用 PM2：

```bash
# 安装 PM2（如果未安装）
npm install -g pm2

# 启动前端应用
cd /home/ubuntu/yz/Web3/REALTrace
pm2 start npm --name "realtrace-frontend" -- run dev

# 启动后端代理（如果需要）
pm2 start npm --name "realtrace-proxy" -- run proxy

# 查看状态
pm2 status

# 查看日志
pm2 logs realtrace-frontend
pm2 logs realtrace-proxy

# 设置开机自启
pm2 startup
pm2 save
```

## 验证部署

1. **检查 Nginx 配置**:
   ```bash
   sudo nginx -t
   ```

2. **检查 SSL 证书**:
   ```bash
   sudo certbot certificates
   ```

3. **访问网站**:
   - https://trace.matrixlab.work

4. **查看日志**:
   ```bash
   # Nginx 访问日志
   tail -f /var/log/nginx/trace.matrixlab.work.access.log
   
   # Nginx 错误日志
   tail -f /var/log/nginx/trace.matrixlab.work.error.log
   
   # 应用日志（如果使用 PM2）
   pm2 logs realtrace-frontend
   ```

## 防火墙配置

确保以下端口已开放：
- **80**: HTTP（Let's Encrypt 验证需要）
- **443**: HTTPS
- **3113**: 前端应用（仅本地访问，通过 Nginx 代理）
- **3001**: 后端代理（仅本地访问，通过 Nginx 代理）

## SSL 证书续期

Let's Encrypt 证书有效期为 90 天，certbot 会自动续期。可以手动测试续期：

```bash
sudo certbot renew --dry-run
```

## 故障排查

### 端口冲突
如果遇到端口被占用：
```bash
# 查看端口占用
sudo lsof -i :3113
# 或
sudo netstat -tulpn | grep 3113

# 停止占用端口的进程（谨慎操作）
sudo kill <PID>
```

### Nginx 配置错误
```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### SSL 证书问题
```bash
# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew

# 重新申请证书
sudo certbot --nginx -d trace.matrixlab.work --force-renewal
```

## 文件位置

- **Nginx 配置**: `/etc/nginx/sites-available/trace.matrixlab.work`
- **SSL 证书**: `/etc/letsencrypt/live/trace.matrixlab.work/`
- **日志目录**: `/var/log/nginx/`
- **项目目录**: `/home/ubuntu/yz/Web3/REALTrace`

