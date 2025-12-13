#!/bin/bash

# ChainTrace 项目部署脚本
# 用于首次部署或更新 Nginx 配置

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ChainTrace 项目部署${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否有 sudo 权限
if ! sudo -n true 2>/dev/null; then
    echo -e "${YELLOW}⚠️  需要 sudo 权限来配置 Nginx${NC}"
    echo -e "${YELLOW}   请输入密码：${NC}"
    sudo -v
fi

# 1. 复制 Nginx 配置
echo -e "${YELLOW}📋 复制 Nginx 配置文件...${NC}"
sudo cp nginx-trace.matrixlab.work-final.conf /etc/nginx/sites-available/trace.matrixlab.work
echo -e "${GREEN}✓ 配置文件已复制${NC}"

# 2. 创建软链接（如果不存在）
if [ ! -L /etc/nginx/sites-enabled/trace.matrixlab.work ]; then
    echo -e "${YELLOW}🔗 创建软链接...${NC}"
    sudo ln -s /etc/nginx/sites-available/trace.matrixlab.work /etc/nginx/sites-enabled/
    echo -e "${GREEN}✓ 软链接已创建${NC}"
else
    echo -e "${GREEN}✓ 软链接已存在${NC}"
fi

# 3. 测试 Nginx 配置
echo -e "${YELLOW}🧪 测试 Nginx 配置...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✓ Nginx 配置测试通过${NC}"
else
    echo -e "${RED}✗ Nginx 配置测试失败${NC}"
    exit 1
fi

# 4. 重载 Nginx
echo -e "${YELLOW}🔄 重载 Nginx...${NC}"
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✓ Nginx 已重载${NC}"
else
    echo -e "${RED}✗ Nginx 重载失败${NC}"
    exit 1
fi

# 5. 检查 Nginx 状态
echo -e "${YELLOW}📊 检查 Nginx 状态...${NC}"
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx 运行正常${NC}"
else
    echo -e "${RED}✗ Nginx 未运行${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📝 配置信息："
echo -e "   域名: trace.matrixlab.work"
echo -e "   前端端口: 3114"
echo -e "   后端端口: 3113"
echo -e "   SSL 证书: /etc/letsencrypt/live/trace.matrixlab.work/"
echo ""
echo -e "🚀 下一步："
echo -e "   1. 运行 ./startall.sh 启动服务"
echo -e "   2. 访问 https://trace.matrixlab.work"
echo ""
echo -e "📋 其他命令："
echo -e "   查看 Nginx 日志: sudo tail -f /var/log/nginx/trace.matrixlab.work.access.log"
echo -e "   查看 Nginx 错误: sudo tail -f /var/log/nginx/trace.matrixlab.work.error.log"
echo ""
