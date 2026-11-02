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
              duration: data.duration || 180,
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
   * AI Lyrics Generator Assistant
   */
  public static generateRandomLyrics(topic: string, genre: string): string {
    const themes = [
      `[Verse 1]\nSepi membisu di sudut malam ini\nLampu berpendar di antara bayang sunyi\nKenangan manis kembali terulang lagi\nTakkan pernah hilang dari relung hati\n\n[Chorus]\nBagaikan lampu yang tak pernah mati\nTerang menyala di kegelapan abadi\nWalau badai menerjang takkan berhenti\nCinta sejati abadi di hati\n\n[Outro]\nTak pernah mati...\nAbadi di hati...`,
      `[Verse 1]\nNeon lights reflect the rainy street\nEchoes of the city in my beat\nChasing shadows under velvet skies\nNo more questions, no more compromises\n\n[Chorus]\nTake me higher through the neon haze\nLost inside this electric maze\nWe are timeless, running with the sound\nFeet won't ever touch the ground\n\n[Outro]\nLost in the frequency...\nJust you and me...`,
      `[Verse 1]\nPetikan gitar mengalun syahdu di pelataran\nLangkah perlahan menanti kepastian\nJanji suci terukir dalam genggaman\nMenemani setiap helaan nafas impian\n\n[Chorus]\nHari bahagia yang kita nantikan berdua\nMenyatukan dua jiwa dalam bahagia\nKisah abadi hingga menua bersama\nDalam irama cinta yang sempurna`
    ];
    return themes[Math.floor(Math.random() * themes.length)];
  }

  /**
   * Curated Songs from Suno Workspace
   */
  public static getInitialExploreSongs(): Song[] {
    return [
      {
        id: 'suno_ws_1',
        title: 'Bill Osmena - D Nae (Wedding Instrumental)',
        prompt: 'piano pop, folk-pop, wedding instrumental, fingerpicked acoustic guitar, nylon-string arpeggios, upright bass, brushed sn...',
        tags: 'piano pop, folk-pop, wedding, acoustic, nylon string',
        isInstrumental: true,
        provider: 'suno',
        model: 'v6-mini',
        modelBadge: 'V6-MINI',
        extendCount: 1,
        audioUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop',
        duration: 162,
        createdAt: 'Oct 14',
        dateGroup: 'Wednesday, Oct 14',
        status: 'complete',
        vocalStemUrl: 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg',
        instrumentalStemUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        isLiked: false
      },
      {
        id: 'suno_ws_2',
        title: 'Bill Osmena - D Nae (Wedding Instrumental)',
        prompt: 'piano pop, folk-pop, wedding instrumental, fingerpicked acoustic guitar, nylon-string arpeggios, upright bass, brushed sn...',
        tags: 'piano pop, folk-pop, wedding, acoustic',
        isInstrumental: true,
        provider: 'suno',
        model: 'v6-mini',
        modelBadge: 'V6-MINI',
        extendCount: 1,
        audioUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop',
        duration: 163,
        createdAt: 'Oct 14',
        dateGroup: 'Wednesday, Oct 14',
        status: 'complete',
        vocalStemUrl: 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg',
        instrumentalStemUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        isLiked: false
      },
      {
        id: 'suno_ws_3',
        title: 'Seperti Mati Lampu',
        prompt: 'Funkot with metallic robotic synthesizer and supersaw riser sweeps, half-time brostep breakdowns, extreme drop dynamics, glitch-chopped ken...',
        tags: 'funkot, electro, brostep, koplo, synthesizer',
        lyrics: '[Verse]\nBagaikan lampu padam di tengah malam...\n[Chorus]\nSeperti mati lampu ya sayang, seperti mati lampu...',
        isInstrumental: false,
        provider: 'suno',
        model: 'v6',
        modelBadge: 'V6',
        isCover: true,
        audioUrl: 'https://actions.google.com/sounds/v1/music/ambient_hum.ogg',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
        duration: 228,
        createdAt: 'Sep 13',
        dateGroup: 'Sunday, Sep 13',
        status: 'complete',
        vocalStemUrl: 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg',
        instrumentalStemUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        isLiked: true
      },
      {
        id: 'suno_ws_4',
        title: 'Seperti Mati Lampu',
        prompt: 'Female biduan lead, husky tone with thick melismatic cengkok and sliding portamento, occasional robotic pitch-shifted vocal chops; Funkot, drivi...',
        tags: 'funkot, cengkok, female vocal, dangdut koplo',
        lyrics: '[Verse]\nMelangkah pelan diiringi irama...\n[Chorus]\nSeperti mati lampu ya sayang...',
        isInstrumental: false,
        provider: 'suno',
        model: 'v6',
        modelBadge: 'V6',
        isCover: true,
        audioUrl: 'https://actions.google.com/sounds/v1/music/ambient_hum.ogg',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop',
        duration: 228,
        createdAt: 'Sep 13',
        dateGroup: 'Sunday, Sep 13',
        status: 'complete',
        vocalStemUrl: 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg',
        instrumentalStemUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        isLiked: false
      },
      {
        id: 'suno_ws_5',
        title: 'Seperti Mati Lampu',
        prompt: 'Funkot, driving kendang koplo drum rolls with Jaipongan-influenced tak-dang-dut stutters, keyboard and organ tunggal melody, 132 BPM four-on-...',
        tags: 'funkot, kendang koplo, jaipongan, organ tunggal',
        isInstrumental: true,
        provider: 'suno',
        model: 'v6',
        modelBadge: 'V6',
        isCover: true,
        audioUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
        duration: 227,
        createdAt: 'Sep 13',
        dateGroup: 'Sunday, Sep 13',
        status: 'complete',
        isLiked: false
      },
      {
        id: 'suno_ws_6',
        title: 'Dumes',
        prompt: 'Indonesian Javanese pop ballad with acoustic guitar, emotive strings, and modern synth pad accents',
        tags: 'javanese pop, ballad, emotive, acoustic guitar',
        lyrics: '[Verse]\nSepine wengi iki ngelingke kowe...\n[Chorus]\nRa kuat aku nyonggo loro iki...',
        isInstrumental: false,
        provider: 'suno',
        model: 'v6-mini',
        modelBadge: 'V6-MINI',
        audioUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&h=400&fit=crop',
        duration: 215,
        createdAt: 'Sep 10',
        dateGroup: 'Sunday, Sep 13',
        status: 'complete',
        vocalStemUrl: 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg',
        instrumentalStemUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        isLiked: true
      }
    ];
  }
}
