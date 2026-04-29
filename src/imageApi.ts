import type { ApiSettings, GeneratedImage, GenerateRequest } from './types';

type ExternalImage = {
  b64_json?: string;
  url?: string;
  revised_prompt?: string;
};

type ExternalResponse = {
  id?: string;
  state?: string;
  progress?: number;
  data?: ExternalImage[] | { images?: Array<{ url?: string; file_name?: string }>; description?: string };
  error?: { message?: string } | string;
};

function isDuomi(baseUrl: string) {
  return /duomiapi\.com|api\.wike\.cc/.test(baseUrl);
}

function resolveCreateEndpoint(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/$/, '');
  if (!trimmed) return '';
  if (trimmed.includes('duomiapi.com')) return `${trimmed}/v1/images/generations?async=true`;
  if (trimmed.includes('api.wike.cc')) return `${trimmed}/v1/images/generations?async=true`;
  if (trimmed.endsWith('/v1')) return `${trimmed}/images/generations`;
  return `${trimmed}/v1/images/generations`;
}

function resolveTaskEndpoint(baseUrl: string, id: string) {
  const trimmed = baseUrl.trim().replace(/\/$/, '');
  // 无论是多米还是 wike，原代码最终真实的路径都是 /v1/tasks/{id}
  return `${trimmed}/v1/tasks/${id}`;
}

function errorMessage(payload: ExternalResponse | null, fallback: string) {
  if (!payload) return fallback;
  if (typeof payload.error === 'string') return payload.error;
  if (payload.error?.message) return payload.error.message;
  const detail = JSON.stringify(payload);
  return detail && detail !== '{}' ? `${fallback}：${detail}` : fallback;
}

function normalizeImages(payload: ExternalResponse, format: string): GeneratedImage[] {
  if (Array.isArray(payload.data)) {
    return payload.data.map((image, index) => {
      const src = image.b64_json ? `data:image/${format};base64,${image.b64_json}` : image.url;
      if (!src) throw new Error('接口返回了无法识别的图片格式。');
      return { id: `img_${Date.now()}_${index}`, src, revisedPrompt: image.revised_prompt };
    });
  }

  const images = payload.data?.images ?? [];
  return images.map((image, index) => {
    if (!image.url) throw new Error('接口返回了无法识别的图片地址。');
    return { id: `img_${Date.now()}_${index}`, src: image.url };
  });
}

async function readJson(response: Response) {
  return (await response.json().catch(() => null)) as ExternalResponse | null;
}

export async function pollDuomiTask(settings: ApiSettings, taskId: string, format: string) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const targetUrl = resolveTaskEndpoint(settings.baseUrl, taskId);
    const proxyEndpoint = import.meta.env.VITE_PROXY_ENDPOINT || '/api.php';
    const response = await fetch(proxyEndpoint, {
      headers: { 'X-Target-Url': targetUrl },
    });
    const payload = await readJson(response);

    if (!response.ok) throw new Error(errorMessage(payload, `查询任务失败：HTTP ${response.status}`));
    if (!payload) throw new Error('查询任务返回为空。');
    if (payload.state === 'failed') throw new Error(errorMessage(payload, '图片生成任务失败。'));
    if (payload.state === 'succeeded') {
      const images = normalizeImages(payload, format);
      if (!images.length) throw new Error('任务成功但没有返回图片。');
      return images;
    }

    // 每次查询之间等待 2 秒，防止瞬间把 90 次额度消耗完导致误判为超时
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error('图片生成超时，请稍后到多米控制台查看任务结果。');
}

export async function generateImages(settings: ApiSettings, request: GenerateRequest): Promise<GeneratedImage[]> {
  const prompt = request.prompt.trim();
  const targetUrl = resolveCreateEndpoint(settings.baseUrl);
  const proxyEndpoint = import.meta.env.VITE_PROXY_ENDPOINT || '/api.php';
  const model = settings.model.trim() || 'gpt-image-2';
  const referenceImages = request.referenceImages
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);

  if (!targetUrl) throw new Error('请先填写 Base URL。');
  if (!prompt) throw new Error('提示词不能为空。');

  const response = await fetch(proxyEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Target-Url': targetUrl,
    },
    body: JSON.stringify({
      model,
      prompt,
      size: request.size,
      quality: request.quality,
      output_format: request.format,
      n: request.n,
      ...(referenceImages.length ? { image: referenceImages } : {}),
    }),
  });

  const payload = await readJson(response);

  if (!response.ok) throw new Error(errorMessage(payload, `接口请求失败：HTTP ${response.status}`));
  if (!payload) throw new Error('接口返回为空。');
  if (payload.error) throw new Error(errorMessage(payload, '接口返回了错误信息'));

  if (isDuomi(settings.baseUrl)) {
    // 如果没有 id，但直接返回了 data (同步返回结果的情况)
    if (!payload.id && payload.data) {
      const images = normalizeImages(payload, request.format);
      if (images.length) return images;
    }
    
    if (!payload.id) throw new Error(`多米接口没有返回任务 ID。API返回内容: ${JSON.stringify(payload)}`);

    // 缓存进行中的异步任务，防止页面刷新丢失
    const pendingTask = {
      id: payload.id,
      prompt: prompt,
      format: request.format,
      size: request.size,
      quality: request.quality,
      n: request.n,
    };
    localStorage.setItem('image-lab-pending-task', JSON.stringify(pendingTask));

    try {
      const images = await pollDuomiTask(settings, payload.id, request.format);
      localStorage.removeItem('image-lab-pending-task');
      return images;
    } catch (e) {
      localStorage.removeItem('image-lab-pending-task');
      throw e;
    }
  }

  const images = normalizeImages(payload, request.format);
  if (!images.length) throw new Error('接口没有返回图片数据。');
  return images;
}
