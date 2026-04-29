import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Aperture, Bolt, Download, Eye, EyeOff, ImagePlus, KeyRound, Loader2, Lock, RadioTower, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { generateImages } from './imageApi';
import type { ApiSettings, GeneratedImage, GenerateRequest, HistoryItem, ImageFormat, ImageQuality, ImageSize, ReferenceImage } from './types';
import './index.css';

const SETTINGS_KEY = 'image-lab-settings';
const HISTORY_KEY = 'image-lab-history';



const defaultSettings: ApiSettings = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://duomiapi.com',
  model: import.meta.env.VITE_API_MODEL || 'gpt-image-2',
};

const defaultRequest: GenerateRequest = {
  prompt: '',
  referenceImages: '',
  size: 'auto',
  quality: 'high',
  format: 'png',
  n: 1,
};

function loadHistory(): HistoryItem[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function uploadReferenceFile(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const uploadUrl = import.meta.env.VITE_UPLOAD_API_URL || '/upload.php';
    const response = await fetch(uploadUrl, { method: 'POST', body: formData });
    const payload = await response.json().catch(() => null) as { data?: { url?: string }; error?: string } | null;
    if (response.ok && payload?.data?.url) {
      const url = payload.data.url;
      // 检查如果是本地地址，云端 API 无法访问
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        throw new Error('本地 /upload.php 返回的是内网地址 (localhost)，多米等云端绘图 API 无法访问该图片。');
      }
      return url;
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('内网地址')) {
      throw e;
    }
    // 忽略其他的网络错误，统一抛出下面更友好的提示
  }
  throw new Error('当前本地开发环境无公网图床支持。请手动将参考图上传至公共图床（如路过图床），然后将生成的公网 URL 粘贴到输入框中。');
}

async function saveGeneratedImage(imageUrl: string) {
  try {
    const response = await fetch('/save-generated.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    const payload = await response.json().catch(() => null) as { data?: { url?: string }; error?: string } | null;
    if (response.ok && payload?.data?.url) {
      return payload.data.url;
    }
  } catch (e) {
    // 忽略错误
  }
  return imageUrl;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`读取图片失败：${file.name}`));
    reader.readAsDataURL(file);
  });
}

