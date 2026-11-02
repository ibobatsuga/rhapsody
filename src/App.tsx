import React, { useState } from 'react';
import { Song, AppTab, AIProvider } from './types';
import { AIService } from './services/aiService';
import { SunoSidebar } from './components/SunoSidebar';
import { SunoCreatePanel } from './components/SunoCreatePanel';
import { SunoTrackCard } from './components/SunoTrackCard';
import { SunoExploreView } from './components/SunoExploreView';
import { SunoLibraryView } from './components/SunoLibraryView';
import { SunoPlayerBar } from './components/SunoPlayerBar';
import { SunoLyricsModal } from './components/SunoLyricsModal';
import { SunoStemsModal } from './components/SunoStemsModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  Sparkles, 
  Loader2, 
  Search, 
  Layers, 
  SlidersHorizontal,
  Flame,
  Radio,
  Clock
} from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & Tabs
  const [currentTab, setCurrentTab] = useState<AppTab>('create');
  const [credits, setCredits] = useState<number>(50);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [stemModalSong, setStemModalSong] = useState<Song | null>(null);

  // Player State
  const [currentSong, setCurrentSong] = useState<Song | null>(() => {
    const initial = AIService.getInitialExploreSongs();
    return initial.length > 0 ? initial[0] : null;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Songs State
  const [songs, setSongs] = useState<Song[]>(() => AIService.getInitialExploreSongs());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');

  // Prefill Create Panel State (from Remix or Extend)
  const [createPrefill, setCreatePrefill] = useState<{
    prompt?: string;
    tags?: string;
    title?: string;
  }>({});

  // Audio Playback Controls
  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  const handleToggleLike = (songId: string) => {
    setSongs(prev => prev.map(s => {
      if (s.id === songId) {
        return { ...s, isLiked: !s.isLiked };
      }
      return s;
    }));

    if (currentSong?.id === songId) {
      setCurrentSong(prev => prev ? { ...prev, isLiked: !prev.isLiked } : null);
    }
  };

  const handleDeleteSong = (songId: string) => {
    setSongs(prev => prev.filter(s => s.id !== songId));
    if (currentSong?.id === songId) {
      setIsPlaying(false);
      setCurrentSong(null);
    }
  };

  // Remix & Extend Prompt Helpers
  const handleUsePrompt = (song: Song) => {
    setCreatePrefill({
      prompt: song.prompt,
      tags: song.tags,
      title: `${song.title} (Remix)`
    });
    setCurrentTab('create');
  };

  const handleExtendSong = (song: Song) => {
    setCreatePrefill({
      prompt: `Continuation of ${song.title}: ${song.prompt}`,
      tags: song.tags,
      title: `${song.title} (Part 2)`
    });
    setCurrentTab('create');
  };

  // Stem Separation Trigger
  const handleSplitStems = (song: Song) => {
    // If not already separated, inject simulated high-quality stem links
    if (!song.vocalStemUrl || !song.instrumentalStemUrl) {
      const updated = {
        ...song,
        vocalStemUrl: 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg',
        instrumentalStemUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg'
      };
      setSongs(prev => prev.map(s => s.id === song.id ? updated : s));
      setStemModalSong(updated);
    } else {
      setStemModalSong(song);
    }
  };

  // Music Generation Handler
  const handleGenerate = async (params: {
    provider: AIProvider;
    model: string;
    prompt: string;
    tags: string;
    title: string;
    lyrics?: string;
    isInstrumental: boolean;
  }) => {
    if (credits < 5) {
      alert('You need at least 5 credits to generate a new track. Credits reset daily.');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Submitting generation task...');
    setCredits(prev => Math.max(0, prev - 5));

    const tempId = `gen_${Date.now()}`;
    const placeholderSong: Song = {
      id: tempId,
      title: params.title || 'Generating Title...',
      prompt: params.prompt,
      tags: params.tags,
      lyrics: params.lyrics,
      isInstrumental: params.isInstrumental,
      provider: params.provider,
      model: params.model,
      audioUrl: '',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
      duration: 180,
      createdAt: 'Just now',
      status: 'generating'
    };

    setSongs(prev => [placeholderSong, ...prev]);

    try {
      // 1. Submit Generation
      const { taskId } = await AIService.generateMusic({
        provider: params.provider,
        prompt: params.prompt,
        tags: params.tags,
        title: params.title,
        lyrics: params.lyrics,
        isInstrumental: params.isInstrumental
      });

      setGenerationStatus('Synthesizing audio and harmonies...');

      // 2. Poll for Completion
      const result = await AIService.pollTask(taskId, params.provider, (status) => {
        setGenerationStatus(`Processing: ${status}...`);
      });

      // 3. Update Song Record
      const completedSong: Song = {
        ...placeholderSong,
        title: result.title || params.title,
        status: 'complete',
        audioUrl: result.audioUrls[0] || 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
        imageUrl: `https://picsum.photos/seed/${tempId}/400/400`,
        duration: result.duration || 180,
        vocalStemUrl: result.vocalStemUrl || 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg',
        instrumentalStemUrl: result.instrumentalStemUrl || 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg'
      };

      setSongs(prev => prev.map(s => s.id === tempId ? completedSong : s));
      setCurrentSong(completedSong);
      setIsPlaying(true);
    } catch (err: any) {
      console.error('Generation Error:', err);
      setSongs(prev => prev.map(s => {
        if (s.id === tempId) {
          return {
            ...s,
            status: 'failed',
            title: `${s.title} (Failed)`
          };
        }
        return s;
      }));
      alert(`Generation notice: ${err.message || 'Task timed out'}`);
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090b0e] text-white font-sans antialiased">
      {/* 1. Left Suno Sidebar Navigation */}
      <SunoSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        credits={credits}
      />

      {/* 2. Main Content View Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* TAB 1: CREATE VIEW (Split Panel like Suno.com) */}
        {currentTab === 'create' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Form & Generator Settings */}
            <SunoCreatePanel
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              credits={credits}
              initialPrompt={createPrefill.prompt}
              initialTags={createPrefill.tags}
              initialTitle={createPrefill.title}
            />

            {/* Right Panel: Live Generation Feed & Songs List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-28 flex flex-col gap-6">
              {/* Header Feed Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1c232f]">
                <div>
                  <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Recent Creations</span>
                    <span className="text-xs font-mono font-normal text-gray-500">
                      ({songs.length} tracks)
                    </span>
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your real-time generated Suno and Udio tracks
                  </p>
                </div>
              </div>

              {/* Generating In-Progress Card */}
              {isGenerating && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1f1625] via-[#1a1f2c] to-[#151c27] border border-[#ff3366]/40 shadow-xl flex items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#ff3366]/20 border border-[#ff3366]/40 flex items-center justify-center text-[#ff3366]">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">Generating Track...</span>
                        <span className="text-[10px] bg-[#ff3366] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                          LIVE
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {generationStatus || 'Sending prompt to AI model...'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Creations Feed List */}
              <div className="flex flex-col gap-3">
                {songs.map(song => (
                  <SunoTrackCard
                    key={song.id}
                    song={song}
                    isPlaying={currentSong?.id === song.id && isPlaying}
                    onPlay={handlePlaySong}
                    onToggleLike={handleToggleLike}
                    onSplitStems={handleSplitStems}
                    onExtend={handleExtendSong}
                    onDelete={handleDeleteSong}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPLORE VIEW (Discover Trending Grid) */}
        {currentTab === 'explore' && (
          <SunoExploreView
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onToggleLike={handleToggleLike}
            onUsePrompt={handleUsePrompt}
            onSplitStems={handleSplitStems}
          />
        )}

        {/* TAB 3: LIBRARY VIEW (User Saved & Stems) */}
        {currentTab === 'library' && (
          <SunoLibraryView
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onToggleLike={handleToggleLike}
            onSplitStems={handleSplitStems}
            onExtend={handleExtendSong}
            onDelete={handleDeleteSong}
            onGoToCreate={() => setCurrentTab('create')}
          />
        )}
      </main>

      {/* 3. Sticky Bottom Audio Player Bar */}
      <SunoPlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onToggleLike={handleToggleLike}
        onToggleLyrics={() => setShowLyricsModal(!showLyricsModal)}
        showLyrics={showLyricsModal}
      />

      {/* 4. Modals */}
      <SunoLyricsModal
        song={currentSong}
        isOpen={showLyricsModal}
        onClose={() => setShowLyricsModal(false)}
      />

      <SunoStemsModal
        song={stemModalSong}
        isOpen={!!stemModalSong}
        onClose={() => setStemModalSong(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;

