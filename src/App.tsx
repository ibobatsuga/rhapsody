import React, { useState } from 'react';
import { Song, AppTab, AIProvider } from './types';
import { AIService } from './services/aiService';
import { SunoSidebar } from './components/SunoSidebar';
import { SunoCreatePanel } from './components/SunoCreatePanel';
import { SunoWorkspaceFeed } from './components/SunoWorkspaceFeed';
import { SunoStudioView } from './components/SunoStudioView';
import { SunoExploreView } from './components/SunoExploreView';
import { SunoLibraryView } from './components/SunoLibraryView';
import { SunoPlayerBar } from './components/SunoPlayerBar';
import { SunoLyricsModal } from './components/SunoLyricsModal';
import { SunoStemsModal } from './components/SunoStemsModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  // Navigation & Tabs: 'create' | 'studio' | 'explore' | 'library'
  const [currentTab, setCurrentTab] = useState<AppTab>('create');
  const [credits, setCredits] = useState<number>(50);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [stemModalSong, setStemModalSong] = useState<Song | null>(null);

  // Songs & Studio State
  const [songs, setSongs] = useState<Song[]>(() => AIService.getInitialExploreSongs());
  const [studioSong, setStudioSong] = useState<Song | null>(() => {
    const initial = AIService.getInitialExploreSongs();
    return initial.find(s => s.title === 'Dumes') || initial[0];
  });

  // Player State
  const [currentSong, setCurrentSong] = useState<Song | null>(() => {
    const initial = AIService.getInitialExploreSongs();
    return initial.length > 0 ? initial[0] : null;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Prefill Create Panel State
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

  const handleOpenInStudio = (song: Song) => {
    setStudioSong(song);
    setCurrentTab('studio');
  };

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

  const handleSplitStems = (song: Song) => {
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
    vocalGender?: 'male' | 'female' | 'any';
    weirdness?: number;
    styleInfluence?: number;
    variety?: string;
  }) => {
    if (credits < 5) {
      alert('You need at least 5 credits to generate a new track. Credits reset daily.');
      return;
    }

    setIsGenerating(true);
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
      modelBadge: params.model.toUpperCase(),
      audioUrl: '',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
      duration: 180,
      createdAt: 'Just now',
      dateGroup: 'Wednesday, Oct 14',
      status: 'generating'
    };

    setSongs(prev => [placeholderSong, ...prev]);

    try {
      const { taskId } = await AIService.generateMusic({
        provider: params.provider,
        prompt: params.prompt,
        tags: params.tags,
        title: params.title,
        lyrics: params.lyrics,
        isInstrumental: params.isInstrumental
      });

      const result = await AIService.pollTask(taskId, params.provider);

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
      setSongs(prev => prev.map(s => s.id === tempId ? { ...s, status: 'failed' } : s));
      alert(`Generation notice: ${err.message || 'Task completed via preview'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090c] text-white font-sans antialiased">
      {/* 1. Left Thin Icon Sidebar (Matching Suno Left Bar) */}
      <SunoSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        credits={credits}
      />

      {/* 2. Main Workstation Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* VIEW 1: CREATE VIEW (Screenshots 1, 2, 3) */}
        {currentTab === 'create' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Suno Create Panel with Songs/Speech, Simple/Advanced, Accordions */}
            <SunoCreatePanel
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              credits={credits}
              initialPrompt={createPrefill.prompt}
              initialTags={createPrefill.tags}
              initialTitle={createPrefill.title}
            />

            {/* Right Panel: Suno Workspace Feed */}
            <SunoWorkspaceFeed
              songs={songs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              onToggleLike={handleToggleLike}
              onSplitStems={handleSplitStems}
              onExtend={handleExtendSong}
              onDelete={handleDeleteSong}
              onOpenInStudio={handleOpenInStudio}
            />
          </div>
        )}

        {/* VIEW 2: STUDIO VIEW (Screenshot 4 - The Suno Studio Multitrack DAW) */}
        {currentTab === 'studio' && (
          <SunoStudioView
            song={studioSong}
            onBackToLibrary={() => setCurrentTab('create')}
            onGeneratePart={(prompt) => {
              handleGenerate({
                provider: 'suno',
                model: 'v6-mini',
                prompt,
                tags: studioSong?.tags || 'pop, modern',
                title: `${studioSong?.title || 'Song'} Part`,
                isInstrumental: false
              });
            }}
          />
        )}

        {/* VIEW 3: EXPLORE VIEW */}
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

        {/* VIEW 4: LIBRARY VIEW */}
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

      {/* 3. Sticky Bottom Audio Player Bar (Shown in non-studio tabs) */}
      {currentTab !== 'studio' && (
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
      )}

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
