import type { ImageSize, ImageQuality } from '../../types';

export type ProductType = 'white-bg' | 'scene' | 'model' | 'detail';

export interface ProductTypeOption {
  id: ProductType;
  label: string;
  description: string;
  icon: string;
  promptTemplate: string;
  placeholder?: string;
}

export interface ProductConfig {
  type: ProductType;
  size: ImageSize;
  quality: ImageQuality;
  count: number;
  sceneDescription: string;
}

export interface ProductImage {
  id: string;
  src: string;
  type: ProductType;
  config: ProductConfig;
  createdAt: string;
}

export interface ProductGenerateRequest {
  image: File | string;
  config: ProductConfig;
}

export const PRODUCT_TYPES: ProductTypeOption[] = [
  {
    id: 'white-bg',
    label: '白底主图',
    description: '纯白背景，商品居中，电商主图标准',
    icon: 'Layers',
    promptTemplate: '将此商品放在纯白背景上，商品居中，光线均匀，高清商业摄影风格，产品细节清晰，适合电商主图使用',
  },
  {
    id: 'scene',
    label: '场景图',
    description: '自然场景展示，提升商品质感',
    icon: 'Mountain',
    promptTemplate: '将此商品放在{scene}中，自然光线，真实场景感，高端商业摄影风格，突出商品主体',
    placeholder: '描述场景，如：温馨的客厅茶几上',
  },
  {
    id: 'model',
    label: '模特图',
    description: '模特穿戴展示，适合服饰配饰',
    icon: 'UserCheck',
    promptTemplate: '让模特穿着/展示此商品，时尚摄影风格，专业灯光，杂志封面质感，突出商品细节',
  },
  {
    id: 'detail',
    label: '详情页长图',
    description: '多角度展示，包含细节特写',
    icon: 'LayoutList',
    promptTemplate: '生成此商品的多角度展示图，包含细节特写和使用场景，电商详情页风格，高清商业摄影，排版精致',
  },
];

export function buildProductPrompt(config: ProductConfig): string {
  const typeOption = PRODUCT_TYPES.find((t) => t.id === config.type);
  if (!typeOption) return '';

  let prompt = typeOption.promptTemplate;

  if (config.type === 'scene' && config.sceneDescription.trim()) {
    prompt = prompt.replace('{scene}', config.sceneDescription.trim());
  }

  return prompt;
}

export const PRODUCT_SIZES: { value: ImageSize; label: string }[] = [
  { value: '1024x1024', label: '1:1 正方形 · 主图' },
  { value: '1792x1024', label: '3:2 横版 · 详情页' },
  { value: '1024x1792', label: '2:3 竖版 · 手机端' },
  { value: 'auto', label: '自动 · 模型决定' },
];

export const PRODUCT_QUALITIES: { value: ImageQuality; label: string }[] = [
  { value: 'high', label: '高清' },
  { value: 'medium', label: '标清' },
  { value: 'low', label: '快速' },
  { value: 'auto', label: '自动' },
];
