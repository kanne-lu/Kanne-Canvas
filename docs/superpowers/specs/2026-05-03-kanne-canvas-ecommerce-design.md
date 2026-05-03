# Kanne Canvas 电商功能设计规格

**日期：** 2026-05-03
**状态：** 已批准
**作者：** 小七 & 云哥哥

---

## 1. 概述

Kanne Canvas 是一个轻量级 AI 图片生成平台，现在需要扩展电商功能，帮助电商卖家快速生成商品图、营销物料和多平台适配图片。

### 1.1 目标

- 提供一站式电商图片生成解决方案
- 支持多种商品图类型（白底主图、场景图、模特图、详情页长图）
- 支持多种营销物料（电商海报、社交媒体图、直播间背景）
- 提供多平台尺寸适配、批量生成、A/B 测试等进阶功能

### 1.2 技术栈

- **前端：** React + Vite + TypeScript
- **后端：** PHP 代理（现有架构）
- **AI 引擎：** OpenAI 兼容 API（duomiapi.com）
- **状态管理：** 纯 useState（现有方案）
- **持久化：** localStorage

---

## 2. 架构设计

### 2.1 架构方案

采用 **模块化插件架构**，将电商功能作为独立模块接入现有系统。

**选择理由：**
- 不影响现有功能，风险最低
- 可以逐步上线，快速看到效果
- 保持代码简洁，易于维护
- 未来扩展灵活

### 2.2 模块划分

#### 核心模块

| 模块 | 功能 | 状态 |
|------|------|------|
| 商品图生成模块 | 白底主图、场景图、模特图、详情页长图 | 待开发 |
| 营销物料模块 | 电商海报、社交媒体图、直播间背景 | 待开发 |
| 进阶功能模块 | 多平台适配、批量生成、A/B测试 | 待开发 |

#### 支撑模块

| 模块 | 功能 | 状态 |
|------|------|------|
| 会员系统 | 用户注册登录、会员等级、积分/配额管理 | 待开发 |
| 模板系统 | 预设模板、用户自定义模板 | 待开发 |
| 批量处理 | 批量生成、批量下载、任务队列 | 待开发 |
| 导出系统 | 多格式导出、平台尺寸适配、压缩优化 | 待开发 |

### 2.3 模块依赖关系

```
┌─────────────────────────────────────────────────────────────┐
│                      Kanne Canvas 主应用                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  商品图模块  │  │  营销物料   │  │  进阶功能   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │               │               │                  │
│         ▼               ▼               ▼                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   共享服务层                         │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │   │
│  │  │会员系统 │  │模板系统 │  │批量处理 │  │导出系统 │ │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │   │
│  │  ┌─────────┐                                        │   │
│  │  │AI引擎  │                                        │   │
│  │  └─────────┘                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   基础设施层                         │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │   │
│  │  │API代理  │  │文件存储 │  │本地存储 │  │状态管理 │ │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. UI 设计

### 3.1 导航方案

采用 **侧边栏导航** 方案，在左侧添加功能导航栏，点击切换不同功能模块。

**选择理由：**
- 导航直观，一目了然
- 节省屏幕空间
- 适合多功能应用

### 3.2 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│                      Kanne Canvas                          │
├──────┬──────────────────────────────────────────────────────┤
│      │                                                      │
│  侧  │   ┌──────────────────────────────────────────────┐  │
│  边  │   │                                              │  │
│  栏  │   │              内容区域                        │  │
│  导  │   │                                              │  │
│  航  │   │                                              │  │
│      │   └──────────────────────────────────────────────┘  │
│      │                                                      │
└──────┴──────────────────────────────────────────────────────┘
```

### 3.3 侧边栏项目

| 图标 | 名称 | 功能 |
|------|------|------|
| 🎨 | 通用生图 | 现有功能（保持不变） |
| 📦 | 商品图 | 商品图生成模块 |
| 📢 | 营销 | 营销物料模块 |
| ⚡ | 进阶 | 进阶功能模块 |

---

## 4. 功能模块详细设计

### 4.0 会员系统模块

#### 4.0.1 功能概述

会员系统提供用户注册登录、会员等级管理、积分/配额管理等功能，为后续付费功能和用户数据管理打下基础。

#### 4.0.2 用户认证

**登录方式（当前）：**
- 邮箱 + 密码登录（主要方式）
- 邮箱验证码登录（可选）

**登录方式（后续）：**
- 微信扫码登录（待确认）

**注册流程：**
1. 输入邮箱
2. 设置密码
3. 发送验证邮件
4. 验证通过，自动注册并登录
5. 设置昵称（可选）

**登录状态：**
- Token 存储在 localStorage
- Token 有效期：7 天
- 支持自动刷新 Token

#### 4.0.3 用户等级（积分制）

采用 **免费+积分模式**，用户通过获取积分来使用功能，无需付费。

