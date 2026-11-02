import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  FastForward, 
  Folder, 
  SlidersHorizontal, 
  Mic, 
  Settings, 
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  isPlaying: boolean;
  currentTime: number;
  bpm: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  onToggleConsole: () => void;
  onOpenDrumPads: () => void;
  onOpenSynth: () => void;
  onToggleAIAssistant: () => void;
  onOpenSettings: () => void;
  isAIDrawerOpen: boolean;
  isConsoleOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isPlaying,
  currentTime,
  bpm,
  onPlay,
  onPause,
  onStop,
  onRewind,
  onFastForward,
  onToggleConsole,
  onOpenDrumPads,
  onOpenSynth,
  onToggleAIAssistant,
  onOpenSettings,
  isAIDrawerOpen,
  isConsoleOpen
}) => {
  // Format seconds to 00 : 48 : 34 (mins : secs : ms)
  const formatDigitalTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${mins.toString().padStart(2, '0')} : ${remSecs.toString().padStart(2, '0')} : ${ms.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-14 bg-[#11161b] border-b border-[#1f2730] px-3.5 flex items-center justify-between select-none z-20">
      {/* Brand & Studio Label (Left) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          {/* Glowing Red Camera/Eye Icon Badge */}
          <div className="w-8 h-8 rounded-lg bg-[#161c22] border border-[#27323c] flex items-center justify-center shadow-inner">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#9b111e] via-[#e63946] to-[#ff6b6b] shadow-[0_0_8px_rgba(230,57,70,0.8)] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white opacity-80" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold tracking-tight text-white text-[13px]">RhapsodyStudio</span>
            </div>
            <span className="text-[10px] font-mono text-gray-500 font-medium">v 2.11</span>
          </div>
        </div>
      </div>

      {/* Main Hardware Transport Bar (Center) */}
      <div className="flex items-center gap-2.5">
        {/* Recessed Hardware Transport Panel */}
        <div className="flex items-center bg-[#151b22] border border-[#232c36] rounded-lg p-1 gap-1.5 shadow-inner">
          {/* Stop Button */}
          <button 
            onClick={onStop}
            title="Stop"
            className="w-7 h-7 bg-[#1c242e] hover:bg-[#25303d] active:bg-[#151b22] text-gray-400 hover:text-white rounded flex items-center justify-center border border-[#2a3542] transition shadow-sm"
          >
            <Square className="w-3 h-3 fill-current" />
          </button>

          {/* Rewind Button */}
          <button 
            onClick={onRewind}
            title="Rewind"
            className="w-7 h-7 bg-[#1c242e] hover:bg-[#25303d] active:bg-[#151b22] text-gray-400 hover:text-white rounded flex items-center justify-center border border-[#2a3542] transition shadow-sm"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Play/Pause Button - Neon Teal/Green Pill */}
          {isPlaying ? (
            <button 
              onClick={onPause}
              title="Pause"
              className="h-7 px-3.5 bg-[#00f5d4] hover:bg-[#38ef7d] text-black font-bold rounded-md flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(0,245,212,0.4)] transition"
            >
              <Pause className="w-3.5 h-3.5 fill-black" />
            </button>
          ) : (
            <button 
              onClick={onPlay}
              title="Play"
              className="h-7 px-3.5 bg-[#00f5d4] hover:bg-[#38ef7d] text-black font-bold rounded-md flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(0,245,212,0.4)] transition"
            >
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            </button>
          )}

          {/* Fast Forward Button */}
          <button 
            onClick={onFastForward}
            title="Fast Forward (+4s)"
            className="w-7 h-7 bg-[#1c242e] hover:bg-[#25303d] active:bg-[#151b22] text-gray-400 hover:text-white rounded flex items-center justify-center border border-[#2a3542] transition shadow-sm"
          >
            <FastForward className="w-3 h-3" />
          </button>

          {/* Record Button with Red Glowing Dot */}
          <button 
            onClick={onPlay}
            title="Record Mode"
            className="w-7 h-7 bg-[#1c242e] hover:bg-[#25303d] rounded flex items-center justify-center border border-[#2a3542] transition shadow-sm"
          >
            <div className={`w-2.5 h-2.5 rounded-full bg-[#e63946] shadow-[0_0_6px_rgba(230,57,70,0.9)] ${isPlaying ? 'animate-ping' : ''}`} />
          </button>
        </div>

        {/* Status Indicators: 11 RE & EQ ON */}
        <div className="flex flex-col text-[8.5px] font-mono text-gray-400 leading-tight border-r border-[#232c36] pr-2.5">
          <span>11 RE</span>
          <span className="text-[#00f5d4]">EQ ON</span>
        </div>

        {/* Digital LCD Timecode Screen (00 : 48 : 34) */}
        <div className="bg-[#0b0e12] border border-[#232c36] rounded-lg px-3.5 py-1 flex flex-col items-center shadow-inner">
          <div className="text-sm font-bold text-[#00f5d4] digital-lcd tracking-widest leading-none">
            {formatDigitalTime(currentTime)}
          </div>
        </div>

        {/* Helper Recording Label */}
        <div className="flex flex-col text-[8px] font-mono uppercase text-gray-500 leading-tight">
          <span className="text-gray-400 font-semibold">RECORDING</span>
          <span>SPACE TO START</span>
        </div>
      </div>

      {/* Utility Controls & Profile (Right) */}
      <div className="flex items-center gap-2">
        {/* Project Folder */}
        <button 
          onClick={onOpenDrumPads}
          title="Drum Machine & Samples"
          className="w-7 h-7 bg-[#161c22] hover:bg-[#202730] text-gray-400 hover:text-white rounded-lg flex items-center justify-center border border-[#232c36] transition"
        >
          <Folder className="w-3.5 h-3.5" />
        </button>

        {/* Lower Console Mixer Toggle */}
        <button 
          onClick={onToggleConsole}
          title={isConsoleOpen ? "Hide Lower Console" : "Show Lower Console Rack"}
          className={`w-7 h-7 rounded-lg flex items-center justify-center border transition ${
            isConsoleOpen 
              ? 'bg-[#00f5d4]/20 border-[#00f5d4]/50 text-[#00f5d4]' 
              : 'bg-[#161c22] border-[#232c36] text-gray-400 hover:text-white hover:bg-[#202730]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Mic / Input */}
        <button 
          onClick={onOpenSynth}
          title="Synth Keys"
          className="w-7 h-7 bg-[#161c22] hover:bg-[#202730] text-gray-400 hover:text-white rounded-lg flex items-center justify-center border border-[#232c36] transition"
        >
          <Mic className="w-3.5 h-3.5" />
        </button>

        {/* Settings */}
        <button 
          onClick={onOpenSettings}
          title="Settings & GoAPI Key"
          className="w-7 h-7 bg-[#161c22] hover:bg-[#202730] text-gray-400 hover:text-white rounded-lg flex items-center justify-center border border-[#232c36] transition"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* AI Studio Assistant Toggle */}
        <button 
          onClick={onToggleAIAssistant}
          className={`h-7 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
            isAIDrawerOpen
              ? 'bg-gradient-to-r from-[#e63946] to-[#9d4edd] text-white border-transparent shadow-[0_0_10px_rgba(230,57,70,0.4)]'
              : 'bg-[#161c22] hover:bg-[#202730] text-gray-300 border-[#232c36] hover:border-[#00f5d4]/40'
          }`}
        >
          <Sparkles className="w-3 h-3 text-[#00f5d4]" />
          <span className="text-[11px]">AI Studio</span>
        </button>

        <div className="w-[1px] h-5 bg-[#232c36] mx-0.5" />

        {/* User Profile Chip */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer hover:opacity-90">
          <div className="text-right leading-none hidden sm:block">
            <span className="text-[9px] text-gray-500 block">Hello,</span>
            <span className="text-[11px] font-semibold text-gray-200">Mehrdad Adineh</span>
          </div>
          <div className="w-7 h-7 rounded-full overflow-hidden border border-[#2e3a47] shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" 
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
