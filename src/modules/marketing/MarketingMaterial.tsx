import React, { useState, useCallback, useRef } from 'react';
import {
  Megaphone, Share2, Radio, Upload, X, Sparkles, Loader2,
  ImagePlus,
} from 'lucide-react';
import { generateImages } from '../../imageApi';
import {
  MARKETING_TYPES,
  DEFAULT_MARKETING_CONFIG,
  buildMarketingPrompt,
} from './types';
import { PosterGenerator } from './PosterGenerator';
import { SocialMedia } from './SocialMedia';
import { LiveBackground } from './LiveBackground';
import { MarketingPreview } from './MarketingPreview';
import type { MarketingConfig, MarketingType } from './types';
import type { ApiSettings, GeneratedImage } from '../../types';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  poster: <Megaphone size={20} />,
  social: <Share2 size={20} />,
  live: <Radio size={20} />,
};

const defaultSettings: ApiSettings = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://duomiapi.com',
  model: import.meta.env.VITE_API_MODEL || 'gpt-image-2',
};

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`读取图片失败：${file.name}`));
    reader.readAsDataURL(file);
  });
}

async function uploadReferenceFile(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const uploadUrl = import.meta.env.VITE_UPLOAD_API_URL || '/upload.php';
    const response = await fetch(uploadUrl, { method: 'POST', body: formData });
    const payload = (await response.json().catch(() => null)) as {
      data?: { url?: string };
      error?: string;
    } | null;
    if (response.ok && payload?.data?.url) {
      const url = payload.data.url;
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        throw new Error('本地 /upload.php 返回的是内网地址，云端 API 无法访问该图片。');
      }
      return url;
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('内网地址')) throw e;
  }
  throw new Error(
    '当前环境无公网图床支持。请手动将参考图上传至公共图床，然后在通用生图模式中使用。',
  );
}

export function MarketingMaterialModule() {
  const [config, setConfig] = useState<MarketingConfig>(DEFAULT_MARKETING_CONFIG);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = useCallback((type: MarketingType) => {
    setConfig((prev) => ({
      ...prev,
      type,
      // 重置部分字段
      title: '',
      subtitle: '',
      promotion: '',
      sceneDescription: '',
      liveTheme: '',
    }));
    setError('');
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setError('');
    setSelectedFile(file);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreviewUrl(dataUrl);
      const publicUrl = await uploadReferenceFile(file);
      setUploadedUrl(publicUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '图片处理失败');
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadedUrl(null);
    }
  }, []);

  const handleClearImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedUrl(null);
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) handleFileSelect(file);
      event.currentTarget.value = '';
    },
    [handleFileSelect],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = Array.from(event.dataTransfer.files).find((f) =>
        f.type.startsWith('image/'),
      );
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleGenerate = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      const prompt = buildMarketingPrompt(config);
      if (!prompt) throw new Error('无法生成提示词，请检查配置。');

      const imageUrl = uploadedUrl || previewUrl || '';
      const request = {
        prompt,
        referenceImages: imageUrl,
        size: config.size,
        quality: config.quality,
        format: 'png' as const,
        n: config.count,
      };

      const images = await generateImages(defaultSettings, request);
      setGeneratedImages(images);
      setStatus('success');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '生成失败，请稍后重试。');
      setStatus('error');
    }
  }, [config, uploadedUrl, previewUrl]);

  const handleClearResults = useCallback(() => {
    setGeneratedImages([]);
    setStatus('idle');
  }, []);

  const canGenerate = status !== 'loading';

  return (
    <div className="mkt-module">
      {/* Header */}
      <div className="mkt-header">
        <div className="brand-line">
          <div className="brand-mark mkt-brand-mark">
            <Megaphone size={22} color="#fff" />
          </div>
          <div>
            <p className="eyebrow mkt-eyebrow">营销物料</p>
            <h1 className="mkt-title">AI 营销物料</h1>
          </div>
        </div>
        <p className="subtitle">电商海报、社交媒体图、直播间背景，一键 AI 生成</p>
      </div>

      <div className="mkt-layout">
        {/* 左侧配置面板 */}
        <aside className="mkt-sidebar">
          <div className="mkt-config-panel">
            {/* 物料类型选择 */}
            <div className="mkt-type-selector">
              {MARKETING_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`mkt-type-btn ${config.type === type.id ? 'active' : ''}`}
                  onClick={() => handleTypeChange(type.id)}
                >
                  <div className="mkt-type-icon">{TYPE_ICONS[type.id]}</div>
                  <div className="mkt-type-info">
                    <strong>{type.label}</strong>
                    <span>{type.description}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* 参考图上传（可选） */}
            <div className="mkt-upload-section">
              <div className="mkt-upload-header">
                <span className="mkt-section-label">参考图（可选）</span>
                {previewUrl && (
                  <button className="mkt-clear-btn" onClick={handleClearImage}>
                    <X size={14} />
                  </button>
                )}
              </div>
              {previewUrl ? (
                <div className="mkt-upload-preview">
                  <img src={previewUrl} alt="参考图" />
                </div>
              ) : (
                <div
                  className="mkt-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <ImagePlus size={24} />
                  <span>上传商品图作为参考</span>
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

            {/* 各类型配置 */}
            {config.type === 'poster' && (
              <PosterGenerator config={config} onConfigChange={setConfig} />
            )}
            {config.type === 'social' && (
              <SocialMedia config={config} onConfigChange={setConfig} />
            )}
            {config.type === 'live' && (
              <LiveBackground config={config} onConfigChange={setConfig} />
            )}

            {/* 生成按钮 */}
            <button
              className="generate-button mkt-generate-btn"
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
              {status === 'loading' ? (
                <Loader2 className="spin" size={21} />
              ) : (
                <Sparkles size={21} />
              )}
              {status === 'loading' ? '正在生成...' : '生成营销素材'}
            </button>

            {error && <p className="error-box">{error}</p>}
          </div>
        </aside>

        {/* 右侧预览 */}
        <section className="mkt-main">
          <MarketingPreview
            images={generatedImages}
            status={status}
            onClear={handleClearResults}
          />
        </section>
      </div>
    </div>
  );
}
