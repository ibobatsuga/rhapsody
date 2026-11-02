import React, { useState, useEffect } from 'react';
import { Track, AIGenerationResult } from './types';
import { audioEngine } from './audio/audioEngine';
import { AIService } from './services/aiService';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { DrumPadsModal } from './components/DrumPadsModal';
import { SynthKeyboardModal } from './components/SynthKeyboardModal';
import { EffectsRackModal } from './components/EffectsRackModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  // Transport State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [masterVolume, setMasterVolume] = useState(0.85);
  const [isLooping, setIsLooping] = useState(false);
  const [zoom] = useState(24); // 24px per second

  // Active Modals & Flyouts
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isDrumModalOpen, setIsDrumModalOpen] = useState(false);
  const [isSynthModalOpen, setIsSynthModalOpen] = useState(false);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  // Initial Tracks with synthesized demo loops so user can hear music immediately!
  const [tracks, setTracks] = useState<Track[]>(() => {
    // Generate demo audio buffers
    const drumLoopBuffer = audioEngine.createSyntheticMusicLoop('drums', 8, 120);
    const synthLoopBuffer = audioEngine.createSyntheticMusicLoop('synth', 8, 120);

    return [
      {
        id: 'track_drums',
        name: 'Drum Groove (Beat)',
        type: 'drums',
        color: '#ff9e00',
        muted: false,
        solo: false,
        volume: 0.9,
        pan: 0,
        clips: [
          {
            id: 'clip_drums_1',
            name: 'Classic 808 Groove',
            startTime: 0,
            duration: 8,
            audioBuffer: drumLoopBuffer,
            color: '#ff9e00'
          },
          {
            id: 'clip_drums_2',
            name: 'Classic 808 Groove (Rep)',
            startTime: 8,
            duration: 8,
            audioBuffer: drumLoopBuffer,
            color: '#ff9e00'
          }
        ],
        effects: {
          filterCutoff: 20000,
          filterType: 'lowpass',
          delayTime: 0,
          delayFeedback: 0,
          reverbWet: 0,
          distortion: 0
        }
      },
      {
        id: 'track_synth',
        name: 'Synth Chords & Arp',
        type: 'synth',
        color: '#00f5d4',
        muted: false,
        solo: false,
        volume: 0.85,
        pan: -0.15,
        clips: [
          {
            id: 'clip_synth_1',
            name: 'Dreamy Chords Loop',
            startTime: 0,
            duration: 8,
            audioBuffer: synthLoopBuffer,
            color: '#00f5d4'
          },
          {
            id: 'clip_synth_2',
            name: 'Dreamy Chords Loop',
            startTime: 8,
            duration: 8,
            audioBuffer: synthLoopBuffer,
            color: '#00f5d4'
          }
        ],
        effects: {
          filterCutoff: 18000,
          filterType: 'lowpass',
          delayTime: 0,
          delayFeedback: 0,
          reverbWet: 0,
          distortion: 0
        }
      },
      {
        id: 'track_vocal',
        name: 'Vocal / AI Lead',
        type: 'audio',
        color: '#e63946',
        muted: false,
        solo: false,
        volume: 1.0,
        pan: 0.1,
        clips: [],
        effects: {
          filterCutoff: 20000,
          filterType: 'lowpass',
          delayTime: 0,
          delayFeedback: 0,
          reverbWet: 0,
          distortion: 0
        }
      }
    ];
  });

  // Keep AudioEngine time in sync
  useEffect(() => {
    const unsub = audioEngine.addTimeListener((time) => {
      setCurrentTime(time);
      if (isLooping && time >= 16) {
        audioEngine.seek(0, tracks, bpm);
      }
    });
    return unsub;
  }, [isLooping, tracks, bpm]);

  // Master Volume sync
  useEffect(() => {
    audioEngine.setMasterVolume(masterVolume);
  }, [masterVolume]);

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

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds, tracks, bpm);
  };

  // Track Handlers
  const handleUpdateTrack = (trackId: string, updated: Partial<Track>) => {
    setTracks(prev => {
      const next = prev.map(t => t.id === trackId ? { ...t, ...updated } : t);
      const changedTrack = next.find(t => t.id === trackId);
      if (changedTrack) {
        audioEngine.updateTrackNodes(changedTrack);
      }
      return next;
    });
  };

  const handleDeleteTrack = (trackId: string) => {
    audioEngine.unregisterTrack(trackId);
    setTracks(prev => prev.filter(t => t.id !== trackId));
    if (selectedTrackId === trackId) {
      setSelectedTrackId(null);
    }
  };

  const handleAddTrack = (type: 'audio' | 'synth' | 'drums') => {
    const colors = {
      audio: '#e63946',
      synth: '#00f5d4',
      drums: '#ff9e00'
    };

    const newTrack: Track = {
      id: 'track_' + Math.random().toString(36).substring(2, 9),
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Track`,
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
  };

  const handleDeleteClip = (trackId: string, clipId: string) => {
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        return {
          ...t,
          clips: t.clips.filter(c => c.id !== clipId)
        };
      }
      return t;
    }));
  };

  /**
   * Insert AI Clip into Rhapsody timeline as a track
   */
  const handleAddClipFromAI = async (
    result: AIGenerationResult,
    audioUrl?: string,
    trackType: 'audio' | 'synth' | 'drums' = 'audio'
  ) => {
    const newClip = await AIService.createClipFromAI(result, audioUrl, 0);

    // Look for an existing empty track or create a new dedicated track
    setTracks(prev => {
      const existingEmpty = prev.find(t => t.clips.length === 0 && t.type === trackType);
      if (existingEmpty) {
        return prev.map(t => t.id === existingEmpty.id ? { ...t, clips: [...t.clips, newClip] } : t);
      }

      // Create new track for this AI clip
      const newTrack: Track = {
        id: 'track_ai_' + Math.random().toString(36).substring(2, 9),
        name: `[AI] ${result.title.slice(0, 16)}`,
        type: trackType,
        color: result.provider === 'suno' ? '#e63946' : '#9d4edd',
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

  /**
   * Split AI generated song into 2 separate DAW tracks: Vocal & Instrumental
   */
  const handleSplitStemsFromAI = async (result: AIGenerationResult) => {
    // 1. Vocal Stem
    const vocalClip = await AIService.createClipFromAI(
      { ...result, title: `${result.title} (Vocals)` },
      result.vocalStemUrl || result.audioUrls[0],
      0
    );
    vocalClip.color = '#e63946';

    // 2. Instrumental Stem
    const instClip = await AIService.createClipFromAI(
      { ...result, title: `${result.title} (Inst)` },
      result.instrumentalStemUrl || result.audioUrls[0],
      0
    );
    instClip.color = '#00f5d4';

    const vocalTrack: Track = {
      id: 'track_vocal_' + Math.random().toString(36).substring(2, 8),
      name: `[Stem] ${result.title.slice(0, 12)} (Vocal)`,
      type: 'audio',
      color: '#e63946',
      muted: false,
      solo: false,
      volume: 1.0,
      pan: 0,
      clips: [vocalClip],
      effects: {
        filterCutoff: 20000,
        filterType: 'lowpass',
        delayTime: 0,
        delayFeedback: 0,
        reverbWet: 0,
        distortion: 0
      }
    };

    const instTrack: Track = {
      id: 'track_inst_' + Math.random().toString(36).substring(2, 8),
      name: `[Stem] ${result.title.slice(0, 12)} (Instrumental)`,
      type: 'synth',
      color: '#00f5d4',
      muted: false,
      solo: false,
      volume: 0.9,
      pan: 0,
      clips: [instClip],
      effects: {
        filterCutoff: 20000,
        filterType: 'lowpass',
        delayTime: 0,
        delayFeedback: 0,
        reverbWet: 0,
        distortion: 0
      }
    };

    audioEngine.registerTrack(vocalTrack);
    audioEngine.registerTrack(instTrack);
    setTracks(prev => [...prev, vocalTrack, instTrack]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0e1117] text-white">
      {/* Header Transport Bar */}
      <Header
        isPlaying={isPlaying}
        currentTime={currentTime}
        bpm={bpm}
        masterVolume={masterVolume}
        isLooping={isLooping}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onRewind={handleRewind}
        onToggleLoop={() => setIsLooping(!isLooping)}
        onBpmChange={setBpm}
        onMasterVolumeChange={setMasterVolume}
        onOpenDrumPads={() => setIsDrumModalOpen(true)}
        onOpenSynth={() => setIsSynthModalOpen(true)}
        onOpenEffects={() => setIsEffectsModalOpen(true)}
        onToggleAIAssistant={() => setIsAIDrawerOpen(!isAIDrawerOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isAIDrawerOpen={isAIDrawerOpen}
      />

      {/* Main Timeline Workspace */}
      <Timeline
        tracks={tracks}
        currentTime={currentTime}
        bpm={bpm}
        zoom={zoom}
        onSeek={handleSeek}
        onUpdateTrack={handleUpdateTrack}
        onDeleteTrack={handleDeleteTrack}
        onAddTrack={handleAddTrack}
        onDeleteClip={handleDeleteClip}
        onOpenAIAssistant={() => setIsAIDrawerOpen(true)}
      />

      {/* AI Assistant Flyout (Suno & Udio Generator) */}
      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        onAddClipToDAW={handleAddClipFromAI}
        onSplitStemsToDAW={handleSplitStemsFromAI}
      />

      {/* Modals */}
      <DrumPadsModal
        isOpen={isDrumModalOpen}
        onClose={() => setIsDrumModalOpen(false)}
      />

      <SynthKeyboardModal
        isOpen={isSynthModalOpen}
        onClose={() => setIsSynthModalOpen(false)}
      />

      <EffectsRackModal
        isOpen={isEffectsModalOpen}
        onClose={() => setIsEffectsModalOpen(false)}
        tracks={tracks}
        selectedTrackId={selectedTrackId}
        onSelectTrack={setSelectedTrackId}
        onUpdateTrackEffects={(trackId, effects) => handleUpdateTrack(trackId, { effects })}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
export default App;
