import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { LoginModal } from '../modules/auth/LoginModal';
import { UserInfo } from '../modules/auth/UserInfo';
import { CheckIn } from '../modules/points/CheckIn';
import { ProductImageModule } from '../modules/product/ProductImage';
import { MarketingMaterialModule } from '../modules/marketing/MarketingMaterial';
import { AdvancedModule } from '../modules/advanced/AdvancedModule';
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
          {activeModule === 'product' ? (
            <ProductImageModule />
          ) : activeModule === 'marketing' ? (
            <MarketingMaterialModule />
          ) : activeModule === 'advanced' ? (
            <AdvancedModule />
          ) : (
            children
          )}
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
