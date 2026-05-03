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
