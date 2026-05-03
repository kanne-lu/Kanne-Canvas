import React, { useState, useCallback } from 'react';
import { Package } from 'lucide-react';
import { generateImages } from '../../imageApi';
import { buildProductPrompt } from './types';
import { ProductConfig } from './ProductConfig';
import { ProductPreview } from './ProductPreview';
import type { ProductConfig as ProductConfigType } from './types';
import type { ApiSettings, GeneratedImage } from '../../types';

const defaultConfig: ProductConfigType = {
  type: 'white-bg',
  size: '1024x1024',
  quality: 'high',
  count: 1,
  sceneDescription: '',
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

async function saveGeneratedImage(imageUrl: string): Promise<string> {
  try {
    const response = await fetch('/save-generated.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    const payload = (await response.json().catch(() => null)) as {
      data?: { url?: string };
      error?: string;
    } | null;
    if (response.ok && payload?.data?.url) return payload.data.url;
  } catch {
    // ignore
  }
  return imageUrl;
}

export function ProductImageModule() {
  const [config, setConfig] = useState<ProductConfigType>(defaultConfig);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleFileSelect = useCallback(async (file: File) => {
    setError('');
    setSelectedFile(file);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreviewUrl(dataUrl);
      // 上传获取公网 URL
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

  const handleGenerate = useCallback(async () => {
    if (!uploadedUrl && !previewUrl) return;

    setStatus('loading');
    setError('');

    try {
      const prompt = buildProductPrompt(config);
      if (!prompt) throw new Error('无法生成提示词，请检查图片类型设置。');

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

      // 尝试持久化生成的图片
      const persistedImages = await Promise.all(
        images.map(async (image) => ({
          ...image,
          src: image.src.startsWith('http') ? await saveGeneratedImage(image.src) : image.src,
        })),
      );

      setGeneratedImages(persistedImages);
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

  return (
    <div className="product-module">
      <div className="product-header">
        <div className="brand-line">
          <div className="brand-mark">
            <Package size={22} color="#fff" />
          </div>
          <div>
            <p className="eyebrow">商品图生成</p>
            <h1 className="product-title">AI 商品图</h1>
          </div>
        </div>
        <p className="subtitle">上传商品图，选择类型，AI 一键生成电商素材</p>
      </div>

      <div className="product-layout">
        <aside className="product-sidebar">
          <ProductConfig
            config={config}
            onConfigChange={setConfig}
            previewUrl={previewUrl}
            onFileSelect={handleFileSelect}
            onClearImage={handleClearImage}
            onGenerate={handleGenerate}
            status={status}
            error={error}
          />
        </aside>

        <section className="product-main">
          <ProductPreview
            images={generatedImages}
            status={status}
            onClear={handleClearResults}
          />
        </section>
      </div>
    </div>
  );
}
