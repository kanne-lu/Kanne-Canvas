# (Kanne Canvas) - 图像生成平台

一个基于 React + Vite 的轻量化、高颜值图像生成平台。支持无缝接入多米 API (Duomi API) 及各种兼容 OpenAI 格式的图像生成接口，具备强大的后端安全代理机制。

## ✨ 特性

- 🎨 **极简高颜值 UI**：精心打磨的毛玻璃拟态（Glassmorphism）质感与现代渐变，交互流畅优雅。
- 🛡️ **后端安全代理**：API Key 统一在服务端（PHP）保管，前端代码及请求中不留任何敏感密钥，防止额度被盗刷。
- ⚡ **智能状态轮询**：支持针对多米等异步任务生成流的自动排队和状态监控。
- 🖼️ **多维度参数自定义**：支持输出尺寸、画质、图片格式、生成张数及参考图上传的一键配置。
- 📦 **零依赖一键部署**：编译出的 `dist` 静态资源直接扔到任意支持 PHP 的主机根目录即可跑通。

## 🛠️ 本地开发指南

1. **克隆仓库**
   ```bash
   git clone https://github.com/kanne-lu/Kanne-Canvas.git
   cd Kanne-Canvas
   ```

2. **安装依赖**
   ```bash
   pnpm install  # 或 npm install
   ```

3. **配置环境变量**
   在根目录下找到（或新建） `.env` 文件：
   ```env
   # 后端使用的安全 API Key
   API_KEY=sk-your-api-key-here

   # 目标接口默认 Base URL
   VITE_API_BASE_URL=https://duomiapi.com
   VITE_API_MODEL=gpt-image-2
   ```

4. **启动本地预览**
   ```bash
   pnpm dev  # 或 npm run dev
   ```

## 🚀 生产环境部署 (PHP 代理架构)

1. 在本地修改完 `.env` 中的 `VITE_API_BASE_URL` 配置后，运行打包命令：
   ```bash
   pnpm build  # 或 npm run build
   ```
2. 将打包生成的 `dist` 文件夹内的**所有文件**上传至服务器 Web 根目录。
3. 打开服务器端上的 `api.php`，将其中的 `$API_KEY = "sk-your-api-key-here";` 替换为你真实的 API 授权密钥。

## 📄 许可证

[MIT License](LICENSE)
