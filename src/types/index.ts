export interface AudioClip {
  id: string;
  name: string;
  startTime: number; // in seconds on timeline
  duration: number; // in seconds
  audioBuffer?: AudioBuffer;
  sourceUrl?: string;
  color: string;
  isAiGenerated?: boolean;
  aiPrompt?: string;
}

export interface TrackEffectSettings {
  filterCutoff: number; // 20 - 20000 Hz
  filterType: BiquadFilterType;
  delayTime: number; // 0 - 1s
  delayFeedback: number; // 0 - 0.9
  reverbWet: number; // 0 - 1
  distortion: number; // 0 - 50
}

export interface Track {
  id: string;
  name: string;
  type: 'audio' | 'synth' | 'drums';
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number; // 0.0 to 1.5 (1.0 = 0dB)
  pan: number; // -1.0 (Left) to +1.0 (Right)
  clips: AudioClip[];
  effects: TrackEffectSettings;
}

export type AIProvider = 'suno' | 'udio';

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
