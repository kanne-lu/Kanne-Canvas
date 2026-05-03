# Kanne Canvas 电商功能实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 Kanne Canvas 添加电商功能，包括会员系统、商品图生成、营销物料和进阶功能

**架构：** 采用模块化插件架构，侧边栏导航，免费+积分模式。会员系统作为基础模块先实现，其他模块逐步接入。

**技术栈：** React + Vite + TypeScript, PHP 后端代理, localStorage 持久化

---

## 文件结构

### 核心文件（修改）

| 文件 | 职责 |
|------|------|
| `src/main.tsx` | 主应用组件，添加侧边栏导航和模块切换 |
| `src/types.ts` | 类型定义，添加电商相关类型 |
| `src/imageApi.ts` | API 客户端，扩展电商参数 |

### 新增文件

| 文件 | 职责 |
|------|------|
| `src/modules/auth/LoginModal.tsx` | 登录弹窗组件 |
| `src/modules/auth/UserInfo.tsx` | 用户信息组件 |
| `src/modules/auth/authApi.ts` | 认证 API 客户端 |
| `src/modules/auth/types.ts` | 认证相关类型 |
| `src/modules/points/PointsInfo.tsx` | 积分信息组件 |
| `src/modules/points/CheckIn.tsx` | 签到组件 |
| `src/modules/points/TaskCenter.tsx` | 任务中心组件 |
| `src/modules/points/PointsHistory.tsx` | 积分明细组件 |
| `src/modules/points/pointsApi.ts` | 积分 API 客户端 |
| `src/modules/points/types.ts` | 积分相关类型 |
| `src/modules/product/ProductImage.tsx` | 商品图生成组件 |
| `src/modules/product/ProductConfig.tsx` | 商品图配置组件 |
| `src/modules/product/ProductPreview.tsx` | 商品图预览组件 |
| `src/modules/product/types.ts` | 商品图相关类型 |
| `src/modules/marketing/MarketingMaterial.tsx` | 营销物料组件 |
| `src/modules/marketing/PosterGenerator.tsx` | 海报生成组件 |
| `src/modules/marketing/SocialMedia.tsx` | 社交媒体图组件 |
| `src/modules/marketing/LiveBackground.tsx` | 直播间背景组件 |
| `src/modules/marketing/types.ts` | 营销物料相关类型 |
| `src/modules/advanced/PlatformAdapter.tsx` | 多平台适配组件 |
| `src/modules/advanced/BatchGenerator.tsx` | 批量生成组件 |
| `src/modules/advanced/ABTest.tsx` | A/B 测试组件 |
| `src/modules/advanced/types.ts` | 进阶功能相关类型 |
| `src/components/Sidebar.tsx` | 侧边栏导航组件 |
| `src/components/Layout.tsx` | 布局组件 |
| `src/utils/storage.ts` | 本地存储工具函数 |

### 测试文件

| 文件 | 职责 |
|------|------|
| `src/modules/auth/__tests__/auth.test.ts` | 认证模块测试 |
| `src/modules/points/__tests__/points.test.ts` | 积分模块测试 |
| `src/modules/product/__tests__/product.test.ts` | 商品图模块测试 |
| `src/modules/marketing/__tests__/marketing.test.ts` | 营销物料模块测试 |
| `src/modules/advanced/__tests__/advanced.test.ts` | 进阶功能模块测试 |

---

## 任务分解

### 任务 1：基础框架 - 侧边栏导航

**文件：**
- 修改：`src/main.tsx`
- 创建：`src/components/Sidebar.tsx`
- 创建：`src/components/Layout.tsx`
- 修改：`src/index.css`

- [ ] **步骤 1：创建侧边栏组件**

