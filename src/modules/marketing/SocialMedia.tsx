import React from 'react';
import { SOCIAL_PLATFORMS, SOCIAL_SIZES, QUALITIES } from './types';
import type { MarketingConfig, SocialPlatform } from './types';
import type { ImageSize, ImageQuality } from '../../types';

const PLATFORM_COLORS: Record<string, string> = {
  xiaohongshu: '#ff2442',
  douyin: '#000',
  taobao: '#ff5000',
  jingdong: '#e4002b',
  kuaishou: '#ff4906',
  pinduoduo: '#e02e24',
};

interface SocialMediaProps {
  config: MarketingConfig;
  onConfigChange: (config: MarketingConfig) => void;
}

export function SocialMedia({ config, onConfigChange }: SocialMediaProps) {
  function handlePlatformChange(platformId: SocialPlatform) {
    const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
    onConfigChange({
      ...config,
      platform: platformId,
      size: (platform?.size as ImageSize) || config.size,
    });
  }

  return (
    <div className="mkt-section">
      {/* 平台选择 */}
      <div className="mkt-section-label">选择平台</div>
      <div className="mkt-platform-grid">
        {SOCIAL_PLATFORMS.map((platform) => (
          <button
            key={platform.id}
            className={`mkt-platform-card ${config.platform === platform.id ? 'active' : ''}`}
            onClick={() => handlePlatformChange(platform.id)}
            style={{
              '--platform-color': PLATFORM_COLORS[platform.id] || '#2563eb',
            } as React.CSSProperties}
          >
            <div className="mkt-platform-dot" />
            <div className="mkt-platform-info">
              <strong>{platform.label}</strong>
              <span>{platform.sizeLabel}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 内容配置 */}
      <div className="mkt-section-label" style={{ marginTop: 16 }}>内容配置</div>
      <div className="mkt-fields">
        <label className="mkt-field">
          <span>标题</span>
          <input
            type="text"
            value={config.title}
            placeholder="推广图标题"
            onChange={(e) => onConfigChange({ ...config, title: e.target.value })}
          />
        </label>
        <label className="mkt-field">
          <span>内容描述</span>
          <textarea
            value={config.sceneDescription}
            rows={3}
            placeholder="描述推广图内容，如：新品护肤套装，适合敏感肌，夏日必备好物"
            onChange={(e) => onConfigChange({ ...config, sceneDescription: e.target.value })}
          />
        </label>
      </div>

      {/* 参数 */}
      <div className="mkt-options-row">
        <label className="mkt-field compact">
          <span>尺寸</span>
          <select
            value={config.size}
            onChange={(e) => onConfigChange({ ...config, size: e.target.value as ImageSize })}
          >
            {SOCIAL_SIZES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="mkt-field compact">
          <span>质量</span>
          <select
            value={config.quality}
            onChange={(e) => onConfigChange({ ...config, quality: e.target.value as ImageQuality })}
          >
            {QUALITIES.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </label>
        <label className="mkt-field compact">
          <span>数量</span>
          <select
            value={String(config.count)}
            onChange={(e) => onConfigChange({ ...config, count: Number(e.target.value) })}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n} 张</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
