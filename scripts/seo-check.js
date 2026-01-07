#!/usr/bin/env node

/**
 * ChainTrace SEO 检查工具
 * 检查网站的 SEO 配置是否完整
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`)
};

console.log('\n🔍 ChainTrace SEO 检查工具\n');
console.log('================================\n');

let score = 0;
let total = 0;

// 检查文件是否存在
function checkFile(filePath, description) {
  total++;
  const fullPath = path.join(path.dirname(__dirname), filePath);
  if (fs.existsSync(fullPath)) {
    log.success(`${description}: ${filePath}`);
    score++;
    return true;
  } else {
    log.error(`${description}: ${filePath} (未找到)`);
    return false;
  }
}

// 检查文件内容
function checkContent(filePath, pattern, description) {
  total++;
  const fullPath = path.join(path.dirname(__dirname), filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (pattern.test(content)) {
      log.success(description);
      score++;
      return true;
    } else {
      log.warning(`${description} (需要优化)`);
      return false;
    }
  } else {
    log.error(`${description} (文件不存在)`);
    return false;
  }
}

console.log('📄 基础文件检查\n');

checkFile('index.html', 'HTML 入口文件');
checkFile('public/robots.txt', 'Robots.txt');
checkFile('public/sitemap.xml', 'Sitemap.xml');
checkFile('public/humans.txt', 'Humans.txt');
checkFile('favicon (2)/site.webmanifest', 'Web Manifest');
checkFile('public/.well-known/security.txt', 'Security.txt');

console.log('\n🏷️  Meta 标签检查\n');

checkContent('index.html', /<title>.*ChainTrace.*<\/title>/, 'Title 标签');
checkContent('index.html', /<meta name="description"/, 'Description 标签');
checkContent('index.html', /<meta name="keywords"/, 'Keywords 标签');
checkContent('index.html', /<meta property="og:title"/, 'Open Graph Title');
checkContent('index.html', /<meta property="og:description"/, 'Open Graph Description');
checkContent('index.html', /<meta property="og:image"/, 'Open Graph Image');
checkContent('index.html', /<meta name="twitter:card"/, 'Twitter Card');
checkContent('index.html', /<link rel="canonical"/, 'Canonical 链接');

console.log('\n🔧 结构化数据检查\n');

checkContent('index.html', /"@type":\s*"SoftwareApplication"/, 'SoftwareApplication Schema');
checkContent('index.html', /"@type":\s*"WebSite"/, 'WebSite Schema');
checkContent('index.html', /"@type":\s*"BreadcrumbList"/, 'BreadcrumbList Schema');

console.log('\n🎨 Favicon 检查\n');

checkFile('favicon (2)/favicon.ico', 'Favicon ICO');
checkFile('favicon (2)/favicon.svg', 'Favicon SVG');
checkFile('favicon (2)/apple-touch-icon.png', 'Apple Touch Icon');
checkFile('favicon (2)/favicon-96x96.png', 'Favicon 96x96');

console.log('\n📱 移动端优化检查\n');

checkContent('index.html', /<meta name="viewport"/, 'Viewport 标签');
checkContent('index.html', /<meta name="theme-color"/, 'Theme Color');
checkContent('index.html', /<meta name="apple-mobile-web-app-capable"/, 'iOS Web App');

console.log('\n⚡ 性能优化检查\n');

checkContent('index.html', /<link rel="dns-prefetch"/, 'DNS 预取');
checkContent('index.html', /<link rel="preconnect"/, '预连接');

console.log('\n🔍 搜索引擎验证检查\n');

const hasGoogleVerification = checkContent('index.html', /google-site-verification/, 'Google 验证码');
const hasBaiduVerification = checkContent('index.html', /baidu-site-verification/, '百度验证码');

if (!hasGoogleVerification) {
  log.info('   获取方式: https://search.google.com/search-console');
}
if (!hasBaiduVerification) {
  log.info('   获取方式: https://ziyuan.baidu.com/');
}

console.log('\n📊 图片资源检查\n');

const hasOGImage = checkFile('public/og-image.jpg', 'OG 分享图片');
if (!hasOGImage) {
  log.info('   创建方式: 打开 scripts/generate-og-image.html');
}

console.log('\n================================\n');

const percentage = Math.round((score / total) * 100);
const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';

console.log(`📈 SEO 得分: ${score}/${total} (${percentage}%)`);
console.log(`🎯 评级: ${grade}\n`);

if (percentage >= 90) {
  log.success('优秀！SEO 配置非常完善！');
} else if (percentage >= 80) {
  log.success('良好！还有一些小细节可以优化。');
} else if (percentage >= 70) {
  log.warning('及格！建议完善缺失的配置项。');
} else {
  log.error('需要改进！请按照上述提示完善 SEO 配置。');
}

console.log('\n💡 下一步建议:\n');

if (!hasOGImage) {
  console.log('1. 创建 OG 分享图片 (1200x630)');
}
if (!hasGoogleVerification) {
  console.log('2. 注册 Google Search Console 并获取验证码');
}
if (!hasBaiduVerification) {
  console.log('3. 注册百度搜索资源平台并获取验证码');
}
console.log('4. 创建核心页面内容 (/about, /features, /docs)');
console.log('5. 发布第一篇博客文章');
console.log('6. 提交 Sitemap 到各大搜索引擎');

console.log('\n📚 参考文档:\n');
console.log('- SEO 实施报告: SEO-IMPLEMENTATION.md');
console.log('- 快速检查清单: SEO-QUICK-CHECKLIST.md');
console.log('- 内容模板: CONTENT-TEMPLATES.md');

console.log('\n');

process.exit(percentage >= 70 ? 0 : 1);
