import type { ImageSize, ImageQuality } from '../../types';

// ========== 多平台尺寸适配 ==========

export type Platform = 'taobao' | 'jingdong' | 'pinduoduo' | 'xiaohongshu' | 'douyin' | 'kuaishou';

export interface PlatformSize {
  platform: Platform;
  name: string;
  width: number;
  height: number;
  icon: string;
  color: string;
}

export const PLATFORM_SIZES: PlatformSize[] = [
  { platform: 'taobao', name: '淘宝主图', width: 800, height: 800, icon: '🛒', color: '#ff5000' },
  { platform: 'jingdong', name: '京东主图', width: 800, height: 800, icon: '🐕', color: '#e1251b' },
  { platform: 'pinduoduo', name: '拼多多', width: 750, height: 1334, icon: '🍊', color: '#f44e56' },
  { platform: 'xiaohongshu', name: '小红书', width: 1080, height: 1440, icon: '📕', color: '#ff2442' },
  { platform: 'douyin', name: '抖音', width: 1080, height: 1920, icon: '🎵', color: '#111' },
  { platform: 'kuaishou', name: '快手', width: 1080, height: 1920, icon: '⚡', color: '#ff6611' },
];

export interface PlatformConvertResult {
  platform: Platform;
  name: string;
  width: number;
  height: number;
  dataUrl: string;
}

// ========== 批量生成 ==========

export type BatchTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BatchTask {
  id: string;
  imageIndex: number;
  styleName: string;
  status: BatchTaskStatus;
  progress: number;
  result?: string;
  error?: string;
}

export interface BatchConfig {
  images: string[];      // 商品图 dataURL 列表
  styles: string[];      // 生成风格 ID 列表
  count: number;         // 每个商品每个风格生成数量
  size: ImageSize;
  quality: ImageQuality;
}

export const BATCH_STYLES = [
  { id: 'white-bg', label: '白底主图', prompt: '将此商品放在纯白背景上，商品居中，光线均匀，高清商业摄影风格' },
  { id: 'scene', label: '场景图', prompt: '将此商品放在精致的生活场景中，自然光线，真实场景感' },
  { id: 'model', label: '模特图', prompt: '让模特穿着/展示此商品，时尚摄影风格，专业灯光' },
  { id: 'detail', label: '详情页长图', prompt: '生成此商品的多角度展示图，包含细节特写和使用场景' },
  { id: 'creative', label: '创意风格', prompt: '将此商品以创意艺术风格呈现，独特构图，高级质感' },
  { id: 'minimalist', label: '极简风格', prompt: '将此商品以极简风格呈现，干净利落的线条，大量留白' },
];

// ========== A/B 测试 ==========

export interface ABTestConfig {
  image: string;
  styles: string[];
  size: ImageSize;
  quality: ImageQuality;
}

export interface ABTestVersion {
  id: string;
  styleId: string;
  styleName: string;
  src: string;
  metrics: {
    clicks: number;
    conversions: number;
  };
}

export interface ABTestResult {
  id: string;
  versions: ABTestVersion[];
  createdAt: string;
}

export const AB_TEST_STYLES = [
  { id: 'white-bg', label: '白底主图', prompt: '将此商品放在纯白背景上，商品居中，光线均匀，高清商业摄影风格' },
  { id: 'scene', label: '场景图', prompt: '将此商品放在精致的生活场景中，自然光线，真实场景感' },
  { id: 'model', label: '模特图', prompt: '让模特穿着/展示此商品，时尚摄影风格，专业灯光' },
  { id: 'creative', label: '创意风格', prompt: '将此商品以创意艺术风格呈现，独特构图，高级质感' },
];
