#!/bin/bash

# 配置 Nginx 和 Let's Encrypt 证书的脚本
# 用于 trace.matrixlab.work 域名

set -e

DOMAIN="trace.matrixlab.work"
NGINX_CONF_FILE="nginx-trace.matrixlab.work.conf"
NGINX_AVAILABLE="/etc/nginx/sites-available/${DOMAIN}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"
PROJECT_DIR="/home/ubuntu/yz/Web3/REALTrace"

echo "=========================================="
echo "配置 Nginx 和 SSL 证书"
echo "域名: ${DOMAIN}"
echo "=========================================="

# 检查是否以 root 权限运行
if [ "$EUID" -ne 0 ]; then 
    echo "错误: 请使用 sudo 运行此脚本"
    exit 1
fi

# 1. 复制 Nginx 配置文件
echo ""
echo "步骤 1: 复制 Nginx 配置文件..."
if [ -f "${PROJECT_DIR}/${NGINX_CONF_FILE}" ]; then
    cp "${PROJECT_DIR}/${NGINX_CONF_FILE}" "${NGINX_AVAILABLE}"
    echo "✓ 配置文件已复制到 ${NGINX_AVAILABLE}"
else
    echo "✗ 错误: 找不到配置文件 ${PROJECT_DIR}/${NGINX_CONF_FILE}"
    exit 1
fi

# 2. 创建符号链接
echo ""
echo "步骤 2: 创建符号链接..."
if [ -L "${NGINX_ENABLED}" ]; then
    echo "✓ 符号链接已存在: ${NGINX_ENABLED}"
elif [ -f "${NGINX_ENABLED}" ]; then
    echo "⚠ 警告: ${NGINX_ENABLED} 已存在但不是符号链接，正在备份..."
    mv "${NGINX_ENABLED}" "${NGINX_ENABLED}.backup.$(date +%Y%m%d_%H%M%S)"
    ln -s "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"
    echo "✓ 符号链接已创建"
else
    ln -s "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"
    echo "✓ 符号链接已创建: ${NGINX_ENABLED}"
fi

# 3. 测试 Nginx 配置
echo ""
echo "步骤 3: 测试 Nginx 配置..."
if nginx -t; then
    echo "✓ Nginx 配置测试通过"
else
    echo "✗ 错误: Nginx 配置测试失败"
    exit 1
fi

# 4. 检查 certbot 是否已安装
echo ""
echo "步骤 4: 检查 certbot..."
if command -v certbot &> /dev/null; then
    echo "✓ certbot 已安装"
else
    echo "⚠ certbot 未安装，正在安装..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    echo "✓ certbot 已安装"
fi

# 5. 检查是否已有证书
echo ""
echo "步骤 5: 检查 SSL 证书..."
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo "✓ SSL 证书已存在"
    echo ""
    echo "步骤 6: 重新加载 Nginx..."
    systemctl reload nginx
    echo "✓ Nginx 已重新加载"
    echo ""
    echo "=========================================="
    echo "配置完成！"
    echo "=========================================="
    echo "域名: https://${DOMAIN}"
    echo "后端端口: 3113"
    echo ""
    echo "如果证书需要更新，请运行:"
    echo "  sudo certbot renew"
else
    echo "⚠ SSL 证书不存在，需要申请"
    echo ""
    echo "步骤 6: 申请 Let's Encrypt 证书..."
    echo "注意: 请确保域名 ${DOMAIN} 已正确解析到此服务器的 IP 地址"
    echo ""
    read -p "是否继续申请证书? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # 先重新加载 Nginx（使用临时配置，允许 HTTP 访问）
        systemctl reload nginx
        
        # 使用 certbot 申请证书
        certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@matrixlab.work --redirect
        
        if [ $? -eq 0 ]; then
            echo "✓ SSL 证书申请成功"
            echo ""
            echo "步骤 7: 重新加载 Nginx..."
            systemctl reload nginx
            echo "✓ Nginx 已重新加载"
            echo ""
            echo "=========================================="
            echo "配置完成！"
            echo "=========================================="
            echo "域名: https://${DOMAIN}"
            echo "后端端口: 3111"
        else
            echo "✗ 错误: SSL 证书申请失败"
            echo "请检查:"
            echo "  1. 域名 DNS 解析是否正确"
            echo "  2. 端口 80 是否开放"
            echo "  3. 防火墙设置"
            exit 1
        fi
    else
        echo "已跳过证书申请"
        echo ""
        echo "请稍后手动运行:"
        echo "  sudo certbot --nginx -d ${DOMAIN}"
    fi
fi

echo ""
echo "=========================================="
echo "下一步:"
echo "=========================================="
echo "1. 确保应用在端口 3113 上运行:"
echo "   cd ${PROJECT_DIR}"
echo "   npm run dev"
echo ""
echo "2. 访问网站:"
echo "   https://${DOMAIN}"
echo ""
echo "3. 检查日志:"
echo "   tail -f /var/log/nginx/${DOMAIN}.access.log"
echo "   tail -f /var/log/nginx/${DOMAIN}.error.log"
echo "=========================================="

