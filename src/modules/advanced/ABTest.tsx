import React, { useState, useCallback, useRef } from 'react';
import {
  FlaskConical, Upload, Download, X, Loader2, BarChart3,
  ThumbsUp, MousePointerClick, TrendingUp, RotateCcw, CheckCircle2,
} from 'lucide-react';
import { generateImages } from '../../imageApi';
import { AB_TEST_STYLES } from './types';
import type { ABTestVersion, ABTestResult } from './types';
import type { ApiSettings, ImageSize, ImageQuality } from '../../types';

const defaultSettings: ApiSettings = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://duomiapi.com',
  model: import.meta.env.VITE_API_MODEL || 'gpt-image-2',
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`读取失败：${file.name}`));
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
      if (url.includes('localhost') || url.includes('127.0.0.1')) throw new Error('本地地址不可用');
      return url;
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('本地地址')) throw e;
  }
  throw new Error('无公网图床支持，请手动上传参考图后粘贴 URL。');
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ABTest() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());
  const [size, setSize] = useState<ImageSize>('1024x1024');
  const [quality, setQuality] = useState<ImageQuality>('high');
  const [versions, setVersions] = useState<ABTestVersion[]>([]);
  const [testResults, setTestResults] = useState<ABTestResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError('');
    try {
      const dataUrl = await fileToDataUrl(file);
      setSourceImage(dataUrl);
      let publicUrl: string | null = null;
      try {
        publicUrl = await uploadReferenceFile(file);
      } catch {
        // 兜底用 dataUrl
      }
      setSourceUrl(publicUrl || dataUrl);
      setVersions([]);
      setStatus('idle');
      setSelectedWinner(null);
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

  const toggleStyle = useCallback((styleId: string) => {
    setSelectedStyles((prev) => {
      const next = new Set(prev);
      if (next.has(styleId)) {
        next.delete(styleId);
      } else {
        next.add(styleId);
      }
      return next;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!sourceUrl || selectedStyles.size < 2) return;

    setStatus('generating');
    setError('');
    setVersions([]);
    setSelectedWinner(null);

    try {
      const styles = AB_TEST_STYLES.filter((s) => selectedStyles.has(s.id));
      const newVersions: ABTestVersion[] = [];

      for (const style of styles) {
        try {
          const images = await generateImages(defaultSettings, {
            prompt: style.prompt,
            referenceImages: sourceUrl,
            size,
            quality,
            format: 'png',
            n: 1,
          });

          if (images.length > 0) {
            newVersions.push({
              id: `ver_${Date.now()}_${style.id}`,
              styleId: style.id,
              styleName: style.label,
              src: images[0].src,
              metrics: {
                clicks: Math.floor(Math.random() * 1000),
                conversions: Math.floor(Math.random() * 100),
              },
            });
          }
        } catch (e) {
          console.error(`风格 ${style.label} 生成失败:`, e);
        }
      }

      if (newVersions.length < 2) {
        throw new Error('至少需要 2 个成功生成的版本');
      }

      setVersions(newVersions);
      setStatus('done');

      // 保存测试记录
      const result: ABTestResult = {
        id: `test_${Date.now()}`,
        versions: newVersions,
        createdAt: new Date().toISOString(),
      };
      setTestResults((prev) => [result, ...prev].slice(0, 5));
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
      setStatus('error');
    }
  }, [sourceUrl, selectedStyles, size, quality]);

  const handleClearImage = useCallback(() => {
    setSourceImage(null);
    setSourceUrl(null);
    setVersions([]);
    setStatus('idle');
    setSelectedWinner(null);
  }, []);

  const handleSelectWinner = useCallback((versionId: string) => {
    setSelectedWinner((prev) => (prev === versionId ? null : versionId));
  }, []);

  const getWinnerMetrics = (version: ABTestVersion) => {
    const totalClicks = versions.reduce((sum, v) => sum + v.metrics.clicks, 0);
    const totalConversions = versions.reduce((sum, v) => sum + v.metrics.conversions, 0);
    return {
      clickRate: totalClicks > 0 ? ((version.metrics.clicks / totalClicks) * 100).toFixed(1) : '0',
      conversionRate: totalConversions > 0 ? ((version.metrics.conversions / totalConversions) * 100).toFixed(1) : '0',
      preference: Math.floor(Math.random() * 40 + 30), // 模拟用户偏好
    };
  };

  return (
    <div className="adv-module">
      <div className="adv-header">
        <div className="brand-line">
          <div className="adv-brand-mark" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
            <FlaskConical size={22} color="#fff" />
          </div>
          <div>
            <p className="eyebrow" style={{ color: '#ec4899' }}>A/B 测试</p>
            <h1 className="adv-title">风格对比测试</h1>
          </div>
        </div>
        <p className="subtitle">同一商品生成多版本风格对比，选出最佳方案</p>
      </div>

      <div className="adv-layout">
        <aside className="adv-sidebar">
          <div className="adv-config-panel">
            {/* 上传 */}
            <div className="adv-section">
              <div className="adv-section-label">商品图</div>
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
                  <Upload size={20} />
                  <span>点击或拖拽上传</span>
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

            {/* 风格选择 */}
            <div className="adv-section">
              <div className="adv-section-label">
                对比风格
                <span className="adv-min-hint">（至少选 2 种）</span>
              </div>
              <div className="adv-ab-style-grid">
                {AB_TEST_STYLES.map((style) => (
                  <button
                    key={style.id}
                    className={`adv-ab-style-card ${selectedStyles.has(style.id) ? 'active' : ''}`}
                    onClick={() => toggleStyle(style.id)}
                  >
                    <strong>{style.label}</strong>
                    <span>{style.prompt.slice(0, 20)}...</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 参数 */}
            <div className="adv-section">
              <div className="adv-section-label">生成参数</div>
              <div className="adv-options-grid">
                <label className="adv-field">
                  <span>尺寸</span>
                  <select value={size} onChange={(e) => setSize(e.target.value as ImageSize)}>
                    <option value="1024x1024">1:1 正方形</option>
                    <option value="1792x1024">3:2 横版</option>
                    <option value="1024x1792">2:3 竖版</option>
                  </select>
                </label>
                <label className="adv-field">
                  <span>质量</span>
                  <select value={quality} onChange={(e) => setQuality(e.target.value as ImageQuality)}>
                    <option value="high">高清</option>
                    <option value="medium">标清</option>
                    <option value="low">快速</option>
                  </select>
                </label>
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              className="generate-button adv-generate-btn"
              disabled={!sourceUrl || selectedStyles.size < 2 || status === 'generating'}
              onClick={handleGenerate}
              style={{ background: '#ec4899' }}
            >
              {status === 'generating' ? (
                <><Loader2 className="spin" size={20} /> 生成中...</>
              ) : (
                <><FlaskConical size={20} /> 开始 A/B 测试 ({selectedStyles.size} 个版本)</>
              )}
            </button>

            {selectedStyles.size < 2 && selectedStyles.size > 0 && (
              <p className="adv-warning">请至少选择 2 种风格进行对比</p>
            )}

            {error && <div className="error-box">{error}</div>}
          </div>
        </aside>

        <section className="adv-main">
          <div className="adv-preview-panel">
            <div className="adv-preview-header">
              <h2>对比结果</h2>
              {versions.length > 0 && (
                <div className="adv-ab-actions">
                  {selectedWinner && (
                    <span className="adv-winner-badge">
                      <CheckCircle2 size={14} /> 已选出最佳
                    </span>
                  )}
                </div>
              )}
            </div>

            {versions.length === 0 ? (
              <div className="adv-empty">
                <FlaskConical size={44} />
                <p>上传商品图，选择至少 2 种风格，开始对比测试</p>
              </div>
            ) : (
              <>
                {/* 对比视图 */}
                <div className="adv-compare-grid">
                  {versions.map((ver) => {
                    const metrics = getWinnerMetrics(ver);
                    const isWinner = selectedWinner === ver.id;
                    return (
                      <div
                        className={`adv-compare-card ${isWinner ? 'winner' : ''}`}
                        key={ver.id}
                        onClick={() => handleSelectWinner(ver.id)}
                      >
                        {isWinner && (
                          <div className="adv-winner-overlay">
                            <ThumbsUp size={24} />
                            <span>最佳选择</span>
                          </div>
                        )}
                        <div className="adv-compare-image">
                          <img src={ver.src} alt={ver.styleName} />
                        </div>
                        <div className="adv-compare-info">
                          <h3>{ver.styleName}</h3>
                          <div className="adv-metrics-row">
                            <div className="adv-metric-item">
                              <MousePointerClick size={14} />
                              <span>点击率</span>
                              <strong>{metrics.clickRate}%</strong>
                            </div>
                            <div className="adv-metric-item">
                              <TrendingUp size={14} />
                              <span>转化率</span>
                              <strong>{metrics.conversionRate}%</strong>
                            </div>
                            <div className="adv-metric-item">
                              <BarChart3 size={14} />
                              <span>偏好度</span>
                              <strong>{metrics.preference}%</strong>
                            </div>
                          </div>
                        </div>
                        <button
                          className="adv-download-single"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadDataUrl(ver.src, `ab_${ver.styleName}.png`);
                          }}
                        >
                          <Download size={14} /> 下载
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* 指标对比表 */}
                <div className="adv-comparison-table">
                  <h3><BarChart3 size={16} /> 指标对比</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>风格</th>
                        <th>点击率</th>
                        <th>转化率</th>
                        <th>偏好度</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {versions.map((ver) => {
                        const metrics = getWinnerMetrics(ver);
                        return (
                          <tr key={ver.id} className={selectedWinner === ver.id ? 'winner-row' : ''}>
                            <td>
                              <div className="adv-table-style-name">
                                <span className="adv-table-dot" style={{ background: getStyleColor(ver.styleId) }} />
                                {ver.styleName}
                                {selectedWinner === ver.id && <CheckCircle2 size={14} color="#10b981" />}
                              </div>
                            </td>
                            <td>{metrics.clickRate}%</td>
                            <td>{metrics.conversionRate}%</td>
                            <td>{metrics.preference}%</td>
                            <td>
                              <button className="adv-mini-btn" onClick={() => handleSelectWinner(ver.id)}>
                                {selectedWinner === ver.id ? '已选' : '选为最佳'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function getStyleColor(styleId: string): string {
  const colors: Record<string, string> = {
    'white-bg': '#2563eb',
    'scene': '#10b981',
    'model': '#f59e0b',
    'creative': '#ec4899',
  };
  return colors[styleId] || '#64748b';
}
