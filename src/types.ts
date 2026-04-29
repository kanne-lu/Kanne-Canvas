export type ImageSize = 'auto' | '1024x1024' | '1792x1024' | '1024x1792';
export type ImageQuality = 'auto' | 'high' | 'medium' | 'low';
export type ImageFormat = 'png' | 'jpeg' | 'webp';

export type ApiSettings = {
  baseUrl: string;
  model: string;
};

export type GenerateRequest = {
  prompt: string;
  referenceImages: string;
  size: ImageSize;
  quality: ImageQuality;
  format: ImageFormat;
  n: number;
};

export type ReferenceImage = {
  id: string;
  name: string;
  src: string;
  url?: string;
};

export type GeneratedImage = {
  id: string;
  src: string;
  revisedPrompt?: string;
};

export type HistoryItem = {
  id: string;
  prompt: string;
  createdAt: string;
  settings: {
    size: ImageSize;
    quality: ImageQuality;
    format: ImageFormat;
    n: number;
  };
  images: GeneratedImage[];
};
