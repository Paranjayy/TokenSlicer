export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'xai' | 'mistral' | 'other';
export type Encoding = 'cl100k_base' | 'o200k_base' | 'anthropic' | 'google' | string;
export type SplitUnit = 'tokens' | 'characters' | 'words';
export type Boundary = 'none' | 'sentence' | 'paragraph';

export interface ModelPricing {
  inputPer1k: number;
  outputPer1k: number;
  unit: 'tokens' | 'credits';
}

// Fix: Added 'effort_control' to ModelCapability to support new model definitions in constants.ts.
export type ModelCapability = 'fast' | 'vision' | 'reasoning' | 'image_generation' | 'pdf_comprehension' | 'tool_calling' | 'effort_control';
export type ModelStatus = 'new' | 'degraded' | 'premium' | 'default';

export interface ModelPreset {
  id: string;
  label: string;
  provider: ModelProvider;
  platform?: string;
  inputContext: number;
  outputContext?: number;
  pricing?: ModelPricing;
  capabilities?: ModelCapability[];
  status?: ModelStatus;
  encoding: Encoding;
  notes?: string;
  defaultReplyBudget: number;
  defaultGuardBandPct: number;
}

export interface SplitSettings {
  unit: SplitUnit;
  size: number;
  modelPresetId: string;
  boundary: Boundary;
  overlap: number;
  replyBudget: number;
  guardBandPct: number;
}

export interface TemplateSettings {
  firstMessage: string;
  perChunkHeader: string;
  perChunkFooter: string;
}

export interface TemplatePreset {
  id: string;
  label: string;
  settings: TemplateSettings;
}

export interface OutputChunk {
  name: string;
  content: string;
}

export interface HistoryItem {
  id:string;
  title: string;
  timestamp: number;
  inputText: string;
  outputChunks: OutputChunk[];
}

// --- Content Extractor Types ---

export type ExtractedContentType = 'youtube' | 'reddit' | 'generic';

export interface ExtractedMetadata {
  title: string;
  [key: string]: any;
}

export interface YouTubeContent {
  type: 'youtube';
  metadata: ExtractedMetadata & {
    channel: string;
    duration: string;
    views: number;
    thumbnailUrl: string;
  };
  transcript: string;
}

export interface RedditComment {
  author: string;
  score: number;
  body: string;
  replies: RedditComment[];
}

export interface RedditContent {
  type: 'reddit';
  metadata: ExtractedMetadata & {
    subreddit: string;
    author: string;
    score: number;
  };
  postBody: string;
  comments: RedditComment[];
}

export interface GenericContent {
  type: 'generic';
  metadata: ExtractedMetadata & {
    description?: string;
    ogImage?: string;
  };
}

export type ExtractedContent = YouTubeContent | RedditContent | GenericContent;
