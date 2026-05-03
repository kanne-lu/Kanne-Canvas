import React, { useState, useCallback, useRef } from 'react';
import { Monitor, Upload, Download, X, CheckSquare, Square, Loader2, Image as ImageIcon } from 'lucide-react';
import { PLATFORM_SIZES } from './types';
import type { Platform, PlatformConvertResult } from './types';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`读取图片失败：${file.name}`));
    reader.readAsDataURL(file);
  });
}

function convertImageToSize(
  dataUrl: string,
  targetWidth: number,
  targetHeight: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建 Canvas'));
        return;
      }

      // 白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // 保持比例居中绘制
      const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offsetX = (targetWidth - drawW) / 2;
      const offsetY = (targetHeight - drawH) / 2;

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = dataUrl;
  });
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function PlatformAdapter() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set());
  const [results, setResults] = useState<PlatformConvertResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'converting' | 'done'>('idle');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError('');
    try {
      const dataUrl = await fileToDataUrl(file);
      setSourceImage(dataUrl);
      setResults([]);
      setStatus('idle');
    } catch (e) {
      setError(e instanceof Error ? e.message : '图片读取失败');
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
      e.currentTarget.value = '';
    },
    [handleFileSelect],
  );

  const togglePlatform = useCallback((platform: Platform) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPlatforms(new Set(PLATFORM_SIZES.map((p) => p.platform)));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedPlatforms(new Set());
  }, []);

  const handleConvert = useCallback(async () => {
    if (!sourceImage || selectedPlatforms.size === 0) return;

    setStatus('converting');
    setError('');
    setResults([]);

    try {
      const targets = PLATFORM_SIZES.filter((p) => selectedPlatforms.has(p.platform));
      const converted: PlatformConvertResult[] = [];

      for (const target of targets) {
        const dataUrl = await convertImageToSize(sourceImage, target.width, target.height);
        converted.push({
          platform: target.platform,
          name: target.name,
          width: target.width,
          height: target.height,
          dataUrl,
        });
      }

      setResults(converted);
      setStatus('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败');
      setStatus('idle');
    }
  }, [sourceImage, selectedPlatforms]);

  const handleDownloadSingle = useCallback((result: PlatformConvertResult) => {
    downloadDataUrl(result.dataUrl, `${result.platform}_${result.width}x${result.height}.png`);
  }, []);

  const handleDownloadAll = useCallback(() => {
    results.forEach((r, i) => {
      setTimeout(() => {
        downloadDataUrl(r.dataUrl, `${r.platform}_${r.width}x${r.height}.png`);
      }, i * 200);
    });
  }, [results]);

  const handleClearImage = useCallback(() => {
    setSourceImage(null);
    setResults([]);
    setStatus('idle');
  }, []);

  return (
    <div className="adv-module">
      <div className="adv-header">
        <div className="brand-line">
          <div className="adv-brand-mark">
            <Monitor size={22} color="#fff" />
          </div>
          <div>
            <p className="eyebrow adv-eyebrow">多平台适配</p>
            <h1 className="adv-title">平台尺寸转换</h1>
          </div>
        </div>
        <p className="subtitle">上传图片，一键转换为多个电商平台尺寸</p>
      </div>

      <div className="adv-layout">
        <aside className="adv-sidebar">
          <div className="adv-config-panel">
            {/* 上传区域 */}
            <div className="adv-section">
              <div className="adv-section-label">上传原图</div>
              {sourceImage ? (
                <div className="adv-upload-preview-wrap">
                  <div className="adv-upload-preview">
                    <img src={sourceImage} alt="原图" />
                  </div>
                  <button className="adv-clear-btn" onClick={handleClearImage}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  className="adv-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) handleFileSelect(file);
                  }}
                >
                  <Upload size={24} />
                  <span>点击或拖拽上传图片</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                className="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
              />
            </div>

            {/* 选择平台 */}
            <div className="adv-section">
              <div className="adv-section-header">
                <div className="adv-section-label">选择目标平台</div>
                <div className="adv-section-actions">
                  <button className="adv-mini-btn" onClick={selectAll}>全选</button>
                  <button className="adv-mini-btn" onClick={clearAll}>清空</button>
                </div>
              </div>
              <div className="adv-platform-grid">
                {PLATFORM_SIZES.map((p) => (
                  <button
                    key={p.platform}
                    className={`adv-platform-card ${selectedPlatforms.has(p.platform) ? 'active' : ''}`}
                    onClick={() => togglePlatform(p.platform)}
                    style={{ '--platform-color': p.color } as React.CSSProperties}
                  >
                    <span className="adv-platform-icon">{p.icon}</span>
                    <div className="adv-platform-info">
                      <strong>{p.name}</strong>
                      <span>{p.width} x {p.height}</span>
                    </div>
                    {selectedPlatforms.has(p.platform) ? (
                      <CheckSquare size={16} className="adv-check-icon" />
                    ) : (
                      <Square size={16} className="adv-check-icon" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 转换按钮 */}
            <button
              className="generate-button adv-generate-btn"
              disabled={!sourceImage || selectedPlatforms.size === 0 || status === 'converting'}
              onClick={handleConvert}
            >
              {status === 'converting' ? (
                <><Loader2 className="spin" size={20} /> 转换中...</>
              ) : (
                <><ImageIcon size={20} /> 一键转换 ({selectedPlatforms.size} 个平台)</>
              )}
            </button>

            {error && <div className="error-box">{error}</div>}
          </div>
        </aside>

        <section className="adv-main">
          <div className="adv-preview-panel">
            <div className="adv-preview-header">
              <h2>转换结果</h2>
              {results.length > 0 && (
                <button className="ghost-button" onClick={handleDownloadAll}>
                  <Download size={16} /> 全部下载
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <div className="adv-empty">
                <Monitor size={44} />
                <p>上传图片并选择目标平台，点击转换即可生成适配各平台的尺寸</p>
              </div>
            ) : (
              <div className="adv-result-grid">
                {results.map((r) => (
                  <div className="adv-result-card" key={r.platform}>
                    <div className="adv-result-preview">
                      <img src={r.dataUrl} alt={r.name} />
                    </div>
                    <div className="adv-result-info">
                      <div className="adv-result-name">
                        <span>{PLATFORM_SIZES.find((p) => p.platform === r.platform)?.icon}</span>
                        <strong>{r.name}</strong>
                      </div>
                      <span className="adv-result-size">{r.width} x {r.height}</span>
                    </div>
                    <button
                      className="adv-download-btn"
                      onClick={() => handleDownloadSingle(r)}
                    >
                      <Download size={14} /> 下载
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
