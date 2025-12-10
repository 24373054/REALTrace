<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ccI2Kh_0sDYuG2el55UIXPHLfsEgcQJt

## Run Locally

**Prerequisites:**  Node.js

### 方式一：使用内置代理服务器（推荐，更安全）

1. Install dependencies:  
   `npm install`

2. 在根目录创建/编辑 `.env.local`：  
   ```
   VITE_OPENAI_API_KEY=你的Key
   # 可选：自定义接口和模型（如使用代理/网关）
   # VITE_OPENAI_BASE_URL=https://api.openai.com/v1
   # VITE_OPENAI_MODEL=gpt-4o-mini

   # RPC 地址（代理服务器会读取这些配置）
   SOLANA_RPC_URL=https://your-solana-rpc-url?api-key=xxx
   ETH_RPC_URL=https://your-eth-rpc-url?api-key=yyy

   # 前端配置：使用本地代理服务器
   VITE_SOLANA_PROXY_PATH=http://localhost:3001/api/solana
   VITE_ETH_PROXY_PATH=http://localhost:3001/api/eth
   ```

3. 启动代理服务器（新开一个终端窗口）：  
   `npm run proxy`

4. 启动前端应用：  
   `npm run dev`

### 方式二：前端直连 RPC（仅测试，不推荐生产）

1. Install dependencies:  
   `npm install`

2. 在根目录创建/编辑 `.env.local`：  
   ```
   VITE_OPENAI_API_KEY=你的Key
   
   # 前端直连（可能受 CORS/权限限制）
   VITE_SOLANA_RPC=https://your-solana-endpoint/?api-key=xxxx
   VITE_ETH_RPC=https://your-eth-endpoint/?api-key=xxxx
   ```

3. Run the app:  
   `npm run dev`

### 公共 RPC 服务推荐

**Solana RPC 提供商：**
- [Alchemy Solana](https://www.alchemy.com/solana) - 免费层可用
- [Helius](https://www.helius.dev/) - 提供免费层
- [QuickNode Solana](https://www.quicknode.com/) - 多种计划
- [Triton RPC](https://triton.one/) - Solana 专用

**Ethereum RPC 提供商：**
- [Infura](https://www.infura.io/) - 免费层可用
- [Alchemy Ethereum](https://www.alchemy.com/ethereum) - 免费层可用
- [QuickNode Ethereum](https://www.quicknode.com/) - 多种计划

### 注意事项

- Tailwind 已本地构建，无需 CDN，样式入口 `index.css`
- 代理服务器默认运行在 `http://localhost:3001`
- 使用代理服务器可以避免在前端暴露 API Key，更安全
- 如果 RPC 调用失败，系统会自动回退到 mock 数据，不影响页面展示