| 等级 | 名称 | 积分获取方式 | 功能权限 |
|------|------|--------------|----------|
| L0 | 新手用户 | 注册赠送 100 积分 | 基础生图功能 |
| L1 | 活跃用户 | 累计 500 积分 | 解锁商品图生成 |
| L2 | 资深用户 | 累计 2000 积分 | 解锁营销物料 |
| L3 | 专家用户 | 累计 5000 积分 | 解锁全部功能 |

**积分获取方式：**
- 注册赠送：100 积分
- 每日签到：10 积分
- 邀请好友：50 积分/人
- 完成任务：根据任务难度（10-100 积分）
- 分享作品：5 积分/次

**等级权益：**
- L0 新手用户：基础生图（通用生图功能）
- L1 活跃用户：+ 商品图生成
- L2 资深用户：+ 营销物料生成
- L3 专家用户：+ 批量生成、A/B 测试、优先队列

#### 4.0.4 积分系统

**积分获取：**
- 注册赠送：100 积分
- 每日签到：10 积分（连续签到递增，最高 50 积分/天）
- 邀请好友：50 积分/人（好友注册成功后发放）
- 完成任务：根据任务难度（10-100 积分）
- 分享作品：5 积分/次（每日上限 50 积分）

**积分消耗：**
- 普通生图：1 积分/次
- 商品图生成：2 积分/次
- 营销物料：3 积分/次
- 批量生成：5 积分/次
- A/B 测试：10 积分/次

**积分规则：**
- 积分永久有效（除非账户注销）
- 每日签到积分在每日 0 点重置
- 邀请好友积分在好友注册成功后即时发放
- 积分不足时无法使用对应功能

#### 4.0.5 用户数据管理

**个人中心：**
- 基本信息：昵称、头像、手机号
- 会员信息：当前等级、到期时间、剩余积分
- 使用统计：总生成次数、各功能使用情况
- 生成历史：最近 100 条生成记录

**数据同步：**
- 用户数据云端存储
- 支持多设备同步
- 本地缓存提升体验

#### 4.0.6 后端接口

```typescript
// 用户认证
interface AuthAPI {
  register(email: string, password: string, nickname?: string): Promise<LoginResult>;
  login(email: string, password: string): Promise<LoginResult>;
  sendVerificationCode(email: string): Promise<void>;
  verifyEmail(email: string, code: string): Promise<void>;
  resetPassword(email: string, code: string, newPassword: string): Promise<void>;
  refreshToken(token: string): Promise<LoginResult>;
  logout(): Promise<void>;
}

// 用户信息
interface UserAPI {
  getProfile(): Promise<UserProfile>;
  updateProfile(data: Partial<UserProfile>): Promise<void>;
  getUsageStats(): Promise<UsageStats>;
  getGenerationHistory(page: number, size: number): Promise<HistoryItem[]>;
}

// 积分管理
interface PointsAPI {
  getPointsInfo(): Promise<PointsInfo>;
  checkIn(): Promise<CheckInResult>;
  inviteFriend(email: string): Promise<InviteResult>;
  getPointsHistory(page: number, size: number): Promise<PointsRecord[]>;
  getTasks(): Promise<Task[]>;
  completeTask(taskId: string): Promise<TaskResult>;
}

// 数据结构
interface LoginResult {
  token: string;
  refreshToken: string;
  user: UserProfile;
}

interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  level: number;
  points: number;
  totalPoints: number;
  emailVerified: boolean;
  createdAt: string;
}

interface PointsInfo {
  points: number;
  totalPoints: number;
  level: number;
  levelName: string;
  nextLevelPoints: number;
  todayCheckedIn: boolean;
  consecutiveCheckInDays: number;
}

interface Task {
  id: string;
  name: string;
  description: string;
  points: number;
  type: 'daily' | 'achievement' | 'special';
  completed: boolean;
  progress?: number;
  target?: number;
}

interface TaskResult {
  success: boolean;
  pointsEarned: number;
  newTotalPoints: number;
  levelUp?: boolean;
  newLevel?: number;
}

interface CheckInResult {
  success: boolean;
  pointsEarned: number;
  consecutiveDays: number;
  newTotalPoints: number;
}

interface InviteResult {
  success: boolean;
  pointsEarned: number;
  newTotalPoints: number;
}

interface UsageStats {
  totalGenerations: number;
  productImages: number;
  marketingMaterials: number;
  batchTasks: number;
  abTests: number;
}

interface PointsRecord {
  id: string;
  type: 'earn' | 'consume';
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}
```

#### 4.0.7 前端组件

**登录弹窗组件：**
- 邮箱输入
- 密码输入
- 登录按钮
- 注册链接
- 忘记密码链接

**用户信息组件：**
- 头像 + 昵称
- 用户等级标识
- 积分余额显示
- 签到按钮