function App() {
  const settings = defaultSettings;
  const [request, setRequest] = useState<GenerateRequest>(defaultRequest);
  const [referenceFiles, setReferenceFiles] = useState<ReferenceImage[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<{ images: GeneratedImage[]; index: number } | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const latest = selectedHistoryId ? history.find(h => h.id === selectedHistoryId) || history[0] : history[0];
  const canGenerate = request.prompt.trim().length > 0 && status !== 'loading';
  const apiHost = useMemo(() => settings.baseUrl.replace(/^https?:\/\//, '').replace(/\/v1\/?$/, ''), [settings.baseUrl]);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith('image/'));
      if (files.length) void handleFileArray(files);
    }
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setLightbox(null);
      if (event.key === 'ArrowRight') setLightbox((prev) => prev && prev.index < prev.images.length - 1 ? { ...prev, index: prev.index + 1 } : prev);
      if (event.key === 'ArrowLeft') setLightbox((prev) => prev && prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox]);

  function updateHistory(items: HistoryItem[]) {
    setHistory(items);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  }

  async function handlePickFiles() {
    const picker = (window as unknown as { showOpenFilePicker?: (options?: unknown) => Promise<Array<{ getFile: () => Promise<File> }>> }).showOpenFilePicker;
    if (picker) {
      const handles = await picker({
        multiple: true,
        types: [{ description: 'Images', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] } }],
      }).catch(() => []);
      const files = await Promise.all(handles.map((handle) => handle.getFile()));
      await handleFileArray(files);
      return;
    }
    fileInputRef.current?.click();
  }

  async function handleFileArray(files: File[]) {
    if (!files.length) return;
    setError('');
    try {
      const images = await Promise.all(
        files.slice(0, 4).map(async (file) => ({
          id: `ref_${Date.now()}_${file.name}`,
          name: file.name,
          src: await fileToDataUrl(file),
          url: await uploadReferenceFile(file),
        })),
      );
      setReferenceFiles((current) => [...current, ...images].slice(0, 4));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '读取本机图片失败。');
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    await handleFileArray(Array.from(files));
  }


  async function handleGenerate() {
    setStatus('loading');
    setError('');
    try {
      const mergedRequest = {
        ...request,
        referenceImages: [request.referenceImages, ...referenceFiles.map((image) => image.url).filter(Boolean)].filter(Boolean).join(String.fromCharCode(10)),
      };
      const images = await generateImages(settings, mergedRequest);
      const persistedImages = await Promise.all(images.map(async (image) => ({
        ...image,
        src: image.src.startsWith('http') ? await saveGeneratedImage(image.src) : image.src,
      })));
      const item: HistoryItem = {
        id: `run_${Date.now()}`,
        prompt: request.prompt.trim(),
        createdAt: new Date().toISOString(),
        settings: { size: request.size, quality: request.quality, format: request.format, n: request.n },
        images: persistedImages,
      };
      const newHistory = [item, ...history];
      updateHistory(newHistory.slice(0, 12));
      setSelectedHistoryId(null);
      setStatus('success');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '生成失败，接口返回异常。');
      setStatus('error');
    }
  }

  return (
    <main className="lab-shell">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <header className="hero topbar">
        <div>
          <div className="brand-line"><div className="brand-mark"><img src="/kanne-canvas.svg" alt="Kanne Canvas" /></div><p className="eyebrow">Kanne Canvas</p></div>
          <p className="subtitle">轻量本地生图台，支持参考图与 gpt-image-2。</p>
        </div>
        <div className="status-board">
          <Metric icon={<RadioTower size={18} />} label="Endpoint" value={apiHost || '未设置'} />
          <Metric icon={<Sparkles size={18} />} label="Model" value={settings.model || 'gpt-image-2'} />
          <Metric icon={<Lock size={18} />} label="Key" value="由服务端安全管理" />
        </div>
      </header>

      <section className="grid-layout">
        <aside className="control-panel">
          <PanelTitle icon={<ImagePlus />} title="生成参数" aside="Prompt deck" />
          <label className="field">
            <div className="reference-head">
              <span>Prompt</span>
            </div>
            <textarea className="prompt-box" value={request.prompt} rows={4} placeholder="例如：保持参考图人物特征，生成干净白底商业头像，柔光，高级质感" onChange={(event) => setRequest({ ...request, prompt: event.target.value })} />
          </label>
          <div className="reference-box drop-zone" tabIndex={0} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFiles(event.dataTransfer.files); }}>
            <div className="reference-head">
              <span>参考图</span>
              <button type="button" className="upload-button" onClick={handlePickFiles}><Upload size={15} /> 选择图片</button>
              <input ref={fileInputRef} id="reference-upload" className="file-input" type="file" accept="image/*" multiple onChange={(event) => { handleFiles(event.target.files); event.currentTarget.value = ''; }} />
            </div>
            <div className="drop-hint">拖入图片自动作为公网参考图提交</div>
            <textarea value={request.referenceImages} rows={2} placeholder="可额外粘贴公网图片 URL，每行一张" onChange={(event) => setRequest({ ...request, referenceImages: event.target.value })} />
            {!!referenceFiles.length && (
              <div className="ref-strip">
                {referenceFiles.map((image) => (
                  <div className="ref-thumb" key={image.id} title={image.name}>
                    <img src={image.src} alt={image.name} />
                    <button type="button" onClick={() => setReferenceFiles(referenceFiles.filter((item) => item.id !== image.id))}><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="option-grid compact-options">
            <Select label="Size" value={request.size} values={['auto', '1024x1024', '1792x1024', '1024x1792']} labels={{ auto: 'auto · 模型自动决定', '1024x1024': '1:1 · 正方形 · 1024x1024', '1792x1024': '3:2 · 横版 · 1792x1024', '1024x1792': '2:3 · 竖版 · 1024x1792' }} onChange={(value) => setRequest({ ...request, size: value as ImageSize })} />
            <Select label="Quality" value={request.quality} values={['auto', 'high', 'medium', 'low']} onChange={(value) => setRequest({ ...request, quality: value as ImageQuality })} />
            <Select label="Format" value={request.format} values={['png', 'jpeg', 'webp']} onChange={(value) => setRequest({ ...request, format: value as ImageFormat })} />
            <Select label="Count" value={String(request.n)} values={['1', '2', '3', '4']} onChange={(value) => setRequest({ ...request, n: Number(value) })} />
          </div>
          <button className="generate-button" disabled={!canGenerate} onClick={handleGenerate}>
            {status === 'loading' ? <Loader2 className="spin" size={21} /> : <Bolt size={21} />}
            {status === 'loading' ? '创建任务并等待结果...' : '开始生成'}
          </button>
          <p className="hint">云哥哥猛猛哒！！！0.0</p>
          {error && <p className="error-box">{error}</p>}
        </aside>

        <section className="preview-panel">
          <div className="preview-head">
            <div>
              <p className="eyebrow mini">Output Wall</p>
              <h2>{latest ? '最近一次成片' : '等待第一张图'}</h2>
            </div>
            <button className="ghost-button" disabled={!history.length} onClick={() => updateHistory([])}><Trash2 size={16} /> 清空历史</button>
          </div>

          {status === 'loading' && <div className="developing"><span />多米异步任务已提交，正在轮询结果，请稍等。</div>}

          {!latest && status !== 'loading' && (
            <div className="empty-state">
              <Aperture size={44} />
              <p>写提示词或上传参考图，开始生成第一张图。</p>
            </div>
          )}

          {latest && (
            <div className="image-grid">
              {latest.images.map((image, index) => (
                <article className="image-card" key={image.id} onClick={() => setLightbox({ images: latest.images, index })}>
                  <img src={image.src} alt={latest.prompt} />
                  <div className="image-actions">
                    <a href={image.src} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}><Download size={16} /> 打开</a>
                  </div>
                </article>
              ))}
            </div>
          )}

          {lightbox && (
            <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
              <div className="lightbox-content" onClick={() => setLightbox(null)}>
                <img className="lightbox-img" src={lightbox.images[lightbox.index].src} alt="预览" />
                <div className="lightbox-bar" onClick={(event) => event.stopPropagation()}>
                  <a className="lightbox-download" href={lightbox.images[lightbox.index].src} target="_blank" rel="noreferrer"><Download size={16} /> 下载</a>
                  <span className="lightbox-counter">{lightbox.index + 1} / {lightbox.images.length}</span>
                  <button className="lightbox-close" onClick={() => setLightbox(null)}><X size={20} /></button>
                </div>
                {lightbox.images.length > 1 && (
                  <>
                    <button className="lightbox-nav lightbox-prev" disabled={lightbox.index === 0} onClick={() => setLightbox({ ...lightbox, index: lightbox.index - 1 })}>‹</button>
                    <button className="lightbox-nav lightbox-next" disabled={lightbox.index === lightbox.images.length - 1} onClick={() => setLightbox({ ...lightbox, index: lightbox.index + 1 })}>›</button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="history-strip">
            {history.map((item) => (
              <div className={`history-item ${selectedHistoryId === item.id ? 'active' : ''}`} key={item.id} onClick={() => setSelectedHistoryId(item.id)}>
                <img src={item.images[0]?.src} alt="历史缩略图" />
                <span>{item.prompt}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | React.ReactNode }) {
  return <div className="metric">{icon}<span>{label}</span><strong>{value}</strong></div>;
}

function PanelTitle({ icon, title, aside }: { icon: React.ReactNode; title: string; aside: string }) {
  return <div className="panel-title"><div>{icon}<h2>{title}</h2></div><span>{aside}</span></div>;
}

function Select({ label, value, values, labels = {}, onChange }: { label: string; value: string; values: string[]; labels?: Record<string, string>; onChange: (value: string) => void }) {
  return <label className="field compact"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{values.map((item) => <option key={item} value={item}>{labels[item] || item}</option>)}</select></label>;
}

createRoot(document.getElementById('root')!).render(<App />);
