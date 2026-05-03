import React, { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { authApi } from './authApi';
import type { UserProfile } from './types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setNickname('');
    setError('');
  };

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    resetForm();
  };

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
            <label htmlFor="login-email">
              <Mail size={16} />
              邮箱
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="form-group">
              <label htmlFor="login-password">
                <Lock size={16} />
                密码
              </label>
              <input
                id="login-password"
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
              <label htmlFor="login-nickname">昵称（可选）</label>
              <input
                id="login-nickname"
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
              <button className="link-button" onClick={() => switchMode('register')}>
                没有账号？立即注册
              </button>
              <button className="link-button" onClick={() => switchMode('forgot')}>
                忘记密码？
              </button>
            </>
          ) : (
            <button className="link-button" onClick={() => switchMode('login')}>
              已有账号？立即登录
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
