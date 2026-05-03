# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kanne Canvas — 轻量级本地 AI 图片生成平台，兼容 OpenAI 图片生成 API，默认对接 `duomiapi.com`。

## Commands

```bash
pnpm dev          # 启动开发服务器 (localhost:5190，LAN 可访问)
pnpm build        # 类型检查 + 构建生产包
pnpm typecheck    # 仅类型检查
```

## Architecture

前端为单页应用，全部源码集中在 `src/` 下 4 个文件：

- **`src/main.tsx`** — 所有 UI 组件（App、Metric、PanelTitle、Select）和业务逻辑，单文件 ~315 行
- **`src/imageApi.ts`** — 图片生成 API 客户端，处理请求构建、多多异步轮询、图片格式归一化
- **`src/types.ts`** — 核心类型定义（ApiSettings、GenerateRequest、GeneratedImage、HistoryItem 等）
- **`src/index.css`** — 全部样式（Vanilla CSS，磨砂玻璃风格）

后端依赖两个 PHP 脚本（`public/upload.php`、`public/save-generated.php`）处理文件上传和生成图片持久化，纯静态部署时不可用。

## API Integration

`imageApi.ts` 中的 `generateImages()` 自动检测 API 类型：
- **多多/Wike API**：自动追加 `?async=true`，提交后轮询 `/v1/tasks/{id}`（最多 90 次，每次 2 秒）
- **标准 OpenAI 兼容接口**：直接返回 base64 或 URL 图片

开发环境通过 Vite proxy 避免 CORS：
- `/duomi-api` → `https://duomiapi.com`
- `/wike-api` → `https://api.wike.cc`

## State & Persistence

无状态管理库，纯 React `useState`。两项数据持久化到 localStorage：
- `image-lab-settings` — API 配置（Key、Base URL、Model）
- `image-lab-history` — 最近 12 条生成记录

## Known Issues (from PRD)

- 品牌名确认：项目名就叫 Kanne Canvas，无需更改
- PHP 上传依赖在纯静态部署中不可用
- 所有依赖锁定 `latest`，无版本锁定
