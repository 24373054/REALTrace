#!/bin/bash

# ChainTrace 项目停止脚本
# 停止前端和后端服务

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# PID 文件目录
PID_DIR="./.pids"

echo -e "${RED}========================================${NC}"
echo -e "${RED}  ChainTrace 项目停止${NC}"
echo -e "${RED}========================================${NC}"

# 停止后端服务
if [ -f "$PID_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}🛑 停止后端服务 (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID
        sleep 1
        # 如果进程还在运行，强制杀死
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo -e "${YELLOW}   强制停止后端服务...${NC}"
            kill -9 $BACKEND_PID
        fi
        echo -e "${GREEN}✓ 后端服务已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  后端服务未运行${NC}"
    fi
    rm -f "$PID_DIR/backend.pid"
else
    echo -e "${YELLOW}⚠️  未找到后端服务 PID 文件${NC}"
fi

# 停止前端服务
if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}🛑 停止前端服务 (PID: $FRONTEND_PID)...${NC}"
        # 需要杀死整个进程组，因为 npm run dev 会创建子进程
        PGID=$(ps -o pgid= $FRONTEND_PID | grep -o '[0-9]*')
        if [ ! -z "$PGID" ]; then
            kill -- -$PGID 2>/dev/null || kill $FRONTEND_PID
        else
            kill $FRONTEND_PID
        fi
        sleep 1
        # 如果进程还在运行，强制杀死
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo -e "${YELLOW}   强制停止前端服务...${NC}"
            if [ ! -z "$PGID" ]; then
                kill -9 -- -$PGID 2>/dev/null || kill -9 $FRONTEND_PID
            else
                kill -9 $FRONTEND_PID
            fi
        fi
        echo -e "${GREEN}✓ 前端服务已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  前端服务未运行${NC}"
    fi
    rm -f "$PID_DIR/frontend.pid"
else
    echo -e "${YELLOW}⚠️  未找到前端服务 PID 文件${NC}"
fi

# 清理可能残留的 Vite 进程（额外保护）
echo -e "${YELLOW}🧹 清理可能残留的进程...${NC}"
pkill -f "vite" 2>/dev/null && echo -e "${GREEN}✓ 已清理 Vite 进程${NC}" || true
pkill -f "proxy-server.js" 2>/dev/null && echo -e "${GREEN}✓ 已清理 proxy-server 进程${NC}" || true

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  所有服务已停止${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
