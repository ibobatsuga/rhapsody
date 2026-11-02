export type AIProvider = 'suno' | 'udio';
export type AppTab = 'create' | 'studio' | 'explore' | 'library';

export interface Song {
  id: string;
  title: string;
  prompt: string;
  tags: string;
  lyrics?: string;
  isInstrumental: boolean;
  provider: AIProvider;
  model: string;
  audioUrl: string;
  imageUrl: string;
  duration: number; // in seconds
  createdAt: string;
  dateGroup?: string; // e.g. "Wednesday, Oct 14"
  status: 'queued' | 'generating' | 'complete' | 'failed';
  vocalStemUrl?: string;
  instrumentalStemUrl?: string;
  isLiked?: boolean;
  isDisliked?: boolean;
  modelBadge?: string; // e.g. "V6-MINI", "V4", "V6"
  isCover?: boolean;
  extendCount?: number;
}

export interface StudioTrack {
  id: string;
  name: string;
  type: 'full' | 'vocal' | 'instrumental' | 'custom';
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  pan: number;
  audioUrl?: string;
}

export interface AIGenerationRequest {
  provider: AIProvider;
  prompt: string;
  tags?: string;
  title?: string;
  isInstrumental: boolean;
  lyrics?: string;
  apiKey?: string;
  mock?: boolean;
  vocalGender?: 'male' | 'female' | 'any';
  weirdness?: number;
  styleInfluence?: number;
  variety?: string;
  durationMode?: 'auto' | 'custom';
  maxMode?: boolean;
}

export interface AIGenerationResult {
  taskId: string;
  provider: AIProvider;
  title: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrls: string[];
  vocalStemUrl?: string;
  instrumentalStemUrl?: string;
  duration?: number;
  createdAt: number;
}
