import type { ImageSize, ImageQuality } from '../../types';

// ── 营销物料类型 ──
export type MarketingType = 'poster' | 'social' | 'live';

export type SocialPlatform = 'xiaohongshu' | 'douyin' | 'taobao' | 'jingdong' | 'kuaishou' | 'pinduoduo';

export interface MarketingTypeOption {
  id: MarketingType;
  label: string;
  description: string;
  icon: string;
}

export interface SocialPlatformOption {
  id: SocialPlatform;
  label: string;
  size: string;
  sizeLabel: string;
}

export interface PosterTemplate {
  id: string;
  label: string;
  description: string;
  festival: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultPromotion: string;
}

export interface MarketingConfig {
  type: MarketingType;
  platform?: SocialPlatform;
  template?: string;
  title: string;
  subtitle: string;
  promotion: string;
  sceneDescription: string;
  liveTheme: string;
  liveStyle: string;
  size: ImageSize;
  quality: ImageQuality;
  count: number;
}

export interface MarketingImage {
  id: string;
  src: string;
  type: MarketingType;
  config: MarketingConfig;
  createdAt: string;
}

// ── 常量 ──
export const MARKETING_TYPES: MarketingTypeOption[] = [
  {
    id: 'poster',
    label: '电商海报',
    description: '双11、618、新品上市等促销海报',
    icon: 'Megaphone',
  },
  {
    id: 'social',
    label: '社交媒体图',
    description: '小红书、抖音、淘宝等平台推广图',
    icon: 'Share2',
  },
  {
    id: 'live',
    label: '直播间背景',
    description: '直播背景图、商品展示牌',
    icon: 'Radio',
  },
];

export const SOCIAL_PLATFORMS: SocialPlatformOption[] = [
  { id: 'xiaohongshu', label: '小红书', size: '1024x1792', sizeLabel: '1080x1440 竖版' },
  { id: 'douyin', label: '抖音', size: '1024x1792', sizeLabel: '1080x1920 竖版' },
  { id: 'taobao', label: '淘宝', size: '1024x1024', sizeLabel: '800x800 正方形' },
  { id: 'jingdong', label: '京东', size: '1024x1024', sizeLabel: '800x800 正方形' },
  { id: 'kuaishou', label: '快手', size: '1024x1792', sizeLabel: '1080x1920 竖版' },
  { id: 'pinduoduo', label: '拼多多', size: '1024x1792', sizeLabel: '750x1334 竖版' },
];

export const POSTER_TEMPLATES: PosterTemplate[] = [
  {
    id: 'double11',
    label: '双11 狂欢',
    description: '双十一购物节大促',
    festival: '双十一',
    defaultTitle: '双11 狂欢盛典',
    defaultSubtitle: '全场低至 5 折',
    defaultPromotion: '限时抢购 · 满减优惠 · 前 N 名半价',
  },
  {
    id: '618',
    label: '618 年中大促',
    description: '京东 618 购物节',
    festival: '618',
    defaultTitle: '618 年中大促',
    defaultSubtitle: '爆款直降 限时秒杀',
    defaultPromotion: '满 300 减 50 · 跨店满减 · 百亿补贴',
  },
  {
    id: 'newyear',
    label: '年货节',
    description: '春节年货采购季',
    festival: '年货节',
    defaultTitle: '年货盛典 好礼迎新春',
    defaultSubtitle: '精选好物 好运带回家',
    defaultPromotion: '年货特惠 · 买一送一 · 新春礼盒',
  },
  {
    id: 'newproduct',
    label: '新品上市',
    description: '新品首发、新品发布',
    festival: '新品',
    defaultTitle: '全新上市 敬请期待',
    defaultSubtitle: '颠覆想象 重新定义',
    defaultPromotion: '首发特惠 · 预售立减 · 限量赠品',
  },
  {
    id: 'mothersday',
    label: '母亲节',
    description: '母亲节感恩特惠',
    festival: '母亲节',
    defaultTitle: '母亲节 爱意满满',
    defaultSubtitle: '送给最爱的她',
    defaultPromotion: '感恩回馈 · 精选好物 · 满额赠礼',
  },
  {
    id: 'clearance',
    label: '清仓特卖',
    description: '换季清仓、库存特卖',
    festival: '清仓',
    defaultTitle: '清仓特卖 低至 1 折',
    defaultSubtitle: '错过再等一年',
    defaultPromotion: '全场清仓 · 一件包邮 · 先到先得',
  },
];

