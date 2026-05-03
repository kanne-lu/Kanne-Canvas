import type { AuthAPI, LoginResult } from './types';
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