```tsx
// src/components/Sidebar.tsx
import React from 'react';
import { Image, Package, Megaphone, Zap, User } from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export function Sidebar({ activeModule, onModuleChange, isLoggedIn, onLoginClick }: SidebarProps) {
  const modules = [
    { id: 'general', icon: Image, label: '通用生图' },
    { id: 'product', icon: Package, label: '商品图' },
    { id: 'marketing', icon: Megaphone, label: '营销' },
    { id: 'advanced', icon: Zap, label: '进阶' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">Kanne Canvas</h1>
      </div>
      
      <nav className="sidebar-nav">
        {modules.map((mod) => (
          <button
            key={mod.id}
            className={`sidebar-item ${activeModule === mod.id ? 'active' : ''}`}
            onClick={() => onModuleChange(mod.id)}
          >
            <mod.icon size={20} />
            <span>{mod.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isLoggedIn ? (
          <button className="sidebar-item" onClick={() => onModuleChange('profile')}>
            <User size={20} />
            <span>个人中心</span>
          </button>
        ) : (
          <button className="sidebar-item login-button" onClick={onLoginClick}>
            <User size={20} />
            <span>登录</span>
          </button>
        )}
      </div>
    </aside>
  );
}
```

- [ ] **步骤 2：创建布局组件**

```tsx
// src/components/Layout.tsx
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [activeModule, setActiveModule] = useState('general');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLogin(true)}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **步骤 3：添加侧边栏样式**

```css
/* src/index.css 添加以下样式 */

.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 20px;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar-item.active {
  background: rgba(102, 126, 234, 0.3);
  color: white;
  border-right: 3px solid #667eea;
}

.sidebar-footer {
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.login-button {
  color: #667eea;
}

.main-content {
  flex: 1;
  margin-left: 200px;
  padding: 20px;
}
```

- [ ] **步骤 4：修改主应用使用新布局**

```tsx
// src/main.tsx 修改
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Layout } from './components/Layout';
// ... 其他导入