export const LIVE_STYLES = [
  { id: 'fresh', label: '清新简约', description: '简洁大方，适合日常带货' },
  { id: 'luxury', label: '高端大气', description: '金色质感，适合奢侈品/美妆' },
  { id: 'cute', label: '甜美可爱', description: '粉色系，适合少女风产品' },
  { id: 'tech', label: '科技感', description: '深色渐变，适合 3C 数码' },
  { id: 'festive', label: '节日喜庆', description: '红色主题，适合节日促销' },
  { id: 'nature', label: '自然清新', description: '绿色基调，适合食品/农产品' },
];

export const POSTER_SIZES: { value: ImageSize; label: string }[] = [
  { value: '1024x1792', label: '800x1200 竖版海报' },
  { value: '1792x1024', label: '1000x562 横版海报' },
  { value: '1024x1024', label: '1000x1000 正方形' },
  { value: 'auto', label: '自动 · 模型决定' },
];

export const SOCIAL_SIZES: { value: ImageSize; label: string }[] = [
  { value: '1024x1024', label: '1:1 正方形 · 主图' },
  { value: '1024x1792', label: '9:16 竖版 · 短视频封面' },
  { value: '1792x1024', label: '16:9 横版 · 视频封面' },
  { value: 'auto', label: '自动 · 模型决定' },
];

export const LIVE_SIZES: { value: ImageSize; label: string }[] = [
  { value: '1792x1024', label: '1920x1080 横屏直播' },
  { value: '1024x1792', label: '1080x1920 竖屏直播' },
  { value: 'auto', label: '自动 · 模型决定' },
];

export const QUALITIES: { value: ImageQuality; label: string }[] = [
  { value: 'high', label: '高清' },
  { value: 'medium', label: '标清' },
  { value: 'low', label: '快速' },
  { value: 'auto', label: '自动' },
];

// ── 默认配置 ──
export const DEFAULT_MARKETING_CONFIG: MarketingConfig = {
  type: 'poster',
  platform: 'xiaohongshu',
  template: 'double11',
  title: '',
  subtitle: '',
  promotion: '',
  sceneDescription: '',
  liveTheme: '',
  liveStyle: 'fresh',
  size: '1024x1792',
  quality: 'high',
  count: 1,
};

// ── Prompt 构建 ──
export function buildMarketingPrompt(config: MarketingConfig): string {
  switch (config.type) {
    case 'poster':
      return buildPosterPrompt(config);
    case 'social':
      return buildSocialPrompt(config);
    case 'live':
      return buildLivePrompt(config);
    default:
      return '';
  }
}

function buildPosterPrompt(config: MarketingConfig): string {
  const template = POSTER_TEMPLATES.find((t) => t.id === config.template);
  const festival = template?.festival || '促销';
  const title = config.title.trim() || template?.defaultTitle || '限时特惠';
  const subtitle = config.subtitle.trim() || template?.defaultSubtitle || '';
  const promotion = config.promotion.trim() || template?.defaultPromotion || '';

  let prompt = `生成一张精美的 ${festival} 电商促销海报，主标题 "${title}"`;
  if (subtitle) prompt += `，副标题 "${subtitle}"`;
  if (promotion) prompt += `，促销信息 "${promotion}"`;
  prompt += `。要求：电商海报风格，高清商业设计，色彩鲜明，视觉冲击力强，排版精美，适合电商大促使用`;

  return prompt;
}

function buildSocialPrompt(config: MarketingConfig): string {
  const platform = SOCIAL_PLATFORMS.find((p) => p.id === config.platform);
  const platformName = platform?.label || '社交媒体';
  const content = config.sceneDescription.trim() || '推广内容';

  let prompt = `生成一张 ${platformName} 风格的推广图，内容 "${content}"`;
  if (config.title.trim()) prompt += `，标题 "${config.title.trim()}"`;
  prompt += `。要求：${platformName} 平台风格，画面精美吸引眼球，排版时尚，色彩搭配和谐，适合社交媒体传播`;

  return prompt;
}

function buildLivePrompt(config: MarketingConfig): string {
  const style = LIVE_STYLES.find((s) => s.id === config.liveStyle);
  const theme = config.liveTheme.trim() || '直播带货';
  const styleName = style?.label || '清新简约';

  let prompt = `生成一张直播间背景图，主题 "${theme}"，风格 "${styleName}"`;
  if (config.title.trim()) prompt += `，标题 "${config.title.trim()}"`;
  prompt += `。要求：高清直播背景，画面简洁不杂乱，适合作为直播间背景使用，不影响前景主播展示，色彩柔和舒适`;

  return prompt;
}
