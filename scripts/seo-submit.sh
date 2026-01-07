#!/bin/bash

# ChainTrace SEO 提交脚本
# 用于向各大搜索引擎提交 Sitemap

echo "🚀 ChainTrace SEO 提交工具"
echo "================================"

SITE_URL="https://trace.matrixlab.work"
SITEMAP_URL="${SITE_URL}/sitemap.xml"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}📍 网站地址:${NC} $SITE_URL"
echo -e "${BLUE}📄 Sitemap:${NC} $SITEMAP_URL"
echo ""

# 1. Google
echo -e "${YELLOW}1. Google 提交${NC}"
echo "   手动提交地址: https://search.google.com/search-console"
echo "   - 添加资源: $SITE_URL"
echo "   - 提交 Sitemap: sitemap.xml"
echo ""

# 2. Bing
echo -e "${YELLOW}2. Bing 提交${NC}"
echo "   手动提交地址: https://www.bing.com/webmasters"
echo "   - 添加网站: $SITE_URL"
echo "   - 提交 Sitemap: $SITEMAP_URL"
echo ""

# 3. 百度
echo -e "${YELLOW}3. 百度提交${NC}"
echo "   手动提交地址: https://ziyuan.baidu.com/"
echo "   - 添加网站: $SITE_URL"
echo "   - 提交 Sitemap: $SITEMAP_URL"
echo ""

# 百度主动推送（如果有 token）
if [ ! -z "$BAIDU_PUSH_TOKEN" ]; then
    echo -e "${GREEN}✓ 检测到百度推送 Token，开始主动推送...${NC}"
    
    # 推送首页
    curl -H 'Content-Type:text/plain' \
         --data-binary "$SITE_URL" \
         "http://data.zz.baidu.com/urls?site=$SITE_URL&token=$BAIDU_PUSH_TOKEN"
    
    echo ""
    echo -e "${GREEN}✓ 百度主动推送完成${NC}"
else
    echo "   💡 提示: 设置 BAIDU_PUSH_TOKEN 环境变量可启用自动推送"
    echo "   获取方式: 百度站长平台 -> 数据引入 -> 链接提交 -> 主动推送"
fi

echo ""

# 4. 360
echo -e "${YELLOW}4. 360 搜索提交${NC}"
echo "   手动提交地址: https://zhanzhang.so.com/"
echo "   - 添加网站: $SITE_URL"
echo ""

# 5. 搜狗
echo -e "${YELLOW}5. 搜狗提交${NC}"
echo "   手动提交地址: https://zhanzhang.sogou.com/"
echo "   - 添加网站: $SITE_URL"
echo ""

# 6. Yandex (俄罗斯)
echo -e "${YELLOW}6. Yandex 提交${NC}"
echo "   手动提交地址: https://webmaster.yandex.com/"
echo "   - 添加网站: $SITE_URL"
echo ""

echo "================================"
echo -e "${GREEN}✅ 提交指南已显示${NC}"
echo ""
echo "📋 下一步操作："
echo "   1. 访问上述搜索引擎站长平台"
echo "   2. 注册/登录账号"
echo "   3. 添加网站并验证所有权"
echo "   4. 提交 Sitemap"
echo "   5. 等待 1-2 周开始索引"
echo ""
echo "💡 提示: 可以使用 'export BAIDU_PUSH_TOKEN=your_token' 启用百度自动推送"
echo ""
