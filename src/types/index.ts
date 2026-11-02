export type AIProvider = 'suno' | 'udio';
export type AppTab = 'create' | 'explore' | 'library';

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
  status: 'queued' | 'generating' | 'complete' | 'failed';
  vocalStemUrl?: string;
  instrumentalStemUrl?: string;
  isLiked?: boolean;
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
