#!/bin/bash

# ChainTrace OG 图片创建脚本
# 使用 ImageMagick 创建 OG 分享图片

echo "🎨 创建 ChainTrace OG 图片..."

# 检查 ImageMagick 是否安装
if ! command -v convert &> /dev/null; then
    echo "❌ 未找到 ImageMagick"
    echo "📦 安装方法:"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   macOS: brew install imagemagick"
    echo ""
    echo "或者使用在线工具:"
    echo "   1. 打开 scripts/generate-og-image.html"
    echo "   2. 点击下载按钮"
    echo "   3. 保存为 public/og-image.jpg"
    exit 1
fi

# 创建临时目录
mkdir -p public/temp

# 创建背景
convert -size 1200x630 \
    gradient:'#0a0e27-#1a1a2e' \
    public/temp/bg.jpg

# 添加网格效果
convert public/temp/bg.jpg \
    -stroke 'rgba(255,255,255,0.05)' \
    -strokewidth 1 \
    -draw "line 0,0 1200,630" \
    public/temp/bg_grid.jpg

# 添加文字
convert public/temp/bg_grid.jpg \
    -font Arial-Bold -pointsize 80 -fill white \
    -annotate +250+180 'ChainTrace' \
    -font Arial -pointsize 48 -fill '#CCCCCC' \
    -annotate +250+240 '区块链资金追踪平台' \
    -font Arial -pointsize 32 -fill '#00FF88' \
    -annotate +250+320 '✓ 多链支持 (Solana/Ethereum)' \
    -annotate +250+370 '✓ 交易图谱可视化' \
    -annotate +250+420 '✓ 智能风险识别' \
    -font Arial -pointsize 28 -fill '#888888' \
    -annotate +250+550 'trace.matrixlab.work' \
    public/og-image.jpg

# 清理临时文件
rm -rf public/temp

echo "✅ OG 图片已创建: public/og-image.jpg"
echo "📏 尺寸: 1200x630"
echo "🔍 预览: 在浏览器中打开 public/og-image.jpg"
