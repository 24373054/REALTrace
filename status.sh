#!/bin/bash

# ChainTrace 项目状态检查脚本

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# PID 文件目录
PID_DIR="./.pids"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ChainTrace 项目状态${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查后端服务
echo -e "${YELLOW}📡 后端服务 (端口 3113):${NC}"
if [ -f "$PID_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${GREEN}   ✓ 运行中 (PID: $BACKEND_PID)${NC}"
        if lsof -i :3113 > /dev/null 2>&1; then
            echo -e "${GREEN}   ✓ 端口 3113 已监听${NC}"
        else
            echo -e "${RED}   ✗ 端口 3113 未监听${NC}"
        fi
    else
        echo -e "${RED}   ✗ 未运行 (PID 文件存在但进程不存在)${NC}"
    fi
else
    echo -e "${RED}   ✗ 未运行 (未找到 PID 文件)${NC}"
fi

echo ""

# 检查前端服务
echo -e "${YELLOW}🌐 前端服务 (端口 3114):${NC}"
if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${GREEN}   ✓ 运行中 (PID: $FRONTEND_PID)${NC}"
        if lsof -i :3114 > /dev/null 2>&1; then
            echo -e "${GREEN}   ✓ 端口 3114 已监听${NC}"
        else
            echo -e "${RED}   ✗ 端口 3114 未监听${NC}"
        fi
    else
        echo -e "${RED}   ✗ 未运行 (PID 文件存在但进程不存在)${NC}"
    fi
else
    echo -e "${RED}   ✗ 未运行 (未找到 PID 文件)${NC}"
fi

echo ""

# 检查 Nginx
echo -e "${YELLOW}🔧 Nginx 服务:${NC}"
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}   ✓ 运行中${NC}"
    if [ -f /etc/nginx/sites-enabled/trace.matrixlab.work ]; then
        echo -e "${GREEN}   ✓ trace.matrixlab.work 配置已启用${NC}"
    else
        echo -e "${YELLOW}   ⚠️  trace.matrixlab.work 配置未启用${NC}"
    fi
else
    echo -e "${RED}   ✗ 未运行${NC}"
fi

echo ""

# 检查 SSL 证书
echo -e "${YELLOW}🔒 SSL 证书:${NC}"
if [ -d /etc/letsencrypt/live/trace.matrixlab.work ]; then
    echo -e "${GREEN}   ✓ 证书存在${NC}"
    CERT_FILE="/etc/letsencrypt/live/trace.matrixlab.work/fullchain.pem"
    if [ -f "$CERT_FILE" ]; then
        EXPIRY=$(sudo openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
        echo -e "${GREEN}   ✓ 证书过期时间: $EXPIRY${NC}"
    fi
else
    echo -e "${RED}   ✗ 证书不存在${NC}"
fi

echo ""

# 检查端口占用
echo -e "${YELLOW}🔌 端口占用情况:${NC}"
if lsof -i :3113 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✓ 3113 (后端)${NC}"
else
    echo -e "${RED}   ✗ 3113 (后端) - 未监听${NC}"
fi

if lsof -i :3114 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✓ 3114 (前端)${NC}"
else
    echo -e "${RED}   ✗ 3114 (前端) - 未监听${NC}"
fi

if sudo lsof -i :443 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✓ 443 (HTTPS)${NC}"
else
    echo -e "${RED}   ✗ 443 (HTTPS) - 未监听${NC}"
fi

echo ""

# 访问地址
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  访问地址${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "   本地后端: http://localhost:3113"
echo -e "   本地前端: http://localhost:3114"
echo -e "   域名访问: https://trace.matrixlab.work"
echo ""
