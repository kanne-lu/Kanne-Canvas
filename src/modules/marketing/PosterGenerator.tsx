import React from 'react';
import {
  ShoppingBag, Gift, Sparkles, Tag, Award, Percent,
} from 'lucide-react';
import { POSTER_TEMPLATES, POSTER_SIZES, QUALITIES } from './types';
import type { MarketingConfig } from './types';
import type { ImageSize, ImageQuality } from '../../types';

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  double11: <ShoppingBag size={18} />,
  '618': <Percent size={18} />,
  newyear: <Gift size={18} />,
  newproduct: <Sparkles size={18} />,
  mothersday: <Award size={18} />,
  clearance: <Tag size={18} />,
};

interface PosterGeneratorProps {
  config: MarketingConfig;
  onConfigChange: (config: MarketingConfig) => void;
}

export function PosterGenerator({ config, onConfigChange }: PosterGeneratorProps) {
  function handleTemplateChange(templateId: string) {
    const template = POSTER_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    onConfigChange({
      ...config,
      template: templateId,
      title: template.defaultTitle,
      subtitle: template.defaultSubtitle,
      promotion: template.defaultPromotion,
    });
  }

  return (
    <div className="mkt-section">
      {/* 模板选择 */}
      <div className="mkt-section-label">选择模板</div>
      <div className="mkt-template-grid">
        {POSTER_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            className={`mkt-template-card ${config.template === tpl.id ? 'active' : ''}`}
            onClick={() => handleTemplateChange(tpl.id)}
          >
            <div className="mkt-template-icon">
              {TEMPLATE_ICONS[tpl.id] || <ShoppingBag size={18} />}
            </div>
            <div className="mkt-template-info">
              <strong>{tpl.label}</strong>
              <span>{tpl.description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 自定义内容 */}
      <div className="mkt-section-label" style={{ marginTop: 16 }}>自定义内容</div>
      <div className="mkt-fields">
        <label className="mkt-field">
          <span>主标题</span>
          <input
            type="text"
            value={config.title}
            placeholder="如：双11 狂欢盛典"
            onChange={(e) => onConfigChange({ ...config, title: e.target.value })}
          />
        </label>
        <label className="mkt-field">
          <span>副标题</span>
          <input
            type="text"
            value={config.subtitle}
            placeholder="如：全场低至 5 折"
            onChange={(e) => onConfigChange({ ...config, subtitle: e.target.value })}
          />
        </label>
        <label className="mkt-field">
          <span>促销信息</span>
          <textarea
            value={config.promotion}
            rows={2}
            placeholder="如：限时抢购 · 满减优惠 · 前 N 名半价"
            onChange={(e) => onConfigChange({ ...config, promotion: e.target.value })}
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
            {POSTER_SIZES.map((s) => (
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
