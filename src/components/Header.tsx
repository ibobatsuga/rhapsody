import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Repeat, 
  Volume2, 
  Sparkles, 
  Sliders, 
  Music, 
  Settings, 
  CircleDot,
  Radio
} from 'lucide-react';

interface HeaderProps {
  isPlaying: boolean;
  currentTime: number;
  bpm: number;
  masterVolume: number;
  isLooping: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onToggleLoop: () => void;
  onBpmChange: (bpm: number) => void;
  onMasterVolumeChange: (vol: number) => void;
  onOpenDrumPads: () => void;
  onOpenSynth: () => void;
  onOpenEffects: () => void;
  onToggleAIAssistant: () => void;
  onOpenSettings: () => void;
  isAIDrawerOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isPlaying,
  currentTime,
  bpm,
  masterVolume,
  isLooping,
  onPlay,
  onPause,
  onStop,
  onRewind,
  onToggleLoop,
  onBpmChange,
  onMasterVolumeChange,
  onOpenDrumPads,
  onOpenSynth,
  onOpenEffects,
  onToggleAIAssistant,
  onOpenSettings,
  isAIDrawerOpen
}) => {
  // Format seconds to mm:ss.ms
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-16 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between select-none z-20">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#e63946] to-[#ff4d6d] flex items-center justify-center shadow-lg shadow-[#e63946]/20">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-lg">RHAPSODY</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#e63946]/20 text-[#e63946] font-semibold border border-[#e63946]/30">
                DAW Studio
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Untitled Project (44.1kHz / 24-bit)</p>
          </div>
        </div>
      </div>

      {/* Main Transport Bar */}
      <div className="flex items-center gap-3">
        {/* Timecode display */}
        <div className="bg-[#0e1117] border border-[#30363d] rounded-lg px-3 py-1 font-mono text-center shadow-inner">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Timeline</div>
          <div className="text-lg font-bold text-[#00f5d4] tracking-wider leading-none">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Transport buttons */}
        <div className="flex items-center bg-[#0e1117] border border-[#30363d] rounded-lg p-1 gap-1">
          <button 
            onClick={onRewind}
            title="Rewind to start"
            className="p-2 hover:bg-[#21262d] text-gray-300 hover:text-white rounded transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {isPlaying ? (
            <button 
              onClick={onPause}
              title="Pause"
              className="px-4 py-2 bg-[#ff9e00] hover:bg-[#ffaa1a] text-black font-semibold rounded shadow-md transition flex items-center gap-1.5"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span className="text-xs">PAUSE</span>
            </button>
          ) : (
            <button 
              onClick={onPlay}
              title="Play"
              className="px-4 py-2 bg-[#52b788] hover:bg-[#74c69d] text-black font-semibold rounded shadow-md shadow-[#52b788]/20 transition flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span className="text-xs">PLAY</span>
            </button>
          )}

          <button 
            onClick={onStop}
            title="Stop"
            className="p-2 hover:bg-[#21262d] text-gray-300 hover:text-white rounded transition"
          >
            <Square className="w-4 h-4" />
          </button>

          <button 
            onClick={onToggleLoop}
            title="Toggle Loop"
            className={`p-2 rounded transition ${isLooping ? 'bg-[#e63946]/20 text-[#e63946] border border-[#e63946]/40' : 'text-gray-400 hover:text-white hover:bg-[#21262d]'}`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* BPM Selector */}
        <div className="bg-[#0e1117] border border-[#30363d] rounded-lg px-3 py-1 flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono font-bold">BPM</span>
          <input 
            type="number" 
            min="50" 
            max="240"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="w-14 bg-transparent text-sm font-mono text-white text-right focus:outline-none focus:ring-1 focus:ring-[#e63946] rounded px-1"
          />
        </div>

        {/* Master Volume */}
        <div className="flex items-center gap-2 bg-[#0e1117] border border-[#30363d] rounded-lg px-3 py-1.5">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <input 
            type="range"
            min="0"
            max="1.2"
            step="0.01"
            value={masterVolume}
            onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
            className="w-20 accent-[#e63946] h-1.5 bg-[#21262d] rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono text-gray-400 w-8 text-right">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>
      </div>

      {/* Instruments, AI Assistant & Settings Tools */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onOpenDrumPads}
          className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs font-medium rounded-lg border border-[#30363d] transition flex items-center gap-1.5"
          title="Open Drum Machine"
        >
          <CircleDot className="w-3.5 h-3.5 text-[#ff9e00]" />
          <span>Drums</span>
        </button>

        <button 
          onClick={onOpenSynth}
          className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs font-medium rounded-lg border border-[#30363d] transition flex items-center gap-1.5"
          title="Open Polyphonic Synthesizer"
        >
          <Music className="w-3.5 h-3.5 text-[#00f5d4]" />
          <span>Keys</span>
        </button>

        <button 
          onClick={onOpenEffects}
          className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs font-medium rounded-lg border border-[#30363d] transition flex items-center gap-1.5"
          title="Master Effects Rack"
        >
          <Sliders className="w-3.5 h-3.5 text-[#9d4edd]" />
          <span>FX</span>
        </button>

        <div className="w-[1px] h-6 bg-[#30363d] mx-1" />

        {/* AI Assistant Flyout Toggle (Suno / Udio Generator) */}
        <button 
          onClick={onToggleAIAssistant}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-2 shadow-lg ${
            isAIDrawerOpen 
              ? 'bg-gradient-to-r from-[#e63946] to-[#9d4edd] text-white border-transparent shadow-[#e63946]/30' 
              : 'bg-[#21262d] hover:bg-[#30363d] text-white border-[#e63946]/40 hover:border-[#e63946]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span>AI Studio</span>
          <span className="text-[10px] bg-black/40 px-1 py-0.2 rounded font-mono text-gray-300">
            Suno/Udio
          </span>
        </button>

        <button 
          onClick={onOpenSettings}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-lg transition"
          title="Studio Settings & GoAPI Key"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
