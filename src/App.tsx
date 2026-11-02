import React, { useState, useEffect } from 'react';
import { Track, AIGenerationResult } from './types';
import { audioEngine } from './audio/audioEngine';
import { AIService } from './services/aiService';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { BottomConsole } from './components/BottomConsole';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { DrumPadsModal } from './components/DrumPadsModal';
import { SynthKeyboardModal } from './components/SynthKeyboardModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  // Transport State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [masterVolume, setMasterVolume] = useState(0.85);
  const [zoom] = useState(48); // 48px per second for 16-second studio view

  // Active Modals & Flyouts
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [isDrumModalOpen, setIsDrumModalOpen] = useState(false);
  const [isSynthModalOpen, setIsSynthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>('track_kit');
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip_kit_2');

  // Seed tracks to mirror the exact arrangement in the reference screenshot
  const [tracks, setTracks] = useState<Track[]>(() => {
    const mellowBuffer = audioEngine.createSyntheticMusicLoop('synth', 3, 120);
    const vocalBuffer = audioEngine.createSyntheticMusicLoop('vocal', 4.5, 120);
    const beatBuffer = audioEngine.createSyntheticMusicLoop('drums', 4, 120);
    const kitBuffer = audioEngine.createSyntheticMusicLoop('drums', 2.5, 120);
    const fxBuffer = audioEngine.createSyntheticMusicLoop('synth', 1.2, 120);
    const padBuffer = audioEngine.createSyntheticMusicLoop('synth', 1.5, 120);

    return [
      {
        id: 'track_mellow',
        name: 'Mellow',
        type: 'synth',
        color: '#a855f7', // Purple
        muted: false,
        solo: false,
        volume: 0.85,
        pan: -0.1,
        clips: [
          { id: 'clip_m_1', name: 'Mellow 1', startTime: 0, duration: 2.5, audioBuffer: mellowBuffer, color: '#a855f7' },
          { id: 'clip_m_2', name: 'Mellow 2', startTime: 2.5, duration: 2.5, audioBuffer: mellowBuffer, color: '#a855f7' },
          { id: 'clip_m_3', name: 'Mellow 3', startTime: 5, duration: 2.5, audioBuffer: mellowBuffer, color: '#a855f7' },
          { id: 'clip_m_4', name: 'Mellow 4', startTime: 7.5, duration: 2.5, audioBuffer: mellowBuffer, color: '#a855f7' },
          { id: 'clip_m_5', name: 'Mellow 5', startTime: 10, duration: 2.5, audioBuffer: mellowBuffer, color: '#a855f7' },
          { id: 'clip_m_6', name: 'Mellow 6', startTime: 12.5, duration: 2.5, audioBuffer: mellowBuffer, color: '#a855f7' },
        ],
        effects: { filterCutoff: 18000, filterType: 'lowpass', delayTime: 0, delayFeedback: 0, reverbWet: 0, distortion: 0 }
      },
      {
        id: 'track_vocal',
        name: 'Vocal',
        type: 'audio',
        color: '#ff6b6b', // Coral
        muted: false,
        solo: false,
        volume: 0.95,
        pan: 0,
        clips: [
          { id: 'clip_v_1', name: 'Vocal 1', startTime: 5, duration: 4.5, audioBuffer: vocalBuffer, color: '#ff6b6b' },
          { id: 'clip_v_2', name: 'Vocal 2', startTime: 10, duration: 4.5, audioBuffer: vocalBuffer, color: '#ff6b6b' }
        ],
        effects: { filterCutoff: 20000, filterType: 'lowpass', delayTime: 0, delayFeedback: 0, reverbWet: 0, distortion: 0 }
      },
      {
        id: 'track_beat',
        name: 'Beat',
        type: 'drums',
        color: '#00f5d4', // Cyan
        muted: false,
        solo: false,
        volume: 0.9,
        pan: 0,
        clips: [
          { id: 'clip_b_1', name: 'Beat 1', startTime: 0, duration: 4, audioBuffer: beatBuffer, color: '#00f5d4' },
          { id: 'clip_b_2', name: 'Beat 2', startTime: 4, duration: 4, audioBuffer: beatBuffer, color: '#00f5d4' },
          { id: 'clip_b_3', name: 'Beat 3', startTime: 8, duration: 4, audioBuffer: beatBuffer, color: '#00f5d4' },
          { id: 'clip_b_4', name: 'Beat 4', startTime: 12, duration: 4, audioBuffer: beatBuffer, color: '#00f5d4' }
        ],
        effects: { filterCutoff: 20000, filterType: 'lowpass', delayTime: 0, delayFeedback: 0, reverbWet: 0, distortion: 0 }
      },
      {
        id: 'track_kit',
        name: 'Kit',
        type: 'drums',
        color: '#38ef7d', // Green
        muted: false,
        solo: false,
        volume: 0.88,
        pan: 0.1,
        clips: [
          { id: 'clip_kit_1', name: 'Kit 1', startTime: 4.5, duration: 2.2, audioBuffer: kitBuffer, color: '#38ef7d' },
          { id: 'clip_kit_2', name: 'Kit 2', startTime: 7, duration: 2.3, audioBuffer: kitBuffer, color: '#38ef7d' },
          { id: 'clip_kit_3', name: 'Kit 3', startTime: 13, duration: 2.3, audioBuffer: kitBuffer, color: '#38ef7d' }
        ],
        effects: { filterCutoff: 20000, filterType: 'lowpass', delayTime: 0, delayFeedback: 0, reverbWet: 0, distortion: 0 }
      },
      {
        id: 'track_fx',
        name: 'Fx',
        type: 'synth',
        color: '#f59e0b', // Amber / Gold
        muted: false,
        solo: false,
        volume: 0.8,
        pan: 0.2,
        clips: [
          { id: 'clip_fx_1', name: 'Fx45', startTime: 13, duration: 1.2, audioBuffer: fxBuffer, color: '#f59e0b' },
          { id: 'clip_fx_2', name: 'Fx45', startTime: 14.3, duration: 1.2, audioBuffer: fxBuffer, color: '#f59e0b' }
        ],
        effects: { filterCutoff: 19000, filterType: 'lowpass', delayTime: 0, delayFeedback: 0, reverbWet: 0, distortion: 0 }
      },
      {
        id: 'track_pad',
        name: 'Pad',
        type: 'synth',
        color: '#c084fc', // Soft purple
        muted: false,
        solo: false,
        volume: 0.75,
        pan: -0.25,
        clips: [
          { id: 'clip_pad_2', name: 'Pad 2', startTime: 2.6, duration: 1.4, audioBuffer: padBuffer, color: '#c084fc' }
        ],
        effects: { filterCutoff: 17000, filterType: 'lowpass', delayTime: 0, delayFeedback: 0, reverbWet: 0, distortion: 0 }
      }
    ];
  });

  // Keep AudioEngine time in sync
  useEffect(() => {
    const unsub = audioEngine.addTimeListener((time) => {
      setCurrentTime(time);
      if (time >= 16) {
        audioEngine.seek(0, tracks, bpm);
      }
    });
    return unsub;
  }, [tracks, bpm]);

  // Master Volume sync
  useEffect(() => {
    audioEngine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Spacebar Play/Pause trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (isPlaying) {
          handlePause();
        } else {
          handlePlay();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, tracks, bpm]);

  // Playback Handlers
  const handlePlay = () => {
    setIsPlaying(true);
    audioEngine.play(tracks, bpm, (t) => setCurrentTime(t));
  };

  const handlePause = () => {
    setIsPlaying(false);
    audioEngine.pause();
  };

  const handleStop = () => {
    setIsPlaying(false);
    audioEngine.stop();
    setCurrentTime(0);
  };

  const handleRewind = () => {
    audioEngine.seek(0, tracks, bpm);
    setCurrentTime(0);
  };

  const handleFastForward = () => {
    const nextTime = Math.min(16, currentTime + 4);
    audioEngine.seek(nextTime, tracks, bpm);
    setCurrentTime(nextTime);
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds, tracks, bpm);
  };

  const handleAddTrack = (type: 'audio' | 'synth' | 'drums') => {
    const colors = {
      audio: '#ff6b6b',
      synth: '#a855f7',
      drums: '#00f5d4'
    };

    const newTrack: Track = {
      id: 'track_' + Math.random().toString(36).substring(2, 9),
      name: `Track ${tracks.length + 1}`,
      type,
      color: colors[type],
      muted: false,
      solo: false,
      volume: 0.9,
      pan: 0,
      clips: [],
      effects: {
        filterCutoff: 20000,
        filterType: 'lowpass',
        delayTime: 0,
        delayFeedback: 0,
        reverbWet: 0,
        distortion: 0
      }
    };

    audioEngine.registerTrack(newTrack);
    setTracks(prev => [...prev, newTrack]);
    setSelectedTrackId(newTrack.id);
  };

  const handleAddSampleToTrack = (title: string, genre: string, color: string) => {
    const loopBuffer = audioEngine.createSyntheticMusicLoop(genre, 4, bpm);
    const newClip = {
      id: 'clip_' + Math.random().toString(36).substring(2, 9),
      name: title,
      startTime: Math.floor(currentTime),
      duration: 4,
      audioBuffer: loopBuffer,
      color
    };

    setTracks(prev => {
      const target = prev.find(t => t.id === selectedTrackId) || prev[0];
      return prev.map(t => t.id === target.id ? { ...t, clips: [...t.clips, newClip] } : t);
    });
  };

  const handleAddClipFromAI = async (
    result: AIGenerationResult,
    audioUrl?: string,
    trackType: 'audio' | 'synth' | 'drums' = 'audio'
  ) => {
    const newClip = await AIService.createClipFromAI(result, audioUrl, Math.floor(currentTime));

    setTracks(prev => {
      const existingEmpty = prev.find(t => t.clips.length === 0);
      if (existingEmpty) {
        return prev.map(t => t.id === existingEmpty.id ? { ...t, clips: [...t.clips, newClip] } : t);
      }

      const newTrack: Track = {
        id: 'track_ai_' + Math.random().toString(36).substring(2, 9),
        name: `AI ${result.title.slice(0, 10)}`,
        type: trackType,
        color: result.provider === 'suno' ? '#ff6b6b' : '#a855f7',
        muted: false,
        solo: false,
        volume: 0.95,
        pan: 0,
        clips: [newClip],
        effects: {
          filterCutoff: 20000,
          filterType: 'lowpass',
          delayTime: 0,
          delayFeedback: 0,
          reverbWet: 0,
          distortion: 0
        }
      };

      audioEngine.registerTrack(newTrack);
      return [...prev, newTrack];
    });
  };

  const handleSplitStemsFromAI = async (result: AIGenerationResult) => {
    const vocalClip = await AIService.createClipFromAI(
      { ...result, title: `${result.title} (Vocal)` },
      result.vocalStemUrl || result.audioUrls[0],
      Math.floor(currentTime)
    );
    vocalClip.color = '#ff6b6b';

    const instClip = await AIService.createClipFromAI(
      { ...result, title: `${result.title} (Inst)` },
      result.instrumentalStemUrl || result.audioUrls[0],
      Math.floor(currentTime)
    );
    instClip.color = '#00f5d4';

    const vocalTrack: Track = {
      id: 'track_vocal_' + Math.random().toString(36).substring(2, 8),
      name: 'Vocal AI',
      type: 'audio',
      color: '#ff6b6b',
      muted: false,
      solo: false,
      volume: 1.0,
      pan: 0,
      clips: [vocalClip],
      effects: { filterCutoff: 20000, filterType: 'lowpass', delayTime: 0, delayFeedback: 0, reverbWet: 0, distortion: 0 }
    };

    const instTrack: Track = {
      id: 'track_inst_' + Math.random().toString(36).substring(2, 8),
      name: 'Beat AI',
      type: 'drums',
      color: '#00f5d4',
      muted: false,
      solo: false,
      volume: 0.9,
      pan: 0,
      clips: [instClip],
      effects: { filterCutoff: 20000, filterType: 'lowpass', delayTime: 0, delayFeedback: 0, reverbWet: 0, distortion: 0 }
    };

    audioEngine.registerTrack(vocalTrack);
    audioEngine.registerTrack(instTrack);
    setTracks(prev => [...prev, vocalTrack, instTrack]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0e12] text-white">
      {/* 1. Hardware Top Header Bar */}
      <Header
        isPlaying={isPlaying}
        currentTime={currentTime}
        bpm={bpm}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onRewind={handleRewind}
        onFastForward={handleFastForward}
        onToggleConsole={() => setIsConsoleOpen(prev => !prev)}
        onOpenDrumPads={() => setIsDrumModalOpen(true)}
        onOpenSynth={() => setIsSynthModalOpen(true)}
        onToggleAIAssistant={() => setIsAIDrawerOpen(!isAIDrawerOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isAIDrawerOpen={isAIDrawerOpen}
        isConsoleOpen={isConsoleOpen}
      />

      {/* 2. Main Studio Timeline Grid */}
      <Timeline
        tracks={tracks}
        currentTime={currentTime}
        bpm={bpm}
        zoom={zoom}
        onSeek={handleSeek}
        onSelectTrack={(id) => setSelectedTrackId(id)}
        selectedTrackId={selectedTrackId}
        selectedClipId={selectedClipId}
        onSelectClip={(id) => setSelectedClipId(id)}
        onAddTrack={handleAddTrack}
      />

      {/* 3. Lower Hardware Console Rack (Volume, DSP Unit, Sample Bank, 10-Band EQ + Oscilloscope) */}
      {isConsoleOpen && (
        <BottomConsole
          masterVolume={masterVolume}
          onMasterVolumeChange={setMasterVolume}
          tracks={tracks}
          selectedTrackId={selectedTrackId}
          onOpenAIAssistant={() => setIsAIDrawerOpen(true)}
          onAddSampleToTrack={handleAddSampleToTrack}
        />
      )}

      {/* AI Assistant Flyout Drawer (Suno & Udio Generator) */}
      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        onAddClipToDAW={handleAddClipFromAI}
        onSplitStemsToDAW={handleSplitStemsFromAI}
      />

      {/* Virtual Instruments & Settings Modals */}
      <DrumPadsModal
        isOpen={isDrumModalOpen}
        onClose={() => setIsDrumModalOpen(false)}
      />

      <SynthKeyboardModal
        isOpen={isSynthModalOpen}
        onClose={() => setIsSynthModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;
