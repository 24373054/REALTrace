#!/bin/bash

# ChainTrace 项目启动脚本
# 启动前端和后端服务

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# PID 文件目录
PID_DIR="./.pids"
mkdir -p "$PID_DIR"

# 日志文件目录
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ChainTrace 项目启动${NC}"
echo -e "${GREEN}========================================${NC}"

# 更新 Nginx 配置
echo -e "${YELLOW}🔧 更新 Nginx 配置...${NC}"
if [ -f "nginx-trace.matrixlab.work-final.conf" ]; then
    sudo cp nginx-trace.matrixlab.work-final.conf /etc/nginx/sites-available/trace.matrixlab.work
    echo -e "${GREEN}✓ Nginx 配置已更新${NC}"
    
    # 测试 Nginx 配置
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✓ Nginx 配置测试通过${NC}"
    else
        echo -e "${RED}✗ Nginx 配置测试失败，请检查配置${NC}"
        sudo nginx -t
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  未找到 nginx-trace.matrixlab.work-final.conf${NC}"
fi

# 检查是否已经在运行
if [ -f "$PID_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  后端服务已在运行 (PID: $BACKEND_PID)${NC}"
    else
        rm -f "$PID_DIR/backend.pid"
    fi
fi

if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  前端服务已在运行 (PID: $FRONTEND_PID)${NC}"
    else
        rm -f "$PID_DIR/frontend.pid"
    fi
fi

# 启动后端服务 (proxy-server.js)
if [ ! -f "$PID_DIR/backend.pid" ] || ! ps -p $(cat "$PID_DIR/backend.pid") > /dev/null 2>&1; then
    echo -e "${GREEN}🚀 启动后端服务...${NC}"
    nohup node proxy-server.js > "$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PID_DIR/backend.pid"
    echo -e "${GREEN}✓ 后端服务已启动 (PID: $BACKEND_PID)${NC}"
    echo -e "   日志文件: $LOG_DIR/backend.log"
    sleep 2
fi

# 启动前端服务 (Vite)
if [ ! -f "$PID_DIR/frontend.pid" ] || ! ps -p $(cat "$PID_DIR/frontend.pid") > /dev/null 2>&1; then
    echo -e "${GREEN}🚀 启动前端服务...${NC}"
    nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
    echo -e "${GREEN}✓ 前端服务已启动 (PID: $FRONTEND_PID)${NC}"
    echo -e "   日志文件: $LOG_DIR/frontend.log"
    sleep 3
fi

# 重载 Nginx
echo -e "${YELLOW}🔄 重载 Nginx...${NC}"
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✓ Nginx 已重载${NC}"
else
    echo -e "${RED}✗ Nginx 重载失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  所有服务已启动${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📊 服务状态："
echo -e "   后端服务: http://localhost:3113"
echo -e "   前端服务: http://localhost:3114"
echo -e "   域名访问: https://trace.matrixlab.work"
echo ""
echo -e "📝 查看日志："
echo -e "   后端: tail -f $LOG_DIR/backend.log"
echo -e "   前端: tail -f $LOG_DIR/frontend.log"
echo -e "   Nginx: sudo tail -f /var/log/nginx/trace.matrixlab.work.access.log"
echo ""
echo -e "🛑 停止服务："
echo -e "   运行: ./stopall.sh"
echo ""
