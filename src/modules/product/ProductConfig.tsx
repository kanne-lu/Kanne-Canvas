import React, { useRef } from 'react';
import { Layers, Mountain, UserCheck, LayoutList, Upload, X, Sparkles, Loader2 } from 'lucide-react';
import { PRODUCT_TYPES, PRODUCT_SIZES, PRODUCT_QUALITIES } from './types';
import type { ProductConfig as ProductConfigType, ProductType } from './types';
import type { ImageSize, ImageQuality } from '../../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Layers: <Layers size={20} />,
  Mountain: <Mountain size={20} />,
  UserCheck: <UserCheck size={20} />,
  LayoutList: <LayoutList size={20} />,
};

interface ProductConfigProps {
  config: ProductConfigType;
  onConfigChange: (config: ProductConfigType) => void;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onClearImage: () => void;
  onGenerate: () => void;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string;
}

export function ProductConfig({
  config,
  onConfigChange,
  previewUrl,
  onFileSelect,
  onClearImage,
  onGenerate,
  status,
  error,
}: ProductConfigProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleTypeChange(type: ProductType) {
    onConfigChange({ ...config, type, sceneDescription: '' });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onFileSelect(file);
    event.currentTarget.value = '';
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    const file = Array.from(event.dataTransfer.files).find((f) => f.type.startsWith('image/'));
    if (file) onFileSelect(file);
  }

  const canGenerate = !!previewUrl && status !== 'loading';

  return (
    <div className="product-config">
      {/* 上传区域 */}
      <div
        className={`product-upload-zone ${previewUrl ? 'has-image' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="product-preview-thumb">
            <img src={previewUrl} alt="商品原图" />
            <button className="product-clear-btn" onClick={onClearImage} title="移除图片">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="product-upload-empty" onClick={() => fileInputRef.current?.click()}>
            <Upload size={28} />
            <p>上传商品图</p>
            <span>拖拽或点击选择</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="file-input"
          onChange={handleFileChange}
        />
      </div>

      {/* 图片类型选择 */}
      <div className="product-type-section">
        <div className="field">
          <span>图片类型</span>
        </div>
        <div className="product-type-grid">
          {PRODUCT_TYPES.map((type) => (
            <button
              key={type.id}
              className={`product-type-card ${config.type === type.id ? 'active' : ''}`}
              onClick={() => handleTypeChange(type.id)}
            >
              <div className="product-type-icon">{ICON_MAP[type.icon]}</div>
              <div className="product-type-info">
                <strong>{type.label}</strong>
                <span>{type.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 场景描述（仅场景图） */}
      {config.type === 'scene' && (
        <div className="field">
          <span>场景描述</span>
          <textarea
            className="product-scene-input"
            value={config.sceneDescription}
            rows={2}
            placeholder={PRODUCT_TYPES.find((t) => t.id === 'scene')?.placeholder}
            onChange={(e) => onConfigChange({ ...config, sceneDescription: e.target.value })}
          />
        </div>
      )}

      {/* 参数选项 */}
      <div className="product-options-grid">
        <label className="field compact">
          <span>尺寸</span>
          <select
            value={config.size}
            onChange={(e) => onConfigChange({ ...config, size: e.target.value as ImageSize })}
          >
            {PRODUCT_SIZES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="field compact">
          <span>质量</span>
          <select
            value={config.quality}
            onChange={(e) => onConfigChange({ ...config, quality: e.target.value as ImageQuality })}
          >
            {PRODUCT_QUALITIES.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </label>
        <label className="field compact">
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

      {/* 生成按钮 */}
      <button className="generate-button" disabled={!canGenerate} onClick={onGenerate}>
        {status === 'loading' ? <Loader2 className="spin" size={21} /> : <Sparkles size={21} />}
        {status === 'loading' ? '正在生成...' : '生成商品图'}
      </button>

      {error && <p className="error-box">{error}</p>}
    </div>
  );
}