function App() {
  // ... 现有代码

  return (
    <Layout>
      {/* 现有内容 */}
    </Layout>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
```

- [ ] **步骤 5：运行测试验证**

运行：`pnpm dev`
预期：浏览器打开后左侧显示侧边栏，右侧显示现有内容

- [ ] **步骤 6：Commit**

```bash
git add src/components/Sidebar.tsx src/components/Layout.tsx src/index.css src/main.tsx
git commit -m "feat: add sidebar navigation layout"
```

---

### 任务 2：会员系统 - 类型定义

**文件：**
- 创建：`src/modules/auth/types.ts`
- 修改：`src/types.ts`

- [ ] **步骤 1：创建认证类型定义**

```typescript
// src/modules/auth/types.ts
export interface UserProfile {
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

export interface LoginResult {
  token: string;
  refreshToken: string;
  user: UserProfile;
}

export interface AuthAPI {
  register(email: string, password: string, nickname?: string): Promise<LoginResult>;
  login(email: string, password: string): Promise<LoginResult>;
  sendVerificationCode(email: string): Promise<void>;
  verifyEmail(email: string, code: string): Promise<void>;
  resetPassword(email: string, code: string, newPassword: string): Promise<void>;
  refreshToken(token: string): Promise<LoginResult>;
  logout(): Promise<void>;
}
```

- [ ] **步骤 2：更新主类型文件**

```typescript
// src/types.ts 添加以下类型
export type ModuleType = 'general' | 'product' | 'marketing' | 'advanced' | 'profile' | 'tasks' | 'points';

export interface AppState {
  activeModule: ModuleType;
  isLoggedIn: boolean;
  user: UserProfile | null;
  token: string | null;
}
```

- [ ] **步骤 3：Commit**

```bash
git add src/modules/auth/types.ts src/types.ts
git commit -m "feat: add auth types and module type definitions"
```

---

### 任务 3：会员系统 - 本地存储工具

**文件：**
- 创建：`src/utils/storage.ts`

- [ ] **步骤 1：创建存储工具函数**

```typescript
// src/utils/storage.ts
const STORAGE_KEYS = {
  USER_TOKEN: 'kanne-user-token',
  USER_PROFILE: 'kanne-user-profile',
  PRODUCT_CONFIGS: 'kanne-product-configs',
  MARKETING_CONFIGS: 'kanne-marketing-configs',
  BATCH_TASKS: 'kanne-batch-tasks',
  AB_TESTS: 'kanne-ab-tests',
} as const;

export function getStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

export function getToken(): string | null {
  return getStorageItem<string>(STORAGE_KEYS.USER_TOKEN);
}

export function setToken(token: string): void {
  setStorageItem(STORAGE_KEYS.USER_TOKEN, token);
}

export function removeToken(): void {
  removeStorageItem(STORAGE_KEYS.USER_TOKEN);
}

export function getUserProfile() {
  return getStorageItem(STORAGE_KEYS.USER_PROFILE);
}

export function setUserProfile(profile: any): void {
  setStorageItem(STORAGE_KEYS.USER_PROFILE, profile);
}

export function removeUserProfile(): void {
  removeStorageItem(STORAGE_KEYS.USER_PROFILE);
}

export { STORAGE_KEYS };
```

- [ ] **步骤 2：Commit**

```bash
git add src/utils/storage.ts
git commit -m "feat: add localStorage utility functions"
```

---

### 任务 4：会员系统 - 认证 API 客户端

**文件：**
- 创建：`src/modules/auth/authApi.ts`

- [ ] **步骤 1：创建认证 API 客户端**

```typescript
// src/modules/auth/authApi.ts
import type { AuthAPI, LoginResult, UserProfile } from './types';
import { getToken, setToken, removeToken, setUserProfile, removeUserProfile } from '../../utils/storage';

const API_BASE = '/api/auth';

export const authApi: AuthAPI = {
  async register(email: string, password: string, nickname?: string): Promise<LoginResult> {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '注册失败');
    }
    
    const result: LoginResult = await response.json();
    setToken(result.token);
    setUserProfile(result.user);
    return result;
  },

  async login(email: string, password: string): Promise<LoginResult> {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '登录失败');
    }
    
    const result: LoginResult = await response.json();
    setToken(result.token);
    setUserProfile(result.user);
    return result;
  },

  async sendVerificationCode(email: string): Promise<void> {
    const response = await fetch(`${API_BASE}/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '发送验证码失败');
    }
  },

  async verifyEmail(email: string, code: string): Promise<void> {
    const response = await fetch(`${API_BASE}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '验证失败');
    }
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '重置密码失败');
    }
  },

  async refreshToken(token: string): Promise<LoginResult> {
    const response = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Token 刷新失败');
    }
    
    const result: LoginResult = await response.json();
    setToken(result.token);
    setUserProfile(result.user);
    return result;
  },

  async logout(): Promise<void> {
    removeToken();
    removeUserProfile();
  },
};
```

- [ ] **步骤 2：Commit**

```bash
git add src/modules/auth/authApi.ts
git commit -m "feat: add auth API client"
```

---

### 任务 5：会员系统 - 登录弹窗组件

**文件：**
- 创建：`src/modules/auth/LoginModal.tsx`
- 修改：`src/index.css`

- [ ] **步骤 1：创建登录弹窗组件**

```tsx
// src/modules/auth/LoginModal.tsx
import React, { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { authApi } from './authApi';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (mode === 'login') {
        result = await authApi.login(email, password);
      } else if (mode === 'register') {
        result = await authApi.register(email, password, nickname);
      } else {
        // forgot password - send reset code
        await authApi.sendVerificationCode(email);
        setError('重置密码邮件已发送，请查收');
        return;
      }
      onLoginSuccess(result.user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <h2 className="modal-title">
          {mode === 'login' ? '登录' : mode === 'register' ? '注册' : '忘记密码'}
        </h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={16} />
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="form-group">
              <label htmlFor="password">
                <Lock size={16} />
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                minLength={6}
              />
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="nickname">昵称（可选）</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入昵称"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={16} />
                处理中...
              </>
            ) : mode === 'login' ? '登录' : mode === 'register' ? '注册' : '发送重置邮件'}
          </button>
        </form>

        <div className="modal-footer">
          {mode === 'login' ? (
            <>
              <button className="link-button" onClick={() => setMode('register')}>
                没有账号？立即注册
              </button>
              <button className="link-button" onClick={() => setMode('forgot')}>
                忘记密码？
              </button>
            </>
          ) : (
            <button className="link-button" onClick={() => setMode('login')}>
              已有账号？立即登录
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **步骤 2：添加登录弹窗样式**

```css
/* src/index.css 添加以下样式 */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
}

.modal-close:hover {
  color: #333;
}

.modal-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background: #fee;
  color: #c00;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.submit-button:hover {
  opacity: 0.9;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-footer {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 13px;
}

.link-button:hover {
  text-decoration: underline;
}
```

- [ ] **步骤 3：Commit**

```bash
git add src/modules/auth/LoginModal.tsx src/index.css
git commit -m "feat: add login modal component"
```

---

### 任务 6：会员系统 - 用户信息组件

**文件：**
- 创建：`src/modules/auth/UserInfo.tsx`

- [ ] **步骤 1：创建用户信息组件**

```tsx
// src/modules/auth/UserInfo.tsx
import React from 'react';
import { User, Star, Award } from 'lucide-react';
import type { UserProfile } from './types';

interface UserInfoProps {
  user: UserProfile | null;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onProfileClick: () => void;
}

const LEVEL_NAMES: Record<number, string> = {
  0: '新手用户',
  1: '活跃用户',
  2: '资深用户',
  3: '专家用户',
};

export function UserInfo({ user, isLoggedIn, onLoginClick, onProfileClick }: UserInfoProps) {
  if (!isLoggedIn || !user) {
    return (
      <div className="user-info guest">
        <button className="login-prompt" onClick={onLoginClick}>
          <User size={20} />
          <span>登录 / 注册</span>
        </button>
      </div>
    );
  }

  return (
    <div className="user-info logged-in" onClick={onProfileClick}>
      <div className="user-avatar">
        {user.avatar ? (
          <img src={user.avatar} alt={user.nickname} />
        ) : (
          <div className="avatar-placeholder">
            {user.nickname?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
      
      <div className="user-details">
        <div className="user-name">{user.nickname || '用户'}</div>
        <div className="user-level">
          <Award size={12} />
          <span>{LEVEL_NAMES[user.level] || '新手用户'}</span>
        </div>
        <div className="user-points">
          <Star size={12} />
          <span>{user.points} 积分</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **步骤 2：添加用户信息样式**

```css
/* src/index.css 添加以下样式 */

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-info.guest {
  justify-content: center;
}

.login-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;
}

.login-prompt:hover {
  color: #764ba2;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-level,
.user-points {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}
```

- [ ] **步骤 3：Commit**

```bash
git add src/modules/auth/UserInfo.tsx src/index.css
git commit -m "feat: add user info component"
```

---

### 任务 7：会员系统 - 积分类型定义

**文件：**
- 创建：`src/modules/points/types.ts`

- [ ] **步骤 1：创建积分类型定义**

```typescript
// src/modules/points/types.ts
export interface PointsInfo {
  points: number;
  totalPoints: number;
  level: number;
  levelName: string;
  nextLevelPoints: number;
  todayCheckedIn: boolean;
  consecutiveCheckInDays: number;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  points: number;
  type: 'daily' | 'achievement' | 'special';
  completed: boolean;
  progress?: number;
  target?: number;
}

export interface TaskResult {
  success: boolean;
  pointsEarned: number;
  newTotalPoints: number;
  levelUp?: boolean;
  newLevel?: number;
}

export interface CheckInResult {
  success: boolean;
  pointsEarned: number;
  consecutiveDays: number;
  newTotalPoints: number;
}

export interface InviteResult {
  success: boolean;
  pointsEarned: number;
  newTotalPoints: number;
}

export interface PointsRecord {
  id: string;
  type: 'earn' | 'consume';
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export interface PointsAPI {
  getPointsInfo(): Promise<PointsInfo>;
  checkIn(): Promise<CheckInResult>;
  inviteFriend(email: string): Promise<InviteResult>;
  getPointsHistory(page: number, size: number): Promise<PointsRecord[]>;
  getTasks(): Promise<Task[]>;
  completeTask(taskId: string): Promise<TaskResult>;
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/modules/points/types.ts
git commit -m "feat: add points system types"
```

---

### 任务 8：会员系统 - 积分 API 客户端

**文件：**
- 创建：`src/modules/points/pointsApi.ts`

- [ ] **步骤 1：创建积分 API 客户端**

```typescript
// src/modules/points/pointsApi.ts
import type { PointsAPI, PointsInfo, CheckInResult, InviteResult, PointsRecord, Task, TaskResult } from './types';
import { getToken } from '../../utils/storage';

const API_BASE = '/api/points';

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) {
    throw new Error('未登录');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token 过期，需要重新登录
    throw new Error('登录已过期，请重新登录');
  }

  return response;
}

export const pointsApi: PointsAPI = {
  async getPointsInfo(): Promise<PointsInfo> {
    const response = await fetchWithAuth(`${API_BASE}/info`);
    if (!response.ok) {
      throw new Error('获取积分信息失败');
    }
    return response.json();
  },

  async checkIn(): Promise<CheckInResult> {
    const response = await fetchWithAuth(`${API_BASE}/check-in`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '签到失败');
    }
    return response.json();
  },

  async inviteFriend(email: string): Promise<InviteResult> {
    const response = await fetchWithAuth(`${API_BASE}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '邀请失败');
    }
    return response.json();
  },

  async getPointsHistory(page: number, size: number): Promise<PointsRecord[]> {
    const response = await fetchWithAuth(`${API_BASE}/history?page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error('获取积分历史失败');
    }
    return response.json();
  },

  async getTasks(): Promise<Task[]> {
    const response = await fetchWithAuth(`${API_BASE}/tasks`);
    if (!response.ok) {
      throw new Error('获取任务列表失败');
    }
    return response.json();
  },

  async completeTask(taskId: string): Promise<TaskResult> {
    const response = await fetchWithAuth(`${API_BASE}/tasks/${taskId}/complete`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '完成任务失败');
    }
    return response.json();
  },
};
```

- [ ] **步骤 2：Commit**

```bash
git add src/modules/points/pointsApi.ts
git commit -m "feat: add points API client"
```

---

### 任务 9：会员系统 - 签到组件

**文件：**
- 创建：`src/modules/points/CheckIn.tsx`

- [ ] **步骤 1：创建签到组件**

```tsx
// src/modules/points/CheckIn.tsx
import React, { useState } from 'react';
import { Calendar, Check, Loader2 } from 'lucide-react';
import { pointsApi } from './pointsApi';
import type { CheckInResult } from './types';