**个人中心页面：**
- 基本信息编辑
- 等级与积分展示
- 签到日历
- 使用统计图表
- 生成历史列表

**任务中心页面：**
- 每日任务列表
- 成就任务列表
- 特殊任务列表
- 任务进度展示
- 领取奖励按钮

**积分明细页面：**
- 积分获取记录
- 积分消耗记录
- 积分余额变化

### 4.1 商品图生成模块

#### 4.1.1 支持的图片类型

| 类型 | 尺寸 | 适用场景 |
|------|------|----------|
| 白底主图 | 800x800 / 1000x1000 | 淘宝/京东标准主图 |
| 场景图 | 1000x1000 / 1200x1200 | 商品在使用场景中 |
| 模特图 | 800x1200 / 1000x1500 | 服装/配饰类商品 |
| 详情页长图 | 750x 任意长度 | 商品详情页 |

#### 4.1.2 生成流程

1. **上传商品图** — 用户上传商品原图
2. **选择图片类型** — 白底主图/场景图/模特图/详情页长图
3. **配置参数** — 输出尺寸、背景风格、生成数量
4. **AI 生成** — 调用 AI 引擎生成图片
5. **预览下载** — 预览效果，下载图片

#### 4.1.3 关键功能点

- **智能抠图** — 自动识别商品主体，去除背景
- **背景生成** — 根据商品类型智能生成背景
- **模特合成** — AI 生成模特穿着商品的效果
- **批量生成** — 同一商品生成多张不同风格图

### 4.2 营销物料模块

#### 4.2.1 支持的物料类型

| 类型 | 尺寸 | 适用场景 |
|------|------|----------|
| 电商海报 | 800x1200 / 1000x1500 | 双11、618 等促销活动 |
| 社交媒体图 | 1080x1080 / 1080x1920 | 小红书、抖音、淘宝等 |
| 直播间背景 | 1920x1080 / 1080x1920 | 直播背景、商品展示牌 |

#### 4.2.2 海报生成流程

1. **选择模板** — 预设模板（双11、618、年货节、新品等）
2. **自定义内容** — 主标题、副标题、促销信息
3. **上传商品图** — 选择商品图片
4. **AI 生成** — 调用 AI 引擎生成海报
5. **预览下载** — 预览效果，下载海报

#### 4.2.3 社交媒体图尺寸预设

| 平台 | 尺寸 | 说明 |
|------|------|------|
| 小红书 | 1080x1440 | 竖版图文 |
| 抖音 | 1080x1920 | 竖版视频封面 |
| 淘宝 | 800x800 | 正方形主图 |
| 京东 | 800x800 | 正方形主图 |
| 快手 | 1080x1920 | 竖版视频封面 |
| 拼多多 | 750x1334 | 竖版主图 |

### 4.3 进阶功能模块

#### 4.3.1 多平台尺寸适配

**功能：** 一键将图片转换为多个平台的尺寸

**流程：**
1. 上传原图
2. 选择目标平台（可多选）
3. 一键转换
4. 批量下载

**支持平台：**
- 淘宝主图（800x800）
- 京东主图（800x800）
- 拼多多（750x1334）
- 小红书（1080x1440）
- 抖音（1080x1920）
- 快手（1080x1920）

#### 4.3.2 批量生成功能

**功能：** 多商品同时生成，任务队列管理

**流程：**
1. 上传多张商品图
2. 选择生成风格（可多选）
3. 设置每个商品生成数量
4. 开始批量生成
5. 任务队列显示进度
6. 全部下载

**任务状态：**
- ✓ 完成 — 生成完成，可下载
- ⏳ 生成中 — 正在生成，显示进度条
- ⏸ 等待中 — 等待生成

#### 4.3.3 A/B 测试图生成功能

**功能：** 同一商品生成多版本风格对比

**流程：**
1. 上传商品图
2. 选择生成风格（至少 2 种）
3. AI 生成多版本图片
4. 并排对比展示
5. 追踪数据（点击率、转化率）

**对比维度：**
- 点击率
- 转化率
- 用户偏好

---

## 5. 数据设计

### 5.1 本地存储结构

```typescript
// 商品图配置
interface ProductImageConfig {
  id: string;
  name: string;
  type: 'white-bg' | 'scene' | 'model' | 'detail';
  size: string;
  background: string;
  createdAt: string;
}

// 营销物料配置
interface MarketingConfig {
  id: string;
  name: string;
  type: 'poster' | 'social' | 'live';
  template: string;
  content: {
    title: string;
    subtitle: string;
    promotion: string;
  };
  createdAt: string;
}

// 批量任务
interface BatchTask {
  id: string;
  productImages: string[];
  styles: string[];
  count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: GeneratedImage[];
  createdAt: string;
}

// A/B 测试
interface ABTest {
  id: string;
  productImage: string;
  versions: {
    id: string;
    style: string;
    image: GeneratedImage;
    metrics: {
      clicks: number;
      conversions: number;
    };
  }[];
  createdAt: string;
}
```

