import React from 'react';
import { Track } from '../types';
import { VolumeX, Volume2, Mic, Music, Drum, Trash2 } from 'lucide-react';

interface TrackControlProps {
  track: Track;
  onUpdateTrack: (updated: Partial<Track>) => void;
  onDeleteTrack: () => void;
}

export const TrackControl: React.FC<TrackControlProps> = ({
  track,
  onUpdateTrack,
  onDeleteTrack
}) => {
  const getIcon = () => {
    switch (track.type) {
      case 'synth': return <Music className="w-3.5 h-3.5 text-[#00f5d4]" />;
      case 'drums': return <Drum className="w-3.5 h-3.5 text-[#ff9e00]" />;
      default: return <Mic className="w-3.5 h-3.5 text-[#e63946]" />;
    }
  };

  return (
    <div className="h-24 bg-[#161b22] border-b border-r border-[#30363d] p-2 flex flex-col justify-between relative group select-none">
      {/* Track Color Strip */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1" 
        style={{ backgroundColor: track.color }}
      />

      {/* Track Title & Type */}
      <div className="flex items-center justify-between pl-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {getIcon()}
          <input 
            type="text" 
            value={track.name}
            onChange={(e) => onUpdateTrack({ name: e.target.value })}
            className="text-xs font-semibold text-gray-200 bg-transparent hover:bg-[#21262d] focus:bg-[#0e1117] px-1 py-0.5 rounded truncate focus:outline-none focus:ring-1 focus:ring-[#30363d]"
          />
        </div>
        <button 
          onClick={onDeleteTrack}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 rounded transition"
          title="Delete track"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Mute, Solo & Controls */}
      <div className="flex items-center gap-1.5 pl-2">
        <button 
          onClick={() => onUpdateTrack({ muted: !track.muted })}
          className={`w-6 h-6 rounded text-[10px] font-bold transition flex items-center justify-center ${
            track.muted 
              ? 'bg-[#e63946] text-white shadow' 
              : 'bg-[#21262d] text-gray-400 hover:text-white hover:bg-[#30363d]'
          }`}
          title="Mute"
        >
          M
        </button>

        <button 
          onClick={() => onUpdateTrack({ solo: !track.solo })}
          className={`w-6 h-6 rounded text-[10px] font-bold transition flex items-center justify-center ${
            track.solo 
              ? 'bg-[#ff9e00] text-black font-bold shadow' 
              : 'bg-[#21262d] text-gray-400 hover:text-white hover:bg-[#30363d]'
          }`}
          title="Solo"
        >
          S
        </button>

        {/* Pan Control */}
        <div className="flex items-center gap-1 flex-1 ml-1" title={`Pan: ${Math.round(track.pan * 100)}%`}>
          <span className="text-[9px] font-mono text-gray-500">P</span>
          <input 
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={track.pan}
            onChange={(e) => onUpdateTrack({ pan: Number(e.target.value) })}
            className="w-full accent-[#00f5d4] h-1 bg-[#21262d] rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Volume Fader */}
      <div className="flex items-center gap-1.5 pl-2">
        {track.volume === 0 || track.muted ? (
          <VolumeX className="w-3 h-3 text-gray-500" />
        ) : (
          <Volume2 className="w-3 h-3 text-gray-400" />
        )}
        <input 
          type="range"
          min="0"
          max="1.5"
          step="0.02"
          value={track.volume}
          onChange={(e) => onUpdateTrack({ volume: Number(e.target.value) })}
          className="w-full accent-[#e63946] h-1.5 bg-[#21262d] rounded cursor-pointer"
        />
        <span className="text-[10px] font-mono text-gray-400 w-8 text-right">
          {Math.round(track.volume * 100)}%
        </span>
      </div>
    </div>
  );
};
