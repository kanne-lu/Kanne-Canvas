import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Layers, Upload, Download, X, Loader2, CheckCircle2,
  Clock, AlertCircle, Trash2, Play, Pause, Image as ImageIcon,
} from 'lucide-react';
import { generateImages } from '../../imageApi';
import { BATCH_STYLES } from './types';
import type { BatchTask, BatchTaskStatus } from './types';
import type { ApiSettings, GeneratedImage, ImageSize, ImageQuality } from '../../types';

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
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        throw new Error('本地地址不可用');
      }
      return url;
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('本地地址')) throw e;
  }
  throw new Error('无公网图床支持，请手动上传参考图后粘贴 URL。');
}

interface UploadedImage {
  id: string;
  name: string;
  dataUrl: string;
  publicUrl: string | null;
}

export function BatchGenerator() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set(['white-bg']));
  const [count, setCount] = useState(1);
  const [size, setSize] = useState<ImageSize>('1024x1024');
  const [quality, setQuality] = useState<ImageQuality>('high');
  const [tasks, setTasks] = useState<BatchTask[]>([]);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopRef = useRef(false);

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    setError('');
    setUploading(true);
    const fileArr = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 10);
    if (fileArr.length === 0) {
      setError('请选择图片文件');
      setUploading(false);
      return;
    }

    try {
      const newImages: UploadedImage[] = [];
      for (const file of fileArr) {
        const dataUrl = await fileToDataUrl(file);
        let publicUrl: string | null = null;
        try {
          publicUrl = await uploadReferenceFile(file);
        } catch {
          // 上传失败不阻塞，后续可以用 dataUrl 兜底
        }
        newImages.push({
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          dataUrl,
          publicUrl,
        });
      }
      setImages((prev) => [...prev, ...newImages].slice(0, 10));
    } catch (e) {
      setError(e instanceof Error ? e.message : '图片处理失败');
    }
    setUploading(false);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

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

  const buildAllTasks = useCallback((): BatchTask[] => {
    const allTasks: BatchTask[] = [];
    images.forEach((img, imgIdx) => {
      const styles = BATCH_STYLES.filter((s) => selectedStyles.has(s.id));
      styles.forEach((style) => {
        for (let c = 0; c < count; c++) {
          allTasks.push({
            id: `task_${imgIdx}_${style.id}_${c}`,
            imageIndex: imgIdx,
            styleName: style.label,
            status: 'pending',
            progress: 0,
          });
        }
      });
    });
    return allTasks;
  }, [images, selectedStyles, count]);

  const runBatch = useCallback(async () => {
    if (images.length === 0 || selectedStyles.size === 0) return;

    stopRef.current = false;
    setIsRunning(true);
    setError('');
    setResults([]);

    const allTasks = buildAllTasks();
    setTasks(allTasks);

    const collectedResults: GeneratedImage[] = [];

    for (let i = 0; i < allTasks.length; i++) {
      if (stopRef.current) {
        setTasks((prev) =>
          prev.map((t, idx) => (idx >= i ? { ...t, status: 'pending' as BatchTaskStatus } : t)),
        );
        break;
      }

      const task = allTasks[i];
      const img = images[task.imageIndex];
      const style = BATCH_STYLES.find((s) => s.label === task.styleName);
      if (!style) continue;

      // 更新当前任务状态
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'processing' as BatchTaskStatus, progress: 50 } : t)),
      );

      try {
        const imageUrl = img.publicUrl || img.dataUrl;
        const images_result = await generateImages(defaultSettings, {
          prompt: style.prompt,
          referenceImages: imageUrl,
          size,
          quality,
          format: 'png',
          n: 1,
        });

        if (images_result.length > 0) {
          collectedResults.push(images_result[0]);
          setResults([...collectedResults]);
        }

        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: 'completed' as BatchTaskStatus, progress: 100, result: images_result[0]?.src }
              : t,
          ),
        );
      } catch (e) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: 'failed' as BatchTaskStatus, error: e instanceof Error ? e.message : '生成失败' }
              : t,
          ),
        );
      }
    }

    setIsRunning(false);
  }, [images, selectedStyles, count, size, quality, buildAllTasks]);

  const handleStop = useCallback(() => {
    stopRef.current = true;
  }, []);

  const handleClearAll = useCallback(() => {
    setImages([]);
    setTasks([]);
    setResults([]);
    setSelectedStyles(new Set(['white-bg']));
    setIsRunning(false);
  }, []);

  const handleDownloadAll = useCallback(() => {
    results.forEach((r, i) => {
      if (r.src.startsWith('data:') || r.src.startsWith('http')) {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = r.src;
          link.download = `batch_${i + 1}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, i * 200);
      }
    });
  }, [results]);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const failedCount = tasks.filter((t) => t.status === 'failed').length;
  const totalCount = tasks.length;

  return (
    <div className="adv-module">
      <div className="adv-header">
        <div className="brand-line">
          <div className="adv-brand-mark" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <Layers size={22} color="#fff" />
          </div>
          <div>
            <p className="eyebrow" style={{ color: '#8b5cf6' }}>批量生成</p>
            <h1 className="adv-title">批量任务队列</h1>
          </div>
        </div>
        <p className="subtitle">多商品同时生成，任务队列管理，高效产出</p>
      </div>

      <div className="adv-layout">
        <aside className="adv-sidebar">
          <div className="adv-config-panel">
            {/* 上传区域 */}
            <div className="adv-section">
              <div className="adv-section-header">
                <div className="adv-section-label">商品图 ({images.length}/10)</div>
                {images.length > 0 && (
                  <button className="adv-mini-btn" onClick={() => setImages([])}>
                    <Trash2 size={12} /> 清空
                  </button>
                )}
              </div>
              <div
                className="adv-upload-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files);
                }}
              >
                {uploading ? (
                  <><Loader2 className="spin" size={20} /> 上传中...</>
                ) : (
                  <><Upload size={20} /> 点击或拖拽上传商品图（最多 10 张）</>
                )}
              </div>
              <input
                ref={fileInputRef}
                className="file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) handleFileSelect(e.target.files);
                  e.currentTarget.value = '';
                }}
              />
              {images.length > 0 && (
                <div className="adv-thumb-strip">
                  {images.map((img) => (
                    <div className="adv-thumb-item" key={img.id} title={img.name}>
                      <img src={img.dataUrl} alt={img.name} />
                      <button onClick={() => handleRemoveImage(img.id)}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 风格选择 */}
            <div className="adv-section">
              <div className="adv-section-label">生成风格</div>
              <div className="adv-style-grid">
                {BATCH_STYLES.map((style) => (
                  <button
                    key={style.id}
                    className={`adv-style-card ${selectedStyles.has(style.id) ? 'active' : ''}`}
                    onClick={() => toggleStyle(style.id)}
                  >
                    <strong>{style.label}</strong>
                  </button>
                ))}
              </div>
            </div>

            {/* 参数设置 */}
            <div className="adv-section">
              <div className="adv-section-label">参数设置</div>
              <div className="adv-options-grid">
                <label className="adv-field">
                  <span>每个风格数量</span>
                  <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                    <option value={1}>1 张</option>
                    <option value={2}>2 张</option>
                    <option value={3}>3 张</option>
                    <option value={4}>4 张</option>
                  </select>
                </label>
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

            {/* 操作按钮 */}
            <div className="adv-action-row">
              {isRunning ? (
                <button className="generate-button adv-generate-btn" onClick={handleStop} style={{ background: '#ef4444' }}>
                  <Pause size={20} /> 停止生成
                </button>
              ) : (
                <button
                  className="generate-button adv-generate-btn"
                  disabled={images.length === 0 || selectedStyles.size === 0}
                  onClick={runBatch}
                  style={{ background: '#8b5cf6' }}
                >
                  <Play size={20} /> 开始批量生成
                </button>
              )}
              {images.length > 0 && selectedStyles.size > 0 && !isRunning && tasks.length === 0 && (
                <p className="adv-hint">
                  将生成 {images.length} x {selectedStyles.size} x {count} = {images.length * selectedStyles.size * count} 张图
                </p>
              )}
            </div>

            {error && <div className="error-box">{error}</div>}
          </div>
        </aside>

        <section className="adv-main">
          <div className="adv-preview-panel">
            <div className="adv-preview-header">
              <h2>
                任务队列
                {totalCount > 0 && (
                  <span className="adv-task-count">
                    {completedCount}/{totalCount}
                    {failedCount > 0 && <span className="adv-fail-count"> ({failedCount} 失败)</span>}
                  </span>
                )}
              </h2>
              {results.length > 0 && (
                <button className="ghost-button" onClick={handleDownloadAll}>
                  <Download size={16} /> 全部下载 ({results.length})
                </button>
              )}
            </div>

            {/* 进度总览 */}
            {totalCount > 0 && (
              <div className="adv-progress-bar-wrap">
                <div className="adv-progress-bar">
                  <div
                    className="adv-progress-fill"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
                <span className="adv-progress-text">
                  {Math.round(totalCount > 0 ? (completedCount / totalCount) * 100 : 0)}%
                </span>
              </div>
            )}

            {/* 任务列表 */}
            {tasks.length > 0 ? (
              <div className="adv-task-list">
                {tasks.map((task) => (
                  <div className={`adv-task-item adv-task-${task.status}`} key={task.id}>
                    <div className="adv-task-status-icon">
                      {task.status === 'completed' && <CheckCircle2 size={16} color="#10b981" />}
                      {task.status === 'processing' && <Loader2 className="spin" size={16} color="#8b5cf6" />}
                      {task.status === 'pending' && <Clock size={16} color="#94a3b8" />}
                      {task.status === 'failed' && <AlertCircle size={16} color="#ef4444" />}
                    </div>
                    <div className="adv-task-info">
                      <strong>商品 {task.imageIndex + 1} - {task.styleName}</strong>
                      {task.error && <span className="adv-task-error">{task.error}</span>}
                    </div>
                    {task.result && (
                      <img className="adv-task-thumb" src={task.result} alt="结果" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="adv-empty">
                <Layers size={44} />
                <p>上传商品图、选择风格，开始批量生成</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