### 5.2 localStorage 键值

| 键名 | 类型 | 说明 |
|------|------|------|
| `kanne-user-token` | string | 用户登录 Token |
| `kanne-user-profile` | UserProfile | 用户基本信息 |
| `kanne-product-configs` | ProductImageConfig[] | 商品图配置列表 |
| `kanne-marketing-configs` | MarketingConfig[] | 营销物料配置列表 |
| `kanne-batch-tasks` | BatchTask[] | 批量任务列表 |
| `kanne-ab-tests` | ABTest[] | A/B 测试列表 |

---

## 6. 接口设计

### 6.1 AI 引擎接口

现有接口保持不变，新增以下参数：

```typescript
interface EcommerceGenerateRequest {
  // 现有参数
  prompt: string;
  referenceImages: string;
  size: ImageSize;
  quality: ImageQuality;
  format: ImageFormat;
  n: number;
  
  // 新增电商参数
  ecommerceType?: 'product' | 'marketing' | 'advanced';
  productType?: 'white-bg' | 'scene' | 'model' | 'detail';
  template?: string;
  platform?: string[];
}
```

### 6.2 模板系统接口

```typescript
interface Template {
  id: string;
  name: string;
  type: 'product' | 'marketing';
  category: string;
  preview: string;
  config: Record<string, any>;
}

interface TemplateSystem {
  getTemplates(type: string, category?: string): Template[];
  getTemplateById(id: string): Template | null;
  saveCustomTemplate(template: Omit<Template, 'id'>): Template;
  deleteCustomTemplate(id: string): boolean;
}
```

---

## 7. 错误处理

### 7.1 错误类型

| 错误类型 | 描述 | 处理方式 |
|----------|------|----------|
| 图片上传失败 | 网络问题或文件过大 | 提示重试，建议压缩图片 |
| AI 生成失败 | API 调用失败 | 提示重试，检查 API 配置 |
| 批量任务失败 | 部分任务失败 | 显示失败任务，支持重试 |
| 尺寸转换失败 | 不支持的尺寸 | 提示选择其他尺寸 |

### 7.2 错误提示

- 使用友好的中文错误提示
- 提供具体的解决建议
- 支持一键重试

---

## 8. 测试策略

### 8.1 单元测试

- 模板系统
- 批量处理逻辑
- 尺寸转换算法
- 本地存储操作

### 8.2 集成测试

- AI 引擎调用
- 文件上传下载
- 任务队列管理

### 8.3 E2E 测试

- 完整的商品图生成流程
- 完整的营销物料生成流程
- 批量生成流程
- A/B 测试流程

---

## 9. 实现阶段

### 9.1 第一阶段：基础框架 + 会员系统

- 侧边栏导航
- 模块切换
- 基础 UI 框架
- 会员系统（注册登录、用户信息）
- 会员等级与积分系统

### 9.2 第二阶段：商品图生成

- 商品图类型选择
- 参数配置界面
- AI 生成集成
- 预览下载

### 9.3 第三阶段：营销物料

- 模板系统
- 海报生成
- 社交媒体图生成
- 直播间背景生成

### 9.4 第四阶段：进阶功能

- 多平台尺寸适配
- 批量生成
- A/B 测试
- 会员配额管理集成

---

## 10. 待确认事项

- [x] 是否需要用户登录系统？ ✅ 已确认：需要会员登录
- [ ] 是否需要云端存储？（建议：需要，用于用户数据同步）
- [x] 是否需要付费功能？ ✅ 已确认：先做免费+积分模式，后续再考虑付费
- [ ] 是否需要 API 限流？（建议：需要，防止滥用）
- [ ] 是否需要图片水印功能？（建议：免费用户带水印，会员无水印）
- [x] 会员等级定价是否合理？ ✅ 已确认：采用积分制，无需定价
- [x] 积分消耗规则是否合理？ ✅ 已确认：合理
- [x] 是否需要微信登录？ ✅ 已确认：先用邮箱登录，后续再考虑微信登录
- [x] 是否需要支付功能？ ✅ 已确认：先做免费+积分模式，暂不需要支付功能

---

## 附录

### A. 参考资料

- 现有 Kanne Canvas 代码：`workspace/AI 生图平台/`
- 现有 API 集成：`src/imageApi.ts`
- 现有类型定义：`src/types.ts`

### B. 相关文件

- 项目 README：`workspace/AI 生图平台/README.md`
- 项目 CLAUDE.md：`workspace/AI 生图平台/CLAUDE.md`
- 项目 AGENTS.md：`workspace/AI 生图平台/AGENTS.md`

---

*文档版本：v1.0*
*最后更新：2026-05-03*
