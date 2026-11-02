import { AIGenerationRequest, AIGenerationResult, AudioClip } from '../types';
import { audioEngine } from '../audio/audioEngine';

export class AIService {
  private static STORAGE_KEY = 'rhapsody_goapi_key';

  public static getApiKey(): string {
    return localStorage.getItem(this.STORAGE_KEY) || '';
  }

  public static setApiKey(key: string) {
    localStorage.setItem(this.STORAGE_KEY, key);
  }

  /**
   * Submit music generation task to GoAPI (or local simulation)
   */
  public static async generateMusic(request: AIGenerationRequest): Promise<{ taskId: string; mode: string }> {
    const apiKey = request.apiKey || this.getApiKey();

    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...request,
        apiKey
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to submit AI generation task');
    }

    const data = await response.json();
    return {
      taskId: data.taskId,
      mode: data.mode
    };
  }

  /**
   * Poll task status until complete or error
   */
  public static async pollTask(
    taskId: string,
    provider: 'suno' | 'udio',
    onProgress?: (status: string) => void
  ): Promise<AIGenerationResult> {
    const apiKey = this.getApiKey();
    const maxAttempts = 40; // 40 * 3s = 120 seconds max
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(`/api/ai/status/${taskId}?provider=${provider}`, {
            headers: apiKey ? { 'x-api-key': apiKey } : {}
          });

          if (!res.ok) {
            clearInterval(interval);
            return reject(new Error('Failed to fetch task status'));
          }

          const data = await res.json();
          if (onProgress) {
            onProgress(data.status);
          }

          if (data.status === 'completed' || data.status === 'success') {
            clearInterval(interval);
            resolve({
              taskId: data.taskId,
              provider,
              title: data.title || 'AI Generated Clip',
              prompt: data.prompt || '',
              status: 'completed',
              audioUrls: data.audioUrls || [],
              vocalStemUrl: data.vocalStemUrl,
              instrumentalStemUrl: data.instrumentalStemUrl,
              duration: data.duration || 30,
              createdAt: Date.now()
            });
          } else if (data.status === 'failed' || data.status === 'error') {
            clearInterval(interval);
            reject(new Error(data.error || 'AI music generation failed'));
          }

          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('Generation timeout (exceeded 2 minutes)'));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 3000);
    });
  }

  /**
   * Convert an AI result into a playable AudioClip
   */
  public static async createClipFromAI(
    result: AIGenerationResult,
    audioUrl?: string,
    startTime = 0
  ): Promise<AudioClip> {
    const targetUrl = audioUrl || result.audioUrls[0];
    let audioBuffer: AudioBuffer;

    if (targetUrl) {
      try {
        audioBuffer = await audioEngine.loadAudio(targetUrl);
      } catch (e) {
        console.warn('Network audio load failed, generating fallback synthetic loop:', e);
        audioBuffer = audioEngine.createSyntheticMusicLoop(result.prompt, 8, 120);
      }
    } else {
      audioBuffer = audioEngine.createSyntheticMusicLoop(result.prompt, 8, 120);
    }

    return {
      id: 'clip_' + Math.random().toString(36).substring(2, 9),
      name: `${result.provider.toUpperCase()}: ${result.title}`,
      startTime,
      duration: audioBuffer.duration,
      audioBuffer,
      sourceUrl: targetUrl,
      color: result.provider === 'suno' ? '#e63946' : '#9d4edd',
      isAiGenerated: true,
      aiPrompt: result.prompt
    };
  }
}
