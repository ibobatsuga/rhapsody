import { AIGenerationRequest, AIGenerationResult, Song, AIProvider } from '../types';

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
    provider: AIProvider,
    onProgress?: (status: string) => void
  ): Promise<AIGenerationResult> {
    const apiKey = this.getApiKey();
    const maxAttempts = 40;
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
              duration: data.duration || 32,
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
   * AI Lyrics Generator Assistant (similar to Suno's AI Lyric Generator)
   */
  public static generateRandomLyrics(topic: string, genre: string): string {
    const themes = [
      `[Verse 1]\nNeon lights reflect the rainy street\nEchoes of the city in my beat\nChasing shadows under velvet skies\nNo more questions, no more compromises\n\n[Chorus]\nTake me higher through the neon haze\nLost inside this electric maze\nWe are timeless, running with the sound\nFeet won't ever touch the ground\n\n[Verse 2]\nFrequencies are buzzing through the air\nAnalog warmth is everywhere\nFeel the sub-bass shaking in the night\nEverything is gonna be alright\n\n[Outro]\nLost in the frequency...\nJust you and me...`,
      `[Verse 1]\nSunlight fades behind the coastal hills\nSipping coffee, watching time stand still\nAcoustic chords are floating in the breeze\nWhispers dancing through the olive trees\n\n[Chorus]\nHere's to the moments that we never planned\nFootprints washing away in the sand\nLet the ocean carry us away\nInto the golden light of another day\n\n[Outro]\nAnother day...\nCarry us away...`,
      `[Verse 1]\nHeavy distortion in the engine roar\nWe've never felt this alive before\nBreaking out of the cybernetic cage\nTurning over a brand new page\n\n[Chorus]\nIgnite the spark, break through the firewall\nStanding tall against the digital wall\nUnstoppable force, unbroken chain\nRunning free through the acid rain\n\n[Outro]\nUnstoppable...\nRunning free...`
    ];
    return themes[Math.floor(Math.random() * themes.length)];
  }

  /**
   * Initial Curated Songs (Explore Feed)
   */
  public static getInitialExploreSongs(): Song[] {
    return [
      {
        id: 'suno_exp_1',
        title: 'Neon Odyssey',
        prompt: 'Synthwave 80s anthem with retro arpeggiated synths, energetic drums, and soaring vocals',
        tags: 'synthwave, electronic, retro, 80s, melodic',
        lyrics: '[Verse 1]\nNeon lights reflect the rainy street...\n[Chorus]\nTake me higher through the neon haze...',
        isInstrumental: false,
        provider: 'suno',
        model: 'v4',
        audioUrl: 'https://actions.google.com/sounds/v1/music/ambient_hum.ogg',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
        duration: 184,
        createdAt: '1 hour ago',
        status: 'complete',
        vocalStemUrl: 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg',
        instrumentalStemUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        isLiked: true
      },
      {
        id: 'suno_exp_2',
        title: 'Tokyo Midnight Rain',
        prompt: 'Lo-fi chill hip hop, mellow rhodes piano, rainy day vinyl crackle, relaxed bassline',
        tags: 'lo-fi, chillhop, jazzy, relaxed, ambient',
        isInstrumental: true,
        provider: 'suno',
        model: 'v3.5',
        audioUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
        duration: 156,
        createdAt: '3 hours ago',
        status: 'complete',
        isLiked: false
      },
      {
        id: 'suno_exp_3',
        title: 'Cyber Valkyrie',
        prompt: 'Dark electro industrial cyberpunk with gritty distorted bass and aggressive female vocal',
        tags: 'cyberpunk, darksynth, industrial, bass, heavy',
        lyrics: '[Verse]\nHeavy distortion in the engine roar...\n[Chorus]\nIgnite the spark...',
        isInstrumental: false,
        provider: 'udio',
        model: 'v1.5',
        audioUrl: 'https://actions.google.com/sounds/v1/music/ambient_hum.ogg',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop',
        duration: 210,
        createdAt: '5 hours ago',
        status: 'complete',
        isLiked: true
      },
      {
        id: 'suno_exp_4',
        title: 'Golden Sunset Acoustic',
        prompt: 'Warm indie acoustic pop song, fingerstyle acoustic guitar, gentle vocals, uplifting melody',
        tags: 'indie pop, acoustic, folk, warm, feelgood',
        isInstrumental: false,
        provider: 'suno',
        model: 'v4',
        audioUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&h=400&fit=crop',
        duration: 172,
        createdAt: 'Yesterday',
        status: 'complete',
        isLiked: false
      }
    ];
  }
}