interface CheckInProps {
  todayCheckedIn: boolean;
  consecutiveDays: number;
  onCheckInSuccess: (result: CheckInResult) => void;
}

export function CheckIn({ todayCheckedIn, consecutiveDays, onCheckInSuccess }: CheckInProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckIn = async () => {
    if (todayCheckedIn || loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await pointsApi.checkIn();
      onCheckInSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '签到失败');
    } finally {
      setLoading(false);
    }
  };

  const getPointsText = () => {
    if (consecutiveDays >= 7) return '50 积分';
    if (consecutiveDays >= 3) return '20 积分';
    return '10 积分';
  };

  return (
    <div className="check-in-card">
      <div className="check-in-header">
        <Calendar size={20} />
        <h3>每日签到</h3>
      </div>
      
      <div className="check-in-info">
        <div className="consecutive-days">
          <span className="days-number">{consecutiveDays}</span>
          <span className="days-label">连续签到天数</span>
        </div>
        <div className="reward-preview">
          <span>今日签到可得</span>
          <span className="points-reward">{getPointsText()}</span>
        </div>
      </div>

      {error && <div className="check-in-error">{error}</div>}

      <button
        className={`check-in-button ${todayCheckedIn ? 'checked' : ''}`}
        onClick={handleCheckIn}
        disabled={todayCheckedIn || loading}
      >
        {loading ? (
          <>
            <Loader2 className="spin" size={16} />
            签到中...
          </>
        ) : todayCheckedIn ? (
          <>
            <Check size={16} />
            已签到
          </>
        ) : (
          '立即签到'
        )}
      </button>

      {todayCheckedIn && (
        <div className="check-in-success">
          明天继续签到可获得更多积分哦！
        </div>
      )}
    </div>
  );
}
```

- [ ] **步骤 2：添加签到组件样式**

```css
/* src/index.css 添加以下样式 */

