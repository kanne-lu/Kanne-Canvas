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
