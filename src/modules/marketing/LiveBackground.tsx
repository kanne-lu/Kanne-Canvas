import React from 'react';
import {
  Leaf, Crown, Heart, Cpu, PartyPopper, TreePine,
} from 'lucide-react';
import { LIVE_STYLES, LIVE_SIZES, QUALITIES } from './types';
import type { MarketingConfig } from './types';
import type { ImageSize, ImageQuality } from '../../types';

const STYLE_ICONS: Record<string, React.ReactNode> = {
  fresh: <Leaf size={18} />,
  luxury: <Crown size={18} />,
  cute: <Heart size={18} />,
  tech: <Cpu size={18} />,
  festive: <PartyPopper size={18} />,
  nature: <TreePine size={18} />,
};

interface LiveBackgroundProps {
  config: MarketingConfig;
  onConfigChange: (config: MarketingConfig) => void;
}

export function LiveBackground({ config, onConfigChange }: LiveBackgroundProps) {
  return (
    <div className="mkt-section">
      {/* 风格选择 */}
      <div className="mkt-section-label">背景风格</div>
      <div className="mkt-style-grid">
        {LIVE_STYLES.map((style) => (
          <button
            key={style.id}
            className={`mkt-style-card ${config.liveStyle === style.id ? 'active' : ''}`}
            onClick={() => onConfigChange({ ...config, liveStyle: style.id })}
          >
            <div className="mkt-style-icon">
              {STYLE_ICONS[style.id] || <Leaf size={18} />}
            </div>
            <div className="mkt-style-info">
              <strong>{style.label}</strong>
              <span>{style.description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 主题配置 */}
      <div className="mkt-section-label" style={{ marginTop: 16 }}>主题配置</div>
      <div className="mkt-fields">
        <label className="mkt-field">
          <span>直播主题</span>
          <input
            type="text"
            value={config.liveTheme}
            placeholder="如：美妆专场、数码新品首发、年货特卖"
            onChange={(e) => onConfigChange({ ...config, liveTheme: e.target.value })}
          />
        </label>
        <label className="mkt-field">
          <span>标题文字</span>
          <input
            type="text"
            value={config.title}
            placeholder="如：今日爆款 · 限时秒杀"
            onChange={(e) => onConfigChange({ ...config, title: e.target.value })}
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
            {LIVE_SIZES.map((s) => (
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
