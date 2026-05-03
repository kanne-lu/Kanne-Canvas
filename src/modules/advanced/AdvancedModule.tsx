import React, { useState } from 'react';
import { Monitor, Layers, FlaskConical, Zap } from 'lucide-react';
import { PlatformAdapter } from './PlatformAdapter';
import { BatchGenerator } from './BatchGenerator';
import { ABTest } from './ABTest';

type AdvancedTab = 'platform' | 'batch' | 'abtest';

const tabs: { id: AdvancedTab; label: string; icon: typeof Monitor; description: string }[] = [
  { id: 'platform', label: '多平台适配', icon: Monitor, description: '一键转换多平台尺寸' },
  { id: 'batch', label: '批量生成', icon: Layers, description: '多商品批量任务' },
  { id: 'abtest', label: 'A/B 测试', icon: FlaskConical, description: '风格对比测试' },
];

export function AdvancedModule() {
  const [activeTab, setActiveTab] = useState<AdvancedTab>('platform');

  return (
    <div className="adv-module-wrapper">
      {/* 子模块标签栏 */}
      <div className="adv-tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`adv-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            <div className="adv-tab-text">
              <strong>{tab.label}</strong>
              <span>{tab.description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 子模块内容 */}
      <div className="adv-tab-content">
        {activeTab === 'platform' && <PlatformAdapter />}
        {activeTab === 'batch' && <BatchGenerator />}
        {activeTab === 'abtest' && <ABTest />}
      </div>
    </div>
  );
}
