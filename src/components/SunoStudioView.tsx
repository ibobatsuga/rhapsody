import React, { useState, useRef, useEffect } from 'react';
import { Song, StudioTrack } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Download, 
  Plus, 
  Sparkles, 
  Scissors, 
  Sliders, 
  Share2, 
  Library, 
  ChevronDown, 
  ArrowUp, 
  Lightbulb, 
  SlidersHorizontal,
  X,
  Maximize2,
  FolderOpen
} from 'lucide-react';

interface SunoStudioViewProps {
  song: Song | null;
  onBackToLibrary: () => void;
  onGeneratePart?: (prompt: string) => void;
}

export const SunoStudioView: React.FC<SunoStudioViewProps> = ({
  song,
  onBackToLibrary,
  onGeneratePart
}) => {
  // Master transport state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [bpm, setBpm] = useState(140);
  const [timeSig] = useState('4/4');
  const [masterVolume, setMasterVolume] = useState(0.85);
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotModel, setCopilotModel] = useState('v6-mini');

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Studio Tracks (Full Mix, Lead Vocal, Instrumental Stem)
  const [tracks, setTracks] = useState<StudioTrack[]>([
    {
      id: 'trk_main',
      name: song ? song.title : 'Dumes',
      type: 'full',
      color: '#b08953', // Golden-brown from screenshot
      muted: false,
      solo: false,
      volume: 0.9,
      pan: 0,
      audioUrl: song?.audioUrl || 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg'
    },
    {
      id: 'trk_vocal',
      name: song ? `${song.title} (Lead Vocal)` : 'Dumes (Lead Vocal)',
      type: 'vocal',
      color: '#0284c7', // Cyan/electric blue from screenshot
      muted: false,
      solo: false,
      volume: 0.95,
      pan: 0,
      audioUrl: song?.vocalStemUrl || 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg'
    },
    {
      id: 'trk_instrumental',
      name: song ? `${song.title} (Without Lead Vocal)` : 'Dumes (Without Lead Vocal)',
      type: 'instrumental',
      color: '#7c3aed', // Purple/violet from screenshot
      muted: false,
      solo: false,
      volume: 0.85,
      pan: 0,
      audioUrl: song?.instrumentalStemUrl || 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg'
    }
  ]);

  // Update tracks if active song changes
  useEffect(() => {
    if (song) {
      setTracks([
        {
          id: 'trk_main',
          name: song.title,
          type: 'full',
          color: '#b08953',
          muted: false,
          solo: false,
          volume: 0.9,
          pan: 0,
          audioUrl: song.audioUrl
        },
        {
          id: 'trk_vocal',
          name: `${song.title} (Lead Vocal)`,
          type: 'vocal',
          color: '#0284c7',
          muted: false,
          solo: false,
          volume: 0.95,
          pan: 0,
          audioUrl: song.vocalStemUrl || song.audioUrl
        },
        {
          id: 'trk_instrumental',
          name: `${song.title} (Without Lead Vocal)`,
          type: 'instrumental',
          color: '#7c3aed',
          muted: false,
          solo: false,
          volume: 0.85,
          pan: 0,
          audioUrl: song.instrumentalStemUrl || song.audioUrl
        }
      ]);
    }
  }, [song]);

  // Playhead Clock Simulation
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now() - playheadTime * 1000;
      const updateClock = () => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setPlayheadTime(elapsed % 240); // loop after 4 mins
        animationFrameRef.current = requestAnimationFrame(updateClock);
      };
      animationFrameRef.current = requestAnimationFrame(updateClock);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const rewind = () => setPlayheadTime(0);

  const toggleMute = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const toggleSolo = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, solo: !t.solo } : t));
  };

  const updateVolume = (trackId: string, vol: number) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, volume: vol } : t));
  };

  const handleAddNewTrack = () => {
    const newId = `trk_${Date.now()}`;
    setTracks(prev => [
      ...prev,
      {
        id: newId,
        name: `Track ${prev.length + 1} (Custom AI Layer)`,
        type: 'custom',
        color: '#10b981',
        muted: false,
        solo: false,
        volume: 0.8,
        pan: 0
      }
    ]);
  };

  const handleSendCopilot = () => {
    if (!copilotPrompt.trim()) return;
    if (onGeneratePart) {
      onGeneratePart(copilotPrompt);
    }
    alert(`AI Studio Copilot generating at position ${formatTimecode(playheadTime)}: "${copilotPrompt}"`);
    setCopilotPrompt('');
  };

  const formatTimecode = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const formatBars = (secs: number) => {
    const totalBeats = Math.floor((secs * bpm) / 60);
    const bars = Math.floor(totalBeats / 4) + 1;
    const beats = (totalBeats % 4) + 1;
    return `${bars.toString().padStart(3, '0')}.${beats}.1`;
  };

  return (
    <div className="flex-1 h-screen flex flex-col bg-[#07090c] text-white font-sans select-none overflow-hidden">
      {/* 1. TOP STUDIO NAVIGATION BAR (Screenshot 4) */}
      <header className="h-14 bg-[#0a0d12] border-b border-[#181d26] px-4 flex items-center justify-between z-20">
        {/* Left: Brand, Song Title Selector, Mode Pills, Undo/Redo */}
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-base tracking-wider text-white">
            SUNO
          </span>

          <div className="flex items-center gap-1 bg-[#12161f] px-2.5 py-1 rounded-lg border border-[#212734] cursor-pointer hover:bg-[#1a202c]">
            <span className="text-xs font-bold text-gray-200">{song ? song.title : 'Dumes'}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>

          <button className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-[#12161f]">
            ...
          </button>

          <button className="px-2.5 py-1 text-xs font-semibold text-gray-300 hover:text-white bg-[#141923] rounded-lg border border-[#212735]">
            Preview
          </button>

          <button className="px-2.5 py-1 text-xs font-bold text-gray-300 hover:text-white bg-[#141923] rounded-lg border border-[#212735]">
            Upgrade to edit
          </button>

          <div className="flex items-center gap-1 text-gray-400 ml-1">
            <button title="Undo" className="p-1 hover:text-white"><RotateCcw className="w-3.5 h-3.5" /></button>
            <button title="Redo" className="p-1 hover:text-white"><RotateCcw className="w-3.5 h-3.5 -scale-x-100" /></button>
          </div>
        </div>

        {/* Center: Transport Controls Pill & Timecode Counter */}
        <div className="flex items-center gap-3">
          {/* Transport Pill */}
          <div className="flex items-center gap-2 bg-[#12161f] px-3 py-1 rounded-full border border-[#212735]">
            <button onClick={rewind} title="Rewind" className="text-gray-400 hover:text-white">
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
            </button>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" title="Record" />
          </div>

          {/* Timecode Box */}
          <div className="flex items-center gap-3 bg-[#12161f] px-3 py-1 rounded-full border border-[#212735] font-mono text-xs">
            <span className="text-gray-200 font-bold">{formatTimecode(playheadTime)}</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">{formatBars(playheadTime)}</span>
          </div>
        </div>

        {/* Right: Tempo BPM, Time Sig, Export, Library */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
            <span className="font-bold">{bpm} BPM</span>
            <span className="text-gray-500">|</span>
            <span>{timeSig}</span>
          </div>

          <button className="px-3 py-1.5 bg-[#141923] hover:bg-[#1f2635] text-gray-200 text-xs font-bold rounded-xl border border-[#212735] flex items-center gap-1.5 transition">
            <Share2 className="w-3.5 h-3.5 text-gray-400" />
            <span>Export</span>
          </button>

          <button 
            onClick={onBackToLibrary}
            className="px-3 py-1.5 bg-[#141923] hover:bg-[#1f2635] text-gray-200 text-xs font-bold rounded-xl border border-[#212735] flex items-center gap-1.5 transition"
          >
            <Library className="w-3.5 h-3.5 text-gray-400" />
            <span>Library</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN MULTITRACK TIMELINE WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Track Headers Column (240px) */}
        <div className="w-60 min-w-[240px] bg-[#090c10] border-r border-[#191e27] flex flex-col z-10">
          {/* Header Bar */}
          <div className="h-9 border-b border-[#191e27] px-3 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>TRACKS</span>
            <span className="text-[10px]">VOL / PAN</span>
          </div>

          {/* Track Headers List */}
          <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-[#151922]">
            {tracks.map((track, idx) => (
              <div 
                key={track.id}
                className="h-24 p-2.5 flex flex-col justify-between hover:bg-[#10141d] transition group"
              >
                {/* Track Row 1: Number, Title, Mute, Solo, Automation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-mono text-gray-500">{idx + 1}</span>
                    <span className="text-xs font-bold text-gray-200 truncate group-hover:text-white">
                      {track.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleMute(track.id)}
                      className={`p-1 rounded text-xs ${track.muted ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-white'}`}
                      title="Mute"
                    >
                      {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => toggleSolo(track.id)}
                      className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                        track.solo ? 'bg-amber-400 text-black' : 'text-gray-500 hover:text-white bg-[#141822]'
                      }`}
                      title="Solo"
                    >
                      S
                    </button>
                    <button
                      className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center text-gray-500 hover:text-white bg-[#141822]"
                      title="Automation"
                    >
                      A
                    </button>
                  </div>
                </div>

                {/* Track Row 2: Volume Slider & Pan knob */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={track.volume}
                    onChange={(e) => updateVolume(track.id, Number(e.target.value))}
                    className="flex-1 accent-gray-300 h-1 bg-[#1a202c] rounded cursor-pointer"
                  />
                  <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[8px] font-mono text-gray-400" title="Pan Center">
                    C
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Track Button */}
            <div className="p-3">
              <button
                onClick={handleAddNewTrack}
                className="w-full py-2 bg-[#12161f] hover:bg-[#1a202b] text-gray-300 text-xs font-semibold rounded-xl border border-[#212836] flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-gray-400" />
                <span>Add new track</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Multitrack Timeline Waveform Lanes */}
        <div className="flex-1 flex flex-col bg-[#07090c] overflow-x-auto relative">
          {/* Top Bar Ruler with Measures (1, 17, 33, 49, 65, 81...) */}
          <div className="h-9 border-b border-[#191e27] flex items-center text-[10px] font-mono text-gray-500 select-none px-2 min-w-[1200px]">
            {[1, 17, 33, 49, 65, 81, 97, 113, 129, 145, 161].map(bar => (
              <div key={bar} className="flex-1 flex items-center border-l border-[#191e27] pl-1.5">
                <span>{bar}</span>
              </div>
            ))}
          </div>

          {/* Timeline Lanes */}
          <div className="flex-1 flex flex-col divide-y divide-[#151922] min-w-[1200px] relative">
            {/* Playhead Vertical Line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-[#ff3366] z-10 pointer-events-none transition-all duration-75"
              style={{ left: `${(playheadTime / 240) * 100}%` }}
            >
              <div className="w-2.5 h-2.5 -left-1 -top-1 bg-[#ff3366] rounded-full absolute shadow-md" />
            </div>

            {tracks.map((track) => (
              <div 
                key={track.id}
                className="h-24 p-2 relative flex items-center"
              >
                {/* Waveform Box (Styled like Screenshot 4) */}
                <div 
                  className="w-full h-20 rounded-xl px-3 py-2 flex flex-col justify-between overflow-hidden shadow-inner border"
                  style={{ 
                    backgroundColor: `${track.color}22`,
                    borderColor: `${track.color}55`
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-bold truncate px-2 py-0.5 rounded"
                      style={{ color: track.color }}
                    >
                      {track.name}
                    </span>
                  </div>

                  {/* SVG Waveform Simulation */}
                  <div className="w-full h-9 flex items-center gap-1 opacity-85">
                    {Array.from({ length: 90 }).map((_, i) => {
                      const heightPct = Math.sin(i * 0.4) * 35 + Math.cos(i * 0.15) * 45 + 15;
                      return (
                        <div 
                          key={i}
                          className="flex-1 rounded-full transition-all"
                          style={{
                            height: `${Math.max(10, Math.min(100, Math.abs(heightPct)))}%`,
                            backgroundColor: track.color
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. FLOATING AI STUDIO COPILOT / PROMPT BAR (Screenshot 4) */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-xl z-30 px-4">
          <div className="bg-[#12161f]/95 backdrop-blur-md border border-[#2b3546] rounded-3xl p-3 shadow-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-[#1e2533]">
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-red-600 text-white font-mono font-bold px-1.5 py-0.2 rounded">
                  BETA
                </span>
                <span className="text-gray-300 font-semibold">AI Studio Copilot</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <select
                  value={copilotModel}
                  onChange={(e) => setCopilotModel(e.target.value)}
                  className="bg-[#181d28] text-xs font-mono font-bold text-gray-300 px-2 py-0.5 rounded border border-[#2b3546] focus:outline-none"
                >
                  <option value="v6-mini">v6-mini</option>
                  <option value="v4">v4</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                title="Add part"
                className="w-8 h-8 rounded-full bg-[#1c222e] hover:bg-[#262f3e] text-white flex items-center justify-center shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={copilotPrompt}
                onChange={(e) => setCopilotPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
                placeholder="Select a spot on the timeline and ask me to add a part"
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />

              <button
                onClick={handleSendCopilot}
                className="w-8 h-8 rounded-full bg-white text-black hover:bg-gray-200 flex items-center justify-center shrink-0 shadow transition"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM FOOTER TOOLBAR (Screenshot 4) */}
      <footer className="h-12 bg-[#090c10] border-t border-[#181d26] px-4 flex items-center justify-between text-xs text-gray-400 z-20">
        {/* Left: Main fader & tools */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-300">Main</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="w-24 accent-white h-1 bg-[#1a202c] rounded cursor-pointer"
            />
            <Volume2 className="w-3.5 h-3.5 text-gray-400" />
          </div>

          <div className="w-[1px] h-4 bg-[#1f2634]" />

          <div className="flex items-center gap-2">
            <button title="Pointer Tool" className="p-1 hover:text-white bg-[#141822] rounded"><Plus className="w-3.5 h-3.5" /></button>
            <button title="Split / Scissor" className="p-1 hover:text-white bg-[#141822] rounded"><Scissors className="w-3.5 h-3.5" /></button>
            <button title="DSP Rack" className="p-1 hover:text-white bg-[#141822] rounded"><Sliders className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Center: Timeline time markers */}
        <div className="hidden md:flex items-center gap-8 font-mono text-[10px] text-gray-500">
          <span>00:00</span>
          <span>01:00</span>
          <span>02:00</span>
          <span>03:00</span>
          <span>04:00</span>
          <span>05:00</span>
          <span>06:00</span>
        </div>

        {/* Right: Learn Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('Suno Studio lets you arrange, edit, split stems, and prompt AI copilot directly on the timeline!')}
            className="px-3 py-1 bg-[#141923] hover:bg-[#1e2534] text-white rounded-full border border-[#2b3546] flex items-center gap-1.5 transition text-xs font-semibold"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Learn</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
