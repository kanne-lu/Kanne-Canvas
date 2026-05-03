import type {
  PointsAPI,
  PointsInfo,
  CheckInResult,
  InviteResult,
  PointsRecord,
  Task,
  TaskResult,
} from './types';
import { getToken } from '../../utils/storage';

const API_BASE = '/api/points';

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  if (!token) {
    throw new Error('未登录');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
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
    const response = await fetchWithAuth(
      `${API_BASE}/history?page=${page}&size=${size}`
    );
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
    const response = await fetchWithAuth(
      `${API_BASE}/tasks/${taskId}/complete`,
      { method: 'POST' }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '完成任务失败');
    }
    return response.json();
  },
};