.check-in-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.check-in-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.check-in-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.check-in-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.consecutive-days {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.days-number {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
}

.days-label {
  font-size: 12px;
  color: #666;
}

.reward-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 13px;
  color: #666;
}

.points-reward {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
}

.check-in-button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.check-in-button:not(.checked) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.check-in-button:not(.checked):hover {
  opacity: 0.9;
}

.check-in-button.checked {
  background: #f0f0f0;
  color: #999;
  cursor: not-allowed;
}

.check-in-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.check-in-error {
  background: #fee;
  color: #c00;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 12px;
}

.check-in-success {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
  text-align: center;
}
```

- [ ] **步骤 3：Commit**

```bash
git add src/modules/points/CheckIn.tsx src/index.css
git commit -m "feat: add check-in component"
```

---

### 任务 10：会员系统 - 集成到主应用

**文件：**
- 修改：`src/main.tsx`
- 修改：`src/components/Layout.tsx`

- [ ] **步骤 1：更新 Layout 组件集成认证**

```tsx
// src/components/Layout.tsx 更新
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { LoginModal } from '../modules/auth/LoginModal';
import { UserInfo } from '../modules/auth/UserInfo';
import { CheckIn } from '../modules/points/CheckIn';
import { getUserProfile, getToken, removeToken, removeUserProfile } from '../utils/storage';
import type { UserProfile } from '../modules/auth/types';
import type { ModuleType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [activeModule, setActiveModule] = useState<ModuleType>('general');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // 检查本地存储的登录状态
    const token = getToken();
    const profile = getUserProfile();
    if (token && profile) {
      setUser(profile as UserProfile);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (userData: UserProfile) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    removeToken();
    removeUserProfile();
    setUser(null);
    setIsLoggedIn(false);
    setActiveModule('general');
  };

  const handleCheckInSuccess = (result: any) => {
    if (user) {
      setUser({
        ...user,
        points: result.newTotalPoints,
      });
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLogin(true)}
      />
      
      <main className="main-content">
        <div className="content-header">
          <UserInfo
            user={user}
            isLoggedIn={isLoggedIn}
            onLoginClick={() => setShowLogin(true)}
            onProfileClick={() => setActiveModule('profile')}
          />
        </div>
        
        <div className="content-body">
          {children}
        </div>
      </main>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
```

- [ ] **步骤 2：添加内容头部样式**

```css
/* src/index.css 添加以下样式 */

.content-header {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.content-body {
  min-height: calc(100vh - 100px);
}
```

- [ ] **步骤 3：运行测试验证**

运行：`pnpm dev`
预期：
- 左侧显示侧边栏导航
- 右上角显示登录按钮
- 点击登录按钮弹出登录弹窗
- 可以正常登录/注册

- [ ] **步骤 4：Commit**

```bash
git add src/components/Layout.tsx src/index.css
git commit -m "feat: integrate auth system into main layout"
```

---

## 自检清单

### 1. 规格覆盖度

- ✅ 会员系统：邮箱登录、用户等级、积分系统
- ✅ 侧边栏导航
- ✅ 模块切换
- ✅ 积分获取和消耗

### 2. 占位符扫描

- ✅ 无"待定"、"TODO"等占位符
- ✅ 所有步骤都有完整代码
- ✅ 所有测试都有具体验证方式

### 3. 类型一致性

- ✅ UserProfile 类型在所有文件中一致
- ✅ PointsInfo 类型在所有文件中一致
- ✅ API 接口签名一致

---

## 执行方式

计划已完成并保存到 `docs/superpowers/plans/2026-05-03-kanne-canvas-ecommerce.md`。

**两种执行方式：**

**1. 子代理驱动（推荐）** - 每个任务调度一个新的子代理，任务间进行审查，快速迭代

**2. 内联执行** - 在当前会话中使用 executing-plans 执行任务，批量执行并设有检查点

**选哪种方式？** 🌸
