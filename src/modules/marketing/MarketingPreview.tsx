import React, { useState, useEffect } from 'react';
import { Megaphone, Download, X, Trash2, Loader2 } from 'lucide-react';
import type { GeneratedImage } from '../../types';

interface MarketingPreviewProps {
  images: GeneratedImage[];
  status: 'idle' | 'loading' | 'success' | 'error';
  onClear: () => void;
}

export function MarketingPreview({ images, status, onClear }: MarketingPreviewProps) {
  const [lightbox, setLightbox] = useState<{ images: GeneratedImage[]; index: number } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setLightbox(null);
      if (event.key === 'ArrowRight')
        setLightbox((prev) =>
          prev && prev.index < prev.images.length - 1
            ? { ...prev, index: prev.index + 1 }
            : prev,
        );
      if (event.key === 'ArrowLeft')
        setLightbox((prev) =>
          prev && prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev,
        );
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox]);

  return (
    <div className="mkt-preview">
      <div className="mkt-preview-header">
        <div>
          <p className="eyebrow mini">Marketing Output</p>
          <h2>{images.length > 0 ? '生成结果' : '等待生成'}</h2>
        </div>
        {images.length > 0 && (
          <button className="ghost-button" onClick={onClear}>
            <Trash2 size={16} /> 清空
          </button>
        )}
      </div>

      {status === 'loading' && (
        <div className="mkt-loading">
          <Loader2 className="spin" size={32} />
          <p>AI 正在生成营销素材，请稍候...</p>
          <span>通常需要 10-30 秒</span>
        </div>
      )}

      {status !== 'loading' && images.length === 0 && (
        <div className="mkt-empty">
          <Megaphone size={48} />
          <p>选择物料类型并配置内容，开始生成营销素材</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="mkt-image-grid">
          {images.map((image, index) => (
            <article
              className="mkt-image-card"
              key={image.id}
              onClick={() => setLightbox({ images, index })}
            >
              <img src={image.src} alt="生成的营销图" />
              <div className="mkt-image-actions">
                <a
                  href={image.src}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={16} /> 下载
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={() => setLightbox(null)}>
            <img
              className="lightbox-img"
              src={lightbox.images[lightbox.index].src}
              alt="营销图预览"
            />
            <div className="lightbox-bar" onClick={(e) => e.stopPropagation()}>
              <a
                className="lightbox-download"
                href={lightbox.images[lightbox.index].src}
                target="_blank"
                rel="noreferrer"
              >
                <Download size={16} /> 下载
              </a>
              <span className="lightbox-counter">
                {lightbox.index + 1} / {lightbox.images.length}
              </span>
              <button className="lightbox-close" onClick={() => setLightbox(null)}>
                <X size={20} />
              </button>
            </div>
            {lightbox.images.length > 1 && (
              <>
                <button
                  className="lightbox-nav lightbox-prev"
                  disabled={lightbox.index === 0}
                  onClick={() => setLightbox({ ...lightbox, index: lightbox.index - 1 })}
                >
                  &lsaquo;
                </button>
                <button
                  className="lightbox-nav lightbox-next"
                  disabled={lightbox.index === lightbox.images.length - 1}
                  onClick={() => setLightbox({ ...lightbox, index: lightbox.index + 1 })}
                >
                  &rsaquo;
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
