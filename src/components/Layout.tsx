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
