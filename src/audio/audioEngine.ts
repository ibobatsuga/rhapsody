import { Track } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private playStartTime: number = 0;
  private animationFrameId: number | null = null;
  private timeListeners: Set<(time: number) => void> = new Set();
  
  // Track audio nodes mapping
  private trackNodes: Map<string, {
    gain: GainNode;
    panner: StereoPannerNode;
    filter: BiquadFilterNode;
  }> = new Map();

  // Active buffer source nodes playing on timeline
  private activeSources: AudioBufferSourceNode[] = [];

  constructor() {
    // AudioContext will be initialized on user gesture
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx({ sampleRate: 44100 });
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getContext(): AudioContext {
    this.init();
    return this.ctx!;
  }

  public setMasterVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1.5, val)), this.ctx.currentTime);
    }
  }

  public registerTrack(track: Track) {
    const ctx = this.getContext();
    if (this.trackNodes.has(track.id)) {
      this.updateTrackNodes(track);
      return;
    }

    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    const filter = ctx.createBiquadFilter();

    filter.type = track.effects.filterType || 'lowpass';
    filter.frequency.value = track.effects.filterCutoff || 20000;

    gain.gain.value = track.muted ? 0 : track.volume;
    panner.pan.value = track.pan;

    // Chain: Track Source -> Filter -> Pan -> Gain -> Master
    filter.connect(panner);
    panner.connect(gain);
    gain.connect(this.masterGain!);

    this.trackNodes.set(track.id, { gain, panner, filter });
  }

  public updateTrackNodes(track: Track) {
    const nodes = this.trackNodes.get(track.id);
    if (!nodes || !this.ctx) return;

    const effectiveGain = track.muted ? 0 : track.volume;
    nodes.gain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);
    nodes.panner.pan.setValueAtTime(track.pan, this.ctx.currentTime);
    nodes.filter.type = track.effects.filterType || 'lowpass';
    nodes.filter.frequency.setValueAtTime(track.effects.filterCutoff || 20000, this.ctx.currentTime);
  }

  public unregisterTrack(trackId: string) {
    const nodes = this.trackNodes.get(trackId);
    if (nodes) {
      nodes.gain.disconnect();
      nodes.panner.disconnect();
      nodes.filter.disconnect();
      this.trackNodes.delete(trackId);
    }
  }

  /**
   * Start playback from current timeline position
   */
  public play(tracks: Track[], bpm: number, onUpdate?: (time: number) => void) {
    this.init();
    if (this.isPlaying) return;

    this.isPlaying = true;
    const ctx = this.getContext();
    this.playStartTime = ctx.currentTime - this.currentTime;

    // Check if any track has solo
    const hasSolo = tracks.some(t => t.solo);

    // Stop old active sources
    this.stopSources();

    // Schedule clips to play
    tracks.forEach(track => {
      this.registerTrack(track);
      const nodes = this.trackNodes.get(track.id);
      if (!nodes) return;

      const shouldPlay = hasSolo ? track.solo : !track.muted;
      if (!shouldPlay) return;

      track.clips.forEach(clip => {
        if (!clip.audioBuffer) return;

        const clipStart = clip.startTime;
        const clipEnd = clip.startTime + clip.duration;

        // If current playhead is before or inside this clip
        if (this.currentTime < clipEnd) {
          const source = ctx.createBufferSource();
          source.buffer = clip.audioBuffer;
          source.connect(nodes.filter);

          const offsetInClip = Math.max(0, this.currentTime - clipStart);
          const delayUntilPlay = Math.max(0, clipStart - this.currentTime);

          source.start(ctx.currentTime + delayUntilPlay, offsetInClip);
          this.activeSources.push(source);
        }
      });
    });

    // Start time ticker
    const tick = () => {
      if (!this.isPlaying) return;
      this.currentTime = ctx.currentTime - this.playStartTime;
      this.timeListeners.forEach(listener => listener(this.currentTime));
      if (onUpdate) onUpdate(this.currentTime);
      this.animationFrameId = requestAnimationFrame(tick);
    };
    this.animationFrameId = requestAnimationFrame(tick);
  }

  public pause() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.stopSources();
  }

  public stop() {
    this.pause();
    this.currentTime = 0;
    this.timeListeners.forEach(listener => listener(0));
  }

  public seek(seconds: number, tracks: Track[], bpm: number) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }
    this.currentTime = Math.max(0, seconds);
    this.timeListeners.forEach(listener => listener(this.currentTime));
    if (wasPlaying) {
      this.play(tracks, bpm);
    }
  }

  public addTimeListener(listener: (time: number) => void) {
    this.timeListeners.add(listener);
    return () => this.timeListeners.delete(listener);
  }

  private stopSources() {
    this.activeSources.forEach(src => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    });
    this.activeSources = [];
  }

  /**
   * Load audio file from URL and decode to AudioBuffer
   */
  public async loadAudio(url: string): Promise<AudioBuffer> {
    const ctx = this.getContext();

    // Use backend proxy to avoid CORS issues with third-party CDNs
    const proxyUrl = url.startsWith('http') && !url.includes(window.location.host)
      ? `/api/ai/proxy-audio?url=${encodeURIComponent(url)}`
      : url;

    const response = await fetch(proxyUrl);
    const arrayBuffer = await response.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  }

  /**
   * Synthesize Drum Pad Sounds (Kick, Snare, HiHat, Clap, 808, etc.)
   */
  public playDrumSound(type: string, pitch = 1.0) {
    this.init();
    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (type.toLowerCase()) {
      case 'kick': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(150 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.35);
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'snare': {
        // Noise + tone
        const osc = ctx.createOscillator();
        const toneGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180 * pitch, now);
        toneGain.gain.setValueAtTime(0.6, now);
        toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(toneGain);
        toneGain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.15);

        // White noise burst
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain!);
        noise.start(now);
        break;
      }
      case 'hihat_closed':
      case 'hihat': {
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7500;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);
        noise.start(now);
        break;
      }
      case 'clap': {
        const bufferSize = ctx.sampleRate * 0.25;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);
        noise.start(now);
        break;
      }
      case '808_bass':
      case 'bass': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(65 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.8);
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }
      default: {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(440 * pitch, now);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    }
  }

  /**
   * Play a Polyphonic Synth Note (e.g. from Piano Roll or Virtual Keyboard)
   */
  public playSynthNote(freq: number, type: OscillatorType = 'sawtooth', duration = 0.5) {
    this.init();
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + duration);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Generate a Synthetic Audio Buffer (For AI simulation or instant demo loops)
   */
  public createSyntheticMusicLoop(genre: string, durationSec = 8, bpm = 120): AudioBuffer {
    const ctx = this.getContext();
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * durationSec);
    const buffer = ctx.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const beatInterval = 60 / bpm;
    const chordFrequencies = [
      [220, 261.63, 329.63], // Am (A3, C4, E4)
      [174.61, 220, 261.63], // F (F3, A3, C4)
      [261.63, 329.63, 392], // C (C4, E4, G4)
      [196, 246.94, 293.66]  // G (G3, B3, D4)
    ];

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const beat = (t / beatInterval) % 4;
      const chordIndex = Math.floor((t / (beatInterval * 4)) % chordFrequencies.length);
      const freqs = chordFrequencies[chordIndex];

      // Pad chord synth
      let sample = 0;
      freqs.forEach(f => {
        sample += Math.sin(2 * Math.PI * f * t) * 0.12;
        sample += Math.sin(2 * Math.PI * (f * 1.005) * t) * 0.08; // Chorus detune
      });

      // Bassline pulse
      const bassFreq = freqs[0] / 2;
      const bassEnv = Math.exp(-((t % beatInterval) * 4));
      sample += Math.sin(2 * Math.PI * bassFreq * t) * 0.3 * bassEnv;

      // Drum kick on beat 0 & 2
      if (beat < 0.2 || (beat > 2.0 && beat < 2.2)) {
        const kickTime = (t % (beatInterval * 2));
        const kickPitch = Math.max(30, 140 * Math.exp(-kickTime * 25));
        sample += Math.sin(2 * Math.PI * kickPitch * kickTime) * 0.45 * Math.exp(-kickTime * 15);
      }

      // Snare on beat 1 & 3
      if ((beat > 1.0 && beat < 1.2) || (beat > 3.0 && beat < 3.2)) {
        const noise = (Math.random() * 2 - 1) * 0.25;
        sample += noise;
      }

      left[i] = Math.max(-1, Math.min(1, sample));
      right[i] = Math.max(-1, Math.min(1, sample * 0.95));
    }

    return buffer;
  }
}

export const audioEngine = new AudioEngine();
